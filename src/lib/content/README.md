# Content (blog) — colocated server module

- **HTTP:** `src/app/api/content/posts/**`
- **Data:** Supabase schemas `content.posts`, `identity.users` (author names).
- **Contracts:** `@shared/services/content/contracts`
- **Legacy:** `server/services/contentService.js`, `server/routes/contentRoute.js`

When `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are unset, Route Handlers return the migration 503 payload.
