# OBSIDIAN — Neural Synthesis Pipeline

> Multi-agent AI orchestration platform with parallel worker inference and master consolidation.

![Obsidian](https://img.shields.io/badge/Obsidian-0a0a0a?style=for-the-badge&logo=data:image/svg+xml;base64,&logoColor=ff5c00)
![Next.js](https://img.shields.io/badge/Next.js_15-000?style=for-the-badge&logo=nextdotjs)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

## Overview

Obsidian deploys multi-model inference across four specialized stages (**Research → Reasoning → Coding → Synthesis**). Each stage runs 3 parallel workers synthesized by a master consolidator. Supports 10+ AI providers with dynamic API key injection.

## Quick Start

```bash
# Clone & install
git clone https://github.com/bhavanisingh/obsidian.git
cd obsidian
npm install

# Configure
cp .env.example .env.local
# Edit .env.local with your API keys

# Run
npx prisma generate
npx prisma db push
npm run dev
```

## Supported Providers

| Provider | Key |
|----------|-----|
| OpenRouter | `OPENROUTER_API_KEY` |
| Groq | `GROQ_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Anthropic | `ANTHROPIC_API_KEY` |
| Google | `GOOGLE_API_KEY` |
| xAI | `XAI_API_KEY` |
| Mistral | `MISTRAL_API_KEY` |
| Cohere | `COHERE_API_KEY` |
| Together | `TOGETHER_API_KEY` |

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bhavanisingh/obsidian)

1. Push to GitHub
2. Import repo in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables (see `.env.example`)
4. Deploy — `vercel.json` handles Prisma generation and function timeouts automatically

## Architecture

```
┌─────────────┐     ┌──────────────────────────────────────┐
│  Frontend   │────▶│  /api/stream/{research|reasoning|..} │
│  (React 19) │     │  SSE Streaming + Provider Router     │
└─────────────┘     └──────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         Worker 1        Worker 2        Worker 3
         (Parallel)      (Parallel)      (Parallel)
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                      Master Synthesizer
                    (Consolidates outputs)
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + Glassmorphism
- **State**: Zustand (persisted)
- **Database**: SQLite (dev) / Postgres (prod)
- **Auth**: NextAuth v5 (Guest fallback)
- **UI**: Radix UI + Framer Motion

## License

MIT