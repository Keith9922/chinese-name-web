import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, PaidPlanId } from "@/lib/server/stripe-service";

export const runtime = "nodejs";

interface CheckoutRequestBody {
  nameResult?: {
    chineseName?: string;
    pinyin?: string;
    meaning?: string;
  };
  planId?: PaidPlanId;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const planId = (body.planId ?? "keepsake") as PaidPlanId;

    if (planId !== "keepsake" && planId !== "signature") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const url = await createCheckoutSession(body.nameResult ?? {}, planId);
    return NextResponse.json({ url, checkoutUrl: url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
