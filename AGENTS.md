# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a Next.js 15 monorepo (`npm workspaces`) with two workspaces:
- **`web/`** — Primary Next.js app (App Router, React 19, Mantine UI, Supabase). This is the production codebase.
- **`server/`** — Legacy Express/Knex (local dev/migrations only, not deployed).

Node version: **20.x** (see `.nvmrc`). Package manager: **npm**.

### Quick reference

| Task | Command | Notes |
|------|---------|-------|
| Install deps | `npm install` | From repo root; installs both workspaces |
| Dev server | `npm run dev` | Starts Next.js on `:3000` |
| Lint | `cd web && npx next lint` | Warnings only; no blocking errors expected |
| Tests (frontend) | `cd web && npx vitest run` | Vitest + jsdom; 10 tests as of setup |
| Build | `npm run build` | Runs `next build` in `web/` |

### Environment variables

- The Next.js app needs a `.env.local` in `web/` with at minimum `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (can be placeholder values for local dev).
- The full env template is in `.env.example` (root) and `config/env.example`.
- Supabase clients gracefully return `null` when env vars are missing, so the app boots without a real Supabase instance.

### Gotchas

- The `web/package.json` `dev` script calls `../scripts/check-port.js` before `next dev`. If that script is missing or port 3000 is in use, use `npx next dev` directly from `web/`.
- React is hoisted to the repo root `node_modules/`; `vitest.config.ts` explicitly aliases `react` and `react-dom` to the root to avoid duplicate React errors.
- `next.config.mjs` sets `typescript: { ignoreBuildErrors: true }` and `eslint: { ignoreDuringBuilds: true }` for deterministic builds.
- The `server/` workspace is not included in `npm workspaces` and does not need to run for frontend development or testing.

### Documentation

- Architecture: `docs/architecture.md`
- Startup commands: `docs/11_startup_commands_guide.md`
- Database schema: `docs/04_schema.md`
- ADRs: `docs/adr/`
