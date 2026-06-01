# Angus Hally — AI Product Manager CV

> **Workflow status (2026-05-26):** ✅ Frame · ✅ Research (high-confidence — same source material as dev-CV, reframed product-shaped) · ✅ Curate · ✅ Render at `/ai-pm` · ✅ Propagate (chatbot-knowledge entry at `docs/chatbot-knowledge/ai-pm.md`). See [persona-page-workflow.md](../guides/persona-page-workflow.md).

## Phase 1 — Frame

- **Audience:** AI / ML startups hiring senior product roles; product-led AI orgs (model labs, agent platforms); founders of pre-seed / seed AI companies looking for a product-shaped technical co-founder or first PM hire.
- **Question they're answering:** "Can he spec, ship, iterate, and *evaluate* an AI product without hiding behind buzzwords?"
- **Tagline (working):** "Product manager who builds the eval framework, not just the spec."

## Phase 2 — Research

### Profile

Product manager who codes. Co-founder and COO at HeyLina shipping a longitudinal emotional-data product across mobile (Expo / React Native), backend (Firebase Cloud Functions v2), and an internal operations console. Previously Head of Product at Teamvine — shipped four digital products in six months, secured a £100k UKRI grant, owned the operator function end-to-end.

What distinguishes this PM positioning from a generalist one: the eval framework underneath HeyLina (Lina Lab) is a product I personally architected and ship into. LLM-as-judge with full provenance, variant experiments, multi-scope rubrics, prompt-promotion pipeline — not as a research curiosity but as the iteration loop the production prompt rests on. Most AI products are run on vibes; this one isn't.

### Selected products

**HeyLina — emotional-data product** *(2025–Present)*
*Customer-facing AI product on iOS and Android.* React Native (Expo) mobile app · Firebase Cloud Functions v2 backend · Internal operations console for prompt and theme management · RAG-augmented chat with user-scoped Pinecone indexes · GPT-4o + audio-preview models · ElevenLabs TTS · prompt configuration served live from Firestore.

- Product positioning: longitudinal emotional data, clinical-safety-aware, conversational interface as primary modality.
- Commercial: own GTM, fundraising (interim raise running), pricing, clinical advisor relationships, compliance posture.
- Process: built the engineering process (two-tier branching, Conventional Commits, Detox E2E suite, GitHub Actions deploying to Firebase) alongside our mobile engineer.

**Lina Lab — prompt-evaluation engine** *(part of the HeyLina stack)*
The evaluation backbone behind HeyLina. A FastAPI service that hosts a versioned prompt catalog, a variant-comparison runtime, and a multi-scope eval framework (message / turn / conversation / variant). 8 MECE kickoff types modelled in `scenario_types.py`, scenarios stored in Supabase, LLM-as-judge with `judge_type` / `judge_model` / `judge_prompt_version` / `judge_rater_id` provenance, rolling baseline snapshot identity per run, prompt soft-delete + version pinning, promotion pipeline with Slack notifications, clinical-safety risk classification on transcripts. **This exists because the commercial reasoning about iteration velocity required it** — not because the engineering taste did. See [dev-cv.md](dev-cv.md) for the technical breakdown.

