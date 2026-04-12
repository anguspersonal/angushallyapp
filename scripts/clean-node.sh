#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "🧹 Removing node_modules..."
rm -rf node_modules
echo "📦 Fresh install (npm ci)…"
npm ci
echo "✅ Clean install done."
