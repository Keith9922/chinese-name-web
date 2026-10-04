import { NextRequest, NextResponse } from "next/server";
import {
  generateCalligraphyImage,
  CalligraphyStyle,
} from "@/lib/server/calligraphy-image";

// This needs the Node.js runtime (not edge): it renders a PNG locally via
// @vercel/og, base64-encodes it, then does a multi-step fetch/poll round
// trip to GMI Cloud's async image queue — comfortably longer than edge's
// typical budget. maxDuration mirrors the generator's own internal 25s
// timeout plus a little headroom for the surrounding request/response work.
export const runtime = "nodejs";
export const maxDuration = 30;

const VALID_STYLES: CalligraphyStyle[] = ["classical", "modern", "seal"];

interface RequestBody {
  chineseName?: string;
  style?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const chineseName = body.chineseName?.trim();

    if (!chineseName) {
      return NextResponse.json(
        { error: "Missing required field: chineseName" },
        { status: 400 },
      );
    }

    const style: CalligraphyStyle = VALID_STYLES.includes(body.style as CalligraphyStyle)
      ? (body.style as CalligraphyStyle)
      : "classical";

    const result = await generateCalligraphyImage({ chineseName, style });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Calligraphy image generation error:", error);
    // Fail open — the client-side component always has the Canvas rendering
    // to fall back to, so we still return 200 with a fallback payload rather
    // than a hard error where reasonable. Only truly unexpected exceptions
    // (e.g. malformed JSON body) get a 500.
    return NextResponse.json(
      { source: "fallback", error: "Failed to generate calligraphy image" },
      { status: 500 },
    );
  }
}
