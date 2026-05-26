---
source: /ai-pm
topic: AI Product Manager persona
priority: normal
---

> Source: `/ai-pm` — AI Product Manager CV page. Audience: AI / ML
> startups hiring senior product roles, model labs, agent-platform
> orgs, founders seeking a product-shaped technical co-founder. For
> the developer lens see `/dev`; for commercial framing see `/strategist`.

**Tagline:** *"Product manager who builds the eval framework, not just the spec."*

**Profile:** Co-founder and COO at HeyLina, shipping an AI product across mobile, backend, and an internal ops console. Previously Head of Product at Teamvine (four products in six months, £100k UKRI grant).

**Eval discipline — the differentiator vs. generalist PMs.** Through Lina Lab, the prompt-evaluation engine I architected:

- **Provenance** — every eval row carries `judge_type`, `judge_model`, `judge_prompt_version`, `judge_rater_id`. Regressions are diagnosable.
- **Variant experiments** — model × temperature × role-preset × message-style toggles, with baseline-delta reporting.
- **Multi-scope rubrics** — message / turn / conversation / variant. Conflating scopes is the "metric up, product feels worse" trap.
- **Prompt soft-delete + version pinning** — historical runs continue to resolve.
- **Rolling-baseline snapshot identity** — comparative regression detection becomes meaningful only when "baseline" is pinned.
- **Promotion pipeline with Slack notifications** — production-grade ops, not a research notebook.

**Selected products:** HeyLina (live AI product on iOS + Android), Lina Lab (the eval engine), AHKMS ([kms.angushally.com](https://kms.angushally.com) — multi-platform AI knowledge-management system), Teamvine (4 products in 6 months).

**Commercial/GTM (HeyLina specifically):** Own GTM, the interim raise, clinical advisor relationships, compliance posture, pricing strategy. Founded on a clinical-emotional-data thesis that had to thread a regulatory needle.

**Engineering credibility:** 1.12M lines added, 2,391 commits across 44 repos (see `/dev`).

The research substrate is at `docs/cvs/ai-product-manager-cv.md`.
