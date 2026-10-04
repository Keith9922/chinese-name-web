// AI text-to-speech for the generated Chinese name — two short clips:
//   1. Pronunciation: the pinyin syllables read out clearly, one at a time,
//      so an English-speaking visitor can hear exactly how their name sounds.
//   2. Meaning narration: a warm ~20-30s spoken explanation of what the name
//      means and why it was chosen, composed as natural spoken sentences
//      (never just the raw JSON fields read verbatim).
//
// Model: minimax-tts-speech-2.6-hd via GMI Cloud's async request-queue API
// (same base/poll/extract pattern as calligraphy-image.tsx — see that file
// for the canonical write-up of the pipeline). We picked this model over
// inworld-tts-2 because its default voice, "English_expressive_narrator",
// plus an explicit "calm" emotion setting, is a direct match for the "warm,
// calm narrator explaining a name to an English speaker" brief — no need to
// browse a 65-voice catalog to find the right fit.
//
// Failure at any step (missing key, network, timeout, bad response) must
// degrade to `{ source: "fallback" }` — the caller (NamePronounce) simply
// hides the play button for whichever clip failed. The existing Canvas
// calligraphy card and the rest of the result page must never depend on
// this succeeding.

import { logGmiCall } from "./gmi-log";

export interface PronunciationAudioArgs {
  chineseName: string;
  pinyin: string;
}

export interface MeaningNarrationArgs {
  chineseName: string;
  pinyin: string;
  meaning: string;
  culturalExplanation: string;
}

export interface AudioNarrationResult {
  source: "gmi" | "fallback";
  audioUrl?: string;
  error?: string;
}

const GMI_QUEUE_BASE = "https://console.gmicloud.ai/api/v1/ie/requestqueue/apikey";
const TTS_MODEL = "minimax-tts-speech-2.6-hd";
const NARRATOR_VOICE = "English_expressive_narrator";

const TOTAL_TIMEOUT_MS = 25_000;
const POLL_TIMEOUT_MS = 20_000;
const POLL_INTERVAL_MS = 2000;

// ── GMI Cloud async request-queue helpers (mirrors calligraphy-image.tsx) ──

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
    body: JSON.stringify({ model: TTS_MODEL, payload }),
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
    // otherwise still "queued"/"processing"/"dispatched" — keep polling
  }
  throw new Error(`GMI job timed out after ${POLL_TIMEOUT_MS}ms`);
}

function extractAudioUrl(outcome: GmiOutcome): string {
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

  for (const key of ["audio_url", "image_url", "output_url", "url", "result_url", "audio", "output"]) {
    const val = outcome[key];
    if (typeof val === "string" && val.startsWith("http")) return val;
  }

  for (const key of ["images", "outputs", "results", "media"]) {
    const val = outcome[key];
    if (Array.isArray(val) && val.length > 0) {
      const item = val[0];
      if (typeof item === "string" && item.startsWith("http")) return item;
      if (item && typeof item === "object") {
        for (const sub of ["url", "audio_url", "image_url", "output_url"]) {
          const subVal = (item as Record<string, unknown>)[sub];
          if (typeof subVal === "string") return subVal;
        }
      }
    }
  }

  throw new Error(`Cannot find audio URL in GMI outcome. Keys: ${Object.keys(outcome).join(", ")}`);
}

async function runTtsPipeline(text: string, apiKey: string, signal: AbortSignal): Promise<string> {
  if (signal.aborted) throw new Error("aborted before start");

  const payload = {
    text,
    voice_id: NARRATOR_VOICE,
    speed: "0.92",
    vol: "1",
    pitch: "0",
    emotion: "calm",
    language_boost: "auto",
    format: "mp3",
    audio_sample_rate: "32000",
    bitrate: "128000",
    channel: "2",
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

  return extractAudioUrl(outcome);
}

async function generateSpeech(text: string, step: string): Promise<AudioNarrationResult> {
  const apiKey = process.env.GMI_API_KEY;
  if (!apiKey) {
    return { source: "fallback", error: "GMI_API_KEY is not configured" };
  }
  if (!text || !text.trim()) {
    return { source: "fallback", error: "text is required" };
  }

  const startedAt = Date.now();
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), TOTAL_TIMEOUT_MS);

  try {
    const audioUrl = await Promise.race([
      runTtsPipeline(text.trim(), apiKey, ctrl.signal),
      new Promise<never>((_, reject) => {
        ctrl.signal.addEventListener("abort", () => reject(new Error("audio generation timed out")));
      }),
    ]);

    const latencyMs = Date.now() - startedAt;
    logGmiCall({
      step,
      modality: "audio",
      model: TTS_MODEL,
      latencyMs,
      ok: true,
    });

    return { source: "gmi", audioUrl };
  } catch (err) {
    const latencyMs = Date.now() - startedAt;
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[audio-narration:${step}] generation failed:`, message);
    logGmiCall({
      step,
      modality: "audio",
      model: TTS_MODEL,
      latencyMs,
      ok: false,
      error: message,
    });
    return { source: "fallback", error: message };
  } finally {
    clearTimeout(timeout);
  }
}

// ── Text composition helpers ────────────────────────────────────────────────

// Turn "Kē Yǎ Lín" into "Kē. ... Yǎ. ... Lín." — full stops force the TTS
// engine to pause and articulate each syllable distinctly rather than
// gliding through the name as one continuous word.
function buildPronunciationScript(pinyin: string): string {
  const syllables = pinyin
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (syllables.length === 0) return pinyin.trim();
  return syllables.map((s) => `${s}.`).join(" ... ");
}

// Compose 2-3 natural spoken sentences from the structured name-generation
// fields, rather than reading the JSON verbatim — written for the ear, not
// the eye. Kept short so the resulting clip stays well under ~30s.
function buildMeaningScript({ chineseName, pinyin, meaning, culturalExplanation }: MeaningNarrationArgs): string {
  const sentences: string[] = [];

  sentences.push(`Your Chinese name is ${chineseName}, pronounced ${pinyin}.`);

  if (meaning.trim()) {
    sentences.push(`It carries the meaning of ${meaning.trim()}.`);
  }

  if (culturalExplanation.trim()) {
    // Keep only the first sentence or two of the cultural explanation so the
    // whole narration stays compact — the full text is still shown on screen.
    const trimmed = culturalExplanation.trim();
    const firstSentences = trimmed.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
    sentences.push(firstSentences);
  }

  return sentences.join(" ");
}

// ── Public entry points ──────────────────────────────────────────────────────

export async function generatePronunciationAudio({
  chineseName,
  pinyin,
}: PronunciationAudioArgs): Promise<AudioNarrationResult> {
  if (!chineseName.trim() || !pinyin.trim()) {
    return { source: "fallback", error: "chineseName and pinyin are required" };
  }
  const script = buildPronunciationScript(pinyin);
  return generateSpeech(script, "pronunciation_audio");
}

export async function generateMeaningNarration(
  args: MeaningNarrationArgs,
): Promise<AudioNarrationResult> {
  if (!args.chineseName.trim() || !args.pinyin.trim()) {
    return { source: "fallback", error: "chineseName and pinyin are required" };
  }
  const script = buildMeaningScript(args);
  return generateSpeech(script, "meaning_narration");
}
