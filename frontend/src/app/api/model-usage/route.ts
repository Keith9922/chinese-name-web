import { NextResponse } from "next/server";
import { getRecentGmiCalls } from "@/lib/server/gmi-log";

// IMPORTANT: must be "nodejs", not "edge". gmiCallLogs is a module-level
// in-memory array, and Next's dev/runtime bundling gives edge and nodejs
// routes separate module graphs — an edge route here would never see writes
// from the nodejs-runtime GMI routes (generate-seal, generate-audio,
// generate-calligraphy-image all run on nodejs; only generate-name is edge).
// nodejs is the correct choice since it's the common runtime most GMI calls
// actually log from.
export const runtime = "nodejs";
export const maxDuration = 10;

const LIMIT = 20;

export async function GET() {
  const calls = getRecentGmiCalls(LIMIT);
  return NextResponse.json({ calls });
}
