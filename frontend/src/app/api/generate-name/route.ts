import { NextRequest, NextResponse } from "next/server";

export interface NameGenerationRequest {
  englishName: string;
  gender: "male" | "female" | "other";
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM optional
}

export interface NameGenerationResponse {
  chineseName: string;
  pinyin: string;
  meaning: string;
  culturalExplanation: string;
  pronunciationMapping: string;
  elementAnalysis: string;
  suggestedCharacters: {
    character: string;
    meaning: string;
  }[];
}

const backendBaseUrl =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const body: NameGenerationRequest = await request.json();
    const { englishName, gender, birthDate, birthTime } = body;

    if (!englishName || !gender || !birthDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(`${backendBaseUrl}/api/generate-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        englishName,
        gender,
        birthDate,
        birthTime,
      }),
      cache: "no-store",
    });

    const responseText = await backendResponse.text();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error: "Failed to generate name",
          detail: responseText,
        },
        { status: backendResponse.status }
      );
    }

    return new NextResponse(responseText, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Name generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate name" },
      { status: 500 }
    );
  }
}
