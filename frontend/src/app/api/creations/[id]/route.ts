import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

// Called by CalligraphyCard / SealDesign once their own async GMI image
// call resolves, to attach the art onto the text-only creation row that
// /api/generate-name already saved. Fire-and-forget from the client — a
// failure here never blocks or breaks the visible UI, it only means that
// one image won't show up later in "My Names".
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign-in required" }, { status: 401 });
    }

    const body = (await request.json()) as {
      calligraphyImageData?: string;
      sealImageData?: string;
    };

    const patch: Record<string, string> = {};
    if (typeof body.calligraphyImageData === "string") {
      patch.calligraphy_image_data = body.calligraphyImageData;
    }
    if (typeof body.sealImageData === "string") {
      patch.seal_image_data = body.sealImageData;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    // RLS (creations_update_own) already scopes this to the caller's own
    // rows — the .eq() below is a second, explicit guard rather than the
    // only line of defense.
    const { error } = await supabase
      .from("creations")
      .update(patch)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to update creation:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Creation PATCH error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
