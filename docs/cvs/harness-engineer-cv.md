# Angus Hally — Harness Engineer CV

> **Workflow status (2026-05-27):** ✅ Frame · ✅ Research (v2 — background Explore agent verified 36 skills in `~/.claude/skills/`; agent files + settings.json permission-denied so harness-config bucket remains partial) · ✅ Curate · ✅ Render at `/harness` · ✅ Propagate. See [persona-page-workflow.md](../guides/persona-page-workflow.md).
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

A library of slash-commands compressing recurring workflows. 36 verified user-level skills in `~/.claude/skills/` (Explore-agent inventory, 2026-05-27), plus a parallel set of plugin-namespaced skills (`anthropic-skills:*`) including HeyLina-specific rituals. Grouped by job.

**Daily Operating System & capture** *(plugin-namespaced; HeyLina-flavoured)*:
- `/dos-eod` — end-of-day synthesis ritual
- `/dos-reflect` — weekly reflection ritual
- `/dos-inbox` — inbox capture
- `/dos-braindump` — fast clear-the-head capture
- `/heylina-notion` — Notion workspace integration
- `/heylina-pptx` — HeyLina-branded deck generation
- `/capture` — second-brain capture
- `/quick-capture` (`/qc`) — fast Notion capture without breaking flow
- `/prep` — day or meeting prep
- `/whatsapp-blast` — backlog-WhatsApp triage with action routing
- `/personal-style` — load voice rules before drafting
- `/handoff` — generate transfer artefact for a new Claude session
- `/route` — calibrated check on whether the current surface is right
- `/explain` — layered explanation of a dense output
- `/boss-mode` — Chair / NED persona for accountability sessions

**Spec-driven development**:
- `/spec-debate` — five-agent debate (drafter → reviewer → defender → judge → implementer) scoring a spec against a rubric
- `/spec-req` — generate a comprehensive requirements document
- `/spec-design` — generate a standardised design document template
- `/spec-tasks` — generate structured implementation task file from requirements + design
- `/spec-impl` — complete implementation of specified tasks with quality checks
- `/spec-verify` — confirm planned improvements are implemented and update task checkboxes
- `/to-prd` — turn current context into a PRD on the project issue tracker
- `/to-issues` — break a plan into independently-grabbable issues using tracer-bullet vertical slices

**PR review, QA & repo hygiene**:
- `/qa-review` — round-aware QA review of a PR (posts to GitHub with round marker)
- `/address-review` — developer-side companion: triage findings, push, reply inline
- `/review-and-comment` — review and post to PR
- `/create-clean-tree` — semantic-batch commits across messy working tree
- `/wrap` — end-of-session wrap-up + cheap QA gates + thematic commits
- `/merge-prune` — end-to-end merge + branch cleanup + prune
- `/sync-dotclaude` — sync ~/.claude/ ↔ dotclaude repo
- `/git-guardrails-claude-code` — block destructive git commands via hooks
- `/setup-pre-commit` — Husky + lint-staged setup
- `/repo-organizer` — repo cleanliness specialist
- `/archiver` — feature-folder archiving
- `/cloud-env` — configure a repo for cloud Claude Code
- `/setup-matt-pocock-skills` — repo-aware agent-skills block in AGENTS.md / CLAUDE.md

**Engineering discipline**:
- `/solid` — SOLID principles, TDD, clean code transformation
- `/architect-senior-engineer` — design / refactor with senior-eng discipline
- `/improve-codebase-architecture` — find deepening opportunities informed by domain language + ADRs
- `/tdd` — red-green-refactor loop
- `/prototype` — throwaway prototype to flush out a design
- `/pragmatist` — ship-focused scope cutter

**Dialogue, diagnostics & content**:
- `/diagnose` — reproduce → minimise → hypothesise → instrument → fix → regression-test
- `/fix` — run and fix the most stale unit tests, typechecks, builds
- `/fix-failing-tests` — systematic test-failure debug loop
- `/triage` — issue triage through state machine
- `/grill-me` — stress-test a plan through relentless interview
- `/grill-with-docs` — grill + sharpen terminology against domain model
- `/low-brain-grill` — walk through a list of questions one at a time
- `/discuss` — conversational debate about a proposed feature
- `/deep-thinking` — read, think, respond — no actions
- `/zoom-out` — broader context / higher-level perspective
- `/voice-of-user` — represents end-user against technical preferences
- `/edit-article` — restructure + tighten article prose
- `/caveman` — ultra-compressed communication mode (~75% token reduction)

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
