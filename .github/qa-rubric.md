# QA rubric

The quality bar that `/qa-review` checks on every PR in this repo. The dev-side companion is `/address-review`. Both skills read this file; if you change the bar, you change it here.

Keep this short and load-bearing. If a rule isn't being enforced or referenced in reviews, delete it. If a new pattern starts showing up in QA findings often enough, codify it here.

## Must pass (blocking)

- [ ] No Critical or High findings outstanding (severity per `qa-review` Critical/High/Medium/Low scheme).
- [ ] All acceptance criteria from the linked issue(s) met. If no issue is linked, the PR description states what "done" means.
- [ ] Tests added or updated for new behaviour. Bug fixes include a regression test.
- [ ] CI green: `next build`, `vitest`, `next lint`, `node scripts/check-breakpoints.mjs`, branch-name gate.
- [ ] No secrets in diff. No `eval`. No unguarded `dangerouslySetInnerHTML`. No user input interpolated into HTML strings without escaping (see PR #54 history).

## Should pass (non-blocking, but flag)

- [ ] PR description explains the why, lists all themes that landed (not just the headline), links the closing issue with `Closes #N`.
- [ ] Branch name matches `<type>/<kebab-description>` per [docs/agents/branching.md](../docs/agents/branching.md). Type prefixes: `feat`, `fix`, `chore`, `docs`, `perf`, `test`, `refactor`, `hotfix`.
- [ ] Public APIs have TypeScript types. Public exports have JSDoc when intent isn't obvious from the type.
- [ ] User-facing strings considered for tone and copy.
- [ ] No new `TODO` without an issue link.
- [ ] If the PR is base = `main` and not `hotfix/*`, justify in the body. Standard flow goes via `dev`.

## Project-specific

### API + data access

- Route Handlers under `src/app/api/**` use `authedHandler` / `publicHandler` from `src/lib/api/handler.ts`. Errors thrown as `HttpError(status, message, code?)`. JSON envelope is `{ error, code? }`. (ADR 0034.)
- Repository functions in `src/lib/<domain>/*Repository.ts` follow the contract: `Promise<T>` returns real data or throws `HttpError`; `Promise<T | null>` is reserved for legitimate "doesn't exist" (e.g. `getById` missing row). Supabase errors throw `HttpError(500, ...)` rather than swallowing to `null`. (ADR 0036.)
- New domains are colocated: UI under `src/app/projects/<domain>/`, server logic under `src/lib/<domain>/`. No new code goes into `server/` (legacy, not deployed). (ADR 0016.)

### CSS and responsive

- No raw `px` inside `@media` queries in CSS modules. Use `var(--bp-*)` em-based tokens (`--bp-xs: 36em` … `--bp-xl: 88em`). Enforced by [scripts/check-breakpoints.mjs](../scripts/check-breakpoints.mjs). (ADR 0032.)
- Layout reaches for the primitives in `src/components/layout/` (Section, Stack, Switcher, Sidebar, Cluster) before raw flex/grid. (ADR 0032.)

### Performance

- LCP target < 2.0s, ceiling < 2.5s. Total JS gzipped (homepage) target < 200KB, ceiling < 300KB. (ADR 0033 §1.)
- Images: `next/image` only; `priority` mandatory on the LCP candidate; `sizes` mandatory on responsive layouts; pre-resize before commit (≤ 2400px long edge for hero, ≤ 1600px for thumbnails/OG). (ADR 0033 §2.)
- New dependency > 30KB gz requires explicit sign-off in PR body. Removing unused deps is encouraged. (ADR 0033 §4.)
- Perf-sensitive PRs paste a before/after bundle delta (`First Load JS` from `next build` output is fine; full WebPageTest only when the change is hot-path runtime). (ADR 0033 §7.)
- `framer-motion` only where choreography genuinely needs JS. Simple fade/translate-on-enter uses CSS scroll-driven animation. (ADR 0033 §5.)

### Database migrations

- Live at `supabase/migrations/<timestamp>_<name>.sql`.
- Idempotent (`CREATE INDEX IF NOT EXISTS`, `DROP INDEX IF EXISTS`, `CREATE TABLE IF NOT EXISTS`).
- Wrapped in `BEGIN; … COMMIT;` unless the statement is incompatible with a transaction (e.g. `CREATE INDEX CONCURRENTLY`).
- **Open the PR before applying to production.** The QA loop has no leverage on an already-deployed change, and a rejected migration is harder to unwind than a delayed one. The only exception is genuine `hotfix/*` situations.

### Email and user input

- Any user-submitted string interpolated into an HTML email body or any `dangerouslySetInnerHTML` target goes through `escapeHtml` (or an equivalent escape that handles `&`, `<`, `>`, `"`, `'`). See PR #54 for the regression that landed this rule.
- Outbound email subjects and bodies stay deduplicated per recipient. One owner notification per submission, not two.

### Privacy and content

- Default to role-based phrasing for identifiable people on user-facing surfaces ("my partner", "a colleague", "my brother"). Carve-outs: immediate family and Angus's partner. Internal docs (`docs/`, ADRs) can use real names freely. (ADR 0035.)

### Review workflow

- Self-PRs: GitHub blocks both `--approve` and `--request-changes` on your own PR. `/qa-review` posts as `--comment` and states the intended verdict in the body. Don't treat the absence of a formal green tick as a missing signal when the body says "intended approve".
- PRs that fix Critical or High findings from an earlier QA round mention which finding they address in the commit or PR body, so the next round can resolve the trail explicitly.
- Round cap is 3. Round 4 triggers `/qa-review` escalation: a `needs-human` label and a final `--request-changes` review. Don't try to thread the needle for a fourth round.
