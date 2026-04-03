# Heroku → Vercel Migration

## Overview

Migrating from a Heroku monolith (Next.js + Express + Postgres) to **Vercel** (**Next.js only**, **Supabase** for Postgres/auth).

### Strategic decision: Option 1 (no split API)

**Production** is a **single** Vercel project (`web` root). Public HTTP APIs live in **Next Route Handlers**, not a second host (e.g. Railway Express). Domain logic is **colocated** under `web/src/lib/<domain>/` next to the matching UI under `src/app/projects/...` where applicable. Full Express → Next file mapping: **`docs/migration/server-to-next-mapping.md`**.

**Scope boundary**: This document tracks migration chunks. Chunks 1–6 are done in code. Chunks 7–8 require your Supabase project + Vercel env setup.

---

## Migration phases (Definition of Done)

These phases are **about removing the Express app**, not about reviving deprecated products.

- **Active** — features you still want fully working on Vercel (contact, blog, Strava, AI analysis, etc.): **real** Route Handlers + Supabase (or equivalent) where data is involved.
- **Deprecated** — products kept online only as placeholders: **stubs are enough for Phase 1.** The page can show deprecation / “unavailable” copy, and matching **`/api/*` routes do not need feature parity** — stable empty responses, 503 + machine-readable code, or no route if nothing calls them. **Pattern:** Eat Safe UK — UI under `web/src/app/projects/eat-safe-uk` with no live hygiene API on Vercel; see `docs/migration/eat-safe-uk-archive.md`. Same idea for Habit, Bookmarks, Instapaper, etc.: **no requirement to port Express logic** for Phase 1.

### Phase 1 — `web/` is the only runtime you need

**Goal:** If `web/` were deployed to Vercel with the right env vars, **no request would need Express**. **Active** flows behave end-to-end; **deprecated** flows are safe stubs. In theory, **`server/` could be deleted** without losing production behaviour anyone still relies on.

**DoD — product / HTTP**

