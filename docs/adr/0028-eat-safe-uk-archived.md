# Eat Safe UK / hygiene API — archived on Vercel

**Decision:** The Eat Safe UK UI is **deprecated** (`web/src/data/projectList.ts`, `app/projects/eat-safe-uk`). The Express mount `GET /api/hygieneScoreRoute` and batch scripts under `server/fsa-data-sync/` are **not** exposed on the Vercel deployment.

- **Local / research:** You may still run FSA scripts from the repo on a workstation with appropriate env and DB access.
- **If the product returns:** Add colocated handlers under `web/src/app/api/hygiene/` and `src/lib/hygiene/`, backed by Supabase, and update `docs/guides/server-to-next-mapping.md`.
