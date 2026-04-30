import { NextRequest, NextResponse } from "next/server";
import { generateName, NameGenerationInput } from "@/lib/server/name-generator";

// Edge runtime gets up to 30s on Hobby (vs 10s for Node functions). Most
// MiniMax calls finish well inside that budget.
export const runtime = "edge";
export const maxDuration = 30;

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
