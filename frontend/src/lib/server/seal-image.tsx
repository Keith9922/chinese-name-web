// Personalized seal/chop (印章) image generator.
//
// Pipeline: render a plain base image locally (white background, black
// characters, a square guide) with @vercel/og, then hand it to GMI's
// gemini-3.1-flash-image-preview image-edit model with a 篆刻 (seal
// engraving) style prompt so it comes back looking like a genuine carved
// stone chop stamped in red ink. Same request-queue + polling API as the
// sibling yingji stamp_generator.py project (confirmed working there).
//
// Every call goes through logGmiCall exactly once (success or failure),
// same discipline as name-generator.ts. If anything fails — missing key,
// timeout, bad response — we return a "fallback" result with no imageUrl
// so the caller can simply skip rendering the seal; the rest of the page
// (the guaranteed-correct Canvas calligraphy card) is unaffected.

import { ImageResponse } from "next/og";
import { logGmiCall } from "./gmi-log";

export interface GenerateSealImageInput {
  chineseName: string;
}

export interface GenerateSealImageResult {
  source: "gmi" | "fallback";
  imageDataUrl?: string;
  error?: string;
}

// Traditional 朱红 (vermilion) seal-ink red, matching yingji's own
// INK_COLORS["朱红"] for authenticity.
const SEAL_INK_RED = "#CC2200";

const GMI_QUEUE_BASE = "https://console.gmicloud.ai/api/v1/ie/requestqueue/apikey";
const IMAGE_MODEL = "gemini-3.1-flash-image-preview";

// 篆刻 / seal-engraving style prompt, adapted from yingji's STAMP_PROMPTS
// "金石篆刻" entry for text input rather than a photo input. We explicitly
// ask the model to preserve the exact character shapes (this is the part
// photo-to-stamp prompts don't need to worry about, but text does).
function buildSealPrompt(sealText: string): string {
  return (
    `Transform this image of the Chinese character(s) "${sealText}" into a traditional East Asian seal engraving (篆刻) impression. ` +
    `Preserve the EXACT character shapes and stroke structure shown in the source image — do not redraw, restyle, or substitute the characters, only re-render them in the engraved seal aesthetic. ` +
    `Render it as if freshly stamped with red ink paste (朱砂印泥) on a small square seal with gently rounded corners: bold, slightly irregular carved strokes, authentic stone-carved texture with fine cracks and uneven ink density at the edges, like a real hand-carved chop impression. ` +
    `Background must be plain white or transparent. Ink color must be a deep traditional vermilion red (hex ${SEAL_INK_RED}), characters solid, no gradients, no drop shadows, no watermarks, no extra decorative border patterns, no added text. ` +
    `Square seal silhouette with rounded corners, thin engraved border line. Monochrome red-on-white only. Bold, dignified, museum-quality seal impression — not a cartoon, not a logo, not a generic stamp icon.`
  );
}

// Pick the seal text: traditional seals are usually just the given name (or
// a single character), not the full 3-character name — reads better small.
// Last 2 characters if we have 3+, otherwise whatever we have (down to 1).
function extractSealText(chineseName: string): string {
  const chars = [...chineseName.trim()].filter((c) => c.trim().length > 0);
  if (chars.length === 0) return "印";
  if (chars.length <= 2) return chars.join("");
  return chars.slice(-2).join("");
}

async function renderBaseImage(sealText: string): Promise<ArrayBuffer> {
  const size = 512;
  const response = new ImageResponse(
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
        {/* Square guide frame with rounded corners — gives the image-edit
            model a clear silhouette to preserve. */}
        <div
          style={{
            width: size - 64,
            height: size - 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "10px solid #111111",
            borderRadius: 28,
            background: "#ffffff",
          }}
        >
          <div
            style={{
              fontFamily: "noto-serif-sc",
              fontSize: sealText.length <= 1 ? 280 : 200,
              fontWeight: 700,
              color: "#111111",
              letterSpacing: 4,
              display: "flex",
              lineHeight: 1,
            }}
          >
            {sealText}
          </div>
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [{ name: "noto-serif-sc", data: await fetchNotoSerifSc(), style: "normal", weight: 700 }],
    },
  );
  return response.arrayBuffer();
}

// Same Google Fonts CSS-resolution trick as /api/card/route.tsx — pinned
// .ttf URLs go stale when Google bumps versions, so we resolve via CSS
// with an old User-Agent to force a TTF (satori can't decode WOFF2).
const OLD_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_0) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

let cachedFont: ArrayBuffer | null = null;

async function fetchNotoSerifSc(): Promise<ArrayBuffer> {
  if (cachedFont) return cachedFont;
  const cssUrl = "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700&display=swap";
  const css = await fetch(cssUrl, { headers: { "User-Agent": OLD_UA } }).then((r) => r.text());
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
  if (!match) throw new Error("Could not resolve Noto Serif SC font URL");
  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) throw new Error(`Font fetch failed: ${fontRes.status}`);
  cachedFont = await fontRes.arrayBuffer();
  return cachedFont;
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString("base64");
}

interface GmiQueueSubmitResponse {
  status?: string;
  outcome?: Record<string, unknown>;
  request_id?: string;
  error?: { message?: string } | string;
}

interface GmiQueuePollResponse {
  status?: string;
  outcome?: Record<string, unknown>;
}

async function gmiHeaders(apiKey: string): Promise<Record<string, string>> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

