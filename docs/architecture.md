# Architecture

This document describes how **angushallyapp** is structured at runtime and in the repository. For product direction, see `docs/02_roadmap.md`. For deep dives on specific choices, see `docs/adr/`. For the colocated Next service pattern, see `docs/service-layer.md`.

**Hosting target (production):** **Vercel** runs **`web` only** (root directory `web`). HTTP APIs are **Next.js Route Handlers** under `web/src/app/api/**`. **Supabase** provides Postgres (and optional Auth). See `docs/migration/heroku-to-vercel.md` and `docs/migration/server-to-next-mapping.md`. ADR `docs/adr/0016-next-supabase-colocated-features.md`.

---

## System overview

The application is a **monorepo** with two workspaces; **production traffic does not run Express**.

| Workspace | Role |
|-----------|------|
| `web` | **Primary:** Next.js 15 (App Router), React 18, Mantine UI, PWA; pages, layouts, **Route Handlers** (`/api`), and **colocated server logic** under `src/lib/<domain>/`. |
| `server` | **Legacy / tooling:** Express, Knex, PostgreSQL migrations, Jest integration tests, and one-off scripts. Used for local integrated dev or migration until Express is fully retired—not deployed on Vercel. |

A **root** `package.json` ties workspaces together and carries shared backend dependencies used when running `server` locally.

```mermaid
flowchart LR
  subgraph client [Browser]
    UI[Next_pages_and_client]
  end
  subgraph next [web_production]
    RSC[App_Router_RSC]
    NRH[Route_Handlers_app_api]
    LibColoc["lib_domain_server_only"]
    SharedUI["shared_contracts_alias"]
  end
  subgraph supa [Supabase]
    PG[(Postgres)]
    SA[Auth_optional]
  end
  subgraph legacy [server_legacy_local]
    EXP[Express]
    Knex[Knex_migrations]
  end
  subgraph contracts [shared]
    CTR[TypeScript_contracts]
  end
  UI --> RSC
  RSC --> NRH
  NRH --> LibColoc
  LibColoc --> PG
  LibColoc --> SA
  RSC --> SharedUI
  CTR --> next
  EXP -.->|"local_only"| Knex
  Knex -.-> PG
```

---

## Request paths

- **Vercel (canonical):** All `/api/*` requests are handled by **Next Route Handlers** in `web/src/app/api/**/route.ts`. Domain logic lives in `web/src/lib/<domain>/` (server-only imports).
- **Local integrated mode (optional):** If you run the Express app with Next attached (`server/bootstrap/next.js`), Express may still register `/api/*` first. For **production alignment**, do not rely on that path; implement new behavior only in Next + Supabase.

When adding or changing an HTTP API, **default to Route Handlers** in `web` and update `docs/migration/server-to-next-mapping.md` if you add a new surface.

---

## Repository layout (high level)

```
angushallyapp/
├── web/                 # Production app + APIs
│   ├── src/app/             # App Router: pages, layouts, api/**/route.ts
│   ├── src/lib/             # Server/client utilities; colocated domain logic (content, habit, …)
│   ├── src/components/
│   ├── src/providers/
│   ├── src/services/        # Typed clients + hooks (fetch /api)
│   └── src/shared/          # apiClient, HTTP helpers
├── server/                  # Legacy Express + Knex (local / tests / migration)
│   ├── bootstrap/
│   ├── routes/
│   ├── services/
│   ├── habit-api/, bookmark-api/, strava-api/, fsa-data-sync/, …
│   ├── migrations/
│   └── tests/               # Jest — prefer Vitest in web for new tests
├── shared/                  # Cross-package TypeScript contracts
│   └── services/
└── docs/
    └── migration/
        ├── heroku-to-vercel.md
        └── server-to-next-mapping.md
```

---

## Shared contracts (`shared/`)

Type definitions live under `shared/services/**`. In `web`, `@shared/*` maps to this tree (`web/tsconfig.json`).

**Convention (production):** add types under `shared/services/<domain>/contracts.ts`, implement **server-side** logic in `web/src/lib/<domain>/`, expose HTTP via `web/src/app/api/<domain>/.../route.ts`, consume from `web/src/services/<domain>/client.ts` and `hooks.ts`. See `docs/service-layer.md`.

---

## Frontend (`web`)

- **Routing:** App Router (`src/app`). Metadata, layouts, and server components follow Next 15 patterns.
- **UI:** Mantine v8, Tabler icons, Framer Motion; PWA via `next-pwa` (`next.config.mjs`).
- **Data access:** `src/services/<feature>/` exposes **clients** and **hooks** so components avoid ad hoc `fetch`.
- **Shared HTTP:** `src/shared/apiClient.ts`, `src/shared/http/httpStatusMessage.ts`.
- **Auth:** Supabase Auth when enabled; `AuthProvider` may wrap session (see ADRs 0007 / 0009 / 0016).

Path alias **`@/*`** resolves to `web/src/*`.

---

## Backend legacy (`server`)

- **Purpose:** Knex migrations against Postgres/Supabase, Jest route/service tests, optional local Express.
- **Sunset:** Once DDL and tests move to Supabase + Vitest, trim or archive `server/` bootstrap for production workflows. Vercel **never** runs `server/index.js`.

---

## Data and migrations

- Schema workflow: `docs/05_database.md`, `docs/04_schema.md`.
- Apply DDL with your normal process (e.g. **Supabase** `supabase db push`).

---

## Configuration and secrets

- **Vercel / Next:** `NEXT_PUBLIC_*` for browser; `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, OpenAI, SMTP, etc., as server-only env vars in the Vercel project.
- **Local Express:** `server/config/` when running the legacy server.

---

## Testing

| Area | Tooling | Location |
|------|---------|----------|
| Next UI | Vitest, Testing Library | `web/tests/`; prefer co-located `*.test.ts` for new code |
| Server (legacy) | Jest, Supertest | `server/tests/` |

---

## Related documentation

| Topic | Document |
|-------|----------|
| Service layer (colocated Next) | `docs/service-layer.md` |
| Express → Next mapping | `docs/migration/server-to-next-mapping.md` |
| Vercel migration chunks | `docs/migration/heroku-to-vercel.md` |
| Doc index | `docs/01_guidance.md` |
| Colocation decision | `docs/adr/0016-next-supabase-colocated-features.md` |
| Next migration | `docs/adr/0013-nextjs-migration.md` |

---

## Maintenance

When you change API boundaries, hosting, or workspace roles, update this file and `docs/migration/server-to-next-mapping.md` in the same change.
