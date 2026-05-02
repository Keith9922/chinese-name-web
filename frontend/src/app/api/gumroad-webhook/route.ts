import { NextRequest, NextResponse } from "next/server";
import { buildOrderEmail } from "@/lib/server/email-template";
import { signDownloadUrl } from "@/lib/server/download-signing";

// Gumroad's "Ping" sends application/x-www-form-urlencoded by default.
// We accept both that and JSON for safety.
//
// Docs: https://help.gumroad.com/article/137-pinging-a-url-after-a-sale
//
// What we do:
//   1. Validate the ping has the fields we need + matches our products.
//   2. Pull the chinese_name / pinyin / meaning out of `url_params`.
//   3. Compose download URLs (per-customer, generated at click time).
//   4. Send a delivery email via Resend.
//   5. Mirror the order to a Lark Bitable so the seller sees it in Feishu.
//   6. Return 200 quickly — Gumroad retries on non-2xx.

export const runtime = "nodejs";
export const maxDuration = 30;

const KEEPSAKE_PERMALINK = "jaqhrg";
const SIGNATURE_PERMALINK = "kidcrz";

const PRODUCT_KIND: Record<string, "keepsake" | "signature"> = {
  [KEEPSAKE_PERMALINK]: "keepsake",
  [SIGNATURE_PERMALINK]: "signature",
};

interface PingPayload {
  email?: string;
  permalink?: string;
  product_id?: string;
  product_name?: string;
  product_permalink?: string;
  sale_id?: string;
  sale_timestamp?: string;
  price?: string | number;
  currency?: string;
  test?: string | boolean;
  order_number?: string | number;
  url_params?: Record<string, string> | string;
  // Some Gumroad pings flatten url_params into top-level — we accept both.
  chinese_name?: string;
  pinyin?: string;
  meaning?: string;
  classical_allusion?: string;
}

