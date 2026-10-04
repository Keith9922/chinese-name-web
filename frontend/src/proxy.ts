import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Next.js 16 renamed middleware.ts to proxy.ts (functionality unchanged —
// see node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md).
// This only gates PAGE routes; API routes do their own session check and
// return JSON 401s instead of an HTML redirect (a fetch() call that gets
// redirected to /login would otherwise "succeed" with login-page HTML and
// fail confusingly inside response.json()).
const PROTECTED_PAGE_PREFIXES = ["/generate", "/account"];

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PAGE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  // No Supabase project configured yet — there's no way to actually sign
  // in, so gating would just be a dead end. Let these routes through
  // ungated until real credentials land in .env.local.
  if (isProtected && !user && isSupabaseConfigured()) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
