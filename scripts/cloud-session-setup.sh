#!/usr/bin/env bash
# Cloud Claude Code SessionStart hook.
# See "Cloud environment" in AGENTS.md for context.

set -euo pipefail

# Skip local sessions — your dev shell handles deps the normal way.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:?CLAUDE_PROJECT_DIR not set}"

# Seed .env.local from the committed sample only when no real env file is
# mounted. Real secrets belong in the cloud env's Environment variables field;
# this fallback just keeps app code that reads .env.local from crashing.
[ -f .env.local ] || [ -f .env ] || cp .env.example .env.local 2>/dev/null || true

# Repo deps. HUSKY=0 skips git-hook setup in non-interactive env.
# Sentinel: skip when next is already installed — keeps resumes fast.
# npm ci also installs Puppeteer's bundled Chromium for `npm run build:resume`.
if [ ! -x node_modules/.bin/next ]; then
  HUSKY=0 npm ci --no-audit --no-fund
fi
