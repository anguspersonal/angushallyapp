# ADR 0036: Repository interface contract + browser ApiError mirror

Date: 2026-05-07

## Status

Accepted

## Context

ADR 0034 introduced `HttpError` and the `authedHandler` / `publicHandler` Route Handler wrappers, but left the **Repository interface contract** implicit. Existing Repository functions in `src/lib/<domain>/...Repository.ts` returned `Promise<T | null>`, where `null` overloaded three different meanings:

- **DB error swallowed** — `console.error` and `return null`. Caller had to remap to 500.
- **No rows for a `getById`** — legitimate "not found". Caller mapped to 404.
- **Empty list / list-error indistinguishable** — sometimes both produced `null`, sometimes only errors.

Each Route Handler then re-invented the `null → status` translation, inconsistently. There was no way to assert "DB connection error surfaces 500" through a Repository's interface, because the error was already swallowed.

On the browser side, `src/services/<domain>/client.ts` files contained two ad-hoc readers (`handleResponse` in habits, `readContentJson` in content) that decoded the server's `{ error, code? }` envelope differently. Both attached `error.code` via `@ts-expect-error`. As more service clients land, the drift would compound.

A canonical pagination shape — page/pageSize clamping, sort allowlisting, range computation, error mapping, pagination metadata — was duplicated across `habitRepository.listHabitLogs` and `blogRepository.listBlogPosts` with subtly different formulae for `totalPages` and `hasMore`.

## Decision

Three named seams, all aligned to the `HttpError` envelope ADR 0034 established:

### Repository interface contract

Every Repository function obeys:

| Outcome | Return | Throws |
|---------|--------|--------|
| Successful read/write | data shape directly | — |
| Supabase / external error | — | `HttpError(500, '<message>')` (also `console.error` for server logs) |
| Validation / business-state failure | — | `HttpError(<status>, <message>, <code?>)` |
| Legitimate "doesn't exist" (e.g. `getById` missing row) | `null` (with `T \| null` in the type) | — |

The **presence of `\| null` in the return type is a deliberate signal of intent**, not an error channel. Functions that always return data declare `Promise<T>`, which makes the type checker reject any `return null` path inside the implementation.

Enforcement is largely **type-driven**: `Promise<T>` (no `\| null`) means the only way to satisfy the signature is to return real data or throw. The `runHandler` wrapper at `src/lib/api/handler.ts` catches `HttpError` and any other thrown error, mapping cleanly to JSON, so the contract works end-to-end.

### Browser-side `ApiError` mirror

A single `src/lib/api/readApiJson.ts` decodes the server's `{ error, code? }` / `{ errors: [...] }` envelope into a typed `ApiError(message, status, code)` exception class (`src/lib/api/apiError.ts`). All `src/services/<domain>/client.ts` import it; no domain has its own ad-hoc reader.

`ApiError extends Error` with proper readonly `status` and `code` fields — no `@ts-expect-error` shimming. The two former readers were deleted.

### `listPaginated` as the pagination seam

Repositories that produce `{ items, pagination }` build the filtered base query (`.schema().from().select(*, { count: 'exact' }).eq(...)`) and delegate to `listPaginated(base, params, config)` from `src/lib/api/listQuery.ts`. That module owns:

- Page / pageSize clamping (defaults: page 1, pageSize 10, max 50).
- Sort allowlisting via a domain-supplied `sortAllowlist` (e.g. `{ createdAt: 'created_at' }`); sort columns the caller didn't list cannot reach the database.
- Default sort column + direction.
- `.range(offset, offset + pageSize - 1)` computation.
- Error mapping to `HttpError(500, 'Failed to list <errorContext>')`.
- Pagination metadata: `{ page, pageSize, totalItems, totalPages, hasMore }`.

The Repository owns the row → contract mapping; `listPaginated` owns plumbing.

## Consequences

- **Positive**
  - One mental model for failure: "data or `HttpError`" everywhere on the server side; `ApiError` everywhere on the client side. New domains follow one pattern; AI agents and humans navigate with a single set of conventions.
  - Repositories are unit-testable through their interface — pin "data on success", "null on legitimate not-found", "throws on Supabase error" all through the same surface. 101 new tests landed alongside.
  - Pagination edge cases (page=0, pageSize=9999, sort by malicious column, empty list) are pinned in one place by `listQuery` tests.
  - The F5 scoring algorithm (previously embedded in a Route Handler) became a pure function with 17 tests after the extraction.
- **Negative**
  - Subtle behaviour change: `listHabitLogs` and `listBlogPosts` now uniformly compute `totalPages = Math.ceil(totalItems / pageSize)` (returning 0 when there are zero items). Habit's previous `Math.max(..., 1)` is gone. Hits no realistic UI consumer — flagged for completeness.
  - Repositories that previously absorbed Supabase errors silently now produce 500 responses instead of empty results. This is the right behaviour but worth knowing during incident response.
- **Migration**
  - Done in commit `a6c8ad7` on 2026-05-07. Affected domains: `habit`, `content`, `strava`, `bookmarks`, `instagram`, `raindrop`. New shared modules: `src/lib/api/{httpError,apiError,readApiJson,listQuery}.ts`. Two browser readers (`handleResponse` inline + `readContentJson.ts`) deleted.
  - Routes that have not yet been migrated to `authedHandler` / `publicHandler` (`api/habit/[habitType]/aggregates/route.ts`, `api/strava/sync/route.ts`) keep their existing inline patterns — they don't call a Repository, so the contract doesn't apply yet.
  - The legacy `src/lib/bookmarks/notPortedResponse.ts` stub remains as orphaned code; cleanup deferred.

## Related

- `docs/adr/0034-authed-route-handler-module.md` — `HttpError`, validator contract, route wrapper.
- `docs/adr/0016-next-supabase-colocated-features.md` — colocated `src/lib/<domain>/` modules are the home of Repository functions.
- `docs/guides/service-layer.md` — to be updated to reference `listPaginated`, `readApiJson`, and the contract as canonical for new domains.
- `src/lib/api/{httpError,apiError,readApiJson,listQuery}.ts` — the four shared modules introduced.
