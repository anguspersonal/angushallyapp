# Server bootstrap overview

1. **Configuration**
   - `server/config/index.js` loads `.env*` files once, validates required secrets with Zod, applies defaults, and exports a frozen config object.
   - `npm run config:check` runs the same validation used at runtime to fail fast in CI.

2. **HTTP client**
   - `server/http/client.js` exposes `createHttpClient` and a shared `httpClient` with timeouts, exponential backoff retries, tracing headers, and structured/redacted logging.
   - Integrations (Strava, Raindrop, reCAPTCHA, OpenAI) should call this client with their base URLs and auth headers.

3. **Express app assembly**
   - `server/bootstrap/createApp.js` builds an Express app from injected dependencies (`config`, `httpClient`, `db`, logger, optional `nextHandler`).
   - `server/bootstrap/middleware.js` registers security headers, JSON parsing, cookies, rate limiting, and HTTPS trust using the supplied config.
   - `server/bootstrap/routes.js` attaches API routers; `server/bootstrap/health.js` adds `/api/health` plus `/api/ready` (optionally checking `db.query`).
   - `server/bootstrap/createServer.js` / `server/index.js` construct dependencies, build the app, attach Next.js routes via `attachNext` when a `.next` build exists, and start listening on `config.server.port`.

4. **Adding routes or integrations**
   - Add middleware in `registerMiddleware`, routes in `registerRoutes`, and any health/ready probes in `registerHealthChecks`. Routes loaded through `registerRoutes` can be plain routers or factories that accept injected deps.
   - Pull settings from the shared `config` object and use `createHttpClient` for outbound requests to inherit consistent retries, timeouts, and tracing.
   - Local runs stay offline once `npm install` completes: `npm run config:check && npm test && npm run lint` use the vendored dev dependencies (no registry fetch).
