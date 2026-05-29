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

Output: `docs/cvs/<persona>-cv.md` — e.g. [docs/cvs/dev-cv.md](../cvs/dev-cv.md), `docs/cvs/maths-teacher-cv.md`, `docs/cvs/data-strategy-cv.md`. Treat as research, not copy.

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

- **Chatbot knowledge bundle** — the bundle is built from [docs/chatbot-knowledge/](../chatbot-knowledge/) via [scripts/build-chat-knowledge.mjs](../../scripts/build-chat-knowledge.mjs) on `prebuild`. For each persona, propagate the curated page content (not the over-collected research) into the appropriate `.md` files there.
- **Downloadable PDF** — the existing puppeteer pipeline at [scripts/build-resume.mjs](../../scripts/build-resume.mjs) currently serves one resume from [public/resume.html](../../public/resume.html). If you want per-persona PDFs, duplicate to `resume-dev.html`, `resume-teacher.html`, etc., and parallel build scripts.
- **Social / external links** — LinkedIn featured-section, GitHub README, etc.
- **Code stats refresh** — `scripts/fetch-code-stats.mjs` is **not** wired into `prebuild` because it clones every owned + asklina repo (expensive). The committed `src/data/code-stats.json` + `public/data/code-stats.json` are point-in-time snapshots; `/dev`, `/ai-pm`, and `/cv` show the snapshot date in their stats footers. Refresh cadence is **manual**: re-run `npm run stats:refresh` (a) before any LinkedIn or external push of a persona page, (b) at any persona-page content refresh, and (c) when crossing a vanity-number milestone worth showcasing.

## Personas to apply this to

| Persona | Audience | Research doc | Rendered route | Status |
|---|---|---|---|---|
| Developer | Hiring engineer, technical client | [docs/cvs/dev-cv.md](../cvs/dev-cv.md) | [`/dev`](../../src/app/dev/page.tsx) ✅ | Full workflow complete |
| Data strategist | FTSE-100 data leader, Anmut alumni, CDOs | [docs/cvs/data-strategy-cv.md](../cvs/data-strategy-cv.md) | [`/strategist`](../../src/app/strategist/page.tsx) ✅ | Rendered; client-naming gaps flagged |
| Maths teacher | School leadership, TeachFirst alumni, edtech | [docs/cvs/maths-teacher-cv.md](../cvs/maths-teacher-cv.md) | [`/teacher`](../../src/app/teacher/page.tsx) ✅ | Rendered; exam-result data gap flagged |
| Debate coach | Schools wanting coaches with top-tier competing background; debate-judges; executives wanting argument coaching | [docs/cvs/debate-coach-cv.md](../cvs/debate-coach-cv.md) | [`/debate`](../../src/app/debate/page.tsx) ✅ | Unblocked 2026-05-27. Full workflow complete — LSE Debate + WUDC 2015 + Burnt Mill founding |
| AI product manager | AI startups, model labs, AI-shaped PM roles | [docs/cvs/ai-product-manager-cv.md](../cvs/ai-product-manager-cv.md) | [`/ai-pm`](../../src/app/ai-pm/page.tsx) ✅ | Full workflow complete |
| Harness engineer | Model labs, agent-tooling startups, MCP ecosystem | [docs/cvs/harness-engineer-cv.md](../cvs/harness-engineer-cv.md) | [`/harness`](../../src/app/harness/page.tsx) ✅ | Rendered (v3 — 43 user-level skills in `~/.claude/skills/` ground-truthed via `ls`; plugin-namespaced `anthropic-skills:*` shown separately; settings.json + agent files permission-denied so harness-config bucket partial) |
| Operator / COO | Investor, board, fellow founder | [public/resume.html](../../public/resume.html) (existing) | `/` and `/projects` (existing) | Pre-existing — predates this workflow |

## Lessons earned in the dev-CV run

