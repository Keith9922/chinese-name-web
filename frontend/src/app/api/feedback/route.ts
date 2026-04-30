import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const RATING_LABELS: Record<string, string> = {
  love: "😍 I love it",
  good: "🙂 Pretty good",
  meh: "😐 Just okay",
  off: "🤔 Doesn't fit",
};

interface FeedbackPayload {
  rating?: string;
  comment?: string;
  chineseName?: string;
  source?: string;
}

export async function POST(request: NextRequest) {
  let payload: FeedbackPayload;
  try {
    payload = (await request.json()) as FeedbackPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rating = (payload.rating ?? "").trim();
  if (!rating || !RATING_LABELS[rating]) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const comment = (payload.comment ?? "").trim().slice(0, 500);
  const chineseName = (payload.chineseName ?? "").slice(0, 60);
  const source = (payload.source ?? "").slice(0, 200);

  const ratingLabel = RATING_LABELS[rating];
  const timestamp = new Date().toISOString();

  // 1) Lark custom bot webhook — primary visibility channel
  const webhookUrl = process.env.LARK_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const text =
        `📝 New feedback on Ink Name\n` +
        `Reaction: ${ratingLabel}\n` +
        (chineseName ? `Generated name: ${chineseName}\n` : "") +
        (comment ? `Comment: ${comment}\n` : "") +
        (source ? `Page: ${source}\n` : "") +
        `When: ${timestamp}`;

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msg_type: "text", content: { text } }),
      });
    } catch (err) {
      console.error("Lark webhook failed:", err);
    }
  }

  // 2) Optional: write to Lark Bitable for browsable history
  const baseConfigured =
    process.env.LARK_APP_ID &&
    process.env.LARK_APP_SECRET &&
    process.env.LARK_BITABLE_APP_TOKEN &&
    process.env.LARK_BITABLE_TABLE_ID;

  if (baseConfigured) {
    try {
      await writeToBitable({
        rating: ratingLabel,
        comment,
        chineseName,
        source,
        timestamp,
      });
    } catch (err) {
      console.error("Lark Bitable write failed:", err);
    }
  }

  // 3) Fallback log so dev environment still captures feedback
  if (!webhookUrl && !baseConfigured) {
    console.log("[feedback]", { rating: ratingLabel, comment, chineseName, source, timestamp });
  }

  return NextResponse.json({ ok: true });
}

interface BitableRecord {
  rating: string;
  comment: string;
  chineseName: string;
  source: string;
  timestamp: string;
}

async function writeToBitable(record: BitableRecord) {
  const tokenRes = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: process.env.LARK_APP_ID,
        app_secret: process.env.LARK_APP_SECRET,
      }),
    },
  );
  const tokenJson = (await tokenRes.json()) as { tenant_access_token?: string };
  const token = tokenJson.tenant_access_token;
  if (!token) throw new Error("No tenant_access_token returned");

  const appToken = process.env.LARK_BITABLE_APP_TOKEN;
  const tableId = process.env.LARK_BITABLE_TABLE_ID;
  const timestampMs = Date.parse(record.timestamp) || Date.now();

  // Lark Base v3 batch_create: fields-array + rows-array form
  const res = await fetch(
    `https://open.feishu.cn/open-apis/base/v3/bases/${appToken}/tables/${tableId}/records/batch_create`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: ["Rating", "Comment", "Chinese Name", "Source", "Timestamp"],
        rows: [
          [
            record.rating,
            record.comment,
            record.chineseName,
            record.source,
            timestampMs,
          ],
        ],
      }),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bitable write failed: ${res.status} ${text.slice(0, 300)}`);
  }
}
