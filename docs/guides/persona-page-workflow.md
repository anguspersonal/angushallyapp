# Persona-page workflow: research → markdown → rendered page

A repeatable process for building persona-focused pages on this site (Developer CV, Data Strategist CV, Maths Teacher CV, Debate Coach CV, AI Product Manager CV, Harness Engineer CV, Operator/COO CV, etc.). The key insight: **the research markdown is intentionally over-collected and is not 1:1 copy for the final page.** It's the substrate from which an engaging, progressively-disclosed, animated rendered page is curated.

## When to use

- You want a new persona-shaped page on the site (`/dev`, `/teacher`, `/strategist`, …) that frames Angus through one specific lens.
- You're refreshing an existing persona page after material new work has shipped.
- A non-CV but persona-shaped artefact is needed (investor doc, contractor pitch, conference bio).

This workflow does **not** apply to project pages (`/projects/*`), the homepage, or feature-shipping work. For those, prefer the existing routes and patterns.

## The phases

### 1. Define the persona (10 min)

Decide three things before any research:

- **Audience** — who reads this page? Hiring engineer, dean of a school, FTSE-100 data leader, board observer.
- **Question they're answering** — "can he ship?", "can he teach mine?", "does he understand my data problem?".
- **The single sentence positioning** — what tagline lives at the top. Borrow voice from [public/resume.html](../../public/resume.html); invert framing for engineering-leaning vs operator-leaning vs domain-expert-leaning audiences.

Capture in 4-6 lines at the top of the research markdown.

### 2. Research — over-collect (1-2 hours)

Goal: build a research document containing *more* than will ever ship to the page, so curation has good raw material.

Output: `docs/<persona>-cv.md` — e.g. [docs/dev-cv.md](../dev-cv.md), `docs/teacher-cv.md`, `docs/strategist-cv.md`. Treat as research, not copy.

Use parallel Explore agents (max 3, usually 1-2 is enough):

- **Repo / artefact scan** — for engineering personas, deep-dive the most relevant codebases for verified credentials with file-path citations. For non-engineering personas, the equivalents are: lesson plans, exam results, Anmut deliverables, client engagement evidence, talks given, etc.
- **Adjacent inventory** — what other work / artefacts exist that might surface? List them with status (active / dormant / archived).
- **Spot-check** — Explore agents hallucinate. Before trusting a survey, `ls` the ground truth (`Get-ChildItem C:\Users\angus\dev`) and remove invented entries. We caught fabricated repo names ("monitoring", "testing-utils") and a wrong Detox spec count (claimed 26, actual 17) on the dev-CV run.

Then write the research markdown with sections like: Profile · Selected work · Other work · Skills · Broader tooling (`<details>` drop-down) · Practices · Experience · Education · Follow-ups.

**Rules for the research doc:**

- Every concrete claim cites a file path or evidence source. No "production-grade" without a path.
- Be honest about edge cases (e.g. for the dev-CV: Gmail-MCP-Server isn't Angus's code; ARA Copilot is v0.app-generated).
- Over-collect — include the broader-tooling drop-down with everything Angus is fluent in, even if it won't render in the final page body.
- End with a **Follow-ups** section listing what propagation work is still owed (chatbot knowledge bundle, downloadable PDF, etc.).

### 3. Curate (30-60 min)

Read the research markdown with Angus. For each section, decide:

- **Lead with** — what's the single proudest piece? (Dev-CV ran with Lina Lab's data model after Angus flagged it had been buried.)
- **Cut** — over-collected items that dilute. Demote weaker entries to "Other" lines.
- **Reframe** — pull verbatim phrases that sound right; rewrite the rest in plain first-person voice.
- **Quantify** — wherever evidence numbers exist (code-stats, exam results, valuation tickets), prefer them over adjectives.

The result is *not* a rewrite of the research markdown — it's a shortlist of what gets rendered on the page.

### 4. Render — page-build (1-3 hours)

Build a Next.js route under `src/app/<persona>/page.tsx` mirroring the structure of [src/app/cv/page.tsx](../../src/app/cv/page.tsx), with progressive disclosure and motion built in:

