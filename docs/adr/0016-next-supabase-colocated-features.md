# ADR 0016: Next.js + Supabase + colocated domain modules (Option 1)

## Status

Accepted

## Context

The repo historically used a **monorepo** with `web` (Next.js) and `server` (Express + Knex + Postgres). Production could run an integrated process (Express first, Next as catch-all) or be split across hosts. We chose **not** to standardize on a long-term **split API** (e.g. Vercel + Railway Express) for this product.

## Decision

1. **Production hosting:** **Vercel** deploys **`web` only** (project root directory `web`).
2. **Data:** **Supabase** (Postgres; optional Supabase Auth).
3. **HTTP APIs:** All public **`/api/*`** for Vercel are **Next.js Route Handlers** under `web/src/app/api/**`.
4. **Colocation:** Domain logic for each feature lives in **`web/src/lib/<domain>/`**, alongside the UI under `src/app/...` (e.g. habit UI under `app/projects/habit/`, habit server code under `lib/habit/`).
5. **`server/` (Express):** Treated as **legacy** — Knex migrations, Jest tests, local scripts — until migrated or archived. **Vercel does not run Express.**

## Consequences

- **Positive:** One deployable surface, simpler CORS/origin story, aligns with serverless Route Handlers, clear place for new backend code (`lib/<domain>`).
- **Negative:** Large Express routers (bookmarks, Raindrop, F5, Instagram) must be **ported incrementally** or return explicit stubs until revived.
- **Security:** Prefer **RLS** + anon key where possible; if using **service role** in Route Handlers, treat keys as **Vercel server-only** secrets and never expose to the client.
- **Generic `GET /api/db`:** **Not ported** — replaced by domain-specific queries or Supabase RPC.

## Related

- `docs/architecture.md`
- `docs/guides/heroku-to-vercel-migration.md`
- `docs/guides/server-to-next-mapping.md`
- `docs/guides/service-layer.md`
- `docs/adr/0013-nextjs-migration.md`
- `docs/adr/0005-api-routing-pattern.md` (Express-era; superseded for production by this ADR)
