# Staleness Log

Accumulated findings from weekly staleness scans. Each entry is a snapshot — items carry forward until resolved.

---

## 2026-05-31

### Outdated Dependencies

**Major** (breaking-change potential):

| Package | Current | Latest |
|---------|---------|--------|
| next | 15.5.15 | 16.2.6 |
| typescript | 5.9.3 | 6.0.3 |
| @mantine/charts | 8.3.18 | 9.2.2 |
| @mantine/core | 8.3.18 | 9.2.2 |
| @mantine/form | 8.3.18 | 9.2.2 |
| @mantine/notifications | 8.3.18 | 9.2.2 |
| dotenv | 16.6.1 | 17.4.2 |
| nodemailer | 6.10.1 | 8.0.10 |
| @types/jest (dev) | 29.5.14 | 30.0.0 |
| @types/nodemailer (dev) | 7.0.11 | 8.0.0 |
| @types/node (dev) | 24.12.2 | 25.9.1 |
| @vitejs/plugin-react (dev) | 4.7.0 | 6.0.2 |
| @vitest/coverage-v8 (dev) | 1.6.1 | 4.1.7 |
| eslint (dev) | 9.39.4 | 10.4.1 |
| eslint-config-next (dev) | 15.5.15 | 16.2.6 |
| jsdom (dev) | 24.1.3 | 29.1.1 |
| vitest (dev) | 1.6.1 | 4.1.7 |

**Minor**:

| Package | Current | Latest |
|---------|---------|--------|
| @anthropic-ai/sdk | 0.98.0 | 0.100.1 |
| @react-oauth/google | 0.12.2 | 0.13.5 |
| @supabase/ssr | 0.6.1 | 0.10.3 |
| @supabase/supabase-js | 2.103.0 | 2.106.2 |
| @tabler/icons-react | 3.41.1 | 3.44.0 |
| autoprefixer | 10.4.27 | 10.5.0 |
| axios | 1.15.0 | 1.16.1 |
| framer-motion | 12.38.0 | 12.40.0 |
| react | 19.1.0 | 19.2.6 |
| react-dom | 19.1.0 | 19.2.6 |

**Patch**:

| Package | Current | Latest |
|---------|---------|--------|
| @types/react (dev) | 19.2.14 | 19.2.15 |

---

### Broken Internal Links

**ADR files (stale pre-migration references)**:
- `docs/adr/0012-typescript-migration.md:74` → `../09_nextjs_migration_plan.md`
- `docs/adr/0012-typescript-migration.md:75` → `../01_guidance.md`
- `docs/adr/0013-nextjs-migration.md:107` → `../09_nextjs_migration_plan.md`
- `docs/adr/0013-nextjs-migration.md:108` → `../01_guidance.md`
- `docs/adr/0019-heroku-nextjs-config.md:180` → `09_nextjs_migration_plan.md`
- `docs/adr/0019-heroku-nextjs-config.md:181` → `09_migration_tracker.md`
- `docs/adr/0019-heroku-nextjs-config.md:182` → `09_migration_log.md`
- `docs/adr/0019-heroku-nextjs-config.md:188` → `09_nextjs_migration_plan.md`
- `docs/adr/0019-heroku-nextjs-config.md:189` → `../.env.example`
- `docs/adr/0019-heroku-nextjs-config.md:190` → `server/index.js`
- `docs/adr/0019-heroku-nextjs-config.md:191` → `web/next.config.mjs`

**Guides (stale post-migration references)**:
- `docs/guides/README.md:11` → `./testing.md`
- `docs/guides/README.md:14` → `./production-deploys.md`
- `docs/guides/README.md:15` → `./service-incidents.md`
- `docs/guides/README.md:16` → `./vercel-cron-and-webhooks.md`
- `docs/guides/README.md:17` → `./env-management.md`
- `docs/guides/README.md:25` → `./bookmark-integration-setup.md`
- `docs/guides/database.md:134` → `./schema.dbml`
- `docs/guides/database.md:138` → `./schema-dbdiagram.dbml`
- `docs/guides/database.md:142` → `./20250512_schema-angushallyapp.png`
- `docs/guides/database.md:149` → `../server/migrations/README.md`
- `docs/guides/database-schema.md:52` → `../server/migrations/README.md`
- `docs/guides/server-to-next-mapping.md:7` → `../../server/bootstrap/routes.js`
- `docs/guides/server-to-next-mapping.md:11` → `../../web/src/app/api/contact`
- `docs/guides/server-to-next-mapping.md:12` → `../../web/src/app/api/analyseText`
- `docs/guides/server-to-next-mapping.md:13` → `../../web/src/app/api/content/posts`
- `docs/guides/server-to-next-mapping.md:13` → `../../web/src/lib/content`
- `docs/guides/server-to-next-mapping.md:14` → `../../web/src/app/api/habit`
- `docs/guides/server-to-next-mapping.md:14` → `../../web/src/lib/habit`
- `docs/guides/server-to-next-mapping.md:15` → `../../web/src/app/api/strava`
- `docs/guides/server-to-next-mapping.md:15` → `../../web/src/lib/strava`
- `docs/guides/server-to-next-mapping.md:19` → `../../web/src/app/api/raindrop`
- `docs/guides/server-to-next-mapping.md:19` → `../../web/src/lib/bookmarks`
- `docs/guides/server-to-next-mapping.md:20` → `../../web/src/app/api/bookmarks`
- `docs/guides/server-to-next-mapping.md:21` → `../../web/src/app/api/f5`
- `docs/guides/server-to-next-mapping.md:22` → `../../web/src/app/api/instagram-intelligence`
- `docs/guides/service-layer.md:52` → `../src/test/setup.ts`
- `docs/chatbotv1/README.md:203` → `../../scripts/chat-knowledge.config.mjs`

**TSX project pages**:
- `src/app/projects/ai/text-analysis/page.tsx:71` → `/projects/ai` (no page.tsx at `src/app/projects/ai/`)

---

### Orphaned ADRs (zero references outside docs/adr/)

- `docs/adr/0003-migration-tooling.md`
- `docs/adr/0004-db-access-layer.md`
- `docs/adr/0005-api-routing-pattern.md`
- `docs/adr/0008-static-file-served-react.md`
- `docs/adr/0009-global-auth-middleware.md`
- `docs/adr/0011-postgres-search-path-config.md`
- `docs/adr/0015-development-production-server-behavior.md`
- `docs/adr/0018-nextjs-migration-history.md`
- `docs/adr/0020-unused-variables-cleanup.md`
- `docs/adr/0022-wsl2-react-blank-screen.md`
- `docs/adr/0023-hosting-migration-plan.md`
- `docs/adr/0024-service-worker-cache-error.md`
- `docs/adr/0025-wsl-to-windows-migration.md`
- `docs/adr/0026-code-review-2025-11-12.md`
- `docs/adr/0027-wow-factor-plan-2026-04.md`
- `docs/adr/0029-redesign-brief-2026-04.md`
- `docs/adr/0030-redesign-brief-amendment-2026-04.md`
- `docs/adr/0035-avoid-personal-names-on-site.md`
- `docs/adr/0036-repository-contract-and-api-error-mirror.md`
