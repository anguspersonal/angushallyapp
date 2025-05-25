# ADR 0009: Apply Authentication Middleware Globally

Date: 2025-05-25

## Status
Accepted

## Context
We need to ensure that every endpoint under `/api/raindrop` is protected.  
Previously we were considering:
- Applying `authMiddleware()` on each route in `raindropRoute.js`
- Applying at the router level via `router.use()`
- Applying globally in `index.js`

## Decision
We will apply `authMiddleware()` once at the application level in `index.js`:
```js
app.use('/api/raindrop', authMiddleware(), raindropRoute);
```

## Consequences
- **Pros**
  - Single point of configuration for authentication
  - Reduces code duplication
  - Ensures consistent authentication across all raindrop endpoints
  - Easier to maintain and modify authentication logic
- **Cons**
  - Less granular control over which specific routes need authentication
  - May need to add exclusion logic if some routes need to be public in the future

## Related
- ADR 0001: Tech Stack