| Criterion | Notes |
|-----------|--------|
| **Vercel-shaped deploy** | Single project, **Root Directory = `web`**, `npm run build` and production start succeed. |
| **Env parity** | All secrets and public vars required by Route Handlers exist in Vercel (see [Environment variables reference](#environment-variables-reference)). |
| **Express mounts replaced** | Every mount is **documented** in `docs/migration/server-to-next-mapping.md`. **Active** mounts have real Next Route Handlers. **Deprecated** mounts may use **stub handlers** (503, fixed JSON) or **no handler** if the deprecated UI does not call them — same approach as Eat Safe UK / hygiene (no Vercel API). |
| **Supabase** | Used for **active** DB-backed routes; **deprecated** products do **not** require Supabase parity or ported domain logic. |
| **No dual stack in prod** | Production traffic does not depend on `server/index.js`, Heroku-style combined process, or rewrites to an external API. |
| **Client contracts** | Same paths, methods, and **stable error shapes** where the browser or `web/src/services/*` already depend on them. |

**DoD — behaviour**

- **Active (full parity expected):** Contact, AI text analysis, blog/content (when you want it live), Strava (when you want it live), and any other product **not** marked deprecated in `web/src/data/projectList.ts` / mapping — real Route Handlers, env on Vercel, Supabase (or documented third parties) as designed.
- **Deprecated (stubs OK — no backend port required):** Habit, Bookmarks/Raindrop/F5/Instagram intelligence, Instapaper, Eat Safe UK, legacy auth, etc. **UI:** deprecation messaging or static placeholder like Eat Safe UK. **API:** stub responses or omit; **do not** block Phase 1 on porting `server/` logic for these.
- **AI text analysis:** Align **auth / rate limiting** with Express if you still want that hardening (or document a deliberate relaxation).
- **Intentionally not ported** (`/api/db`, generic hygiene API, etc.): Listed in the mapping with **rationale**; no **active** client still depends on them without an update.

**DoD — engineering**

- [ ] `docs/migration/server-to-next-mapping.md` updated: each mount = **Active (web path)** / **Deprecated (stub)** / **Not exposed** with reason.
- [ ] Smoke checklist below run against a **Vercel preview** (or prod) with Supabase attached, not only localhost.
- [ ] No required import from `server/` into `web/` for production code.

**Not required for Phase 1:** deleting `server/`, removing the `server` npm workspace, or archiving Jest integration tests (those are Phase 2).

---

### Phase 2 — Remove `server/`

**Goal:** Repository and tooling assume **only `web/`** (plus optional scripts). Express is gone.

**DoD**

- [ ] `server/` **deleted** or moved to an **archived** repo/path not referenced by CI or root `package.json`.
- [ ] Root `package.json` **workspaces** no longer include `server` (or monorepo collapsed per your preference).
- [ ] **Knex / `DATABASE_URL`**: only if still needed for one-off migrations, replace with **Supabase migrations** (`supabase/migrations`) or documented SQL; remove dead Knex config from default dev flow.
- [ ] **Tests:** Jest suites under `server/tests/` removed or replaced; **Vitest** in `web/` covers anything you still need.
- [ ] **Docs** (`docs/architecture.md`, ADR 0016, this file): state that **Vercel + `web` + Supabase** is the only stack; no “legacy Express” caveats in runbooks.
- [ ] **Local dev** documented: `cd web && npm run dev` (and any minimal env sync), without `node server/index.js`.

---

## Status

Chunks 1–6 are **foundation** (Route Handlers, proxy removal, stubs). **Phase 1** in [Migration phases (Definition of Done)](#migration-phases-definition-of-done) is the gate for “Express could be deleted”; **Phase 2** is actually deleting `server/`.

| Chunk | Description | Status |
|-------|-------------|--------|
| 1 | Contact form API route | ✅ Done |
| 2 | AI Text Analysis API route | ✅ Done |
| 3 | Deprecate backend-dependent pages | ✅ Done |
| 4 | Stub blog + Strava routes (503) | ✅ Done |
| 5 | Remove Express proxy + simplify API client | ✅ Done |
| 6 | Remove Heroku config + clean scripts | ✅ Done |
| 7 | Supabase DB setup + data migration | ⏳ Blocked — needs Supabase account |
| 8 | Deploy to Vercel + env vars + switch off Heroku | ⏳ Blocked — needs Chunk 7 |

---

## What stays, what goes

| Feature | Decision | Reason |
|---------|----------|--------|
| Contact form | ✅ Ported | No DB needed — just reCAPTCHA + email |
| AI Text Analysis | ✅ Ported | Just OpenAI call, no DB |
| Data Value Game | ✅ Already works | Pure client-side |
| Blog | ⏸ Stubbed (503) | Needs Supabase — unblocked after Chunk 7 |
| Strava | ⏸ Stubbed (503) | Needs Supabase + OAuth — unblocked after Chunk 7 |
| Habit Tracker | ❌ Deprecated | Needs DB + auth |
| Bookmarks/Raindrop | ❌ Deprecated | Needs DB + OAuth + Raindrop API |
| Instapaper | ❌ Deprecated | Needs DB |
| Login/Auth | ❌ Deprecated | No longer needed |
| Static pages | ✅ Works | Home, About, CV, Projects listing |

---

## Completed work (Chunks 1–6)

### New files created
- `web/src/app/api/contact/route.ts` — POST handler, validates fields, verifies reCAPTCHA, sends email via nodemailer
- `web/src/lib/email.ts` — nodemailer utility (lazy init, OAuth2 or password auth)
- `web/src/app/api/analyseText/route.ts` — POST handler, validates text, calls OpenAI
- `web/src/app/api/content/posts/route.ts` — 503 stub with TODO for Supabase
- `web/src/app/api/content/posts/[identifier]/route.ts` — 503 stub with TODO for Supabase
- `web/src/app/api/strava/route.ts` — 503 stub with TODO for Supabase

### Modified files
- `web/next.config.mjs` — removed `rewrites()` proxy block and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env var
- `web/src/shared/apiClient.ts` — simplified to `API_BASE = '/api'`, removed Express fallback + dev bypass header
- `web/src/services/content/client.ts` — removed `http://localhost:5000/api` server-side fallback
- `web/src/providers/AuthProvider.tsx` — stubbed to no-op (always `user: null, isLoading: false`)
- `web/src/app/projects/habit/page.tsx` — deprecation notice
- `web/src/app/projects/bookmarks/page.tsx` — deprecation notice
- `web/src/app/projects/ai/instapaper/page.tsx` — deprecation notice
- `web/src/app/login/page.tsx` — redirects to `/`
- `web/src/data/projectList.ts` — `deprecated: true` on Habit (id:4), Instapaper (id:6), Bookmarks (id:7)
- `.env.example` — updated for Vercel (removed Heroku/Express vars, added email + OAuth vars)
- `package.json` (root) — removed Heroku scripts, sync-env scripts, Express dev scripts

### Deleted files
- `Procfile`
- `app.json`
- `force_heroku_update.txt`
- `web/src/app/api/auth/login/route.ts` (forwarded to Express)
- `web/src/app/api/auth/logout/route.ts` (forwarded to Express)
- `web/src/app/api/share/route.ts` (forwarded to Express bookmarks)

---

## Chunk 7: Supabase DB setup + data migration

**Blocked on**: Supabase account + project creation.

Steps:
1. Create Supabase project
2. Create schema (blog posts, strava tokens/activities tables)
3. Export data from Heroku Postgres: `pg_dump` → import to Supabase
4. Add `@supabase/supabase-js` (and `@supabase/ssr` for cookie sessions on protected routes) to `web/package.json`
5. Set **Supabase** env vars in Vercel (see table below); ensure `content.posts` / `identity.users` (and `habit.*` if used) exist with appropriate RLS or use **service role only on the server** for trusted Route Handlers
6. Content and Strava Route Handlers use `web/src/lib/content/` and `web/src/lib/strava/` when env is configured; otherwise they return **503** with `MIGRATION_IN_PROGRESS`
7. Strava OAuth re-setup remains required for live sync; read path can use `habit.strava_activities` once data exists
8. **`DATABASE_URL`** is optional for Next if you use **Supabase client keys** only; Knex on `server/` may still use `DATABASE_URL` locally for migrations

---

## Chunk 8: Deploy to Vercel + switch off Heroku

**Blocked on**: Chunk 7.

Steps:
1. Connect GitHub repo to Vercel
2. Set Root Directory = `web` in Vercel dashboard
3. Set env vars in Vercel:
   - `RECAPTCHA_SECRET_KEY`
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - `OPENAI_API_KEY`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (or Google OAuth vars)
   - `RECIPIENT_EMAIL`
   - `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (preferred for Route Handlers)
   - `DATABASE_URL` (optional; Supabase pooler string for local Knex / scripts)
4. Trigger deploy, verify all routes work
5. Switch domain DNS to Vercel
6. Switch off Heroku dyno

---

## Environment variables reference

| Variable | Used by | Notes |
|----------|---------|-------|
| `RECAPTCHA_SECRET_KEY` | `/api/contact` | Server-side reCAPTCHA verification |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Contact form (browser) | Client-side reCAPTCHA widget |
| `OPENAI_API_KEY` | `/api/analyseText` | Text analysis |
| `SMTP_HOST` | `/api/contact` via `src/lib/email.ts` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | `/api/contact` | e.g. `465` |
| `SMTP_USER` | `/api/contact` | Gmail address |
| `SMTP_PASS` | `/api/contact` | App password (if not using OAuth) |
| `RECIPIENT_EMAIL` | `/api/contact` | Where contact form emails go |
| `GOOGLE_OAUTH_CLIENT_ID` | `/api/contact` | Gmail OAuth2 (preferred over SMTP_PASS) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | `/api/contact` | Gmail OAuth2 |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | `/api/contact` | Gmail OAuth2 |
| `SUPABASE_URL` | Content, Strava, Habit Route Handlers | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Route Handlers (trusted) | **Secret** — never expose to client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + `createServerClient` | Public anon key |
| `DATABASE_URL` | Local Knex / `server/` only | Optional if all access is via Supabase JS |
| `NEXT_PUBLIC_SITE_URL` | Optional | Useful for Vercel preview URL injection |

---

## Testing checklist

- [ ] Contact form submits and sends email via `/api/contact`
- [ ] AI Text Analysis works via `/api/analyseText`
- [ ] Blog pages show "temporarily unavailable" (not a crash)
- [ ] Strava page shows "temporarily unavailable"
- [ ] Deprecated pages show deprecation notices (Habit, Bookmarks, Instapaper)
- [ ] Login redirects to home
- [ ] Collab redirects to home
- [ ] Data Value Game still works (pure client-side)
- [ ] Static pages work (Home, About, CV, Projects listing)
- [ ] No 404s on navigation
- [ ] `cd web && npm run build` succeeds
