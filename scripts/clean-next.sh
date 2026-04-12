#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "🗑️  Purging .next build & cache…"
rm -rf .next
echo "🏗️  Re-building…"
npm run build
echo "✅ Next build cache refreshed."
