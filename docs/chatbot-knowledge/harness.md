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

1. **Custom Claude Code skills authored** — 30+ slash-commands compressing recurring workflows. Grouped:
   - HeyLina Daily Operating System: `/dos-eod`, `/dos-reflect`, `/dos-inbox`, `/dos-braindump`, `/heylina-notion`, `/heylina-pptx`
   - Capture & planning: `/capture`, `/prep`, `/quick-capture`, `/whatsapp-blast`
   - Conversation ergonomics: `/explain`, `/handoff`, `/route`, `/low-brain-grill`, `/boss-mode`, `/personal-style`
   - Dev tooling: `/qa-review`, `/address-review`, `/wrap`, `/merge-prune`, `/diagnose`, `/spec-debate`, `/grill-me`, `/sync-dotclaude`, `/git-guardrails-claude-code`, `/setup-pre-commit`, `/prototype`, `/cloud-env`

2. **Custom agents** — multi-agent patterns for harder calls: `architect-senior-engineer`, `pragmatist`, `synthesiser`, `voice-of-user`, `ui-ux`, `repo-organizer`, `archiver`, `deep-thinking`, `claude-code-guide`. The `/spec-debate` skill orchestrates a five-agent debate (drafter → reviewer → defender → judge → implementer) and scores against a rubric.

3. **Production harness exemplars:**
   - **Lina Lab** — Python / FastAPI prompt-evaluation engine on Railway with LLM-as-judge provenance, variant experiments, multi-scope rubrics, prompt soft-delete + version pinning, Slack-notified promotion pipeline.
   - **AHKMS** — webhook-driven AI orchestration pipeline; capture → workflow → AI extraction → PARAMPS classification → human-in-the-loop review.

**Harness configuration:** versioned `dotclaude` repo (`~/.claude/` skills/agents/settings/hooks treated as portfolio); Husky pre-push gates; Claude Code hooks blocking destructive git; intentional MCP server choices (Notion, Slack, Gmail fork, Supabase, Vercel, computer-use, Claude-in-Chrome, PostHog, Composio, Dex).

**Scale:** 2,391 commits, 1.12M lines added with `Co-Authored-By: Claude Opus 4.7` on most recent commits — AI-pair workflow at scale.

Research substrate at `docs/cvs/harness-engineer-cv.md`.
