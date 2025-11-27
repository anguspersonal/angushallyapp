# Phase 1 exit criteria (Configuration & HTTP client consolidation)

- [x] Single schema-driven config module (`server/config/index.js`) is the only reader of `process.env`, exports a frozen object, and is validated via `npm run config:check`.
- [x] `.env.example` mirrors the schema with domain-based grouping (server, DB, security/JWT, Strava, Raindrop, OpenAI, reCAPTCHA, email, debug flags).
- [x] All outbound HTTP integrations (Strava, Raindrop, reCAPTCHA, OpenAI) run through `server/http/client.js` with shared timeouts, exponential backoff, logging, and redaction.
- [x] Server bootstrap is modular and dependency-injected (`createApp`, middleware, routes, health/ready, Next attachment points documented in `docs/server-bootstrap.md`).
- [x] Health endpoints include `/api/health` and `/api/ready`, exercised via supertest with injectable dependencies.
- [x] Local CI flow uses offline-safe commands: `npm run config:check`, `npm test`, `npm run lint` (and type checks if added).
