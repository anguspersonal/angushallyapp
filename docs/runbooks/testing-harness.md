# Testing Harness and Quality Gates

Owner: Quality (Sam Rivera)

This runbook standardizes how we execute service-layer contract tests, integration coverage, and upcoming browser e2e smoke flows. Use it during feature delivery and before cutting releases to ensure we meet **Phase 4** exit criteria:

- Service and route coverage targets met for new and existing endpoints.
- CI gates fail on contract regressions and track flake rate for remediation.
- Documentation, runbooks, and observability traces stay aligned with the active architecture.

## 1) Quick links
- Service mocking helpers: `server/tests/helpers/serviceMocks.js` (stateless utilities documented below)
- Canonical habit contract constants: `shared/services/habit/contracts.ts` (source of truth) with CommonJS shims re-exporting the compiled output at `shared/services/habit/contracts`
- Service contracts: `shared/services/**/contracts.ts`
- Content/habit services: `server/services`
- Frontend clients/hooks: `next-ui/src/services`
- Browser E2E runbook: `docs/runbooks/browser-e2e.md`

## 2) Test suite overview
- **Unit & contract tests (server)**: Validate service contracts, pagination (first/middle/last page), and error handling. Run selectively with `cd server && npm test -- --runTestsByPath tests/contentService.test.js tests/habitService.test.js`.
- **Route-level integration (server)**: Validate Express factories against the service layer (e.g., content route). Run with `cd server && npm test -- --runTestsByPath tests/contentRoute.integration.test.js`.
- **Browser e2e smoke (required for Phase 4 completion once implemented)**: Golden-path journeys (login → content browse, habit add → stats) will be automated with Playwright hitting the Next.js frontend. Capture steps and expected assertions in this runbook as flows are built. Phase 4 remains incomplete until these flows exist and run in CI.

### Canonical helper surface
- **Content builders**: `createContentRow`, `createContentPage` for contract-shaped DB rows and pagination envelopes.
- **Habit builders**: `createHabitLog` for provider-shaped rows; aggregates default to zero-filled metrics aligned to `shared/services/habit/contracts`.
- **Dependency factories**: `createMockDb`, `createMockLogger`, `createContentServiceDeps`, `createHabitServiceDeps` for DI-compatible mocks without shared state.
- **Provider stubs**: `createHabitApiMock` with independent methods for success/failure scenarios.

### Habit contracts (TS → JS bridge)
- **Canonical source (only editable location)**: `shared/services/habit/contracts.ts` contains every Habit contract shape and constant (periods/metrics). Define or change values here only.
- **Generated bridge for JS consumers**: `shared/services/habit/contracts.js` is a thin, generated CommonJS entrypoint that re-exports the compiled output from `shared/services/habit/dist/contracts.js`. It must remain free of handwritten literals or logic; regenerate it from the TS source when contracts change.
- **Canonical import path**: All JavaScript consumers—including `server/services/habitService.js`, `server/tests/helpers/serviceMocks.js`, and the habit test files—must import from `shared/services/habit/contracts`. Do not mix TS imports with ad hoc JS paths or inline literals for periods/metrics.
- **Regeneration + build ordering**: `npm run build:habit-contracts` (or `tsc -p shared/services/habit/tsconfig.json`) compiles the bridge. The `pretest:contracts` hook runs this build automatically before `npm run test:contracts`, so the CI job and local runs stay aligned. The generated `shared/services/habit/dist/` output is ignored by git—never commit it.
- **Runtime expectation**: The bridge is generated only; never edit `contracts.js` or `constants.base.js` by hand. If you find a literal period/metric in services/helpers/tests, replace it with an import from this canonical module.

When adding helpers, keep them narrowly scoped (e.g., "build a content row" or "build a habit aggregate stub"). Document new names in this list and keep shapes derived from the published contracts—do not embed business logic.

