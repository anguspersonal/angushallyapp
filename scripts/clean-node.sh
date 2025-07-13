#!/usr/bin/env bash
set -euo pipefail
echo "🧹 Removing node_modules & lockfile..."
rm -rf node_modules next-ui/node_modules server/node_modules package-lock.json
echo "📦 Fresh install (npm ci)…"
npm ci --workspaces --include-workspace-root
echo "✅ Clean install done." 