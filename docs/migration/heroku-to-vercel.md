# Heroku → Vercel Migration

## Overview

Migrating from a Heroku monolith (Next.js + Express + Postgres) to Vercel (Next.js only, Supabase DB later).

**Scope boundary**: This document tracks the full migration. Chunks 1–6 are code changes (this PR). Chunks 7–8 require infrastructure setup.

---

## Status

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
- `next-ui/src/app/api/contact/route.ts` — POST handler, validates fields, verifies reCAPTCHA, sends email via nodemailer
- `next-ui/src/lib/email.ts` — nodemailer utility (lazy init, OAuth2 or password auth)
- `next-ui/src/app/api/analyseText/route.ts` — POST handler, validates text, calls OpenAI
- `next-ui/src/app/api/content/posts/route.ts` — 503 stub with TODO for Supabase
- `next-ui/src/app/api/content/posts/[identifier]/route.ts` — 503 stub with TODO for Supabase
- `next-ui/src/app/api/strava/route.ts` — 503 stub with TODO for Supabase

### Modified files
- `next-ui/next.config.mjs` — removed `rewrites()` proxy block and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env var
- `next-ui/src/shared/apiClient.ts` — simplified to `API_BASE = '/api'`, removed Express fallback + dev bypass header
- `next-ui/src/services/content/client.ts` — removed `http://localhost:5000/api` server-side fallback
- `next-ui/src/providers/AuthProvider.tsx` — stubbed to no-op (always `user: null, isLoading: false`)
- `next-ui/src/app/projects/habit/page.tsx` — deprecation notice
- `next-ui/src/app/projects/bookmarks/page.tsx` — deprecation notice
- `next-ui/src/app/projects/ai/instapaper/page.tsx` — deprecation notice
- `next-ui/src/app/login/page.tsx` — redirects to `/`
- `next-ui/src/data/projectList.ts` — `deprecated: true` on Habit (id:4), Instapaper (id:6), Bookmarks (id:7)
- `.env.example` — updated for Vercel (removed Heroku/Express vars, added email + OAuth vars)
- `package.json` (root) — removed Heroku scripts, sync-env scripts, Express dev scripts

### Deleted files
- `Procfile`
- `app.json`
- `force_heroku_update.txt`
- `next-ui/src/app/api/auth/login/route.ts` (forwarded to Express)
- `next-ui/src/app/api/auth/logout/route.ts` (forwarded to Express)
- `next-ui/src/app/api/share/route.ts` (forwarded to Express bookmarks)

---

## Chunk 7: Supabase DB setup + data migration

**Blocked on**: Supabase account + project creation.

Steps:
1. Create Supabase project
2. Create schema (blog posts, strava tokens/activities tables)
3. Export data from Heroku Postgres: `pg_dump` → import to Supabase
4. Add `@supabase/supabase-js` to `next-ui/package.json`
5. Replace 503 stub in `next-ui/src/app/api/content/posts/route.ts` with Supabase query
6. Replace 503 stub in `next-ui/src/app/api/content/posts/[identifier]/route.ts`
7. Replace 503 stub in `next-ui/src/app/api/strava/route.ts` (also needs Strava OAuth re-setup)
8. Set `DATABASE_URL` in Vercel env vars

---

## Chunk 8: Deploy to Vercel + switch off Heroku

**Blocked on**: Chunk 7.

Steps:
1. Connect GitHub repo to Vercel
2. Set Root Directory = `next-ui` in Vercel dashboard
3. Set env vars in Vercel:
   - `RECAPTCHA_SECRET_KEY`
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - `OPENAI_API_KEY`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (or Google OAuth vars)
   - `RECIPIENT_EMAIL`
   - `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`
   - `DATABASE_URL` (Supabase connection string)
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
| `DATABASE_URL` | Blog + Strava routes (after Chunk 7) | Supabase connection string |
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
- [ ] `cd next-ui && npm run build` succeeds
