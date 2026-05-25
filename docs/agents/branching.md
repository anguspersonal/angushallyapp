# Branching & Flow

How code moves from a working branch to production. Applies to agents and humans equally.

## Branch naming

Every branch starts with a type prefix matching the kind of change. The prefix MUST be one of:

| Prefix     | Use for                                                       | Example                                  |
| ---------- | ------------------------------------------------------------- | ---------------------------------------- |
| `feat/`    | New user-facing capability                                    | `feat/blog-tag-filter`                   |
| `fix/`     | Bug fix on existing capability                                | `fix/contact-form-html-injection`        |
| `chore/`   | Maintenance: deps, configs, lint, internal refactors          | `chore/bump-mantine-8.3`                 |
| `docs/`    | Documentation only (no code/test changes)                     | `docs/branching-policy`                  |
| `perf/`    | Performance-only change with no behavior diff                 | `perf/db-hot-path-indexes`               |
| `test/`    | Test-only additions or harness changes                        | `test/header-aria-label-coverage`        |
| `refactor/`| Internal restructuring with no behavior or perf claim         | `refactor/extract-content-repository`    |
| `hotfix/`  | Urgent production fix that bypasses `dev` (see below)         | `hotfix/login-callback-500`              |

After the prefix, use a short kebab-case description of the intent — not a commit message, not the file you changed.

### Local vs remote

Agent tooling often auto-generates branch names like `claude/<random-words>`, `codex/<topic>`, `cursor/<task-id>`. **That's fine locally.** The CI gate validates remote branch names only.

Before pushing, rename to a canonical prefix:

```
git branch -m feat/<short-description>
git push -u origin feat/<short-description>
```

Same applies to humans on auto-named scratch branches. The prefix convention is what review/history/automation reads — what you call the branch on your laptop is your business.

## Flow

```
feat/* | fix/* | chore/* | docs/* | perf/* | test/* | refactor/*
   │
   ▼
  dev   ← manual testing happens here
   │
   ▼
  main  ← production (Vercel auto-deploys)

hotfix/*
   │
   ▼
  main  ← direct (skip dev when downtime is the alternative)
```

### Standard flow

1. Branch off `dev`.
2. Push, open PR with base = `dev`.
3. Merge into `dev` after pre-push checks pass (see below) and review converges.
4. Manual / preview testing happens on `dev` (or its Vercel preview deploy).
5. Open `dev → main` PR to promote. Merge after pre-merge checks pass.

### Hotfix flow

A hotfix branch targets `main` directly. Use it **only** when waiting for the `dev` cycle would extend a production incident. Examples that qualify: prod-only crash, security bug being exploited, payment/auth completely broken. Examples that do NOT qualify: visual bug, minor regression with workaround, "I want this out faster". After landing on `main`, immediately also merge into `dev` so the two branches don't diverge.

## Pre-push / pre-merge checks

### Feature branch → `dev` (cheap, fast)

Run before pushing and re-verify in the PR:

| Check       | Command                  | Purpose                                  |
| ----------- | ------------------------ | ---------------------------------------- |
| Lint        | `npm run lint`           | Catches obvious style/correctness issues |
| Typecheck   | `npx tsc --noEmit`       | Flags new TS errors (pre-existing ones are tracked separately — see `next.config.mjs`) |
| Unit tests  | `npm test`               | Vitest run; must be green (no `--no-verify`) |

These are enforced automatically via a Husky `pre-push` hook (installed by `npm install` via the `prepare` script). Bypassing with `git push --no-verify` is allowed only for WIP backup pushes to a feature branch you don't intend to PR yet — never when opening or updating a PR.

### `dev → main` (expensive, slower)

Run before merging the promotion PR:

