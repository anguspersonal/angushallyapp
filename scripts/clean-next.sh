#!/usr/bin/env bash
set -euo pipefail
echo "🗑️  Purging .next build & cache…"
rm -rf web/.next
echo "🏗️  Re-building Next UI…"
npm run build --workspace web
echo "✅ Next build cache refreshed." 