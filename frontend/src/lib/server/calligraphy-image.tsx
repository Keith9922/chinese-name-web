// AI-enhanced calligraphy artwork generator.
//
// Architecture (deliberately two-step — never let the AI model freehand the
// characters): the exact Chinese characters are guaranteed correct because
// we render them ourselves with @vercel/og into a clean black-on-white base
// image first. The GMI image-edit model (Gemini family) is only ever asked
// to RESTYLE that base image into ink-brush calligraphy — same layout, same
// stroke count, same characters, just a different medium/texture. This
// mirrors the proven working pattern in yingji/stamp_generator.py (AI does
// style transformation on a locally-rendered/captured base image, never
// generates text from scratch).
//
// Failure at any step (base render, network, timeout, bad response) must
// degrade to `{ source: "fallback" }` — the caller (CalligraphyCard) always
// has the guaranteed-correct Canvas rendering to fall back to.

import { ImageResponse } from "next/og";
import { logGmiCall } from "./gmi-log";

export type CalligraphyStyle = "classical" | "modern" | "seal";

export interface GenerateCalligraphyImageArgs {
  chineseName: string;
  style?: CalligraphyStyle;
}

export interface GenerateCalligraphyImageResult {
  source: "gmi" | "fallback";
  imageDataUrl?: string;
  error?: string;
}

const GMI_QUEUE_BASE = "https://console.gmicloud.ai/api/v1/ie/requestqueue/apikey";
const IMAGE_MODEL = "gemini-3.1-flash-image-preview";
const TOTAL_TIMEOUT_MS = 25_000;
// Leave headroom inside the 25s budget for the base-image render + download
// step, so the poll loop doesn't eat the entire timeout itself.
const POLL_TIMEOUT_MS = 20_000;
const POLL_INTERVAL_MS = 2000;

const STYLE_PROMPT_HINTS: Record<CalligraphyStyle, string> = {
  classical:
    "Classical rice-paper aesthetic: soft cream/ivory paper texture, traditional brush strokes reminiscent of 楷书/行书 running script.",
  modern: "A slightly bolder, more graphic brush treatment while remaining ink-on-paper — restrained, gallery-modern, never gaudy.",
  seal: "Archaic, carved-feeling brush strokes evoking 篆书 seal-script solidity — thicker, more angular stroke terminations, but still hand-inked, not a stamped seal graphic.",
};

// ── Step 1: render a clean, guaranteed-correct base image locally ──────────

async function renderBaseImagePng(chineseName: string): Promise<ArrayBuffer> {
  const fontSize = chineseName.length <= 2 ? 320 : chineseName.length <= 3 ? 240 : 180;

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize,
            fontWeight: 700,
            color: "#000000",
            letterSpacing: 12,
            fontFamily: "sans-serif",
          }}
        >
          {chineseName}
        </div>
      </div>
    ),
    { width: 1024, height: 1024 },
  );

  return image.arrayBuffer();
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString("base64");
}

// ── Step 2: GMI Cloud async request-queue helpers ──────────────────────────

interface GmiOutcome {
  [key: string]: unknown;
}

interface GmiSubmitResponse {
  status?: string;
  outcome?: GmiOutcome;
  request_id?: string;
  error?: string;
}

async function submitJob(payload: Record<string, unknown>, apiKey: string): Promise<GmiSubmitResponse> {
  const res = await fetch(`${GMI_QUEUE_BASE}/requests`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: IMAGE_MODEL, payload }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GMI submit HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return (await res.json()) as GmiSubmitResponse;
}

