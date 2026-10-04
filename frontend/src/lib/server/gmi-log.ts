// Shared call-log sink for every GMI Cloud request made anywhere in the app
// (naming, blessing, calligraphy image, seal image, audio narration). Every
// server-side module that calls GMI should push one entry here after each
// call. The /api/model-usage route and the ModelUsagePanel component read
// from this — it is both a transparency feature (vs. black-box competitor
// agents) and the source of the "API call proof" screenshots for submission.
export interface GmiCallLog {
  step: string;
  modality: "text" | "image" | "audio";
  model: string;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  ok: boolean;
  error?: string;
  at: number; // Date.now() at completion
}

const MAX_LOGS = 200;

// Module-level array — fine for a single dev/demo server process. Not meant
// to survive serverless cold starts across regions; if that becomes a
// problem, swap for a small KV/store, but out of scope for this hackathon.
export const gmiCallLogs: GmiCallLog[] = [];

export function logGmiCall(entry: Omit<GmiCallLog, "at">): void {
  gmiCallLogs.push({ ...entry, at: Date.now() });
  if (gmiCallLogs.length > MAX_LOGS) gmiCallLogs.splice(0, gmiCallLogs.length - MAX_LOGS);
}

export function getRecentGmiCalls(limit = 20): GmiCallLog[] {
  return gmiCallLogs.slice(-limit).reverse();
}
