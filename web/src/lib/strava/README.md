# Strava — colocated server module

- **HTTP:** `src/app/api/strava/route.ts`
- **Data:** Supabase schema `habit` — `strava_activities`, `strava_tokens`
- **Auth:** Session user via `@/lib/supabase/server` (anon key + cookies)
- **Legacy:** `server/strava-api/*`, `server/routes/stravaRoute.js`