- **Don't trust survey agents without ground-truth `ls`.** The first project survey was substantially hallucinated. The second was directed to paste the raw `ls` listing at the top of its output before doing anything else. Use that pattern.
- **Spot-check at least three load-bearing claims.** We caught a wrong spec count and an implausible TypeScript version (6.0.3) before they shipped.
- **Be candid about edge cases in writing.** Gmail-MCP-Server's `package.json` author wasn't Angus; ARA Copilot was v0.app-generated. The persona page is more credible *because* it labels these honestly than it would be hiding them.
- **Numbers beat adjectives.** The code-stats wiring (1.12M lines, 2,391 commits, 259 active days) does more work in the Profile than any phrase like "production-grade" or "shipped-at-scale" ever would.
- **The proudest piece often surfaces only on review.** Angus flagged Lina Lab as buried in Other after the first draft. Build in an explicit "what's missing or wrongly weighted?" review pass before declaring done.

## v2 backlog (after v1 ships)

v1 ships consistent visual treatment across all persona pages: same Mantine gradient `Paper` cards, same Framer Motion staggered-entry pattern, same overall composition (hero → headline cards → 2-up/3-up content → narrative card). This is intentional — v1 is about content and the *workflow* working end-to-end.

v2 should differentiate each persona visually:

- **Custom hero per persona.** `/teacher` already gestures at this with the photo hero; `/strategist` similarly with the JLR Data Fest image. `/dev`, `/ai-pm`, `/harness`, `/debate` could each get a distinct hero treatment (graph viz / eval-flow diagram / terminal mock / debate-floor metaphor).
- **Custom components per persona.** A reusable `<PersonaHero>` and `<PersonaProjectCard>` could be extracted, then each persona overrides parts. The current pages are self-contained `page.tsx` files of ~250-350 lines each — refactor to shared components is a natural v2 move.
- **Per-persona colour identity.** v1 reuses Mantine's `primary`/`secondary`/`accent`/`success`/`dark` semantic colors. v2 could give each persona a signature accent that carries through hero gradient + card highlights + button color.
- **Discoverability:** the `/personas` hub is intentionally not in nav for v1 (the footer's "Work with me" column surfaces the individual lenses instead). v2 might add a nav surface or a homepage tile if the user research justifies it.

Track v2 work as separate persona-specific PRs once content is settled.

## Footer integration

The footer's "Work with me" column lists each persona as a link (`src/components/Footer.tsx`). The `/personas` hub is **deliberately not linked from the UI** — it stays accessible by direct URL only. Each persona page is built to feel like "this is my main thing" rather than "one stop on a tour"; the cross-link bars between persona pages that existed in early drafts were removed for this reason.

## Surface registry

Route-level visual chrome (which header/footer/background a route gets) lives in a single source of truth: [src/lib/surfaces.ts](../../src/lib/surfaces.ts). `ClientLayout` reads this registry via `resolveSurface(pathname)` and renders the matching `kind`. **`ClientLayout` should never need editing to add a persona** — adding or changing chrome is a one-line edit to the registry.

The recipe for adding a persona / route-level visual system:

1. **Append one entry to `src/lib/surfaces.ts`.** Each entry is a `SurfaceDef`: a `surface` string (written to `data-surface`), a `kind`, and a `match(pathname)` predicate.
   - `kind: 'editorial'` → flat editorial chrome (`BlogHeader` + editorial footer + `GradientRoot`).
   - `kind: 'fullBleed'` → the page owns the whole viewport; site chrome and `GradientRoot` are suppressed.
   - **No entry** → default site chrome (Mantine `AppShell` + Glass header + `Footer`). Most routes want this.
   - **Use a prefix matcher so the persona owns its whole subtree.** A persona entry must match its index *and* anything beneath it — `match: (p) => p === '/<persona>' || p.startsWith('/<persona>/')` — so sub-pages like `/<persona>/privacy` render in the persona's own chrome rather than falling back to default site chrome. `/dev` is the reference implementation of this prefix matcher. (Contrast `/projects`, which is intentionally exact-match — its sub-routes are individual destinations and keep the default chrome.)
2. **Build the page** at `src/app/<route>/page.tsx`, which owns its own nav / hero / footer (for a `fullBleed` persona).
3. **Put fonts in `src/app/<route>/fonts.ts`** — route-local, **not** `src/lib/fonts.ts`. Each persona owns its own typography so it can diverge without touching shared font config.
4. **Put styles in `src/app/<route>/<route>.module.css`** — route-scoped CSS module, keyed off the `data-surface` attribute where it needs to react to the surface.

`data-surface` is orthogonal to colour-scheme: components that care (e.g. `Glass`, `GradientRoot`) read the attribute independently, so a persona can opt into bespoke treatment without the layout knowing the details.

## Per-persona metadata: `personaMetadata()` + the server-wrapper pattern

Each persona is a shareable destination, so it wants its own tab title, description, social-preview image, and favicon (PRD #123, user stories 26–29). Two pieces make this trivial and consistent:

### 1. The pure helper — `personaMetadata(config)`

[`src/lib/persona/personaMetadata.ts`](../../src/lib/persona/personaMetadata.ts) maps a small declarative config to a Next `Metadata` object:

```ts
import { personaMetadata } from '@/lib/persona/personaMetadata';

export const metadata = personaMetadata({
  title: 'Maths Teacher',
  description: 'TeachFirst-trained maths teacher; measurable exam-result deltas.',
  // everything below is optional — sensible site-wide defaults apply
  ogImage: '/og/teacher.png',      // default: /AH_Logo.png
  favicon: '/teacher.ico',         // default: /AH-logo-no-background.ico
  // ogTitle defaults to "<title> · Angus Hally"; url is optional
});
```

Only `title` and `description` are required; OG image, favicon, apple icon, OG title and canonical URL all fall back to the site defaults declared in `PERSONA_METADATA_DEFAULTS` (mirrored from the root layout). The helper is **pure** — no I/O, no Next runtime access — so the config → metadata mapping is unit-tested directly in [`personaMetadata.test.ts`](../../src/lib/persona/personaMetadata.test.ts). Adjusting a persona's metadata is a one-line config edit.

### 2. The constraint — `'use client'` pages can't export `metadata`

Next.js only honours an exported `metadata` (or `generateMetadata`) from a **Server Component**. The persona pages are `'use client'` (they use Mantine hooks, Framer Motion, `useMantineTheme`, etc.), and a module that opens with `'use client'` cannot also export `metadata` — Next ignores it, so the page silently falls back to the root layout's generic title and preview.

### 3. The pattern — thin server wrapper over the client island

Keep the existing client component, but make `page.tsx` a thin **Server Component** that (a) exports the metadata and (b) renders the client island as its only child. The interactive page becomes a sibling `*.client.tsx` module that owns the `'use client'` directive.

```
src/app/teacher/
  page.tsx            ← Server Component: exports metadata, renders <TeacherClient/>
  teacher.client.tsx  ← 'use client'  the existing interactive page, renamed
  fonts.ts            ← unchanged (route-local typography)
  teacher.module.css  ← unchanged (route-scoped styles)
```

`page.tsx` (server — note: **no** `'use client'`):

```tsx
import { personaMetadata } from '@/lib/persona/personaMetadata';
import TeacherClient from './teacher.client';

export const metadata = personaMetadata({
  title: 'Maths Teacher',
  description: 'TeachFirst-trained maths teacher; measurable exam-result deltas.',
});

export default function TeacherPage() {
  return <TeacherClient />;
}
```

`teacher.client.tsx` (the former `page.tsx` body, unchanged except the filename and that it is no longer the route entry):

```tsx
'use client';
// …all the existing Mantine + Framer Motion page code…
export default function TeacherClient() { /* … */ }
```

**Why this works and stays additive:**

- The server wrapper renders nothing but the island, so the rendered output and the persona's bespoke chrome (driven by the surface registry) are byte-for-byte unchanged — only the document `<head>` gains the persona metadata.
- Metadata is statically analysable by Next at build time (the wrapper is a Server Component with a static `metadata` export), so social crawlers get the persona title/description/preview without any client JS.
- No shared layout or `ClientLayout` edit is needed; this is a per-route change, mirroring how each persona already owns its `fonts.ts` and CSS module.

> Scope note: the helper and this pattern land on `dev` as foundation. **The persona pages adopt the wrapper on their own branches** (#117/#118/#119) — this foundation slice does not rename any persona `page.tsx`, so current routes are untouched.
