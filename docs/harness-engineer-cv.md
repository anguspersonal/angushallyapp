# Angus Hally — Harness Engineer CV (research stub)

> **Status:** Phase 1 frame filled in; Phase 2 (research) pending.
> See [docs/guides/persona-page-workflow.md](guides/persona-page-workflow.md).
>
> "Harness engineer" = builds the scaffolding *around* an LLM (agent runtimes, MCP servers, skill systems, evaluation harnesses, prompt operations) rather than the model itself.

## Phase 1 — Frame

- **Audience:** Model labs hiring for agent-platform / developer-tooling roles (Anthropic, OpenAI, Google DeepMind); MCP ecosystem maintainers; agent-tooling startups (Cursor, Cline, Continue, Aider, Replit, etc.); internal-tooling teams at AI-heavy orgs.
- **Question they're answering:** "Can he build the agent runtime, the eval harness, and the developer ergonomics around an LLM — not just call its API?"
- **Tagline (working):** "Code is ephemeral. The harness is leverage."

## Phase 2 — Research (not yet collected)

Source material to scan and synthesise — much of this lives in personal config repos, not just project repos:

- **`dotclaude` repo (`~/dev/dotclaude`)** — versioned Claude Code config: custom skills, agents, settings, hook scripts. Demonstrates harness-design fluency at the personal-config level.
- **Custom skills authored** — `/dos-eod`, `/capture`, `/prep`, `/explain`, `/handoff`, `/route`, `/qa-review`, `/whatsapp-blast`, `/loop`, etc. Each is a piece of LLM ergonomics for a specific workflow.
- **Custom agents** — `architect-senior-engineer`, `pragmatist`, `synthesiser`, `voice-of-user`, `claude-code-guide`, etc. Multi-agent debate / decision patterns.
- **MCP servers used / forked / configured** — Notion, Gmail (forked from `gongrzhe`), Slack, Vercel, Supabase, computer-use, Chrome, PostHog, etc. Identify which are vanilla vs custom-configured vs forked-with-changes.
- **Lina Lab eval harness** — production-grade LLM-as-judge framework with provenance (`judge_type`, `judge_model`, `judge_prompt_version`, `judge_rater_id`), variant experiments, multi-scope rubrics. The most substantial harness artefact. See [dev-cv.md](dev-cv.md) Lina Lab section.
- **AHKMS workflow orchestration** — Express webhook router → step-by-step pipeline → AI extraction → human review. Agentic-pipeline pattern even if not "agent" in the SDK sense.
- **Hooks and settings authored** — pre-commit hooks, git guardrails, harness automations in `.husky/`, `.claude/settings.json`.
- **Co-author footprint** — `Co-Authored-By: Claude Opus 4.7` on most recent commits; shows the AI-pair workflow at scale (2,391 commits, 1.12M lines added — see [code-stats.md](code-stats.md)).

Open questions for Angus:

- How much of `dotclaude` is publishable as a portfolio artefact vs. private? (Repo is currently versioned — `.gitignore` excludes credentials and history.)
- Any MCP server contributions / PRs upstream worth surfacing?
- Are there harness patterns documented anywhere (ADRs, blog posts, talks) that could be linked?
- Is the angle "harness engineer at a lab" or "harness consultant for AI-heavy startups"? Different audience, different framing.

## Phase 3–5 — Curate / Render / Propagate

To follow once Phase 2 lands.

## Sections to fill (Phase 2 output)

- Profile
- Selected harness work
- Custom skills & agents (`<details>` drop-down likely)
- Eval & ops
- Tooling & process
- Experience
- Education
- Follow-ups
