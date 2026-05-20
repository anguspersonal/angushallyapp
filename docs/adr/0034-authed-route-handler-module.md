# ADR 0034: Authed Route Handler module

Date: 2026-05-05

## Status

Accepted

## Context

Every Next.js Route Handler under `src/app/api/**` that needs an authenticated user repeats the same five-line ceremony: build the per-request Supabase user client, return 503 if Supabase isn't configured, call `auth.getUser()`, return 401 if there's no session, get the service-role admin client, return 503 if it isn't configured, then proceed.

Two helpers exist for this — `requireAuth` (`src/lib/supabase/auth-helpers.ts`) and `requireHabitUserAndAdmin` (`src/lib/habit/routeContext.ts`) — and they are structurally identical: same return shape (`{ ok: true; admin; userId } | { ok: false; response }`), same three failure modes, same flow. The only variation is the 503 response body (`{ error: 'Supabase not configured' }` vs `migrationInProgressResponse('habit')`). A third adapter is inlined in `src/app/api/strava/route.ts`. That's three adapters of the same module — well past the *two-adapters-equals-real-seam* threshold.

The same handlers also each hand-roll JSON parsing (try/catch around `req.json()`), validation, and error-response shaping. Error envelopes have drifted: some return `{ error }`, some `{ message }`, some plain arrays. Some handlers extract validation into `validateContactFormBody` / `validateAnalyseTextBody`; others keep it inline. Some handlers handle thrown errors; most rely on Next.js's framework-level catch.

We need one place that owns the HTTP entry-point protocol: auth, Supabase client construction, JSON parsing, validation, error-envelope shaping, and the `Result | thrown error → NextResponse` mapping.

## Decision

Introduce an **Authed Route Handler module** at `src/lib/api/handler.ts` exposing two named higher-order route handlers and one error class:

- `publicHandler(opts?, fn)` — no session required; provides `admin` (service-role Supabase client), parsed `body`, `params`, `req`.
- `authedHandler(opts?, fn)` — session required; provides `admin`, `userId`, `body`, `params`, `req`. Returns 401 if no session.
- `HttpError(status, message, code?)` — thrown by handlers (or by Repository functions deeper in the call stack) to signal a non-200 response.

The wrapper owns:

1. **Auth gate** — for `authedHandler`, builds the per-request Supabase user client, calls `auth.getUser()`, returns 401 on failure.
2. **Supabase client construction** — both handlers obtain the service-role admin client and return 503 on misconfig.
3. **JSON body parse** — when a `body:` validator is configured, parses `req.json()` (returns 400 on malformed JSON), runs the validator (returns 400 on validation failure), and provides a typed `body` to the callback.
4. **Error mapping** — catches `HttpError` and returns `{ error, status, code? }` JSON with the carried status; catches any other thrown error and returns 500 with a logged stack.
5. **Success envelope** — calls `NextResponse.json(value)` on the callback's return value (pass-through, no wrapping).

Five sub-decisions resolved during design:

| Fork | Decision | Reasoning |
|------|----------|-----------|
| Shape | **Higher-order function** over helper-inside-handler | Only the HOF can own thrown errors and uniform response shapes; helpers can't structurally |
| Scope | **Wide** — auth + clients + body parse + validator + error envelope | Medium would leave the duplicated JSON-parse/validate boilerplate in place; Wide is the only width that fully closes the seam |
| Variants | **Named entries** (`publicHandler`, `authedHandler`) | Greppable; reads aloud at the call site; codebase has only two real flavors today |
| Error signaling | **Throw `HttpError`** | Dominant TS-server convention (tRPC, NestJS); the wrapper must catch unknown errors anyway, so symmetric; lets Repositories deep in the stack surface 404/403 cleanly without threading `Result` types |
| Success envelope | **Pass-through** (no `{ data: ... }` wrapping) | REST-orthodox; single-consumer site doesn't need an envelope; migration cost on browser clients is real; errors are uniform regardless |

Validators are plain functions of shape `(raw: unknown) => { ok: true; value: T } | { ok: false; error: string }` — the existing hand-rolled validators (`validateContactFormBody`, `validateAnalyseTextBody`) already satisfy this. No new validation library required.

Role-based authorisation (e.g. "only editors can publish") is a separate concern handled inside the wrapped handler via a future `requireRole(admin, userId, role)` that throws `HttpError(403)`. The wrapper owns the door, not the keycard.

## Consequences

- **Positive**
  - Auth, env-var, and JSON-parse boilerplate disappears from per-route code (~5–15 lines per handler).
  - Error envelope becomes uniform across the API for free.
  - Repositories can throw `HttpError` directly; per-route null-mapping disappears.
  - Test surface concentrates: the wrapper has one test file pinning 401/503/400/HttpError/unknown-throw paths; per-handler tests focus only on dispatch.
  - New domains follow one pattern; AI agents and humans both navigate with a single mental model.
- **Negative**
  - HOF wrapping introduces one extra call-stack frame; debugger stepping is slightly less direct than today's helper pattern.
  - Repository functions that currently return `T | null` must migrate to throwing `HttpError` (or stay null and be remapped at the call site during transition).
  - Migration is incremental — for the duration, two patterns coexist.
- **Migration**
  - Order: `contact` → `analyseText` → `strava` → habit suite (`habit/route.ts`, `[habitType]/*`, `stats/[period]`, `entries/[id]`) → `bookmarks` → `raindrop` → `content/posts/*` → delete deprecated shims.
  - During transition, `requireAuth` and `requireHabitUserAndAdmin` remain as thin wrappers that delegate to `authedHandler` internals, so existing handlers keep working without per-PR rewrites.
  - `migrationInProgressResponse('<domain>')` is replaced with a generic 503 wherever the only trigger is a missing admin client — that condition is a config error, not a migration state.

## Related

- `docs/adr/0007-auth-strategy.md` — auth approach (Supabase + Google OAuth)
- `docs/adr/0009-global-auth-middleware.md` — Express-era global middleware; superseded for the Next side by per-handler wrappers
- `docs/adr/0016-next-supabase-colocated-features.md` — Route Handlers + colocated `lib/<domain>/` are where this module fits
- `docs/guides/service-layer.md` — to be updated to reference `publicHandler` / `authedHandler` as the canonical entry-point pattern
- `src/lib/supabase/auth-helpers.ts`, `src/lib/habit/routeContext.ts` — the two existing adapters being subsumed
