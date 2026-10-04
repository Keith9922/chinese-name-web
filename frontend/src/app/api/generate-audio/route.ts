import { NextRequest, NextResponse } from "next/server";
import {
  generateMeaningNarration,
  generatePronunciationAudio,
} from "@/lib/server/audio-narration";

// This needs the Node.js runtime (not edge): same reasoning as
// generate-calligraphy-image — it does a multi-step fetch/poll round trip
// to GMI Cloud's async request-queue API, comfortably longer than edge's
// typical budget. maxDuration mirrors the generator's own internal 25s
// timeout plus a little headroom for the surrounding request/response work.
export const runtime = "nodejs";
export const maxDuration = 30;

type Mode = "pronunciation" | "narration";

interface RequestBody {
  chineseName?: string;
  pinyin?: string;
  mode?: Mode;
  meaning?: string;
  culturalExplanation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const chineseName = body.chineseName?.trim();
    const pinyin = body.pinyin?.trim();
    const mode: Mode = body.mode === "narration" ? "narration" : "pronunciation";

    if (!chineseName || !pinyin) {
      return NextResponse.json(
        { error: "Missing required fields: chineseName, pinyin" },
        { status: 400 },
      );
    }

    const result =
      mode === "narration"
        ? await generateMeaningNarration({
            chineseName,
            pinyin,
            meaning: body.meaning?.trim() ?? "",
            culturalExplanation: body.culturalExplanation?.trim() ?? "",
          })
        : await generatePronunciationAudio({ chineseName, pinyin });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Audio generation error:", error);
    // Fail open — the caller always hides the corresponding play button on
    // a fallback response rather than showing a broken UI, so 200 with a
    // fallback payload is preferable to a hard error where reasonable.
    return NextResponse.json(
      { source: "fallback", error: "Failed to generate audio" },
      { status: 500 },
    );
  }
}
