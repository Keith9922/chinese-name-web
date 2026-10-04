import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google/GitHub redirect here after the user approves the OAuth consent
// screen (via Supabase's own hosted callback, which forwards to this route
// with a one-time `code`). Exchanging it for a session sets the auth cookies
// that proxy.ts and every server component/route then read.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/generate";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
