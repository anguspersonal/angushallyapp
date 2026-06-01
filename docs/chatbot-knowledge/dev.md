---
source: /dev
topic: Developer persona — engineering credentials
priority: high
---

> Source: `/dev` — engineering-leaning CV page. For the broader career
> arc see `/about` and `/projects/timeline`. For commercial framing
> see `/strategist` (data strategy) and `/ai-pm` (AI product).

Angus is a co-founder and COO who ships code. The `/dev` page is his
engineer-shaped CV, distinct from the operator-positioned downloadable
resume at `/resume.pdf`.

**Headline numbers** (computed locally from `git log --numstat` and
exposed at `/cv` and `/dev`):

- 1.12M lines added across 44 repos
- 2,391 commits
- 259 active days over ~3 years
- ~75% TypeScript; Python (Lina Lab) and Go are next largest

**Selected projects** (full detail on `/dev`):

- **HeyLina** — production AI product. Expo / React Native mobile + Firebase Cloud Functions v2 backend + internal React ops console. RAG with user-scoped Pinecone indexes, GPT-4o-audio-preview, ElevenLabs TTS.
- **Lina Lab** — Python / FastAPI prompt-evaluation engine on Railway. LLM-as-judge with provenance, variant experiments, multi-scope rubrics, promotion pipeline. Frontend in HeyLina Web App 2.0.
- **AHKMS** ([kms.angushally.com](https://kms.angushally.com)) — multi-platform AI knowledge-management system. Turborepo monorepo: Next.js 14 on Vercel + Express worker on Railway in Docker + Expo mobile + shared types, all backed by Supabase.
- **angushallyapp** — this site. Next.js 15 + Node/Express + PostgreSQL.
- **Nexus** — chat-first personal-workspace SPA on Firebase.
- **LLM Council** — multi-model evaluation hack via OpenRouter.

**Technical breadth**: TypeScript (strict), JavaScript, Python, SQL; React 19, Next.js 15, React Native (Expo), Vite, Tailwind, Mantine, shadcn; Node, Express, Firebase Cloud Functions v2, FastAPI + Pydantic, Supabase Edge Functions; PostgreSQL + Knex, Firestore, Pinecone, Supabase; OpenAI, @anthropic-ai/sdk, LlamaIndex, ElevenLabs, OpenRouter; Vercel, Heroku, Railway, GCP, Firebase Hosting; GitHub Actions, EAS, Husky + lint-staged.

The research substrate (over-collected, not 1:1 with the rendered page) is at `docs/cvs/dev-cv.md` in the repo.
