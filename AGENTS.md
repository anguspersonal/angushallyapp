# AGENTS.md

Repo-level guidance for AI coding agents (Claude Code, Codex, Cursor, etc.) working on `angushallyapp`.

## Agent skills

### Issue tracker

GitHub Issues at `github.com/anguspersonal/angushallyapp/issues`, accessed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical labels with default names (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Branching & flow

Type-prefixed branches (`feat/`, `fix/`, `chore/`, `docs/`, `perf/`, `test/`, `refactor/`) flow through `dev` (manual testing) before promotion to `main`. `hotfix/*` is the only exception that targets `main` directly. Cheap checks (lint, typecheck, unit tests) gate feature → dev; E2E + manual visual gate dev → main. See `docs/agents/branching.md`.
