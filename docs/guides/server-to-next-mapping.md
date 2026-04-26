# Server (Express) → Next.js colocation mapping

**Definition of done (phases):** See **`docs/guides/heroku-to-vercel-migration.md`** — *Migration phases (Definition of Done)*: **Phase 1** = `web/` alone on Vercel; **active** routes have real behaviour + Supabase where needed; **deprecated** routes may stay **stubs** (Eat Safe UK pattern). **Phase 2** = delete `server/`.

**Hosting target:** Option 1 — Vercel deploys `web` only; public `/api/*` are **Next Route Handlers**; **Supabase** for Postgres/auth. The `server/` workspace is **legacy**: local dev, Jest, and Knex migrations until fully retired.

Express mounts are registered in [`server/bootstrap/routes.js`](../../server/bootstrap/routes.js).

| Express mount | Server source | Next.js destination |
|---------------|---------------|---------------------|
| `GET/POST /api/contact` | `server/routes/contact.js`, `utils/sendEmail.js` | [`web/src/app/api/contact`](../../web/src/app/api/contact) — done |
| `POST /api/analyseText` | `server/routes/analyseTextRoute.js`, `ai-api/apiService.js` | [`web/src/app/api/analyseText`](../../web/src/app/api/analyseText) — done |
| `GET /api/content/*` | `server/routes/contentRoute.js`, `server/services/contentService.js` | [`web/src/app/api/content/posts`](../../web/src/app/api/content/posts), [`web/src/lib/content/`](../../web/src/lib/content) |
| `GET /api/habit/*` | `server/routes/habitRoute.js`, `server/services/habitService.js`, `server/habit-api/*` | [`web/src/app/api/habit`](../../web/src/app/api/habit), [`web/src/lib/habit/`](../../web/src/lib/habit) |
| `GET /api/strava` | `server/routes/stravaRoute.js`, `server/strava-api/*` | [`web/src/app/api/strava`](../../web/src/app/api/strava), [`web/src/lib/strava/`](../../web/src/lib/strava) |
| `GET /api/hygieneScoreRoute` | `server/routes/hygieneScoreRoute*.js`, `server/fsa-data-sync/*` | **Archived** — see [Eat Safe UK](#eat-safe-uk--hygiene). No Vercel API. |
| `GET/POST /api/auth/*` | `server/routes/authRoute.js`, `middleware/auth.js` | Replace with **Supabase Auth** when login returns; UI stubs in `web` |
| `GET /api/db/*` | `server/routes/dbRoute.js` | **Do not port** — generic table reader; use domain routes or Supabase RPC |
| `GET/POST /api/raindrop/*` | `server/routes/raindrop*.js`, `bookmark-api/raindrop*.js` | [`web/src/app/api/raindrop`](../../web/src/app/api/raindrop), [`web/src/lib/bookmarks/`](../../web/src/lib/bookmarks) — stub until revived |
| `GET/POST /api/bookmarks/*` | `server/routes/bookmarkRoute.js`, `bookmark-api/*` | [`web/src/app/api/bookmarks`](../../web/src/app/api/bookmarks) — stub until revived |
| `GET/POST /api/f5/*` | `server/routes/f5CertaintyRoute.js`, `bookmark-api/f5-certainty-scoring/*` | [`web/src/app/api/f5`](../../web/src/app/api/f5) — stub until revived |
| `POST /api/instagram-intelligence/*` | `server/routes/instagramIntelligenceRoute.js`, `bookmark-api/instagramIntelligence.js` | [`web/src/app/api/instagram-intelligence`](../../web/src/app/api/instagram-intelligence) — stub until revived |

## Scaffold-only on server

| Path | Note |
|------|------|
| `server/content-api/README.md` | Docs only; merge into `docs` if needed |
| `server/crm-api/README.md` | Docs only |
| `server/public-api/README.md` | Docs only |
| `server/bookmark-api/instapaper.js` | Empty; Instapaper UI under `web` (deprecated) |

## Cross-cutting

| Area | Direction |
|------|-----------|
| `server/db.js`, `knexfile.js`, `migrations/` | Target **Supabase migrations**; keep Knex until DDL cutover |
| `server/observability/*` | Prefer Vercel logs + small `web` logging helpers in Route Handlers |
| `server/config/*` | Vercel env + `web` server-only vars |
| `server/tests/*` | New tests: **Vitest** under `web`; keep Jest while Express remains |

## Eat Safe UK / hygiene

**Decision:** Product UI is **deprecated** (`projectList`, eat-safe-uk page). **Do not** expose `hygieneScoreRoute` on Vercel. Keep FSA batch scripts under `server/fsa-data-sync/` for optional one-off local use only, or archive that folder in a later cleanup.

## Monorepo: one React for `next build`

If `next build` fails while prerendering `/404` or `/500` with *“Objects are not valid as a React child”*, the workspace lockfile may list **`web/node_modules/react`** at a **different version** than the hoisted root `react`. Use **one** version across the repo (root `package.json` `overrides` for `react` / `react-dom` if needed), remove any **nested** `web/package-lock.json`, and regenerate the **root** `package-lock.json` with a clean `npm install`. Vitest in `web` resolves `react` from the repo root in `vitest.config.ts`.
