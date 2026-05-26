# Angus Hally — Harness Engineer CV

> **Workflow status (2026-05-26):** ✅ Frame · 🟡 Research (v1 from observable skills + workspace; background agent may refine) · ✅ Curate · ✅ Render at `/harness` · ✅ Propagate (chatbot-knowledge at `docs/chatbot-knowledge/harness.md`). See [persona-page-workflow.md](../guides/persona-page-workflow.md).
>
> "Harness engineer" = builds the scaffolding *around* an LLM (agent runtimes, MCP servers, skill systems, evaluation harnesses, prompt operations) rather than the model itself.

## Phase 1 — Frame

- **Audience:** Model labs hiring for agent-platform / developer-tooling roles (Anthropic, OpenAI, Google DeepMind); MCP ecosystem maintainers; agent-tooling startups (Cursor, Cline, Continue, Aider, Replit, etc.); internal-tooling teams at AI-heavy orgs.
- **Question they're answering:** "Can he build the agent runtime, the eval harness, and the developer ergonomics around an LLM — not just call its API?"
- **Tagline (working):** "Code is ephemeral. The harness is leverage."

## Phase 2 — Research

### Profile

Daily-use harness builder. Not a model researcher — a tooling engineer who treats the LLM as a primitive and builds ergonomic, repeatable structure around it. The footprint shows up in three places: (1) custom Claude Code skills and agents authored to compress recurring workflows; (2) Lina Lab, a production prompt-evaluation engine with LLM-as-judge provenance and a promotion pipeline; (3) AHKMS, a webhook-driven AI orchestration pipeline running on Railway + Supabase Edge Functions.

The differentiator vs. someone who "uses LLMs": the harness exists, is versioned, is shared between projects, and is treated as a load-bearing surface rather than a personal hack.

### Custom skills authored

A library of Claude Code slash-commands written to compress recurring workflows. Each is a piece of LLM ergonomics around a specific job.

**HeyLina Daily Operating System** — a multi-skill ritual layer for running HeyLina operations through Claude:
- `/dos-eod` — end-of-day synthesis ritual
- `/dos-reflect` — weekly reflection ritual
- `/dos-inbox` — inbox capture
- `/dos-braindump` — fast clear-the-head capture
- `/heylina-notion` — Notion workspace integration
- `/heylina-pptx` — HeyLina-branded deck generation

**Personal capture & planning:**
- `/capture` — second-brain capture (replaces `/qc`, `/dos-inbox` for broader use)
- `/prep` — day or meeting prep
- `/quick-capture` (`/qc`) — fast Notion capture without breaking flow
- `/whatsapp-blast` — backlog-WhatsApp triage with action routing

**Conversation ergonomics:**
- `/explain` — layered explanation of a dense output
- `/handoff` — generate transfer artefact for a new Claude session
- `/route` — calibrated check on whether the current Claude surface is the right one
- `/low-brain-grill` — walk through a list of questions one at a time
- `/boss-mode` — switch to Chair / NED persona for accountability sessions
- `/personal-style` — load voice rules before drafting under Angus's name

**Dev tooling:**
- `/qa-review` — round-aware QA review of a PR
- `/address-review` — companion to qa-review (action / push back / defer findings)
- `/review-and-comment` — review and post to PR
- `/wrap` — end-of-session wrap-up
- `/merge-prune` — merge + clean up branches end-to-end
- `/diagnose` — disciplined diagnosis loop
- `/spec-debate` — multi-agent spec validation
- `/grill-me` / `/grill-with-docs` — stress-test a plan
- `/sync-dotclaude` — sync personal config repo
- `/git-guardrails-claude-code` — block destructive git commands
- `/setup-pre-commit` — Husky + lint-staged setup
- `/prototype` — throwaway prototype builder
- `/cloud-env` — configure a repo for cloud Claude Code

### Custom agents

Multi-agent patterns for harder calls:

