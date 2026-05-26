# Angus Hally — Data Strategy CV

> **Workflow status (2026-05-26):** ✅ Frame · 🟡 Research (best-effort from existing CV material; gaps flagged) · ✅ Curate · ✅ Render at `/strategist` · ✅ Propagate (chatbot-knowledge entry at `docs/chatbot-knowledge/strategist.md`). See [persona-page-workflow.md](../guides/persona-page-workflow.md).
>
> ⚠ Source-material gap: this research doc is built from `public/resume.html` and `src/data/careerMilestones.ts` — there is no primary deliverable archive (decks, contracts, named client work) in this repo. Open questions at the bottom of this file flag what Angus needs to confirm before any external use.

## Phase 1 — Frame

- **Audience:** FTSE-100 data leaders, CDOs at mid-to-large orgs, Anmut and ex-Anmut network, data-strategy consultancies, edtech / health-tech orgs hiring senior data-strategy.
- **Question they're answering:** "Does he understand my data problem, and can he translate it into commercial value without disappearing into a year-long programme?"
- **Tagline (working):** "Data valuation that survives contact with engineering reality."

## Phase 2 — Research

### Profile

A decade across Accenture, Anmut, and HeyLina at the intersection of business strategy, data, and software. Three years at Anmut leading data-valuation and data-maturity engagements helping enterprise clients price what their data is actually worth. Before that, four years at Accenture (analyst → strategy consultant) on digital transformation across UK public sector and on pricing / GDPR / data-insight engagements in telecoms and insurance. Now co-founder and COO at HeyLina, where the data-strategy lens preceded any engineering.

Distinct from "data strategist who deck-builds and exits" — every recommendation has been pressure-tested by someone (often me) actually shipping the system that lives downstream of it.

### Selected engagements

**Data valuation — multiple FTSE-100 clients** *(Anmut, 2022–2025)*
Led engagements helping enterprise clients quantify the financial value of their data estate. The Anmut methodology assigns commercial value to data assets in a way that survives audit: it forces a chain from data → decision → revenue/cost impact rather than treating data as a generic balance-sheet item. Outputs ranged from board-level valuations through to asset-level prioritisation that fed downstream platform investment decisions.
*Open: which clients can be named publicly?*

**JLR — client-side data strategy** *(Anmut, ~2024)*
Client-side at Jaguar Land Rover. Reported into senior data leaders on strategy and prioritisation. Attended JLR Data Fest 2024 as part of the engagement (photo in `src/data/careerMilestones.ts`).
*Open: deliverable specifics, named outputs.*

**Grace — data-maturity assessment tool** *(Anmut, 2022–2025)*
Contributor on *Grace*, Anmut's data-maturity tool. A diagnostic that scores an organisation across multiple data-capability dimensions and produces a maturity baseline plus an improvement roadmap. Used in initial engagements to scope where the value-creation opportunity actually sits.
*Open: which dimensions Angus owned / scoped specifically.*

**FTSE-100 sector-by-sector data-value research** *(Anmut, 2023–2024)*
Contribution to Anmut's published thinking on data value across sectors. Mapped how data contributes to enterprise value differently in financial services vs. consumer goods vs. industrials vs. healthcare.
*Open: public link if one exists.*

**Pricing & GDPR — telecoms and insurance** *(Accenture Strategy, 2019–2020)*
Pricing strategy and GDPR engagements at large telecoms and insurance clients. The transition from analyst to strategy consultant. Cross-functional work involving data, legal, and commercial leaders.

**Digital transformation — UK public sector** *(Accenture, 2018–2019)*
Analyst on digital-transformation programmes across the Royal Navy, the Police, and the Courts & Tribunals Judiciary. Where I cut my teeth understanding how strategy actually contacts operations in legacy estates.

### HeyLina — strategy-first architecture *(2025–Present)*

The strategy lens preceded any code. The product is longitudinal emotional data — a category that exists because the data-strategy framing came first. As co-founder and COO I own GTM, fundraising, compliance, pricing, and the engineering process, but the strategic framing is the part that recruits data leaders to the conversation. Clinical-advisory relationships and the compliance posture are downstream of that framing.

### Frameworks & methods

- **Data valuation** — Anmut methodology: data asset taxonomy → use case mapping → value chain → P&L impact.
- **Data maturity** — multi-dimensional capability assessment (Grace) → roadmap → investment prioritisation.
- **Strategy execution** — backwards-from-fixed-deadline planning (see ARA Copilot in [dev-cv.md](dev-cv.md)); critical-path identification; parallel review.
- **Pricing strategy** — value-based pricing, willingness-to-pay analysis, GDPR-constrained data monetisation.
- **Data-driven insight engagements** — cross-functional with engineering, legal, and commercial; pragmatic about what "insight" actually means commercially.

### Skills

- **Domain** — Data valuation, data maturity, executive advisory, market research, sector analysis.
- **Stakeholder** — Briefing and aligning senior data leaders; chairing cross-functional steering groups; bridging engineering, legal, and commercial.
- **Compliance** — GDPR; UK financial-services regulatory awareness from telecoms / insurance; clinical-safety positioning (HeyLina).
- **Engineering literacy** — uniquely for a strategist: I can read schemas, evaluate platform decisions, and stand up the prototype that proves the strategy. See [dev-cv.md](dev-cv.md) for the engineering breadth.
- **Tooling** — Excel/Sheets at depth (pivot tables, query, scripts); PowerBI; SQL; Notion; internal tools I've built myself.

### Experience (engineering-lens off, commercial-lens on)

- **COO & Co-founder — HeyLina** · 2025–Present
- **Data Strategy Manager — Anmut** · 2022–2025
- **Head of Product — Teamvine (Future Factory Ltd)** · 2020–2022 *(four products in six months, £100k UKRI grant)*
- **Analyst → Strategy Consultant — Accenture** · 2018–2020
- **Mathematics Teacher — TeachFirst / Burnt Mill Academy, Harlow** · 2016–2018

### Education

**BSc Philosophy & Economics, First Class Honours** — London School of Economics · 2013–2016

## Phase 3 — Curated for render

The `/strategist` page should lead with:

1. **Hero** — name + tagline + sub-line "I help organisations price what their data is actually worth."
2. **Selected engagements** — top 4 as Mantine cards: FTSE-100 data valuation (anonymised), Grace, JLR, sector data-value research.
3. **Frameworks** — 3-up card row: data valuation methodology · data maturity · pricing strategy.
4. **Engineering bridge** — short callout linking to `/dev`: "Strategy is more durable when the strategist can also stand up the system downstream of it."
5. **Experience strip** — compact timeline matching the timeline component shape.
6. **Education** — single line.

Visual treatment: Anmut JLR Data Fest image (`/20241023_Anmut_JLR_Data_Fest.jpg`) or strategy dinner (`/20260426_anmut_strat_dinner.jpg`) — both already in `public/`.

Drop (over-collected, NOT for the rendered page in this pass):
- Detailed Anmut methodology unpacking
- Per-client deliverable detail
- Anything that needs client confirmation to be safe to publish

## Open questions for Angus

- Which Anmut clients can be named publicly?
- Is there a published version of the FTSE-100 sector data-value research worth linking to?
- Specific Anmut artefacts (whitepaper, talk, decision-tree slide) we have rights to surface as visual cards?
- Best hero image — JLR Data Fest or Anmut strategy dinner?
- Should the route sit at `/strategist` or something more descriptive like `/data-strategy`?
