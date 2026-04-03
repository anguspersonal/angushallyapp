# Service layer patterns (Next.js + Supabase, Option 1)

Production APIs live in **`web`**: **Route Handlers** call **colocated server modules** under `src/lib/<domain>/`, backed by **Supabase** (or external HTTP). Shared TypeScript contracts stay in **`shared/services/<domain>/contracts.ts`**.

The **`server/`** Express + Knex stack is **legacy** for migration and local use; do not add new Express routes for Vercel-bound features. See `docs/migration/server-to-next-mapping.md` and `docs/adr/0016-next-supabase-colocated-features.md`.

---

## Colocation layout (canonical)

| Layer | Location |
|-------|----------|
| **Contracts** | `shared/services/<domain>/contracts.ts` (+ `shared/services/contracts/pagination.ts` for lists) |
| **Server-only logic** | `web/src/lib/<domain>/` — import only from Route Handlers, Server Actions, or RSC |
| **HTTP** | `web/src/app/api/<domain>/.../route.ts` — mirror `/api/...` paths the browser already uses |
| **Client + hooks** | `web/src/services/<domain>/client.ts`, `hooks.ts` — `fetch('/api/...')` + types from `@shared` |
| **UI** | `web/src/app/...` (e.g. `app/projects/habit/`, `app/blog/`) |

---

## Canonical example: Content / blog

1. **Contract** — `shared/services/content/contracts.ts` (`ContentListParams`, `ContentListResult`, …).
2. **Server logic** — `web/src/lib/content/blogRepository.ts` (Supabase queries, pagination guards, row → contract mapping).
3. **Route Handlers** — `web/src/app/api/content/posts/route.ts`, `[identifier]/route.ts`.
4. **Client** — `web/src/services/content/client.ts` calls `/api/content/posts`.
5. **Hooks** — `web/src/services/content/hooks.ts`.
6. **Components** — e.g. `BlogSnippet.tsx` consumes hook data without reshaping.

Legacy reference implementation (Knex + Express) remains in `server/services/contentService.js` until deleted.

---

## Habits

- **Contracts:** `shared/services/habit/contracts.ts` (`HABIT_PERIODS`, `HABIT_METRICS`, …).
- **Server logic:** `web/src/lib/habit/` — Supabase access to `habit.*` tables; stats/aggregates mirror `server/services/habitService.js` behavior.
- **Routes:** `web/src/app/api/habit/**` — paths aligned with former `server/routes/habitRoute.js` (`/`, `/stats/:period`, `/entries/:id`, `/:habitType`, …).
- **Client/hooks:** `web/src/services/habits/client.ts`, `hooks.ts`.
- **Auth:** Use `@supabase/ssr` (`createServerClient` + cookies) in Route Handlers; return **401** when there is no session.

Legacy: `server/habit-api/*`, `server/routes/habitRoute.js`.

---

## How to add a new domain (5 steps)

1. **Contracts** under `shared/services/<domain>/contracts.ts` (reuse `PaginationMeta` for lists).
2. **Server module(s)** under `web/src/lib/<domain>/` (validation, Supabase calls, mapping into contracts).
3. **Route Handlers** under `web/src/app/api/<domain>/.../route.ts` with stable JSON error shapes.
4. **Client + hooks** under `web/src/services/<domain>/`.
5. **Tests** — **Vitest** in `web/tests/` or co-located `*.test.ts` (prefer this for new code). Keep Jest in `server/tests/` only while Express code still exists.

---

## Folder quick-reference

| Concern | Path |
|---------|------|
| Contracts | `shared/services/{content|habit|…}/contracts.ts` |
| Colocated server | `web/src/lib/{content|habit|strava|bookmarks}/` |
| APIs | `web/src/app/api/.../route.ts` |
| Clients / hooks | `web/src/services/{content|habits|…}/` |
| Legacy Express | `server/routes/`, `server/services/`, `server/*-api/` |

---

## Historical note (Express era)

The previous checklist referenced `server/services/<domain>Service.js` and `server/routes/<domain>Route.js` factories. That pattern remains valid **only** for legacy `server/` code under test or local integrated mode—not for new Vercel features.
