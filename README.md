# Chinese Name Generator

Discover your personalized Chinese name based on ancient wisdom and modern AI.

![Chinese Name Generator](https://img.shields.io/badge/Status-Beta-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

- **AI-Powered Name Generation** - Get a meaningful Chinese name based on your English name, gender, and birth date
- **Cultural Deep Dive** - Learn the cultural significance and meaning behind your name
- **Bazi Analysis** - Traditional Chinese astrology meets modern AI
- **Calligraphy Cards** - Unlock beautiful downloadable calligraphy artwork
- **Multiple Pricing Tiers** - Free basic generation, premium detailed analysis

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- pnpm (recommended) or npm

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure your API keys
python main.py
```

The API will be available at [http://localhost:8000](http://localhost:8000).

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# MiniMax API (for name generation)
ANTHROPIC_API_KEY=your_api_key_here
ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 📁 Project Structure

```
chinese-name-web/
├── frontend/                 # Next.js 16 frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   │   ├── api/        # API routes
│   │   │   └── page.tsx    # Main landing page
│   │   └── components/      # React components
│   │       ├── NameForm.tsx
│   │       ├── NameResult.tsx
│   │       └── ui/          # shadcn/ui components
│   └── tests/               # Playwright E2E tests
│
├── backend/                  # FastAPI backend
│   ├── api/
│   │   └── routes.py        # API endpoints
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── services/
│   │   ├── name_generator.py
│   │   └── stripe_service.py
│   └── main.py              # FastAPI app entry
│
└── CLAUDE.md               # Developer guide
```

## 🔌 API Endpoints

### Generate Chinese Name

```bash
POST /api/generate-name
Content-Type: application/json

{
  "englishName": "John Smith",
  "gender": "male",
  "birthDate": "1990-05-15"
}
```

Response:
```json
{
  "chineseName": "李明",
  "pinyin": "Lǐ Míng",
  "meaning": "Bright and intelligent",
  "culturalExplanation": "This name combines...",
  "suggestedCharacters": [
    {"character": "李", "meaning": "plum tree, common surname"},
    {"character": "明", "meaning": "bright, intelligent"}
  ]
}
```

### Create Checkout Session

```bash
POST /api/create-checkout-session
Content-Type: application/json

{
  "nameResult": { ... }
}
```

## 🎨 Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- shadcn/ui
- Playwright (testing)

**Backend:**
- FastAPI
- Python 3.10+
- MiniMax API (Anthropic-compatible)
- Stripe (payments)

## 📦 Deploy

### Frontend (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import/git?repo=https://github.com/Keith9922/chinese-name-web)

### Backend (Railway/Render)

1. Connect your GitHub repo to Railway or Render
2. Set environment variables
3. Deploy automatically on push

## 🧪 Testing

```bash
# Run E2E tests
cd frontend
npx playwright test

# Run with UI
npx playwright test --ui

# Run headed
npx playwright test --headed
```

## 📜 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- Chinese naming traditions from thousands of years of history
- MiniMax API for AI-powered name generation
- shadcn/ui for beautiful components
