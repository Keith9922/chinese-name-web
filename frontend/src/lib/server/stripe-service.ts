import Stripe from "stripe";
import crypto from "node:crypto";

export type PaidPlanId = "keepsake" | "signature";

interface PlanDefinition {
  name: string;
  description: string;
  amountUsd: number;
}

const PLAN_DEFINITIONS: Record<PaidPlanId, PlanDefinition> = {
  keepsake: {
    name: "Keepsake Card",
    description: "One premium calligraphy card with a refined classical style",
    amountUsd: 2.99,
  },
  signature: {
    name: "Signature Collection",
    description: "Three artistic styles with a more premium presentation and export quality",
    amountUsd: 6.99,
  },
};

export interface CheckoutSessionData {
  sessionId: string;
  planId: PaidPlanId;
  planName: string;
  amountUsd: number;
  paymentStatus: string;
  isMock: boolean;
  nameResult: {
    chineseName: string;
    pinyin: string;
    meaning: string;
  };
}

const MOCK_PREFIX = "mock_";

function encodeMockSession(data: CheckoutSessionData): string {
  return MOCK_PREFIX + Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
}

function decodeMockSession(sessionId: string): CheckoutSessionData | null {
  if (!sessionId.startsWith(MOCK_PREFIX)) return null;
  try {
    const json = Buffer.from(sessionId.slice(MOCK_PREFIX.length), "base64url").toString("utf8");
    return JSON.parse(json) as CheckoutSessionData;
  } catch {
    return null;
  }
}

function getFrontendUrl(): string {
  return (
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  );
}

function isMockMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return !key || key.toLowerCase().includes("your_stripe");
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

interface NameResultPayload {
  chineseName?: string;
  pinyin?: string;
  meaning?: string;
}

export async function createCheckoutSession(
  nameResult: NameResultPayload,
  planId: PaidPlanId,
): Promise<string> {
  const plan = PLAN_DEFINITIONS[planId];
  if (!plan) throw new Error(`Unsupported plan: ${planId}`);

  const sessionId = crypto.randomUUID();
  const frontendUrl = getFrontendUrl();

  if (isMockMode()) {
    const mockId = encodeMockSession({
      sessionId,
      planId,
      planName: plan.name,
      amountUsd: plan.amountUsd,
      paymentStatus: "paid",
      isMock: true,
      nameResult: {
        chineseName: nameResult.chineseName ?? "",
        pinyin: nameResult.pinyin ?? "",
        meaning: nameResult.meaning ?? "",
      },
    });
    return `${frontendUrl}/success?session_id=${mockId}`;
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: plan.name,
            description: `${plan.description}: ${nameResult.chineseName || "N/A"}`,
            metadata: {
              chineseName: nameResult.chineseName ?? "",
              pinyin: nameResult.pinyin ?? "",
              meaning: nameResult.meaning ?? "",
              planId,
            },
          },
          unit_amount: Math.round(plan.amountUsd * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/cancel?plan=${planId}`,
    metadata: {
      session_id: sessionId,
      chinese_name: nameResult.chineseName ?? "",
      pinyin: nameResult.pinyin ?? "",
      meaning: nameResult.meaning ?? "",
      plan_id: planId,
    },
    expires_at: Math.floor(Date.now() / 1000) + 1800,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

export async function getCheckoutSession(sessionId: string): Promise<CheckoutSessionData> {
  const mock = decodeMockSession(sessionId);
  if (mock) return mock;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const planId = (session.metadata?.plan_id ?? "keepsake") as PaidPlanId;
  const plan = PLAN_DEFINITIONS[planId];
  if (!plan) throw new Error(`Unsupported plan: ${planId}`);

  return {
    sessionId: session.id,
    planId,
    planName: plan.name,
    amountUsd: plan.amountUsd,
    paymentStatus: session.payment_status,
    isMock: false,
    nameResult: {
      chineseName: session.metadata?.chinese_name ?? "",
      pinyin: session.metadata?.pinyin ?? "",
      meaning: session.metadata?.meaning ?? "",
    },
  };
}
