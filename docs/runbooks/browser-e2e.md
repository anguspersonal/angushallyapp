# Browser E2E (Golden Path) Runbook

Owner: Quality (Sam Rivera)

This runbook captures the planned Phase 4 browser end-to-end smoke flows so backend and frontend teams can align on fixtures, commands, and CI placement. Implementations can land incrementally, but keep the flows and expectations updated as soon as steps are runnable.

## Scope and goals
- Validate the public UX across services using golden-path journeys.
- Reuse the same contract expectations documented in the testing harness (pagination metadata, error envelopes) from the browser perspective.
- Provide fast feedback in CI (initially nightly; promote to blocking once flake rate is acceptable).
- **Phase 4 completion requires**: the minimum golden paths below exist as executable tests, run in CI (`ci/browser-smoke`), and are visible alongside the server gates.

## Target flows (Phase 4)
- **Minimum scope required to claim Phase 4 completion (must exist as runnable tests):**
  - **Authentication + content browse** (`tests/e2e/auth-content.e2e.ts`): sign in via the primary path and navigate through at least two content pages, asserting pagination metadata and envelope stability when opening a content item.
  - **Authentication + habit capture → stats** (`tests/e2e/auth-habits.e2e.ts`): add a habit log and verify day/week stats render with zero-filling consistent with `shared/services/habit/contracts`.
- **Stretch flows (add as stability improves):**
  - Password reset or SSO alternates.
  - Habit multi-period stats (month/year) and error envelopes for failed provider calls.

## Fixtures and test data
- Seed a test user with predictable credentials and data. Prefer dedicated fixtures that map to `serviceMocks` shapes (content rows, habit logs) to keep parity with service/route tests.
- Reset data between runs to avoid cross-test leakage; document any environment variables required for seeds.

## Execution (planned → required for completion)
- Runner: Playwright.
- Local command (planned): `cd next-ui && npm run test:e2e`.
- CI job (planned → required): `ci/browser-smoke` executes `tests/e2e/auth-content.e2e.ts` and `tests/e2e/auth-habits.e2e.ts`. Run nightly while stabilising; once flakes are addressed, promote to a per-PR blocking gate. Link this job from the testing harness matrix so contributors know where browser flows sit relative to service and route gates. This job must exist and exercise both flows before Phase 4 can be considered complete.

## Integration with the testing harness
- The browser suite should reuse the contract language from `docs/runbooks/testing-harness.md` and rely on the same canonical contract constants from `shared/services/habit/contracts`.
- When flows assert pagination or envelopes, align with the route integration tests to avoid divergent expectations.
- Update this runbook alongside changes to the testing harness matrix so contributors see how browser flows fit into the overall quality story.

## Open items / next steps
- Wire Playwright config to consume shared fixtures (content rows, habit logs) from `server/tests/helpers/serviceMocks.js` or a shared test-data layer.
- Add screenshots or video retention for failing golden paths.
- Document retry policy and flake triage (owners, SLAs) once the suite is active.
