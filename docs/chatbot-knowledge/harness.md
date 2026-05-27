---
source: /harness
topic: Harness Engineer persona
priority: normal
---

> Source: `/harness` — Harness Engineer CV page. Audience: model labs
> (Anthropic, OpenAI, etc.), MCP-ecosystem maintainers, agent-tooling
> startups, internal AI-tooling teams.

**"Harness engineer"** = builds the scaffolding *around* the LLM (slash-commands, agents, eval harnesses, MCP server choices, hook configuration) rather than the model itself.

**Tagline:** *"Code is ephemeral. The harness is leverage."*

**Three pieces of the footprint:**

1. **Custom Claude Code skills authored** — **43 user-level skills** in `~/.claude/skills/` (ground-truthed via `ls`, 2026-05-27), grouped into 5 buckets:
   - Spec-driven development (8): `/spec-req`, `/spec-design`, `/spec-tasks`, `/spec-impl`, `/spec-verify`, `/spec-debate`, `/to-prd`, `/to-issues`
   - PR review & repo hygiene (11): `/qa-review`, `/address-review`, `/review-and-comment`, `/create-clean-tree`, `/wrap`, `/merge-prune`, `/sync-dotclaude`, `/git-guardrails-claude-code`, `/setup-pre-commit`, `/cloud-env`, `/setup-matt-pocock-skills`
   - Engineering discipline (8): `/solid`, `/architect-senior-engineer`, `/improve-codebase-architecture`, `/tdd`, `/prototype`, `/pragmatist`, `/repo-organizer`, `/archiver`
   - Diagnostics & dialogue (11): `/diagnose`, `/fix`, `/fix-failing-tests`, `/triage`, `/grill-me`, `/grill-with-docs`, `/low-brain-grill`, `/discuss`, `/deep-thinking`, `/zoom-out`, `/voice-of-user`
   - Content & specialists (5): `/edit-article`, `/caveman`, `/synthesiser`, `/ui-ux`, `/heylina-pptx`

   **Plus** a parallel set of **plugin-namespaced HeyLina rituals + capture** (`anthropic-skills:*`, live outside `~/.claude/skills/`): `/dos-eod`, `/dos-reflect`, `/dos-inbox`, `/dos-braindump`, `/heylina-notion`, `/capture`, `/quick-capture`, `/prep`, `/whatsapp-blast`, `/personal-style`, `/handoff`, `/route`, `/explain`, `/boss-mode`.

2. **Custom agents** — multi-agent patterns for harder calls: `architect-senior-engineer`, `pragmatist`, `synthesiser`, `voice-of-user`, `ui-ux`, `repo-organizer`, `archiver`, `deep-thinking`, `claude-code-guide`. The `/spec-debate` skill orchestrates a five-agent debate (drafter → reviewer → defender → judge → implementer) and scores against a rubric.

3. **Production harness exemplars:**
   - **Lina Lab** — Python / FastAPI prompt-evaluation engine on Railway with LLM-as-judge provenance, variant experiments, multi-scope rubrics, prompt soft-delete + version pinning, Slack-notified promotion pipeline.
   - **AHKMS** — webhook-driven AI orchestration pipeline; capture → workflow → AI extraction → PARAMPS classification → human-in-the-loop review.

**Harness configuration:** versioned `dotclaude` repo (`~/.claude/` skills/agents/settings/hooks treated as portfolio); Husky pre-push gates; Claude Code hooks blocking destructive git; intentional MCP server choices (Notion, Slack, Gmail fork, Supabase, Vercel, computer-use, Claude-in-Chrome, PostHog, Composio, Dex).

**Scale:** see `/dev` for the up-to-date line/commit/repo numbers (computed from `git log --numstat` and published at `public/data/code-stats.json`). `Co-Authored-By: Claude Opus 4.7` on most recent commits — AI-pair workflow at scale.

Research substrate at `docs/cvs/harness-engineer-cv.md`.
