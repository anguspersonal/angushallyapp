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

## What an agent should do

- **Pick a branch type honestly.** A "fix" that adds a new code path is a `feat/`. A `chore/` that introduces user-visible behavior is a `feat/`. If unsure, default to the higher-stakes label.
- **Branch off `dev`** unless the change is a `hotfix/`. The repo's default branch (`main`) is the wrong base for normal work.
- **Run the cheap checks before pushing.** Don't push code that fails `lint`, `tsc --noEmit`, or `npm test`.
- **Never push directly to `dev` or `main`.** Always go through a PR.
- **Never merge `dev → main` autonomously.** That step requires a human (manual visual check is part of the bar).
- **Hotfixes still need a PR** — they just target `main`. After landing, open a follow-up to also merge the hotfix commit into `dev`.

## Related

- [`issue-tracker.md`](./issue-tracker.md) — where work is filed
- [`triage-labels.md`](./triage-labels.md) — how it's prioritised
- [`domain.md`](./domain.md) — what the codebase actually is
- [`../adr/`](../adr/) — durable architectural decisions