**AHKMS — Knowledge Management System** *(personal full-stack, October 2025–)*
A multi-platform AI knowledge-capture product (web on Vercel, worker on Railway, mobile via Expo, Supabase for Postgres + Auth + Storage + Edge Functions). Implements the PARAMPS framework (Projects, Areas, Resources, Archive, Memories, People, Secure). Demonstrates AI-pipeline product design: capture → AI extraction → PARAMPS classification → human-in-the-loop review → derived artifacts with lineage tracking. Live at [kms.angushally.com](https://kms.angushally.com).

**Teamvine — 4 products in 6 months** *(Head of Product, 2020–2022)*
Teamvine (Future Factory Ltd) — online team-building startup. Shipped four digital products in six months while leading agile development teams. Secured £100k UKRI innovation grant. Owned the operator function: product, customer services, sales, marketing, compliance, governance, content, ops, IP.

### Evaluation & iteration discipline

The core differentiator for an AI-PM CV in 2026.

- **LLM-as-judge with provenance** — every evaluation row carries the judge model, the judge prompt version, the judge rater identity, and the judge type so regressions are diagnosable. Most teams skip this and live to regret it.
- **Variant experiments at production speed** — model × temperature × role-preset × message-style toggles, with baseline-delta reporting. The cost of running a comparison should be the cost of authoring the variant config; everything else is automation.
- **Multi-scope eval rubrics** — message-level, turn-level, conversation-level, variant-level. Different questions live at different scopes; conflating them creates the "metric improved but the product feels worse" failure mode.
- **Prompt soft-delete + version pinning** — historical runs continue to resolve even after prompts are retired. The eval store is append-only at the identity layer.
- **Rolling-baseline snapshot identity** — comparative regression detection becomes meaningful only when "baseline" is a pinned, identifiable thing rather than a moving target.
- **Promotion pipeline with Slack notifications** — production-grade ops, not a research notebook.

### Commercial / GTM (HeyLina)

- Founded with a clinical-emotional-data thesis; positioning had to thread the regulatory needle (longitudinal emotional data is adjacent to clinical without being a medical device).
- Pricing strategy informed by the Anmut data-valuation background (see [data-strategy-cv.md](data-strategy-cv.md)).
- Clinical advisor relationships run by me directly.
- Interim raise currently running.

### Tooling & process

- **AI-augmented authoring** — daily use of Claude Code, Cursor, MCP servers, custom skills authored personally (see [harness-engineer-cv.md](harness-engineer-cv.md)).
- **Eval-as-code** — Python (FastAPI, Pydantic) on Railway; configs as JSON; CI hooks for evaluative regressions.
- **Product process** — Conventional Commits, ADR-style decision notes, two-tier branching (feature → dev → main), Husky pre-push gates.
- **Stakeholder loops** — clinical advisors, investors, engineers all run through different loop cadences with different artefacts. PM-as-translator is the day job.

### Engineering credibility

For the AI-PM lens specifically: the dev work is the credential, not the role.

- 1.12M lines added across 44 repos · 2,391 commits · 259 active days · ~3 years (see [src/data/code-stats.json](../../src/data/code-stats.json)).
- Owns architecture decisions across mobile, backend, eval, and data layers at HeyLina.
- Reads PRs, writes PRs, ships PRs.

### Experience (PM-lens)

- **COO & Co-founder — HeyLina** · 2025–Present *(AI product end-to-end; eval discipline)*
- **Data Strategy Manager — Anmut** · 2022–2025 *(commercial framing of data products; client-side at JLR)*
- **Head of Product — Teamvine** · 2020–2022 *(four products in six months; £100k UKRI grant)*
- **Analyst → Strategy Consultant — Accenture** · 2018–2020 *(pricing, GDPR; cross-functional fluency)*
- **Mathematics Teacher — TeachFirst / Burnt Mill Academy, Harlow** · 2016–2018 *(stakeholder management at 30 students per period)*

### Education

**BSc Philosophy & Economics, First Class Honours** — London School of Economics · 2013–2016

## Phase 3 — Curated for render

The `/ai-pm` page should lead with:

1. **Hero** — name + tagline "Product manager who builds the eval framework, not just the spec" + a one-line sub: "AI product with discipline — model + prompts + judges + promotion."
2. **Eval discipline as the headline visual** — a 3-up Mantine card row for *Provenance · Variants · Multi-scope* with a quote from the Lina Lab data model. This is the differentiator vs. generalist PMs.
3. **Selected products** — HeyLina · Lina Lab · AHKMS · Teamvine (4 cards, Mantine grid).
4. **By the numbers** — reuse the `src/data/code-stats.json` import the `/cv` page uses. Same component pattern.
5. **Commercial & GTM strip** — short prose card.
6. **Experience timeline** — compact, PM-framed bullets.
7. **Education** — single line.

Visual treatment: HeyLina pitch-video photo (`/20260327_Heylina_Pitch_Video.png`) or strategy-day photo (`/20250927_heylina_Strategy_day.jpg`) as the hero — both already in `public/`.

Drop (over-collected, NOT for the rendered page):
- Detailed Lina Lab internals (those belong on `/dev` and `/harness`)
- Anmut details (belong on `/strategist`)
- The longer commercial-GTM section beyond a card

## Open questions for Angus

- HeyLina commercial specifics — what's public-shareable? Pricing model, GTM motion, advisor structure, clinical-positioning specifics?
- Any HeyLina product screenshots or app-store listings we can surface?
- Is the route `/ai-pm`, `/ai-product`, `/ai-product-manager`, or something tighter?
- Should the eval-discipline section get its own dedicated micro-page, or live as a section on `/ai-pm`?
