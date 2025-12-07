# Observability (Structured Logging & Error Taxonomy)

## Request context and scoped loggers
- `applyRequestContext` (wired in `configureMiddleware`) is the single entry point for request metadata. It reads incoming `x-correlation-id`/`x-trace-id` headers or generates a UUID, stores it on `req.context`, and builds `req.logger` with `logger.createRequestContextLogger`.
- Routes should rely on `req.context`/`req.logger` instead of hand-threading IDs. For non-HTTP callers (jobs, scripts), create a context via `createBackgroundContext` and pass it into `createHttpClient({ getContext })` or `logger.createRequestContextLogger`.
- Services may receive `{ logger, context }` as optional dependencies but must still work without them.

### Copy/paste patterns
- **Route:**
  ```js
  router.get('/thing', async (req, res) => {
    try {
      const result = await service.doWork(req.user.id, { logger: req.logger, context: req.context });
      return res.json(result);
    } catch (error) {
      const classification = classifyError(error, { defaultCode: 'THING_FAILED' });
      req.logger?.error('thingRoute.failed', {
        correlationId: req.context?.correlationId,
        error_class: classification.errorClass,
        is_recoverable: classification.isRecoverable,
        is_user_facing: classification.isUserFacing,
      });
      const response = mapErrorToResponse({ code: classification.code }, { defaultMessage: 'Failed to load thing' });
      return res.status(response.status).json(response.body);
    }
  });
  ```
- **Service:**
  ```js
  function createDomainService(deps = {}) {
    async function doWork(userId, options = {}) {
      if (!userId) throw Object.assign(new Error('User is required'), { code: 'USER_REQUIRED', type: 'validation' });
      const scopedLogger = options.logger || deps.logger;
      scopedLogger?.info?.('domain:doing-work', { userId });
      // return domain value or throw domain error with `code`
    }
    return { doWork };
  }
  ```
- **Background job / script:**
  ```js
  const context = createBackgroundContext('weekly-job');
  const logger = baseLogger.createRequestContextLogger(context.correlationId, { source: context.source });
  const http = createHttpClient({ logger, getContext: () => context, dependencyName: 'partner-api' });
  ```

## Error taxonomy usage
- Services raise domain errors with stable `code` values (e.g., `HABIT_INVALID_PERIOD`, `CONTENT_FETCH_FAILED`) and no HTTP details. See `server/observability/errors.js` for the shared taxonomy.
- Routes (or shared HTTP middleware) classify errors with `classifyError` and translate them to responses with `mapErrorToResponse`, deciding status codes at the edge. Responses stay `{ error, code }`—never include taxonomy metadata.
- When logging failures, include the taxonomy fields (`error_class`, `is_recoverable`, `is_user_facing`) plus `correlationId` from the request context.

## Expectations for new routes/services
- **Services**: accept plain arguments plus optional `{ logger, context }`; validate inputs; throw domain errors with shared codes. Avoid Express, HTTP status codes, or taxonomy imports.
- **Routes**: invoke services, catch domain errors, classify/map with the taxonomy, and return only the public envelope `{ error, code }` alongside any existing Phase 2 fields. Follow the patterns in `contentRoute` and `habitRoute`.
- **HTTP client**: use `createHttpClient` with a `getContext` that returns `req.context` (or `createBackgroundContext` for jobs). Logs must include `method`, sanitized `url`, `status`, `durationMs`, `outcome`, `dependency`, and `correlationId` while preserving the existing retry/timeout behavior.

Cross-reference: keep this layered atop the Phase 2 service contracts documented in `docs/service-layer.md`—domain code stays HTTP-agnostic; routing/middleware own error shaping and taxonomy logging. New features should follow the route/service/background patterns above rather than inventing new entry points.

## Data protection in structured logs
- Avoid logging request bodies, secrets, or PII. Route-level logs should stick to correlation IDs, dependency names, and low-cardinality status fields.
- `createHttpClient` already redacts sensitive headers (tokens, passwords, cookies) and sanitizes URLs; prefer dependency identifiers over full endpoints when possible.
- When adding new fields to logs, favor opaque IDs over raw user data (for example, internal user IDs instead of emails) and keep payload sizes small to reduce risk and noise.
