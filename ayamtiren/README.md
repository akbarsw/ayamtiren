# ⚡ RouterAI — LLM API Gateway & Monetization Platform

A smart LLM API router that automatically selects the cheapest/fastest/best model, handles fallback chains across providers, and gives you a full dashboard for usage analytics and credit management.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔀 **Cost-Aware Routing** | Picks cheapest model by default; `prefer: "quality"` or `"speed"` for others |
| ⛓️ **Fallback Chain** | Auto-retries with next provider if one fails or rate-limits |
| 🔑 **API Key Management** | Create/revoke keys with rate limits & monthly quotas |
| 💰 **Credit Billing** | Top up credits, pay per token consumed |
| 📊 **Usage Analytics** | Charts for daily requests, tokens, cost per model |
| 🛡️ **OpenAI-Compatible API** | Drop-in replacement — just change the base URL |

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, and LLM provider keys
```

### 3. Set up the database

```bash
npm run db:generate   # generate Prisma client
npm run db:push       # push schema to DB (dev)
# or for production:
npm run db:migrate
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📡 API Reference

### `POST /api/v1/chat`

Send chat completion requests through the router.

**Headers:**
```
Authorization: Bearer sk-rt-your-key
Content-Type: application/json
```

**Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "model": "gpt-4o-mini",     // optional — router picks if omitted
  "max_tokens": 1024,          // optional
  "temperature": 0.7,          // optional
  "prefer": "cost"             // "cost" | "speed" | "quality"
}
```

**Response:**
```json
{
  "id": "chatcmpl-...",
  "model": "gpt-4o-mini",
  "provider": "openai",
  "choices": [{ "message": { "role": "assistant", "content": "..." } }],
  "usage": { "prompt_tokens": 10, "completion_tokens": 50, "total_tokens": 60 },
  "cost": 0.0000097,
  "latency_ms": 842
}
```

---

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (credentials)
- **UI**: Tailwind CSS + Recharts
- **Validation**: Zod

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/login/         # Login page
│   ├── (auth)/register/      # Register page
│   ├── api/
│   │   ├── auth/             # NextAuth + register
│   │   ├── v1/chat/          # LLM Router endpoint
│   │   ├── keys/             # API key CRUD
│   │   ├── credits/          # Balance & top-up
│   │   └── usage/            # Usage analytics
│   ├── dashboard/            # Dashboard pages
│   └── page.tsx              # Landing page
├── lib/
│   ├── auth.ts               # NextAuth config
│   ├── prisma.ts             # Prisma client
│   ├── router.ts             # LLM routing logic
│   ├── models.ts             # Model definitions & costs
│   └── apikey.ts             # Key generation & validation
└── types/index.ts            # TypeScript types
```

---

## 🌍 Deploy

### Vercel (recommended)

```bash
vercel deploy
```

Set environment variables in Vercel dashboard. Use [Supabase](https://supabase.com) or [Neon](https://neon.tech) for the database.

### VPS / Docker

```bash
npm run build
npm start
```