## 3) Standard fixtures and mocks
- Use `createContentServiceDeps` and `createHabitServiceDeps` to mirror the real dependency boundaries (service-level, not DB/HTTP clients) while keeping mocks stateless.
- Use canonical habit constants from `shared/services/habit/contracts` (TypeScript source; JS shims re-export) to keep service and test expectations in sync.
- Reuse `createContentRow` when mapping DB rows into shared content contracts.
- Prefer `createHabitApiMock` for habit-domain tests to keep stubbed providers consistent and predictable. Avoid embedding business logic—helpers only prepare inputs, mocks, and expectations.

## 4) Coverage targets and CI expectations
- **Coverage scope (server)**: Coverage collection is limited to `server/services/**/*.js` and `server/routes/**/*.js` via `collectCoverageFrom` so unrelated workspaces do not affect thresholds.
- **Coverage targets (server)**: Thresholds are calibrated to the current passing baseline and enforced by Jest. Lowering them requires an explicit decision, a Jest config update, and a matching doc change—never weaken the gate silently.

| Scope | Lines / Statements | Functions | Branches |
| --- | --- | --- | --- |
| Global | ≥ 75% | ≥ 70% | ≥ 65% |
| Services | ≥ 78% | ≥ 72% | ≥ 68% |
| Routes | ≥ 75% | ≥ 70% | ≥ 65% |

- If a change would reduce coverage, either backfill tests or deliberately adjust the thresholds in `server/package.json` and record the rationale here.
- **CI gating**: Service and route suites run as hard gates. Browser smoke becomes a gate when stable; track and deflake before promoting. Avoid quarantining without an assigned owner.

### CI matrix (Phase 4)
| Test type | Purpose | Local command | CI workflow / job name | Gate? |
| --- | --- | --- | --- | --- |
| Service/unit + contract (content, habits) | Validate service contracts, pagination metadata (first/middle/last), error taxonomy, and aggregate edge cases. | `npm --workspace server run test:contracts -- --coverage` (`pretest:contracts` builds the habit bridge first) | `Server Quality Gates` / `Service and Route Contracts` | Blocking on PRs + main |
| Route integration (content) | Assert HTTP envelope (status, body keys, pagination) stays stable and mirrors service contracts. Included in `test:contracts`. | Included above | Same as above | Blocking |
| Browser e2e smoke | Golden paths across frontend + backend (login/content browse; habit add → stats). See [browser runbook](./browser-e2e.md). | `cd next-ui && npm run test:e2e` (once added) | `ci/browser-smoke` (initially nightly; promote to per-PR blocking once stable) | Planned → Blocking once stable |

Workflow mapping (copy-pasted strings from the workflow for traceability):

| Workflow file | Workflow name | Job name | Trigger | Command |
| --- | --- | --- | --- | --- |
| `.github/workflows/quality.yml` | `Server Quality Gates` | `Service and Route Contracts` | `pull_request` to `main` and `push` to `main` (paths limited to server/shared/runbook/workflow files) | `npm --workspace server run test:contracts` (pretest builds TS→JS bridge; Jest enforces service/route thresholds with coverage) |

## 5) Execution checklist (per PR)
1. **Service-layer contract tests**: Cover the affected service(s) and verify pagination, validation, and error taxonomy handling. Assert on codes/types when present. Use canonical contract imports from `shared/services/habit/contracts` instead of hardcoded periods/metrics.
2. **Route integration**: Exercise the matching route factory with supertest to confirm HTTP status codes, error envelopes, pagination metadata, and payload shape.
3. **Golden-path e2e (once available)**: Run the smoke suite for login/content browse and habit creation/statistics. Capture flake notes in the PR if retries were required.
4. **Coverage/observability**: Ensure tests assert on meaningful fields (pagination metadata, error codes) and do not leak internal error classes. Use logger mocks to confirm errors are recorded when dependencies fail.