async function pollJob(requestId: string, apiKey: string, deadline: number): Promise<GmiOutcome> {
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const res = await fetch(`${GMI_QUEUE_BASE}/requests/${requestId}`, {
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GMI poll HTTP ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = (await res.json()) as GmiSubmitResponse;
    const status = data.status ?? "";
    if (status === "success") return data.outcome ?? {};
    if (["failed", "error", "cancelled"].includes(status)) {
      throw new Error(`GMI job ${status}: ${JSON.stringify(data.outcome ?? data).slice(0, 300)}`);
    }
    // otherwise still "queued"/"dispatched" — keep polling
  }
  throw new Error(`GMI job timed out after ${POLL_TIMEOUT_MS}ms`);
}

// Base64 inline image data discovered inside a raw Gemini-native response
// (outcome.candidates[0].content.parts[].inlineData.data) — GMI's queue
// occasionally passes this shape straight through instead of normalizing it,
// particularly on the image-edit models. Returned as a data: URL directly
// since there's no hosted URL to point to in this shape.
function extractInlineGeminiImage(outcome: GmiOutcome): string | null {
  const candidates = outcome.candidates;
  if (!Array.isArray(candidates)) return null;
  for (const candidate of candidates) {
    const parts = (candidate as Record<string, unknown> | undefined)?.content as Record<string, unknown> | undefined;
    const partsList = parts?.parts;
    if (!Array.isArray(partsList)) continue;
    for (const part of partsList) {
      const inline = (part as Record<string, unknown>)?.inlineData as Record<string, unknown> | undefined;
      const data = inline?.data;
      const mimeType = (inline?.mimeType as string | undefined) ?? "image/png";
      if (typeof data === "string" && data.length > 0) {
        return `data:${mimeType};base64,${data}`;
      }
    }
  }
  return null;
}

function extractImageUrl(outcome: GmiOutcome): string {
  // Surface the real upstream reason first — a raw Gemini error object here
  // ({code, message, status}) is far more useful for logs/screenshots than a
  // generic "couldn't find a URL" message.
  const errorField = outcome.error;
  if (errorField && typeof errorField === "object") {
    const msg = (errorField as Record<string, unknown>).message;
    throw new Error(`GMI/Gemini returned an error: ${typeof msg === "string" ? msg : JSON.stringify(errorField)}`);
  }

  const inlineImage = extractInlineGeminiImage(outcome);
  if (inlineImage) return inlineImage;

  const mediaUrls = outcome.media_urls;
  if (Array.isArray(mediaUrls) && mediaUrls.length > 0) {
    const first = mediaUrls[0];
    if (first && typeof first === "object" && typeof (first as Record<string, unknown>).url === "string") {
      return (first as Record<string, unknown>).url as string;
    }
  }

  if (typeof outcome.thumbnail_image_url === "string" && outcome.thumbnail_image_url.startsWith("http")) {
    return outcome.thumbnail_image_url;
  }

  for (const key of ["image_url", "output_url", "url", "result_url", "image", "output"]) {
    const val = outcome[key];
    if (typeof val === "string" && val.startsWith("http")) return val;
  }

  for (const key of ["images", "outputs", "results"]) {
    const val = outcome[key];
    if (Array.isArray(val) && val.length > 0) {
      const item = val[0];
      if (typeof item === "string" && item.startsWith("http")) return item;
      if (item && typeof item === "object") {
        for (const sub of ["url", "image_url", "output_url"]) {
          const subVal = (item as Record<string, unknown>)[sub];
          if (typeof subVal === "string") return subVal;
        }
      }
    }
  }

  throw new Error(`Cannot find image URL in GMI outcome. Keys: ${Object.keys(outcome).join(", ")}`);
}

async function downloadAsDataUrl(url: string): Promise<string> {
  // extractImageUrl already returns a ready-to-use data: URL when the GMI
  // response embedded inline base64 image data (raw Gemini candidates shape)
  // — nothing to fetch in that case.
  if (url.startsWith("data:")) return url;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download result image: HTTP ${res.status}`);
  const contentType = res.headers.get("content-type") || "image/png";
  const buf = await res.arrayBuffer();
  return `data:${contentType};base64,${arrayBufferToBase64(buf)}`;
}

// ── Public entry point ──────────────────────────────────────────────────────

export async function generateCalligraphyImage({
  chineseName,
  style = "classical",
}: GenerateCalligraphyImageArgs): Promise<GenerateCalligraphyImageResult> {
  const apiKey = process.env.GMI_API_KEY;
  if (!apiKey) {
    return { source: "fallback", error: "GMI_API_KEY is not configured" };
  }
  if (!chineseName || !chineseName.trim()) {
    return { source: "fallback", error: "chineseName is required" };
  }

  const startedAt = Date.now();
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), TOTAL_TIMEOUT_MS);

  try {
    const result = await Promise.race([
      runPipeline(chineseName.trim(), style, apiKey, ctrl.signal),
      new Promise<never>((_, reject) => {
        ctrl.signal.addEventListener("abort", () => reject(new Error("calligraphy image generation timed out")));
      }),
    ]);

    const latencyMs = Date.now() - startedAt;
    logGmiCall({
      step: "calligraphy_image",
      modality: "image",
      model: IMAGE_MODEL,
      latencyMs,
      ok: true,
    });

    return { source: "gmi", imageDataUrl: result };
  } catch (err) {
    const latencyMs = Date.now() - startedAt;
    const message = err instanceof Error ? err.message : String(err);
    console.error("[calligraphy-image] generation failed:", message);
    logGmiCall({
      step: "calligraphy_image",
      modality: "image",
      model: IMAGE_MODEL,
      latencyMs,
      ok: false,
      error: message,
    });
    return { source: "fallback", error: message };
  } finally {
    clearTimeout(timeout);
  }
}

async function runPipeline(
  chineseName: string,
  style: CalligraphyStyle,
  apiKey: string,
  signal: AbortSignal,
): Promise<string> {
  if (signal.aborted) throw new Error("aborted before start");

  // Step 1: locally-rendered, guaranteed-correct base image.
  const baseImageBuf = await renderBaseImagePng(chineseName);
  const baseImageB64 = arrayBufferToBase64(baseImageBuf);

  const styleHint = STYLE_PROMPT_HINTS[style] ?? STYLE_PROMPT_HINTS.classical;
  const prompt = `Transform this plain black-on-white text image into an authentic Chinese ink-wash calligraphy brush stroke rendering.

Requirements:
- Preserve the EXACT character shapes, stroke count, and layout from the input image. Do NOT add, remove, alter, substitute, or reinterpret any character — only restyle the medium and texture.
- Render the characters as if freshly brushed with real ink: varying stroke weight (thick presses, thin lifts), natural ink bleed and slightly frayed/textured stroke edges, subtle dry-brush texture at stroke tails.
- Background: subtle, tasteful rice-paper texture (soft cream/ivory), not pure flat white, not any color paper.
- Ink color: black/dark charcoal ink only.
- ${styleHint}
- Do NOT add any red seals, stamps, borders, decorative frames, other text, watermarks, or generic red-and-gold ornamentation. Do NOT make this look like a restaurant menu or a cliché "Chinese takeout" graphic. The result should look like a refined, museum-quality ink calligraphy piece.
- Keep the composition centered and simple, matching the input layout.`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/png", data: baseImageB64 } },
        ],
      },
    ],
    aspect_ratio: "1:1",
    image_size: "1K",
  };

  const submitRes = await submitJob(payload, apiKey);

  let outcome: GmiOutcome;
  if (submitRes.status === "success" && submitRes.outcome) {
    outcome = submitRes.outcome;
  } else if (submitRes.request_id) {
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    outcome = await pollJob(submitRes.request_id, apiKey, deadline);
  } else {
    throw new Error(`Unexpected GMI submit response: ${JSON.stringify(submitRes).slice(0, 300)}`);
  }

  const imageUrl = extractImageUrl(outcome);
  return downloadAsDataUrl(imageUrl);
}
