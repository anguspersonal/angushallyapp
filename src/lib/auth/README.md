# Auth (Supabase)

**Production (Option 1):** Prefer **Supabase Auth** with `@supabase/ssr` (`createServerClient` + cookies) in Route Handlers. See `src/lib/supabase/server.ts` and `src/lib/habit/routeContext.ts`.

Legacy **Express** JWT + `server/middleware/auth.js` is not used on Vercel. `AuthProvider` may be wired to Supabase session when login is re-enabled.

**Do not** port `GET /api/db` (generic table reader) — use domain-specific queries or Supabase RPC.
