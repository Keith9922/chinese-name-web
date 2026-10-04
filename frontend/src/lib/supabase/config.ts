// Whether real Supabase credentials have been supplied yet. Every auth
// touchpoint (proxy.ts, the login page, generate-name's save step, the
// account page) checks this first and degrades to "no auth required"
// instead of throwing when it's false — so the app keeps working exactly
// as before while the Supabase project is still being set up (see
// .env.local's Supabase section for the 4-step setup).
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
