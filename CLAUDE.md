# Chinese Name Generator

A web application that generates personalized Chinese names based on English names, gender, and birth dates using AI.

## Project Description

Chinese Name Generator helps users discover meaningful Chinese names that reflect their identity and destiny. The application analyzes traditional Chinese naming principles and cultural significance to create personalized name recommendations with detailed explanations.

## Architecture

```
chinese_name_web/
├── frontend/          # Next.js 16 web application
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and animations
│   └── package.json
│
├── backend/           # FastAPI Python backend
│   ├── api/           # API route handlers
│   ├── models/        # Pydantic schemas
│   ├── services/      # Business logic (name generation, Stripe)
│   └── main.py        # FastAPI application entry
│
└── CLAUDE.md          # This file
```

## Tech Stack

### Frontend
- **Framework**: Next.js 16.2.2 with React 19
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **AI SDK**: Anthropic Claude API

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (default)
- **Payments**: Stripe
- **AI**: Anthropic Claude API (MiniMax-M2 model)

## How to Run

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:3000

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The backend runs on http://localhost:8000

For development with auto-reload:
```bash
uvicorn main:app --reload
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=http://localhost:3000
```

See `.env.example` in backend for all required variables.

## API Endpoints

### POST /api/generate-name
Generate a Chinese name based on user input.

**Request:**
```json
{
  "englishName": "string",
  "gender": "male|female|other",
  "birthDate": "YYYY-MM-DD",
  "birthTime": "HH:MM (optional)"
}
```

**Response:**
```json
{
  "chineseName": "中文名",
  "pinyin": "pīnyīn with tones",
  "meaning": "English meaning",
  "culturalExplanation": "Cultural significance",
  "suggestedCharacters": [
    {"character": "字", "meaning": "meaning"}
  ]
}
```

### POST /api/create-checkout-session
Create a Stripe checkout session for premium features.

**Request:**
```json
{
  "nameResult": { /* NameGenerationResponse */ }
}
```

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

### POST /api/webhook
Handle Stripe webhook events for payment confirmation.

### GET /api/health
Health check endpoint.

## Project Structure Details

### Frontend Components
- `NameForm.tsx` - Main input form for name generation
- `NameResult.tsx` - Display generated name with details
- `CalligraphyCard.tsx` - Premium calligraphy card component
- `FloatingCharacters.tsx` - Animated background characters

### Backend Services
- `name_generator.py` - Claude API integration for name generation
- `stripe_service.py` - Stripe payment processing

## Development Notes

- The frontend uses the App Router with React Server Components
- API routes in frontend are located in `src/app/api/`
- Backend CORS is configured to allow localhost:3000
- Name generation uses traditional Chinese naming principles (八字)
