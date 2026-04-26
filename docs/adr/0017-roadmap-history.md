# ADR 0017 — Roadmap History (pre-2026-04)

Status: Archived.

This ADR preserves the historical roadmap of **angushallyapp** as it stood before the docs reorganization in April 2026. The vision, strategic goals, and long-term direction have moved to [`../vision.md`](../vision.md); completed and in-flight phases are recorded below for historical reference. Future commitments now live in [`../backlog.json`](../backlog.json) and [`../implementation-plan.md`](../implementation-plan.md).

## Completed phases

1. **Core Platform** — base infrastructure, Heroku deploy, PostgreSQL, React + Material UI, CI.
2. **Content Management** — blog post system, author profiles, rich text, slug routing, content schema.
3. **Eat Safe UK Integration** — FSA XML sync, search UI, map view, address matching. (Subsequently archived on Vercel; see [`0028-eat-safe-uk-archived.md`](./0028-eat-safe-uk-archived.md).)
4. **Habit Tracking Foundation** — habit logging + visualization, Strava + RescueTime integration, reporting, goals.
5. **Contact Form & CRM System** — secure submissions, reCAPTCHA, CRM schema, email notifications, admin UI.
6. **Authentication System** — identity schema, data backfill, FK migrations, Google OAuth 2.0, JWT, Remember-me, role-based middleware.
7. **Raindrop.io Bookmark Integration** — OAuth 2.0, secure token storage, sync service, management UI.
8. **Production Deployment Safety System** — `checkEnvSync.js`, multi-env DB checks, migration version sync, CI/CD exit codes.
9. **F5 Universal Certainty Scoring Framework** (2025-06-23) — 4-factor confidence algorithm, 5-tier levels, platform-specific validation (Instagram, LinkedIn, YouTube, Twitter), 6-endpoint API, 40 tests with 80%+ coverage.
10. **TypeScript Migration Foundation** (2025-01-27) — all 67 files converted (51 JSX→TSX, 16 JS→TS), TS 5.3.3, 50+ shared type definitions, zero breaking changes.

## Subsequent major phase — Next.js Migration (2025-07 → 2026-Q1)

Strategic decision (2025-07-07): incremental migration from CRA (JSX) to Next.js (TypeScript).

- **Rationale:** CRA deprecation, SSR for SEO, modern App Router, leverage TS foundation.
- **Approach:** route-by-route, dual-app architecture, zero-downtime, ~6–8 weeks planned.
- **Phases 1–6 complete** (foundation, shared infrastructure, core pages, layout + auth, interactive projects, code quality/build). PWA migration tracked separately under [`0018-nextjs-migration-history.md`](./0018-nextjs-migration-history.md).

Full plan, tracker, and log are preserved verbatim in [`0018-nextjs-migration-history.md`](./0018-nextjs-migration-history.md).

## Post-migration backlog (as of 2026-04)

These items have been moved to [`../backlog.json`](../backlog.json) for ongoing tracking:

- Bookmark system enhancements (F-series platform intelligence, multi-source integration).
- Enhanced habit tracker (visualization, goals, social sharing).
- Time-tracking application.
- Admin dashboard (user admin, content moderation, health monitoring).

## Long-term vision

See [`../vision.md`](../vision.md).
