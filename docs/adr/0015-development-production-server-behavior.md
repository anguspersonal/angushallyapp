# ADR 0015: Development vs Production Server Behavior

Date: 2025-07-12

## Status
Accepted

## Context
During the Next.js migration, we encountered confusion about when to use `npm start` vs `npm run dev`. The Express server was running but returning 504 proxy errors when accessed via browser, leading to questions about expected behavior.

## Decision
We clarified the intended behavior of our server scripts:

- **`npm start`**: Production mode
  - Runs only Express server (`node server/index.js`)
  - Serves built Next.js static files from `next-ui/out/`
  - Requires `npm run build` to be run first
  - Designed for production deployment

- **`npm run dev`**: Development mode  
  - Runs both Express server (port 5000) and Next.js dev server (port 3001)
  - Express proxies requests to Next.js dev server
  - Enables hot reloading and development features
  - Designed for active development

## Consequences
- **Pros**
  - Clear separation between development and production workflows
  - Development environment supports hot reloading and debugging
  - Production environment serves optimized static files
  - Consistent with standard Node.js/Next.js patterns

- **Cons**
  - Requires understanding of two different startup modes
  - Development requires both servers to be running
  - Production requires build step before deployment

## Related
- ADR 0013: Next.js Migration
- Migration log: `docs/09_nextjs_migration_log.md` 