| Check                  | How                                          | Purpose                                  |
| ---------------------- | -------------------------------------------- | ---------------------------------------- |
| All feature-branch checks | Same as above                              | Confirm nothing regressed during integration |
| Full build             | `npm run build` (with real env vars)         | Catches build-time errors that `tsc --noEmit` misses |
| E2E smoke              | Browser-based golden-path through key flows (home, blog, contact, login, projects/*) | Catches integration regressions tests miss |
| Manual visual          | Walk a couple of the touched routes on the Vercel preview | Catches layout/style regressions no automated check covers |

E2E and manual visual are the bar for promoting `dev → main`. An agent that touches UI can't autonomously satisfy them — it must defer to a human.

## What "cheap" and "expensive" mean

The split exists because feature-branch PRs land often (multiple per day during active work) and dev→main is rare (once a session, or once a day). Making feature PRs wait on E2E would dominate the loop; running E2E on every feature branch wastes CI minutes. The tradeoff is intentional: catch the cheap mistakes early, batch the expensive ones at promotion time.

## Database migrations

Schema changes follow a different gate than code. Code lands once and runs; DDL (Data Definition Language — `CREATE TABLE`, `DROP INDEX`, `ALTER COLUMN`, etc.) changes physical state that's hard to reverse. **Default rule: review the SQL before applying it to prod.**

### Default flow — stage SQL in PR, apply after merge

For DDL changes with no feature dependency (a new index, a new table, a nullable column with no consumer yet):

1. Agent writes the migration at `supabase/migrations/<timestamp>_<description>.sql`.
2. Agent opens the PR with the file. **Does not** call `apply_migration` on prod.
3. QA reviews the SQL.
4. On merge to `dev`: apply the migration to the dev DB (today: prod, since there's no separate dev DB — see [What we're not doing (yet)](#what-were-not-doing-yet) below for why a staging DB isn't justified yet).
5. Verify post-apply with `pg_indexes` / `\dt` / a sanity SELECT.

### When a feature needs the DDL applied to be testable: expand-and-contract

If you can't fully exercise the PR without the schema change in place, **don't bundle them**. Split into two PRs (the "expand-and-contract" or "parallel change" pattern):

- **PR A — expand.** The additive DDL only. No application-code change. Old code keeps working because the new column / table / index is unused.
- **PR B — use.** Application code reads/writes the new schema. No DDL in this PR. Tests pass because the schema is already on prod (PR A landed first).
- **(Optional) PR C — contract.** Drop the old column / tighten constraints. Only after the feature has been live and stable for at least one dev→main cycle.

Each PR is independently reviewable and revertible. No PR is blocked on "I can't test until the DDL ships." This is the default for any feature that introduces schema changes.

### Destructive DDL is always its own PR

`DROP COLUMN`, `ALTER COLUMN ... NOT NULL` on existing data, FK constraints on existing data, `DROP TABLE`, `DROP TYPE` — these are **never** bundled with a feature PR. They land in their own PR after the feature has been live for at least one `dev→main` cycle. If the feature gets rolled back, the data is still there.

### Additive vs destructive — quick reference

| Additive (low risk, default flow OK)         | Destructive (high risk, separate PR)              |
| -------------------------------------------- | ------------------------------------------------- |
| `CREATE INDEX`                               | `DROP INDEX`                                      |
| `CREATE TABLE`                               | `DROP TABLE`                                      |
| `ADD COLUMN ... NULL` (no `NOT NULL`)        | `DROP COLUMN`                                     |
| `CREATE TYPE`                                | `DROP TYPE`                                       |
| New FK constraint where no orphan rows exist | `ALTER COLUMN ... NOT NULL` on populated table    |
| `CREATE EXTENSION`                           | `DROP EXTENSION`                                  |

When in doubt, treat as destructive.

### Local verification before opening the PR

For non-trivial migrations, run them locally before pushing:

```
supabase start                          # spins up a local Postgres
supabase db reset                       # applies all migrations including yours
npm test                                # confirm the test suite still passes
```

Local DB ≠ prod for data-dependent edge cases (rows that would violate a new constraint, for instance), but local validation catches ~95% of "the SQL is wrong" mistakes for free. Five minutes here saves a production rollback.

### What an agent must NOT do

- **Apply DDL to prod before opening the PR.** Use `apply_migration` only against a local Supabase, never against the prod project ref, until the PR is reviewed and merged.
- **Bundle destructive DDL with feature code.** Always two PRs.
- **Skip local verification** for migrations that touch more than one statement or change existing columns.

### What we're not doing (yet)

- **Supabase database branches** (Pro feature, ~\$25/mo). Would give true preview-DB parity but isn't justified at current scale.
- **Separate staging Supabase project.** Same reasoning — extra cost / drift risk, not enough volume.

If migration frequency picks up or a destructive change goes wrong, re-evaluate.

## What an agent should do

- **Pick a branch type honestly.** A "fix" that adds a new code path is a `feat/`. A `chore/` that introduces user-visible behavior is a `feat/`. If unsure, default to the higher-stakes label.
- **Branch off `dev`** unless the change is a `hotfix/`. The repo's default branch (`main`) is the wrong base for normal work.
- **Rename auto-generated local branches before pushing.** If your tooling spun up `claude/foo`, `codex/bar`, or `cursor/baz`, run `git branch -m <prefix>/<desc>` first. The CI gate only checks the remote name — local naming is your business.
- **Run the cheap checks before pushing.** Don't push code that fails `lint`, `tsc --noEmit`, or `npm test`.
- **Never push directly to `dev` or `main`.** Always go through a PR.
- **Never merge `dev → main` autonomously.** That step requires a human (manual visual check is part of the bar).
- **Hotfixes still need a PR** — they just target `main`. After landing, open a follow-up to also merge the hotfix commit into `dev`.
- **For DDL, follow the [migration governance rules above](#database-migrations).** Never apply to prod before the PR is reviewed and merged. If a feature needs the schema change to be testable, split into expand-and-contract PRs rather than bundling.

## Related

- [`issue-tracker.md`](./issue-tracker.md) — where work is filed
- [`triage-labels.md`](./triage-labels.md) — how it's prioritised
- [`domain.md`](./domain.md) — what the codebase actually is
- [`../adr/`](../adr/) — durable architectural decisions
