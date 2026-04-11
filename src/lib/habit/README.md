# Habit tracker — colocated server module

- **HTTP:** `src/app/api/habit/**` (mirrors former `server/routes/habitRoute.js`)
- **Data:** Supabase schema `habit` — `habit_log`, `drink_catalog`, etc.
- **Auth:** Session user via `@/lib/supabase/server`
- **Legacy:** `server/habit-api/*`, `server/services/habitService.js`

**Note:** Alcohol **POST** with `extraData.drinks` only inserts `habit_log` today; full `alcohol` / `exercise` extension rows (legacy `alcoholService` / `exerciseService`) are not yet ported — extend `habitRepository` when needed.

**Aggregates** (`/:habitType/aggregates`): returns **501** until aggregate SQL is ported; use `/stats/:period` for cross-habit metrics.
