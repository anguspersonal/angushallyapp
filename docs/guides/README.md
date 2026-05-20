# Guides

How-to guides, runbooks, and onboarding material. All non-ADR, non-vision, non-architecture documentation lives here.

## Contents

### Architecture & development
- [`server-bootstrap.md`](./server-bootstrap.md) — how the Express server is assembled (legacy server workspace)
- [`service-layer.md`](./service-layer.md) — service-layer patterns for Next.js + Supabase
- [`observability.md`](./observability.md) — structured logging, error taxonomy, request context
- [`testing.md`](./testing.md) — running tests (vitest, jest, integration)

### Operations & runbooks
- [`production-deploys.md`](./production-deploys.md) — production deployment runbook
- [`service-incidents.md`](./service-incidents.md) — incident response runbook
- [`vercel-cron-and-webhooks.md`](./vercel-cron-and-webhooks.md) — cron jobs + webhooks on Vercel
- [`env-management.md`](./env-management.md) — managing environment variables (Next.js / Vercel)
- [`local-build.md`](./local-build.md) — making `npm run build` succeed locally (Supabase env requirement)

### Migration guides
- [`heroku-to-vercel-migration.md`](./heroku-to-vercel-migration.md) — Heroku → Vercel migration steps
- [`server-to-next-mapping.md`](./server-to-next-mapping.md) — Express route → Next.js Route Handler mapping

### Project-specific
- [`bookmark-integration-setup.md`](./bookmark-integration-setup.md) — Raindrop.io integration setup

## Adding a guide

1. **Name by topic**, not by chronology. `redis-caching.md`, not `2026-redis-caching.md`.
2. **Keep it evergreen**. If the content is "what we decided on 2026-04-20," it's an ADR, not a guide — put it in [`../adr/`](../adr/).
3. **Link from here**: add a one-line entry under the right section above.
4. **Link out**: cross-reference the relevant ADRs, [`../architecture.md`](../architecture.md), or [`../vision.md`](../vision.md) where useful.

See [`../README.md`](../README.md) for the full documentation framework.
