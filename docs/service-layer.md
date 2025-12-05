# Service Layer Patterns (Phase 2)

## Canonical example: Content / Blog (pilot)
- **Shared contracts:** `shared/services/content/contracts.ts` defines `ContentListParams`, `ContentPostSummary`, `ContentPostDetail`, and `ContentListResult` that reference the shared pagination meta in `shared/services/contracts/pagination.ts`. These types are imported by services, routes, clients, and hooks.
- **Server service:** `server/services/contentService.js` owns pagination defaults/guards (page/pageSize clamped with hasMore/totalPages), validation, and DB → domain mapping. Express routes inject this service instead of issuing SQL directly.
- **Routes:** `server/routes/contentRoute.js` is a factory that accepts `contentService` and returns typed responses matching the shared contracts. Detail endpoints return a plain `ContentPostDetail` or `404` if missing.
- **Frontend:** `next-ui/src/services/content/client.ts` wraps `/api/content` endpoints and returns contract-shaped data. Hooks in `next-ui/src/services/content/hooks.ts` (`usePosts`, `usePost`, `useLatestPost`, `usePostShare`) are the only consumer-facing API for React components.
- **Tests:** `server/tests/contentService.test.js` covers service behavior (pagination defaults/clamping, mapping, missing records); `server/tests/contentRoute.integration.test.js` validates route → service wiring and payload shape. Locally, run `npm test` (uses the local Jest binary) or narrow to `npm test -- --runTestsByPath server/tests/contentService.test.js server/tests/contentRoute.integration.test.js`.

## Habits (second domain, scaffolded)
- Shared contracts live at `shared/services/habit/contracts.ts` and mirror the Content structure (`HabitListParams`, `HabitSummary`, `HabitDetail`, `HabitListResult`) with the same pagination shape from `shared/services/contracts/pagination.ts`. Stats use the contract-defined `HabitPeriod` whitelist (`HABIT_PERIODS`), metrics whitelist (`HABIT_METRICS`), and explicit `HabitStats` shape (`period`, `sum`, `avg`, `min`, `max`, `stddev`).
- Server service scaffold: `server/services/habitService.js` exposes `listHabits`, `getHabitById`, `createHabit`, `getStats`, and `getAggregates` while delegating to existing habit APIs until the migration is complete. Pagination defaults/clamping, stat period validation, and list/detail shapes follow the shared contracts, and invalid periods/metrics surface stable error codes consumed by the routes.
- Routes: `server/routes/habitRoute.js` is a factory that injects the habit service; stats (`/api/habit/stats/:period`) and aggregates (`/api/habit/:habitType/aggregates`) both delegate into the service to centralize validation/mapping while preserving the legacy stats path used by the existing UI.
- Frontend client/hooks scaffold: `next-ui/src/services/habits/client.ts` and `next-ui/src/services/habits/hooks.ts` follow the same pattern to keep the migration path clear, and UI types (`next-ui/src/types/common.ts`) alias the shared contracts to avoid drift.
- Tests: `server/tests/habitService.test.js` and `server/tests/habitRoute.integration.test.js` assert list/detail payloads honor the contracts, include pagination metadata/404 handling, and cover stats/aggregate error codes (including invalid period/metric and provider failures).

### Compatibility note: legacy habit stats
- The legacy `/api/habit/stats/:period` route remains available for the current habit UI and is implemented through the habit service (`getStats`) to enforce shared validation and typing. Do not remove this route until the UI migrates to the newer aggregates pattern; both stats and aggregates must continue to delegate into the habit service.
- Frontend calls should go through the contract-aware helpers (e.g., `habitClient.getStats` or `getHabitStats`) so the browser hits `/api/habit/stats/:period` using the shared `HabitPeriod`/`HabitStats` types rather than bespoke fetch logic. The hook/client will surface the service’s error codes (e.g., `HABIT_INVALID_PERIOD`, `HABIT_INVALID_METRIC`) to keep UI handling consistent.

### Example flow: Content list view (end-to-end)
1. **Contract** — `shared/services/content/contracts.ts` declares `ContentListParams` (page, pageSize, sort/order) and `ContentListResult` with `{ items: ContentPostSummary[], pagination: PaginationMeta }`.
2. **Service** — `server/services/contentService.js` maps DB rows to camelCase domain shapes, applies pagination defaults/guards, and returns `ContentListResult` with `hasMore`/`totalPages`.
3. **Route** — `server/routes/contentRoute.js` parses `page`/`pageSize` from query params, calls `listPosts`, and returns the contract payload; missing detail returns `404`.
4. **Client** — `next-ui/src/services/content/client.ts` calls `/api/content/posts` and returns typed `ContentListResult`, mapping HTTP errors to explicit codes (e.g., `NOT_FOUND`).
5. **Hook** — `next-ui/src/services/content/hooks.ts` exposes `usePosts` with `{ data, pagination, isLoading, error }` so components can render without bespoke fetch logic.
6. **Component** — `next-ui/src/components/blog/BlogSnippet.tsx` renders `ContentPostSummary` props passed in from pages/hooks without re-shaping the data.

### Habit stats flow (contract to component)
1. **Contract/constants** — `shared/services/habit/contracts.ts` exposes `HABIT_PERIODS`, `HABIT_METRICS`, and the `HabitStats` shape (`period`, `sum`, `avg`, `min`, `max`, `stddev`).
2. **Service** — `server/services/habitService.js#getStats` validates the requested period/metrics against those constants, calls the provider, and fills all `HabitStats` fields (defaulting to `0` when missing) with stable error codes for invalid input/provider failure.
3. **Route** — `server/routes/habitRoute.js` handles `/api/habit/stats/:period` (legacy compatibility) and `/api/habit/:habitType/aggregates` by delegating to the service and returning `{ error, code }` envelopes for 4xx/5xx cases.
4. **Client/Hook** — `next-ui/src/services/habits/client.ts` issues the HTTP call and preserves server error codes; `next-ui/src/services/habits/hooks.ts` exposes `useHabitStats(period)` with `{ data, pagination: undefined, isLoading, error }`.
5. **Page/component** — `next-ui/src/app/projects/habit/habit.ts` and `components/HabitDrawer.tsx` call the shared helpers (client/hook) using `HabitPeriod` values so no bespoke fetch logic or shape-mapping is embedded in the UI.

## How to add a new domain service (5 steps)
1. **Define shared contracts** under `shared/services/<domain>/contracts.ts` with request/response types and reuse `PaginationMeta` from `shared/services/contracts/pagination.ts` for list responses.
2. **Implement a server service** in `server/services/<domain>Service.js` that owns validation, data access, pagination guardrails, and mapping into the shared contracts. Export a factory for dependency injection.
3. **Wire Express routes** via a factory (e.g., `server/routes/<domain>Route.js`) that accepts the service and returns contract-shaped responses only, with 404 for missing detail.
4. **Expose frontend clients and hooks** under `next-ui/src/services/<domain>/{client,hooks}.ts` so React components consume typed data and never fetch directly.
5. **Remove or shim legacy access** (direct SQL, bespoke fetch utilities) once the service + client/hooks path is wired.

## Folder quick-reference
- Shared contracts: `shared/services/{content|habit}/contracts.ts` plus `shared/services/contracts/pagination.ts`
- Services: `server/services/{content|habit}Service.js`
- Routes: `server/routes/{content|habit}Route.js`
- Frontend: `next-ui/src/services/{content|habits}/{client|hooks}.ts`
- Tests: `server/tests/{content|habit}{Service}.test.js` and `server/tests/{content|habit}Route.integration.test.js`