- **Mantine `Paper` cards** with the established gradient background (`linear-gradient(135deg, ${dark[7]}, ${dark[8]})`) for consistent surfaces.
- **Framer Motion** staggered entry: title (`delay: 0.2`), stats / hero section (`0.3`), skills (`0.4`), projects (`0.6`).
- **Progressive disclosure** for the long tail: `<details>` blocks in markdown, or `Collapse` / `Accordion` from Mantine in React.
- **Evidence sections** where numeric backing exists: see the "By the numbers" pattern on [/cv](../../src/app/cv/page.tsx) loading from [src/data/code-stats.json](../../src/data/code-stats.json). For teacher persona, the equivalent could be exam-result deltas; for strategist, engagement volume / portfolio value.
- **Honest framing UI** — for the broader-tooling list, the `<details>` drop-down approach used in the dev-CV is the template: surface depth on demand without bloating the body.

### 5. Propagate (15-30 min)

Each persona page has matching downstream artefacts:

- **Chatbot knowledge bundle** — add or update `docs/chatbotv1/`... wait, the bundle is built from [docs/chatbot-knowledge/](../chatbot-knowledge/) via [scripts/build-chat-knowledge.mjs](../../scripts/build-chat-knowledge.mjs) on `prebuild`. For each persona, propagate the curated page content (not the over-collected research) into the appropriate `.md` files there.
- **Downloadable PDF** — the existing puppeteer pipeline at [scripts/build-resume.mjs](../../scripts/build-resume.mjs) currently serves one resume from [public/resume.html](../../public/resume.html). If you want per-persona PDFs, duplicate to `resume-dev.html`, `resume-teacher.html`, etc., and parallel build scripts.
- **Social / external links** — LinkedIn featured-section, GitHub README, etc.

## Personas to apply this to

| Persona | Audience | Research doc | Rendered route | Status |
|---|---|---|---|---|
| Developer | Hiring engineer, technical client | [docs/dev-cv.md](../dev-cv.md) | `/dev` (not yet built) | Phase 2 done; curation + render pending |
| Data strategist | FTSE-100 data leader, Anmut alumni, CDOs | [docs/data-strategy-cv.md](../data-strategy-cv.md) | `/strategist` (not yet built) | Phase 1 stub |
| Maths teacher | School leadership, TeachFirst alumni, edtech | [docs/maths-teacher-cv.md](../maths-teacher-cv.md) | `/teacher` (not yet built) | Phase 1 stub |
| Debate coach | Schools / unis, debate societies | [docs/debate-coach-cv.md](../debate-coach-cv.md) | `/debate` (not yet built) | Phase 1 stub — needs material confirmation from Angus |
| AI product manager | AI startups, model labs, AI-shaped PM roles | [docs/ai-product-manager-cv.md](../ai-product-manager-cv.md) | `/ai-pm` (not yet built) | Phase 1 stub |
| Harness engineer | Model labs, agent-tooling startups, MCP ecosystem | [docs/harness-engineer-cv.md](../harness-engineer-cv.md) | `/harness` (not yet built) | Phase 1 stub |
| Operator / COO | Investor, board, fellow founder | [public/resume.html](../../public/resume.html) (existing) | `/` and `/projects` (existing) | Pre-existing — predates this workflow |

## Lessons earned in the dev-CV run

- **Don't trust survey agents without ground-truth `ls`.** The first project survey was substantially hallucinated. The second was directed to paste the raw `ls` listing at the top of its output before doing anything else. Use that pattern.
- **Spot-check at least three load-bearing claims.** We caught a wrong spec count and an implausible TypeScript version (6.0.3) before they shipped.
- **Be candid about edge cases in writing.** Gmail-MCP-Server's `package.json` author wasn't Angus; ARA Copilot was v0.app-generated. The persona page is more credible *because* it labels these honestly than it would be hiding them.
- **Numbers beat adjectives.** The code-stats wiring (1.12M lines, 2,391 commits, 259 active days) does more work in the Profile than any phrase like "production-grade" or "shipped-at-scale" ever would.
- **The proudest piece often surfaces only on review.** Angus flagged Lina Lab as buried in Other after the first draft. Build in an explicit "what's missing or wrongly weighted?" review pass before declaring done.