// Submit the image-edit job, then poll until success/failure/timeout. Ported
// from yingji's _submit_and_poll — same request-queue API, same semantics.
async function submitAndPoll(
  apiKey: string,
  model: string,
  payload: Record<string, unknown>,
  timeoutMs: number,
): Promise<Record<string, unknown>> {
  const headers = await gmiHeaders(apiKey);
  const submitRes = await fetch(`${GMI_QUEUE_BASE}/requests`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, payload }),
  });

  if (!submitRes.ok) {
    const text = await submitRes.text();
    throw new Error(`GMI submit failed [${submitRes.status}]: ${text.slice(0, 300)}`);
  }

  const submitJson = (await submitRes.json()) as GmiQueueSubmitResponse;

  if (submitJson.status === "success" && submitJson.outcome) {
    return submitJson.outcome;
  }

  const requestId = submitJson.request_id;
  if (!requestId) {
    throw new Error(`GMI submit response had neither outcome nor request_id: ${JSON.stringify(submitJson).slice(0, 300)}`);
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const pollRes = await fetch(`${GMI_QUEUE_BASE}/requests/${requestId}`, {
      method: "GET",
      headers,
    });
    if (!pollRes.ok) {
      const text = await pollRes.text();
      throw new Error(`GMI poll failed [${pollRes.status}]: ${text.slice(0, 200)}`);
    }
    const pollJson = (await pollRes.json()) as GmiQueuePollResponse;
    const status = pollJson.status ?? "";
    if (status === "success") {
      return pollJson.outcome ?? {};
    }
    if (status === "failed" || status === "error" || status === "cancelled") {
      throw new Error(`GMI job failed: ${JSON.stringify(pollJson).slice(0, 300)}`);
    }
    // else "queued" / "dispatched" — keep polling
  }

  throw new Error(`GMI job timed out after ${timeoutMs}ms`);
}

// Base64 inline image data occasionally passed straight through from a raw
// Gemini-native response (outcome.candidates[0].content.parts[].inlineData)
// instead of GMI's normalized outcome shape — see calligraphy-image.tsx for
// the identical case.
function extractInlineGeminiImage(outcome: Record<string, unknown>): string | null {
  const candidates = outcome.candidates;
  if (!Array.isArray(candidates)) return null;
  for (const candidate of candidates) {
    const content = (candidate as Record<string, unknown> | undefined)?.content as Record<string, unknown> | undefined;
    const partsList = content?.parts;
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

// Same key-priority search as yingji's _extract_image_url.
function extractImageUrl(outcome: Record<string, unknown>): string {
  const errorField = outcome.error;
  if (errorField && typeof errorField === "object") {
    const msg = (errorField as Record<string, unknown>).message;
    throw new Error(`GMI/Gemini returned an error: ${typeof msg === "string" ? msg : JSON.stringify(errorField)}`);
  }

  const inlineImage = extractInlineGeminiImage(outcome);
  if (inlineImage) return inlineImage;

  const mediaUrls = outcome.media_urls;
  if (Array.isArray(mediaUrls) && mediaUrls.length > 0) {
    const item = mediaUrls[0];
    if (item && typeof item === "object" && typeof (item as Record<string, unknown>).url === "string") {
      return (item as Record<string, unknown>).url as string;
    }
  }

  const thumb = outcome.thumbnail_image_url;
  if (typeof thumb === "string" && thumb.startsWith("http")) return thumb;

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

// Download the GMI-hosted result and re-serve it as a data URL. This avoids
// depending on the longevity/CORS of GMI's hosted URL and lets the browser
// download button work with a plain same-origin blob, no cross-origin
// fetch needed — same approach as calligraphy-image.tsx.
async function downloadAsDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download result image: HTTP ${res.status}`);
  const contentType = res.headers.get("content-type") || "image/png";
  const buf = await res.arrayBuffer();
  return `data:${contentType};base64,${arrayBufferToBase64(buf)}`;
}

const DEFAULT_TIMEOUT_MS = 90_000;

export async function generateSealImage(
  input: GenerateSealImageInput,
): Promise<GenerateSealImageResult> {
  const chineseName = input.chineseName?.trim();
  if (!chineseName) {
    return { source: "fallback", error: "chineseName is required" };
  }

  const sealText = extractSealText(chineseName);
  const step = "seal_image";
  const model = IMAGE_MODEL;

  const apiKey = process.env.GMI_API_KEY;
  if (!apiKey) {
    console.warn("[seal-image] GMI_API_KEY not configured, skipping AI seal generation");
    return { source: "fallback", error: "GMI_API_KEY is not configured" };
  }

  const timeoutMs = Number(process.env.SEAL_IMAGE_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
  const startedAt = Date.now();

  try {
    const baseImageBuf = await renderBaseImage(sealText);
    const baseImageB64 = arrayBufferToBase64(baseImageBuf);

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: buildSealPrompt(sealText) },
            { inlineData: { mimeType: "image/png", data: baseImageB64 } },
          ],
        },
      ],
      aspect_ratio: "1:1",
      image_size: "1K",
    };

    const outcome = await submitAndPoll(apiKey, model, payload, timeoutMs);
    const imageUrl = extractImageUrl(outcome);
    const imageDataUrl = await downloadAsDataUrl(imageUrl);
    const latencyMs = Date.now() - startedAt;

    logGmiCall({ step, modality: "image", model, latencyMs, ok: true });

    return { source: "gmi", imageDataUrl };
  } catch (err) {
    const latencyMs = Date.now() - startedAt;
    const message = err instanceof Error ? err.message : String(err);
    console.error("[seal-image] generation failed, falling back:", message);
    logGmiCall({ step, modality: "image", model, latencyMs, ok: false, error: message });
    return { source: "fallback", error: message };
  }
}
