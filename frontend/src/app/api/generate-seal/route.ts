import { NextRequest, NextResponse } from "next/server";
import { generateSealImage } from "@/lib/server/seal-image";

// Node runtime, not edge: the GMI image-edit call goes through an async
// request-queue that can take up to ~90s to poll to completion (see
// seal-image.ts), which exceeds edge's practical limits on this plan.
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { chineseName?: string };
    const chineseName = body.chineseName?.trim();

    if (!chineseName) {
      return NextResponse.json(
        { error: "Missing required field: chineseName" },
        { status: 400 },
      );
    }

    const result = await generateSealImage({ chineseName });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Seal generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate seal" },
      { status: 500 },
    );
  }
}
