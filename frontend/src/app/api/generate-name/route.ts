import { NextRequest, NextResponse } from "next/server";
import { generateName, NameGenerationInput } from "@/lib/server/name-generator";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Switched from edge to nodejs so this route shares one module graph (and
// therefore the shared gmi-log.ts call log used by the model-usage panel)
// with the other GMI-calling routes (generate-calligraphy-image, generate-seal,
// generate-audio), which all run on nodejs. Edge and nodejs runtimes get
// separate module instances in both Next dev and on Vercel, so naming calls
// were invisible to /api/model-usage while on edge. maxDuration bumped to
// match NAME_AI_TIMEOUT_MS's local headroom; tune down for Vercel Hobby's
// 10s Node cap in production if not upgraded to Pro.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Names are saved to the visitor's account (see proxy.ts, which already
    // redirects signed-out visitors away from /generate) — this is the
    // defense-in-depth check for the route itself, per Next's auth guide.
    // Skipped entirely while no Supabase project is wired up yet (see
    // .env.local) so name generation still works during that setup window.
    const supabaseReady = isSupabaseConfigured();
    const supabase = supabaseReady ? await createClient() : null;
    const user = supabase ? (await supabase.auth.getUser()).data.user : null;
    if (supabaseReady && !user) {
      return NextResponse.json({ error: "Sign-in required" }, { status: 401 });
    }

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

    // Persist the text result immediately; the calligraphy/seal images are
    // PATCHed onto this same row once each async GMI image call finishes
    // (see /api/creations/[id] and CalligraphyCard/SealDesign). If this
    // insert fails for any reason, the visitor still gets their name — we
    // log and fall through rather than failing the whole request.
    let creationId: string | null = null;
    if (supabase && user) {
      const { data: creation, error: insertError } = await supabase
        .from("creations")
        .insert({
          user_id: user.id,
          english_name: englishName,
          gender,
          birth_date: birthDate,
          birth_time: birthTime || null,
          chinese_name: result.chineseName,
          pinyin: result.pinyin,
          meaning: result.meaning,
          cultural_explanation: result.culturalExplanation,
          pronunciation_mapping: result.pronunciationMapping,
          element_analysis: result.elementAnalysis,
          classical_allusion: result.classicalAllusion || null,
          suggested_characters: result.suggestedCharacters,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Failed to save creation:", insertError);
      } else {
        creationId = creation.id;
      }
    }

    return NextResponse.json({ ...result, creationId });
  } catch (error) {
    console.error("Name generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate name" },
      { status: 500 },
    );
  }
}
