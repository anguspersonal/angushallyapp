#!/usr/bin/env bash
set -euo pipefail
echo "🗑️  Purging .next build & cache…"
rm -rf next-ui/.next
echo "🏗️  Re-building Next UI…"
npm run build --workspace next-ui
echo "✅ Next build cache refreshed." 