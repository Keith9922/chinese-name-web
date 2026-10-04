# Turning on sign-in (Google + GitHub)

The app already works fully without this — Supabase is feature-flagged
(`src/lib/supabase/config.ts`), so until you complete the steps below,
"My Names" / sign-in are simply hidden and every visitor gets the old
free-no-signup flow. Once `.env.local` has real Supabase credentials, the
login wall and saved history switch on automatically — no code changes
needed.

## 1. Create the Supabase project (2 minutes)

1. Go to https://supabase.com/dashboard → **New project**.
2. Pick any name/region, wait for it to finish provisioning.
3. **Project Settings → API**: copy the **Project URL** and the **anon
   public** key.
4. Paste them into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

## 2. Run the schema migration

Open the Supabase dashboard's **SQL Editor** and run the contents of
[`supabase/migrations/0001_creations.sql`](supabase/migrations/0001_creations.sql)
once. This creates the `creations` table (with row-level security, so each
visitor can only ever see their own names) — no separate "users" table is
needed, Supabase Auth already manages that.

## 3. Create a Google OAuth client

1. https://console.cloud.google.com/ → create a project (or reuse one).
2. **APIs & Services → OAuth consent screen** → configure it (External,
   fill in app name/support email — for a hackathon demo you can leave it
   in "Testing" mode and add your own Google account as a test user).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   → Application type **Web application**.
4. **Authorized redirect URIs** — add exactly this (Supabase's own
   callback, not your app's):
   ```
   https://xxxxxxxx.supabase.co/auth/v1/callback
   ```
   (same `xxxxxxxx` project ref as step 1 — find the exact URL under
   Supabase's **Authentication → Providers → Google** once you open it,
   it shows the callback URL to paste here).
5. Copy the **Client ID** and **Client secret**.

## 4. Create a GitHub OAuth App

1. https://github.com/settings/developers → **New OAuth App**.
2. **Homepage URL**: `http://localhost:3000` (or your deployed URL).
3. **Authorization callback URL** — same pattern as Google:
   ```
   https://xxxxxxxx.supabase.co/auth/v1/callback
   ```
4. Register, then copy the **Client ID** and generate a **Client secret**.

## 5. Wire both providers into Supabase

In the Supabase dashboard → **Authentication → Providers**:

- **Google**: toggle on, paste the Client ID + Client secret from step 3.
- **GitHub**: toggle on, paste the Client ID + Client secret from step 4.

Then **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` for local dev (change to your real
  domain once deployed).
- **Redirect URLs**: add `http://localhost:3000/auth/callback` (and your
  production equivalent, e.g. `https://your-domain.com/auth/callback`).

## 6. Test it

Restart the dev server (env vars are read at boot), go to `/login`, and
both buttons should redirect to a real Google/GitHub consent screen and
land you back on `/generate` signed in. Generate a name, then visit
`/account` — it should show up there, and again once you sign in from a
different browser.

## What's already built and just waiting for this

- `/login` — Google + GitHub buttons
- `/account` — "My Names" history, newest first
- `/generate` and `/account` require sign-in (via `src/proxy.ts` — Next.js
  16 renamed `middleware.ts` to `proxy.ts`, functionality is identical)
- Every generated name is saved immediately; the calligraphy/seal art is
  attached to that same record a few seconds later, once each GMI image
  call finishes (fire-and-forget — a failed save never breaks the visible
  UI, it just won't appear in history)
