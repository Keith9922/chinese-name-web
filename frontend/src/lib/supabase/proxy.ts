import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "./config";

// Session-refresh logic shared by the project's proxy.ts (Next.js 16 renamed
// middleware.ts to proxy.ts — see AGENTS.md). Kept in its own file so the
// thin proxy.ts stays focused on route-protection decisions.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // No Supabase project wired up yet — every request would otherwise crash
  // here. Treat as signed-out-but-unenforced so the rest of the site (which
  // doesn't need auth) keeps working while setup is in progress.
  if (!isSupabaseConfigured()) {
    return { supabaseResponse, user: null };
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Always re-validate against Supabase (not just decode the cookie) so a
  // revoked/expired session is caught on the very next request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
