import { NextRequest, NextResponse } from "next/server";
import { generateName, NameGenerationInput } from "@/lib/server/name-generator";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<NameGenerationInput>;
    const { englishName, gender, birthDate, birthTime } = body;

    if (!englishName || !gender || !birthDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await generateName({
      englishName,
      gender,
      birthDate,
      birthTime: birthTime || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Name generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate name" },
      { status: 500 },
    );
  }
}
