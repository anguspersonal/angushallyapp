---
source: site-meta
topic: About this website — stack, intent, audiences
priority: normal
---

> Source: `docs/vision.md` (extracted, summarised)

**The site, angushally.com, is a personal web platform serving three
concurrent purposes**:

1. **Portfolio** — showcase Angus's work, skills, and thinking.
2. **Personal tooling** — small, useful tools for Angus, friends, and
   family (some now archived).
3. **Playground** — a space to explore new technologies, patterns, and
   product ideas. The chatbot you're using is itself a playground piece.

**Audiences (in priority order):**

- Curious investors assessing credibility and engagement in HeyLina
- Future collaborators, advisors, and potential hires
- Blog readers (and, more durably, a record for Angus's children)
- Opportunistic service enquiries (web dev, consulting, maths tutoring)
  via hidden landing pages under `/work-with-me` — explicitly not a
  storefront

**Homepage role.** The homepage is "the headlines, not the full story" —
designed for an investor landing cold. Depth (reading, training, side
projects, life context, full philosophy) is deferred to `/about` and
`/projects/timeline`.

**Tech stack** (relevant if a user asks how the site is built):
Next.js 15 + React 19 + TypeScript, Mantine v8 UI, Supabase Postgres +
auth, Vercel hosting. Tests via Vitest. Pre-push hook runs lint +
typecheck + tests. Migrations via Supabase SQL files under
`supabase/migrations/`. Auth: Google OAuth 2.0 + JWT + Supabase RLS.

Angus has built and ships everything on this site himself — frontend,
backend, schema, deploy.