- **architect-senior-engineer** — design / refactor with senior-eng discipline
- **pragmatist** — ship-focused scope cutter
- **synthesiser** — weighs arguments from multiple agents and recommends a call
- **voice-of-user** — represents end-user needs against technical preferences
- **ui-ux** — interface review and refinement
- **repo-organizer** / **archiver** — repo cleanliness specialists
- **deep-thinking** — read-only reasoning agent
- **claude-code-guide** — answers Claude Code / SDK / API questions
- Plus Anthropic's built-in: **Explore** (read-only fan-out), **Plan** (implementation planner), **general-purpose** (catch-all)

The multi-agent debate pattern in `/spec-debate` (drafter → reviewer → defender → judge → implementer) is the most ambitious of these — five-agent orchestration scoring a spec against a rubric.

### Harness configuration & ops

- **dotclaude repo** — versioned `~/.claude/` config: skills, agents, settings, hooks. Treated as a portfolio artefact, not a scratchpad.
- **Husky pre-push gates** — `.husky/pre-push` runs typecheck/lint/test before push.
- **Git guardrails** — Claude Code hooks block destructive git commands (push, reset --hard, clean, branch -D).
- **Settings tuning** — `core.fileMode false` per machine when needed; permissions allowlists per project to reduce prompts.
- **MCP server choices** — Notion (multiple workspaces), Slack, Gmail (forked from `gongrzhe`), Supabase, Vercel, computer-use (native Windows control), Claude-in-Chrome (browser DOM), PostHog, Composio (auth broker), Dex (CRM), scheduled-tasks, ccd_session_mgmt. Choices reflect intentional harness design — each MCP has a job.
- **Conventional commits + AI co-author footprint** — `Co-Authored-By: Claude Opus 4.7` on most recent commits; the AI-pair workflow is at-scale (2,391 commits, 1.12M lines added across 44 repos — see `src/data/code-stats.json`).

### Lina Lab — the production harness exemplar

Beyond personal config, the most substantial harness artefact is **Lina Lab** (see [dev-cv.md](dev-cv.md) and [ai-product-manager-cv.md](ai-product-manager-cv.md)): a Python / FastAPI eval engine on Railway with LLM-as-judge provenance, variant experiments, multi-scope rubrics, prompt soft-delete + version pinning, and a Slack-notified promotion pipeline. The same eval-discipline thinking generalises beyond HeyLina.

### AHKMS — agentic-pipeline pattern

[AHKMS](https://kms.angushally.com) — capture → workflow webhook fires the Express worker → AI extraction → PARAMPS classification → human-in-the-loop review → derived artifacts with lineage tracking. Not "agents" in the SDK sense, but agentic orchestration: webhook-driven, stateful, human-gated.

## Phase 3 — Curated for render

The `/harness` page should lead with:

1. **Hero** — *"Code is ephemeral. The harness is leverage."* + a sub-line on the harness-engineer framing.
2. **Custom skills overview** — grouped 4-up card row (Daily OS / Capture & planning / Conversation ergonomics / Dev tooling). With a `<details>` drop-down listing every individual skill.
3. **Custom agents** — compact card row.
4. **Production harness exemplars** — Lina Lab + AHKMS as 2-up.
5. **Harness configuration** — short prose card.
6. **Engineering credibility** — link out to `/dev` stats.

Visual treatment: terminal-aesthetic or schematic-aesthetic. Use the existing dark gradient pattern but lean into monospace where appropriate.

Drop (over-collected, NOT for the rendered page):
- Exhaustive enumeration of every skill (use a drop-down)
- Detailed MCP server config
- Detailed Lina Lab internals (those belong on `/dev`)

## Open questions for Angus

- How much of `dotclaude` is publishable as a portfolio artefact?
- Any MCP server contributions / PRs upstream worth surfacing?
- Are there harness patterns documented elsewhere (ADRs, blog posts, talks) worth linking?
- Is the angle "harness engineer at a lab" or "harness consultant"? Different audience, different framing.
- Naming sanity-check on persona positioning — does "harness engineer" land for the audience, or do you prefer "agent platform engineer" / "developer-tools engineer" / "LLM ops engineer"?
