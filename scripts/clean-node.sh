#!/usr/bin/env bash
set -euo pipefail
echo "🧹 Removing node_modules & lockfile..."
rm -rf node_modules web/node_modules server/node_modules
echo "📦 Fresh install (npm ci)…"
npm ci --workspaces --include-workspace-root --omit=optional
echo "✅ Clean install done." 