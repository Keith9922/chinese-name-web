# 墨名 · Ink Name

A Chinese name designed by sound, season, and the five elements — for the
world. Free to discover, beautiful to keep.

> **The brand:** "Ink Name". The product writes a real Chinese name for an
> English-speaker the way a Chinese parent would: by listening to the sound,
> reading the birth profile (八字 / 五行), and balancing the elements through
> character imagery. Then it shows the result in calligraphy with a red seal.

## What changed in this redesign

- **Single-stack architecture.** The FastAPI backend was ported into Next.js API
  routes (`/api/generate-name`, `/api/create-checkout-session`,
  `/api/checkout-session`, `/api/feedback`). The whole app — UI and AI calls —
  now ships to Vercel as one codebase. The Python backend in `/backend/` is
  kept around as a reference but is no longer needed at runtime.
- **`/` is a true landing page** with a bold ink-wash aesthetic: hanging-scroll
  hero with a 名 calligraphy character + red seal, drifting characters in the
  background, and ritual-style section markers. See
  `frontend/src/app/page.tsx`.
- **`/generate` is the tool.** The naming form has a corner ribbon (起), softer
  fields, and the result page now leads with a giant calligraphy name framed
  by a real-looking seal.
- **Inline feedback widget** sits beneath every result. Submissions post to a
  Lark (Feishu) custom-bot webhook — you see them in your Lark group within a
  second. Optional Bitable mirroring is supported for browseable history.

## Run it locally

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in keys (see below)
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

`frontend/.env.local` (or `.env`) — full reference in `frontend/.env.example`.

| Key | Required? | Notes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | for live names | MiniMax / Anthropic-compatible. Without it, the route falls back to a deterministic JS-side name. |
| `ANTHROPIC_BASE_URL` | optional | Defaults to `https://api.minimaxi.com/anthropic`. |
| `MINIMAX_MODEL` | optional | Defaults to `MiniMax-M2`. |
| `STRIPE_SECRET_KEY` | for paid plans | Leave blank → mock mode that issues fake-but-valid success URLs. |
| `STRIPE_WEBHOOK_SECRET` | optional | Only needed if you wire up a real webhook. |
| `NEXT_PUBLIC_SITE_URL` / `FRONTEND_URL` | optional | Set on Vercel to your deployed URL so Stripe redirects land in the right place. |
| `LARK_WEBHOOK_URL` | recommended | Lark group → Settings → Bots → Custom Bot → copy webhook. Every feedback becomes a chat message. |
| `LARK_APP_ID` + `LARK_APP_SECRET` + `LARK_BITABLE_APP_TOKEN` + `LARK_BITABLE_TABLE_ID` | optional | If set, feedback also writes a row into your Bitable. Required fields: `Rating`, `Comment`, `Chinese Name`, `Source`, `Timestamp`. |

## Deploy to Vercel

```bash
cd frontend
npx vercel        # link the project
npx vercel env add ANTHROPIC_API_KEY    production
npx vercel env add LARK_WEBHOOK_URL     production
# … add the rest from .env.example as needed
npx vercel deploy --prod
```

`frontend/vercel.json` is already configured (Node runtime, regions, function
timeouts: 60s for `/api/generate-name`, 30s for checkout, 15s for feedback).

> **Note on Hobby tier limits:** the default Vercel Hobby plan caps function
> duration at 10s, which can be tight for the model. If you see timeouts,
> upgrade to Pro (60s allowed) or shorten `max_tokens` in
> `frontend/src/lib/server/name-generator.ts`.

## Wiring up the feedback Lark Bot

1. In Lark / Feishu, open any group → group settings → **Bots** → **Add Bot** →
   **Custom Bot**. Name it "Ink Name Feedback".
2. Copy the **Webhook URL** it gives you.
3. Paste it into `LARK_WEBHOOK_URL` (locally in `.env.local`, on Vercel via
   `vercel env add`). That's it — open the group on phone or web and you'll
   see every submission within ~1 second.

Optional: to also keep a tabular log, create a Lark Bitable with columns
`Rating`, `Comment`, `Chinese Name`, `Source`, `Timestamp`, then create a
self-built app with `bitable:app` permission and fill in the four `LARK_*`
env vars.

## Project layout

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # NEW Landing page (server component)
│   │   ├── generate/page.tsx     # The tool (form + result)
│   │   ├── success/, cancel/     # Stripe redirects
│   │   └── api/                  # generate-name, checkout, feedback (all serverless)
│   ├── components/
│   │   ├── landing/              # HeroInk, NameShowcase, RitualSection, …
│   │   ├── shared/               # SiteHeader, SiteFooter, InkBackdrop
│   │   ├── feedback/             # FeedbackWidget
│   │   ├── NameForm.tsx
│   │   ├── NameResult.tsx
│   │   └── PremiumUnlock.tsx
│   └── lib/
│       └── server/               # name-generator.ts, stripe-service.ts, naming-data.ts
├── vercel.json
└── .env.example

backend/                          # legacy — no longer required at runtime
```

## Tech stack

- **Next.js 16.2 / React 19** with the App Router (Turbopack build)
- **Tailwind CSS 4** + **shadcn/ui** + **Framer Motion** for animation
- **Anthropic SDK** (pointed at MiniMax) for name generation
- **Stripe SDK** for one-time keepsake purchases
- **Lark / Feishu** webhook + Bitable for feedback collection

## License

MIT — adapt freely.