## 6) How to debug
- **Install deps**: ensure dev dependencies (Jest) are installed with `npm install --include=dev` (or `cd server && npm install --include=dev` when using workspaces).
- **Run a single file**: `npm test -- --runTestsByPath server/tests/contentService.test.js` (service) or `npm test -- --runTestsByPath server/tests/contentRoute.integration.test.js` (route).
- **Reproduce the CI gate locally**: `npm --workspace server run test:contracts -- --coverage` (runs helpers + content/habit services + content route with enforced thresholds and coverage collection for services/routes only).
- **Increase logging**: pass a logger override (e.g., `createContentServiceDeps({ loggerOverrides: { error: jest.fn() } })`) to assert dependency failures are captured; correlate with runtime logs and metrics in the Phase 3 observability stack when debugging environment failures.
- **Re-run flaky cases**: retry the specific file before broader suites; capture flake notes in PRs and assign an owner.

### New-contributor checklist
- Install dev deps so Jest is available: `npm install --include=dev`.
- Run the core suites locally: service contract tests (`server/tests/contentService.test.js`, `server/tests/habitService.test.js`) and route integration (`server/tests/contentRoute.integration.test.js`).
- If failures occur, check the mocked dependencies (serviceMocks helpers) and inspect logs/metrics in the observability stack for matching errors.
- Any contract or test-strategy changes (including updates to canonical constants in `shared/services/habit/contracts.ts`) must be mirrored in this runbook so CI gates remain aligned.

## 8) Canonical contracts and helper imports
- Habit constants (`HABIT_PERIODS`, `HABIT_METRICS`) live in `shared/services/habit/contracts.ts`. Runtime JavaScript consumers (services, helpers, tests) import from `shared/services/habit/contracts` so every layer uses the same canonical values.
- Helpers live in `server/tests/helpers/serviceMocks.js` and are grouped by purpose: content builders, habit fixtures, provider stubs, and DI factories. Extend them narrowly and document new helpers in this runbook.

## 9) Verify Phase 4 exit criteria locally
1. Install dev dependencies so Jest is available (`npm install --include=dev` or `npm install --include=dev` inside `server`).
2. Run the gated suite with coverage: `npm --workspace server run test:contracts -- --coverage` (uses `collectCoverageFrom` scoped to `server/services/**` and `server/routes/**`; `pretest:contracts` builds the TS→JS habit bridge first).
3. Confirm coverage meets the thresholds above (lines/statements ≥75%, functions ≥70%, branches ≥65% globally; see service/route tiers for specifics). If coverage dips, either add tests or intentionally adjust thresholds in `server/package.json` and document the rationale here.
4. Check the **Server Quality Gates / Service and Route Contracts** workflow in your PR; Phase 4 changes must keep this check green. Documented workflow: `.github/workflows/quality.yml` triggered on `pull_request` and `push` to `main` touching server/shared/runbook paths.
5. Browser golden-path flows are required for Phase 4 completion once implemented: ensure the minimum flows in [browser-e2e.md](./browser-e2e.md) exist as real tests (`tests/e2e/auth-content.e2e.ts`, `tests/e2e/auth-habits.e2e.ts`), run locally (`cd next-ui && npm run test:e2e`), and are present in CI (`ci/browser-smoke` job, nightly until stable and then blocking).

### Phase 4 verification checklist
- [ ] `npm --workspace server run test:contracts -- --coverage` passes locally with coverage meeting thresholds and any threshold adjustments are documented here.
- [ ] `Server Quality Gates / Service and Route Contracts` check is green in CI for the branch/PR (workflow: `.github/workflows/quality.yml`).
- [ ] Golden-path browser tests implemented and running in CI: `tests/e2e/auth-content.e2e.ts` and `tests/e2e/auth-habits.e2e.ts` in the `ci/browser-smoke` job.
- [ ] Coverage scope/thresholds in `server/package.json` match the values documented above; any deliberate adjustments are recorded in this runbook alongside the Jest config change.

## 10) Ownership and triage
- **Quality** owns the harness, CI wiring, and flake investigation.
- **Domain owners** (content, habits) maintain fixtures and service contracts; Quality provides helpers and guidance.
- Log gaps or flaky cases in `docs/03_updates.md` under the current focus section.