export async function POST(request: NextRequest) {
  let payload: PingPayload;
  try {
    payload = await readBody(request);
  } catch (err) {
    console.error("[gumroad-webhook] body parse failed:", err);
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Validate the product is one we sell
  const permalink = payload.permalink;
  const kind = permalink ? PRODUCT_KIND[permalink] : undefined;
  if (!kind) {
    console.warn(`[gumroad-webhook] unknown permalink ${permalink} — ignoring`);
    return NextResponse.json({ ok: true, ignored: "unknown product" });
  }

  // Skip Gumroad's automated test pings unless we explicitly ask to deliver
  const isTest = String(payload.test ?? "").toLowerCase() === "true";
  if (isTest && process.env.GUMROAD_DELIVER_TESTS !== "1") {
    console.log("[gumroad-webhook] test ping received, no delivery (set GUMROAD_DELIVER_TESTS=1 to deliver tests)");
    return NextResponse.json({ ok: true, test: true });
  }

  const email = (payload.email ?? "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("[gumroad-webhook] invalid email:", email);
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Pull the generated name out of url_params (the buyer's session carried
  // them to Gumroad; Gumroad echoes them back to us in the ping)
  const params = normaliseUrlParams(payload.url_params);
  const chineseName = (params.chinese_name ?? payload.chinese_name ?? "").trim();
  const pinyin = (params.pinyin ?? payload.pinyin ?? "").trim();
  const meaning = (params.meaning ?? payload.meaning ?? "").trim();
  const classicalAllusion = (params.classical_allusion ?? payload.classical_allusion ?? "").trim();

  if (!chineseName) {
    console.error("[gumroad-webhook] missing chinese_name in ping; cannot personalise");
    // Still notify Lark so the seller can manually fulfil
    await safeMirrorToLark({
      email,
      permalink: permalink!,
      kind,
      chineseName: "(missing — manual fulfilment needed)",
      pinyin,
      meaning,
      saleId: String(payload.sale_id ?? ""),
    });
    return NextResponse.json({ ok: true, warning: "missing chinese_name" });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ink-name.vercel.app").replace(/\/$/, "");

  // Sign every download URL so the routes can distinguish a paid email
  // from someone hitting the API directly. Without `sig`, /api/card
  // returns a watermarked preview and /api/svg returns 402.
  const signedParams = {
    name: chineseName,
    pinyin,
    meaning,
    allusion: classicalAllusion ?? "",
    style: "kaishu",
  };
  let cardSig = "";
  let svgSig = "";
  try {
    cardSig = await signDownloadUrl(signedParams);
    svgSig = await signDownloadUrl({ ...signedParams, style: "kaishu" });
  } catch (err) {
    console.error("[gumroad-webhook] signing failed (DOWNLOAD_SIGNING_SECRET missing?):", err);
    // Continue without signatures — buyers will hit the watermarked /
    // paywalled responses, but the email at least goes out so we don't
    // lose the order on a config oversight. Lark mirror will note it.
  }

  const cardQuery = new URLSearchParams({
    name: chineseName,
    pinyin,
    meaning,
  });
  if (classicalAllusion) cardQuery.set("allusion", classicalAllusion);
  if (cardSig) cardQuery.set("sig", cardSig);

  const svgQueryBase = new URLSearchParams({
    name: chineseName,
    pinyin,
    meaning,
  });
  if (classicalAllusion) svgQueryBase.set("allusion", classicalAllusion);
  if (svgSig) svgQueryBase.set("sig", svgSig);

  const cardUrl = `${siteUrl}/api/card?${cardQuery.toString()}`;
  const svgHorizontalUrl = `${siteUrl}/api/svg?${svgQueryBase.toString()}&orientation=horizontal`;
  const svgVerticalUrl = `${siteUrl}/api/svg?${svgQueryBase.toString()}&orientation=vertical`;
  // Inline preview thumbnail (the same card, low-res, so the buyer
  // immediately *sees* what they paid for in the email body).
  const previewQuery = new URLSearchParams(cardQuery);
  previewQuery.set("preview", "1");
  const previewImageUrl = `${siteUrl}/api/card?${previewQuery.toString()}`;

  // Build + send the email
  const { subject, html, text } = buildOrderEmail({
    chineseName,
    pinyin,
    meaning,
    classicalAllusion: classicalAllusion || undefined,
    productKind: kind,
    cardUrl,
    previewImageUrl,
    svgHorizontalUrl: kind === "signature" ? svgHorizontalUrl : undefined,
    svgVerticalUrl: kind === "signature" ? svgVerticalUrl : undefined,
    brandSiteUrl: siteUrl,
    supportEmail: process.env.SUPPORT_EMAIL ?? "hello@ink-name.app",
  });

  const emailResult = await sendDeliveryEmail({ to: email, subject, html, text });

  // Mirror to Lark even if email failed, so the seller has a record
  await safeMirrorToLark({
    email,
    permalink: permalink!,
    kind,
    chineseName,
    pinyin,
    meaning,
    saleId: String(payload.sale_id ?? ""),
    emailDelivered: emailResult.ok,
    emailError: emailResult.error,
  });

  if (!emailResult.ok) {
    console.error("[gumroad-webhook] email send failed:", emailResult.error);
    // Return 200 anyway — Gumroad retry won't help, and the Lark row
    // gives the seller a chance to fulfil manually.
  }

  return NextResponse.json({
    ok: true,
    sent: emailResult.ok,
    chineseName,
    kind,
  });
}

async function readBody(req: NextRequest): Promise<PingPayload> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return (await req.json()) as PingPayload;
  }
  // form-encoded — parse manually
  const text = await req.text();
  const params = new URLSearchParams(text);
  const obj: Record<string, unknown> = {};
  for (const [k, v] of params.entries()) {
    // Gumroad encodes nested url_params keys as `url_params[key]`
    const m = k.match(/^url_params\[(.+)\]$/);
    if (m) {
      obj.url_params ??= {};
      (obj.url_params as Record<string, string>)[m[1]] = v;
    } else {
      obj[k] = v;
    }
  }
  return obj as PingPayload;
}

function normaliseUrlParams(raw: PingPayload["url_params"]): Record<string, string> {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
}

interface EmailResult {
  ok: boolean;
  error?: string;
}

async function sendDeliveryEmail(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  const from = process.env.RESEND_FROM ?? "Ink Name <onboarding@resend.dev>";
  const replyTo = process.env.RESEND_REPLY_TO;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${detail.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "send failed" };
  }
}

interface LarkMirrorArgs {
  email: string;
  permalink: string;
  kind: "keepsake" | "signature";
  chineseName: string;
  pinyin: string;
  meaning: string;
  saleId: string;
  emailDelivered?: boolean;
  emailError?: string;
}

// Best-effort write to the existing Bitable. Failures are logged but never
// propagate — the customer's email delivery shouldn't depend on this.
async function safeMirrorToLark(args: LarkMirrorArgs) {
  try {
    const appId = process.env.LARK_APP_ID;
    const appSecret = process.env.LARK_APP_SECRET;
    const baseToken = process.env.LARK_ORDERS_BASE_TOKEN ?? process.env.LARK_BITABLE_APP_TOKEN;
    const tableId = process.env.LARK_ORDERS_TABLE_ID;
    if (!appId || !appSecret || !baseToken || !tableId) {
      // Orders mirror is optional. Quiet skip.
      return;
    }

    const tokenRes = await fetch(
      "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
      },
    );
    const tokenJson = (await tokenRes.json()) as { tenant_access_token?: string };
    const token = tokenJson.tenant_access_token;
    if (!token) return;

    const planLabel = args.kind === "signature" ? "Signature ($6.99)" : "Keepsake ($2.99)";

    await fetch(
      `https://open.feishu.cn/open-apis/base/v3/bases/${baseToken}/tables/${tableId}/records/batch_create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: ["Email", "Plan", "Chinese Name", "Pinyin", "Meaning", "Sale ID", "Email Delivered", "Notes", "Timestamp"],
          rows: [[
            args.email,
            planLabel,
            args.chineseName,
            args.pinyin,
            args.meaning,
            args.saleId,
            args.emailDelivered === false ? "❌ failed" : args.emailDelivered ? "✅ sent" : "—",
            args.emailError ?? "",
            Date.now(),
          ]],
        }),
      },
    );
  } catch (err) {
    console.error("[gumroad-webhook] Lark mirror failed:", err);
  }
}
