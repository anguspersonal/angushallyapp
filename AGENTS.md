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

## Cloud environment

Settings for running this repo in [cloud Claude Code](https://code.claude.com/docs/en/claude-code-on-the-web) (web sessions at claude.ai/code). The cloud env has two configurable layers; only the SessionStart hook does any work here — the base image covers everything else.

| Layer | Where | What it does | Runs |
| ----- | ----- | ------------ | ---- |
| **Setup script** | Cloud env config UI | Empty. Base image has Node 20, npm, git, ripgrep, Chromium libs, Postgres, Docker. Cloud's [built-in GitHub tools](https://code.claude.com/docs/en/claude-code-on-the-web#work-with-github-issues-and-pull-requests) cover issues/PRs/diffs/comments without `gh`. | n/a |
| **SessionStart hook** | [`.claude/settings.json`](.claude/settings.json) → [`scripts/cloud-session-setup.sh`](scripts/cloud-session-setup.sh) | Seeds `.env.local` from `.env.example` (fallback only), runs `npm ci`. | Every session, in repo root |

### Env settings (cloud UI)

- **Name**: `angushallyapp`
- **Network access**: `Custom` with **Include default list of common package managers** checked, plus one extra allowed domain:

  ```
  *.supabase.co
  ```

  The default Trusted list covers npm, GitHub, Puppeteer's Chromium CDN (`storage.googleapis.com`), and the Anthropic API. Supabase isn't in the defaults but `npm run build` prerenders routes that touch Supabase, so it has to be allowlisted for builds to succeed. Other runtime integrations (OpenAI, Apify, Strava, Raindrop, reCAPTCHA) aren't allowlisted — add them only if you plan to exercise the relevant code paths from a cloud session. **MCP-routed traffic (e.g. the Supabase MCP) bypasses this and works regardless.**
- **Setup script field**: leave empty.
- **Environment variables**: set the secrets `.env.example` lists. The hook only seeds `.env.local` from the sample as a fallback so code that reads it doesn't crash; real values belong in the env-vars field. **`SMTP_*` won't work** — the cloud's HTTP/HTTPS proxy doesn't pass SMTP traffic to `smtp.gmail.com:587`. Contact-form send will fail in cloud; that's expected.

### `.claude/settings.json` snippet

Paste this into [`.claude/settings.json`](.claude/settings.json) (or merge with existing config):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/scripts/cloud-session-setup.sh"
          }
        ]
      }
    ]
  }
}
```

### What the SessionStart hook does

- Bails out on local sessions (`CLAUDE_CODE_REMOTE != true`).
- Copies `.env.example` → `.env.local` only when neither `.env.local` nor `.env` is already present (won't clobber a real mount).
- Runs `HUSKY=0 npm ci` only when `node_modules/.bin/next` is missing, so resumes from a warm snapshot are near-instant. `npm ci` also installs Puppeteer's bundled Chromium for `npm run build:resume`.

### Why these choices

- Lockfile is `package-lock.json` and `engines.npm: ">=10.x"` — npm is canonical. Bun has known [proxy issues](https://code.claude.com/docs/en/claude-code-on-the-web#install-dependencies-with-a-sessionstart-hook) for package fetching in cloud sessions.
- Node 20 is preinstalled; `.nvmrc` (20.19.3) is honoured by nvm without explicit install.
- Puppeteer's post-install pulls Chromium from `storage.googleapis.com`, which is in the Trusted defaults.
- Cloud's built-in GitHub tools replace `gh issue` / `gh pr` / `gh api` for the agent's everyday work, so `gh` doesn't need to be installed. If you ever need `gh release` / `gh workflow run` / `gh label` in a cloud session, add `apt update && apt install -y gh` to the setup script and set `GH_TOKEN` in the env-vars field — `gh` picks it up automatically.

### Useful env vars inside a session

- `CLAUDE_CODE_REMOTE=true` — set in cloud sessions; the SessionStart hook gates on this.
- `CLAUDE_CODE_REMOTE_SESSION_ID` — the session's ID with a `cse_` prefix. Substitute `cse_` → `session_` to build a transcript URL for PR bodies or commit messages:

  ```bash
  echo "https://claude.ai/code/${CLAUDE_CODE_REMOTE_SESSION_ID/#cse_/session_}"
  ```
