# Angus Hally — Developer CV

> Builder with a strategist's instincts and an operator's discipline.

angus.hally@gmail.com · London, UK · [angushally.com](https://angushally.com) · [github.com/angushally](https://github.com/angushally) · [linkedin.com/in/angus-hally-9ab66a87](https://www.linkedin.com/in/angus-hally-9ab66a87/)

---

## Profile

Co-founder and COO who ships code. Over the last two years I've built the Python evaluation engine that runs HeyLina's prompt iteration, a multi-platform AI knowledge-management system, a full-stack personal site, and the internal tooling and engineering process behind HeyLina's mobile product. Background is a decade of data strategy at Accenture and Anmut, but every system below has my fingerprints on the code — not just the spec.

I work fluently with AI-augmented tooling (Claude Code, Cursor) and treat code as a first-class operating function rather than something to delegate.

---

## Selected projects

### HeyLina — mobile, backend, internal ops console
*Customer-facing AI product. Founded 2025. My day job.*

A three-surface monorepo: an **Expo / React Native** customer app, **Firebase Cloud Functions v2** (TypeScript) backend, and an internal **React + Vite** operations console for managing prompts, themes, and demoing new AI features. I own the engineering process and contribute across all three surfaces alongside our mobile engineer.

- RAG-augmented chat with user-scoped Pinecone indexes (chat history + shared content), GPT-4o + GPT-4o-audio-preview, ElevenLabs TTS, prompt config served live from Firestore.
- Firestore security model with role-based access (admin / editor / viewer), field-level write rules, and a 90-day soft-delete window.
- Detox E2E coverage across the main user flows, Vitest + Jest unit tests, GitHub Actions deploying frontend + backend to Firebase on push to `main`, EAS for mobile builds.

### Lina Lab — prompt-evaluation engine for HeyLina
*Python / FastAPI on Railway. Frontend in HeyLina Web App 2.0 (Next.js 15, next-auth SSO, Supabase). Live API: `https://lina-lab-production.up.railway.app`.*

The evaluation backbone behind HeyLina's mobile product. A FastAPI service that hosts a versioned prompt catalog, a variant-comparison runtime, and a multi-scope eval framework (message / turn / conversation / variant). What I'm proudest of is the data model: eight MECE kickoff types typed in `scenario_types.py` (`USER_BLANK`, `USER_TEMPLATE`, `USER_ARTIFACT`, `USER_SYSTEM_CONTEXT` and their Lina-led mirrors), with `Scenario` and `Kickoff` TypedDicts against scenarios stored in Supabase.

- **LLM-as-judge** with full provenance — `judge_type`, `judge_model`, `judge_prompt_version`, `judge_rater_id` — and a rolling-baseline snapshot identity on each run so regressions are catchable.
- **Variant experiments** across model, temperature, role preset, and message-style toggles, with baseline-delta reporting.
- **Run store v2** persisting multi-conversation rows per variant with evaluation rows at every scope, plus macro-goal catalogs and per-run macro-goal scores.
- Prompt **soft-delete + version pinning** so historical runs that reference retired prompts still resolve; **promotion pipeline** to production with Slack notifications.
- Clinical-safety **risk classification** layer over transcripts (`rid_r1_risk_classification`) — relevant because the product is emotional-intelligence-adjacent.

### AHKMS — Knowledge Management System
*Personal full-stack project, October 2025–. [kms.angushally.com](https://kms.angushally.com).*

A multi-platform knowledge-capture system implementing the PARAMPS framework (Projects, Areas, Resources, Archive, Memories, People, Secure). Turborepo monorepo with `packages/web` (Next.js 14 on Vercel), `packages/worker` (Express on Railway in Docker with poppler-utils), `packages/mobile` (Expo / React Native), and `packages/shared` (typed contracts). Supabase provides Postgres, Auth, Storage, and Edge Functions.

- Ingest pipeline: capture (PDF / image / URL / text) → workflow runs in Supabase, webhooks fire the Express worker → AI extraction → PARAMPS classification → human-in-the-loop review → derived artifacts with lineage tracking.
- 7-migration schema (010–016) covering artifacts, entities, tasks, events, system decisions, and user preferences with 11 lifecycle states.

### angushallyapp — personal site & playground
*This very repo. [angushally.com](https://angushally.com).*

Next.js 15 / React 19 monorepo with a Node/Express backend and PostgreSQL (Knex migrations), hosted across Heroku and Vercel. Mantine 8 for the UI, Supabase SSR for auth-aware reads, Mantine charts and Framer Motion for the interactive bits.

- Habit tracker with per-user data isolation, Strava sync, UK Food Standards Agency hygiene lookup, blog with pagination/slugs, rate-limited contact form with reCAPTCHA and email notifications, Google OAuth + JWT auth, RBAC.
- A puppeteer-driven resume PDF builder ([scripts/build-resume.mjs](../scripts/build-resume.mjs)) and an `@anthropic-ai/sdk`-backed chat with knowledge-bundle injection wired into the prebuild.
- Husky + Vitest + breakpoint linting in pre-commit; PWA via `next-pwa`.

### Nexus — chat-first personal workspace
*React / TypeScript SPA. [github.com/angushally/nexus-flow](https://github.com/angushally) (private).*

A chat-first unified workspace over a structured personal knowledge graph. React + Vite + Tailwind + shadcn-style components on the front; Firebase (Firestore + Auth + Hosting) underneath. Built to test the hypothesis that one chat input plus a graph is enough surface area for personal life and work — dashboards, capture, calendar, and comprehension all flowing through the same interface.

---

## Other projects

- **HeyLina marketing site (`heylina/website`)** — public Next.js site for the product.
- **LLM Council** — weekend hack exploring multi-model orchestration via OpenRouter: query fans out to GPT-5.1 / Gemini 3 Pro / Claude Sonnet 4.5 / Grok 4, models anonymously cross-rank each other, and a Chairman synthesises. 99% vibe-coded by design.
- **Automations** — Node/Express webhook service on Railway gluing Notion + Google APIs together with header-based auth.
- **Puffin Carpentry** — React/Vite/Tailwind/shadcn-ui marketing site for a family carpentry business.
- **ARA Copilot** — v0.app-generated narrow-scope tool for Annual Report & Accounts delivery planning, deployed on Vercel. Co-designed; mostly generated, not hand-written.

---

## Technical skills

Grouped by evidence in the codebases above — not buzzwords.

- **Languages** — TypeScript (strict), JavaScript, Python, SQL.
- **Frontend** — React 19, Next.js 15 (App Router), React Native (Expo / Expo Router), Vite, Tailwind, Mantine, shadcn / Radix UI, Framer Motion.
- **Backend** — Node.js, Express, Firebase Cloud Functions v2, FastAPI + Pydantic, Supabase Edge Functions (Deno).
- **Data** — PostgreSQL with Knex migrations, Supabase, Firestore, Pinecone (vector), Tiktoken-aware token budgeting.
- **Data modelling** — typed schemas in TypeScript and Python, MECE taxonomies, multi-scope evaluation models, lifecycle-state machines, soft-delete + version-pinning patterns.
- **AI / ML** — OpenAI SDK (chat + audio-preview), `@anthropic-ai/sdk`, LlamaIndex, RAG patterns, ElevenLabs TTS, OpenRouter for multi-model orchestration; LLM-as-judge frameworks with provenance, prompt versioning + promotion pipelines, multi-scope eval rubrics.
- **Auth** — Google OAuth 2.0, Apple Sign-In, Firebase Auth, Supabase Auth, JWT, role-based access control.
- **Infra & DevOps** — Vercel, Heroku, Railway, GCP, Firebase Hosting, Docker (poppler-utils), GitHub Actions, EAS, Husky + lint-staged, Puppeteer for headless rendering.
- **Testing** — Vitest, Jest, Detox (mobile E2E), Firebase Functions Test SDK, `@testing-library/react`.

<details>
<summary><strong>Broader tooling</strong> — non-engineering apps I work in fluently (for the "but does he know X?" question)</summary>

Not a developer credential, but a complete answer to the operator question. I'm comfortable in basically any business app; below is what I actually use weekly or have used at depth.

- **AI & creative** — Claude (Code, Desktop, API), Cursor, ChatGPT, OpenRouter, ElevenLabs, Canva.
- **No-code & automation** — Bubble.io, Zapier, Make, n8n, Replit.
- **Knowledge & docs** — Notion, Google Workspace (Docs, Sheets, Slides, Drive, Calendar, Forms), Microsoft Office (Word, Excel, PowerPoint).
- **Data & BI** — PowerBI, Google Sheets at depth (pivot tables, query, scripts), SQL clients (psql, Supabase Studio, Firebase console).
- **Comms & collaboration** — Slack, Google Meet, Zoom, Loom.
- **Business operations** — DocuSign, 1Password, Stripe basics, GitHub project boards, Linear.
- **Design surfaces** — Figma (read/comment), Canva, v0.app.
- **Other dev-adjacent** — Postman, Stripe CLI, Firebase CLI, gcloud CLI, EAS CLI, Heroku CLI, Vercel CLI, Railway CLI.

If something isn't on this list, the honest answer is: I either haven't needed it or I'd pick it up quickly.

</details>

---

## Engineering practices

TypeScript-strict everywhere; conventional commits; Husky + lint-staged + Prettier (with Tailwind plugin) gating pushes. Monorepo workspaces (pnpm, Turborepo) when more than one runtime surface earns it. ADR-style decision notes (e.g. AHKMS' `docs/adr/`) when a design choice is load-bearing. Two-tier branching (`feature → dev → main`) on HeyLina, single-trunk on smaller repos. AI-augmented authoring (Claude Code, Cursor) treated as a tool, not a substitute for understanding.

---

## Experience

**COO & Co-founder — HeyLina** · 2025–Present
Building a longitudinal emotional-data product. Own the engineering process and operations console; contribute code across mobile, functions, and the web admin. Also run GTM, the interim raise, compliance, clinical advisory, and pricing.

**Data Strategy Manager — Anmut** · 2022–2025
Data-valuation and data-maturity engagements at FTSE-100 clients including JLR. Contributor on *Grace* (Anmut's data-maturity assessment product) and on the sector-by-sector data-value research.

**Head of Product — Teamvine (Future Factory Ltd)** · 2020–2022
Shipped four digital products in six months leading agile teams. Secured a £100k UKRI grant. Effectively the operator function for the business — product, sales, marketing, compliance, governance, content, ops, IP.

**Analyst → Strategy Consultant — Accenture** · 2018–2020
Digital-transformation programmes across the Royal Navy, the Police, and the Courts & Tribunals Judiciary. Then Accenture Strategy: pricing, GDPR, and data-driven insight engagements in telecoms and insurance.

**Mathematics Teacher — TeachFirst / Burnt Mill Academy, Harlow** · 2016–2018
Two-year leadership-development placement teaching GCSE and A-Level maths. To this day, the hardest thing I've done.

---

## Education

**BSc Philosophy & Economics, First Class Honours** — London School of Economics · 2013–2016

---

## Follow-ups (not part of the CV — internal notes)

- **Mirror this content into the site chatbot's knowledge bundle.** The Angus Hally agent context is built from [docs/chatbot-knowledge/](chatbot-knowledge/) by [scripts/build-chat-knowledge.mjs](../scripts/build-chat-knowledge.mjs) on `prebuild`. To answer "does he know X?" questions the same way this CV does, propagate:
  - The five project blurbs above (HeyLina, AHKMS, angushallyapp, Nexus, LLM Council) — either fold into the existing `cv.md` / `heylina.md` / `projects-index.md`, or add new `project-ahkms.md`, `project-nexus.md`, `project-llm-council.md` files.
  - The full **Broader tooling** drop-down — likely as a new `tooling.md` in `chatbot-knowledge/`, so the agent can answer "is Angus comfortable with Notion / Zapier / PowerBI / etc.?" without guessing.
  - The corrected positioning ("operator who ships code", "fingerprints on the code, not just the spec") should replace any operator-only framing in the existing `public-bio.md` and `about.md`.
- Re-verify `cv.md` and `public-bio.md` against this file once it's finalised, so the chatbot doesn't contradict the downloadable CV.
