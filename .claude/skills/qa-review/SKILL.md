---
name: qa-review
description: Round-aware QA review of a pull request. Reviews against a hybrid definition-of-good (project rubric + linked-issue acceptance criteria), posts the review to GitHub with a round marker, and escalates to a human on round 3 if Critical/High issues remain. Use whenever the user wants a QA pass on a PR — phrases like "QA this PR", "qa-review #123", "do a QA pass", "act as the QA agent on this PR", "re-review this PR". This is the right skill when there's a developer→QA loop and rounds matter. For a single one-shot review with no round tracking, use review-and-comment instead.
---

# qa-review

QA agent skill: review a pull request against a hybrid definition-of-good, post the findings to GitHub, track which review round this is, and force escalation by round 3 so the loop terminates.

## Why this exists (and how it differs from `review-and-comment`)

`review-and-comment` reviews a PR once and posts the findings. It has no memory of previous reviews and no explicit quality bar — every invocation is fresh.

QA in a multi-agent dev↔QA loop needs three more things:
1. **Round awareness** — round 3 of nitpicks is a smell; the loop should converge or escalate.
2. **A stable quality bar** — the dev agent needs to know what "good" looks like so it can self-assess before pushing. That bar can't live only in the QA agent's head.
3. **A termination condition** — if the loop doesn't naturally converge, hand it to a human rather than churn forever.

## Definition of good (hybrid)

Two sources, both consulted every round:

### Source 1 — Project rubric (`.github/qa-rubric.md`)

Read `.github/qa-rubric.md` from the repo root. This is the global, versioned quality bar that applies to every PR in the repo (security, tests, types, docs, perf, accessibility, conventions). Treat its checklist as authoritative.

If `.github/qa-rubric.md` is missing:
- Note this in the review summary so the user knows the rubric isn't established yet.
- Fall back to the severity rubric from `review-and-comment` (Critical/High/Medium/Low) using OWASP-style security checks + project conventions from `CLAUDE.md` / `AGENTS.md` / `.cursorrules`.
- Offer at the end of the review to scaffold a starter `.github/qa-rubric.md` — do **not** create it unsolicited.

### Source 2 — Linked issue acceptance criteria

Find the issue this PR closes:

```bash
gh pr view <number> --json body,closingIssuesReferences \
  --jq '{body, closes: [.closingIssuesReferences[].number]}'
```

For each closing issue, pull its body and extract acceptance criteria:

```bash
gh issue view <issue-number> --json title,body,labels
```

Look for sections like "Acceptance criteria", "AC", "Done when", or checklists under "Definition of done". These are feature-specific requirements the PR must satisfy in addition to the global rubric.

If no issue is linked, note it in the review and use only Source 1. Don't fabricate ACs from the PR title.

## Process

### 1. Resolve the PR and detect the round number

```bash
gh pr view <ref> --json number,url,headRefOid,baseRefName,headRefName,title,body,reviews,closingIssuesReferences
```

`reviews[]` contains all past reviews on this PR. Count prior QA rounds by scanning review bodies for the marker this skill stamps:

```
<!-- qa-review round:N -->
```

`current_round = max(N across past qa-review reviews) + 1`. If no marker is found, this is round 1.

If `current_round > 3`, **stop and escalate immediately** — don't even do the review. See "Round 3 escalation" below.

### 2. Load the definition of good

- Read `.github/qa-rubric.md` (or note its absence).
- Resolve closing issues and read their ACs.
- Read `CLAUDE.md` / `AGENTS.md` / `.cursorrules` for project conventions.

### 3. Fetch the diff and context

```bash
gh pr diff <number>
gh pr view <number> --json files
```

Read enough of the changed files in the working tree to understand context. For rounds 2+, also read the diff between the previous QA review's commit SHA and the current head — this is what changed in response to your last review, and is the most important thing to inspect:

```bash
gh pr view <number> --json reviews \
  --jq '.reviews[] | select(.body | contains("<!-- qa-review round:")) | {sha: .commit.oid, submittedAt}' \
  | <pick the most recent>
git diff <previous-sha>..<current-head> -- <changed files>
```

### 4. Review against the hybrid rubric

For each item in the rubric and each acceptance criterion, decide: **met**, **not met**, or **N/A**. Then scan the diff for additional issues using the severity model:

- **Critical** — compilation breaks, crashes, security holes, data loss
- **High** — likely bugs, failures, significant UX degradation, missing tests for critical paths, unmet acceptance criteria
- **Medium** — code quality, maintainability, minor perf (100–500ms)
- **Low** — style, micro-optimisations

For round 2+, focus the new findings on: (a) what changed since the last review, (b) whether previous Critical/High findings were addressed, (c) any regressions. Don't re-litigate Medium/Low nits the dev declined to action — call those resolved and move on. The loop has to converge.

#### Honouring the previous round's triage

Before flagging anything as a "new" finding in round 2+, read the most recent `address-review` summary comment:

```bash
gh pr view <number> --json comments \
  --jq '.comments[] | select(.body | contains("<!-- address-review for qa-review round:")) | {body, createdAt}' \
  | <pick the most recent>
```

Parse its triage table. Findings the dev marked **Pushed back** (🤝) or **Deferred** (⏭️) in a prior round are **closed topics** for this skill. Do not re-flag them unless:

- the code around them has *regressed* (got worse since the pushback/defer decision), or
- a **Critical/High** issue was somehow deferred (it shouldn't have been — flag that as a process violation, not a re-finding).

If you genuinely disagree with a pushback or defer, say so once in the verdict body under "Previous round status" with `❌ <finding> — disagree with pushback because <reason>` and let the human break the tie. Do not keep re-raising it round after round. That's exactly the failure mode the round cap exists to prevent.

### 5. Determine the verdict

| Condition | Verdict |
|---|---|
| All rubric items met, all ACs met, no Critical/High findings | `--approve` |
| Critical or High findings exist | `--request-changes` |
| Medium/Low only, or rubric items contested | `--comment` |

Approval thresholds tighten as rounds progress. Don't keep finding new Medium nits in round 2 — if the round-1 findings are addressed and no new High issues appeared, approve.

### 6. Post the review

```bash
gh pr review <number> --<verdict> --body-file <path-to-summary.md>
```

Where `<verdict>` is `approve`, `comment`, or `request-changes`.

The body **must** start with the round marker so future rounds can count correctly:

```markdown
<!-- qa-review round:N -->
## QA review — round N

**Verdict:** <approve / changes requested / comment>
**Rubric:** <X/Y items met> · **ACs:** <X/Y met> · **New findings:** 🔴 a · 🟠 b · 🟡 c · 🟢 d

### Rubric check
- ✅ <item> — <one-line evidence>
- ❌ <item> — <what's missing, file:line>
- ⏭️ <item> — N/A (why)

### Acceptance criteria (issue #N)
- ✅ <AC>
- ❌ <AC> — <what's missing>

### New findings

#### 🔴 Critical
- **`path/to/file.ts:42`** — Title. Description + recommendation.

#### 🟠 High
- ...

#### 🟡 Medium
- ...

#### 🟢 Low / nits
- ...

### Previous round status (round 2+)
- ✅ <previous finding> — resolved in <commit-sha>
- ❌ <previous finding> — still unresolved
- 🤝 <previous finding> — accepted dev's pushback, dropping

---

_Posted by qa-review (round N of 3)._
```

For inline-postable findings, batch them into the review using `POST /repos/{owner}/{repo}/pulls/{number}/reviews` with a `comments` array so they post atomically with the top-level body. Falling back to plain comments is fine if the line isn't in the diff hunk.

### 7. Confirm to the user

Report: round number, verdict, link to the posted review, counts by severity, rubric/AC status, and what (if anything) couldn't be posted inline.

## Round 3 escalation

When `current_round > 3` (i.e. round 4 would start), do **not** do another review. The dev↔QA loop has failed to converge and a human needs to break the tie.

1. Post a `--request-changes` review with body:

   ```markdown
   <!-- qa-review round:4-escalation -->
   ## QA review — escalation to human

   This PR has been through 3 rounds of QA review without converging. Per the qa-review skill's termination policy, further automated review rounds are paused and human judgment is needed to either accept the residual findings, override the QA bar, or close the PR.

   **Open findings from round 3:** <summary>

   **What needs a human decision:** <one or two sentences — usually "is finding X actually blocking, or is the dev right to push back?">

   _Posted by qa-review (escalation)._
   ```

2. Add a `needs-human` label so the PR shows up in human triage:

   ```bash
   gh pr edit <number> --add-label needs-human
   ```

   If the label doesn't exist, create it:

   ```bash
   gh label create needs-human --color FBCA04 --description "QA loop did not converge — needs human judgment" 2>/dev/null || true
   ```

3. Tell the user clearly that the loop has stopped and a human is needed. Don't soften this — it's the whole point of having a termination condition.

## Branch-naming compliance (only if convention exists)

If the repo documents a branch-naming convention (look in `docs/agents/branching.md`, `CONTRIBUTING.md`, or `AGENTS.md`), check that the PR's head branch matches. If not, raise as a **Low** finding — the CI gate (if present) will catch it on the next push, but flagging in the review gives the dev a chance to rename before CI re-runs.

Local agent-tool branches (`claude/<random>`, `codex/<topic>`, `cursor/<task-id>`) are **fine as starting names**. The convention applies to the remote PR branch only. The fix is `git branch -m <prefix>/<desc>` then re-push — never a code change.

Skip this check entirely if no convention is documented in the repo. Don't invent one.

## Database migration compliance (only if PR touches migrations)

If the PR's diff includes files matching `supabase/migrations/*.sql`, `db/migrations/*`, `prisma/migrations/*`, or similar **DDL files**, check against the repo's migration policy. Look in `docs/agents/branching.md`, `CONTRIBUTING.md`, or `docs/guides/database*.md` for a documented workflow. Skip this entire section if the PR doesn't touch migrations.

Common findings to scan for:

- **Migration applied to prod before review.** Heuristic: PR body or recent commit messages mention "applied to Supabase prod", `apply_migration`, `prisma migrate deploy`, a `pg_indexes` / `\dt` snapshot taken at PR-open time, or any phrasing like "applied on YYYY-MM-DD" with the date matching the PR creation. Raise as **Medium** — apply-before-review short-circuits the gate, even if the SQL itself is fine. Cite the repo's policy doc. Pattern is governance, not blocking for this PR if the SQL is otherwise clean.

- **Destructive DDL bundled with feature code.** If the migration contains `DROP COLUMN`, `DROP TABLE`, `ALTER ... NOT NULL` on existing data, `DROP TYPE`, or new FK constraints on populated tables, AND the PR also changes application code that touches the affected schema — raise as **High**. Destructive DDL belongs in its own PR after the feature is stable, so a feature rollback doesn't lose data.

- **Feature depends on DDL being applied.** If the PR introduces both a schema change and code that uses the new schema, and the code can't be exercised without the schema in place — raise as **Medium**. Recommend the expand-and-contract pattern: split into two PRs (PR A applies DDL only, PR B uses the new schema). The current bundling creates a chicken-and-egg between review and verification.

- **Missing local verification.** For non-trivial migrations (multi-statement, touching existing data, adding constraints, or anything beyond `CREATE INDEX`), the PR body should mention local apply / test-suite confirmation — e.g. `supabase start` + `supabase db reset` + `npm test` evidence. If absent, raise as **Low** asking for evidence in the PR body.

- **Migration file name doesn't match repo convention.** Most repos timestamp them (`YYYYMMDDHHMMSS_description.sql`); some use sequential numbers. If the new file breaks the pattern, **Low**.

Don't invent a migration policy if the repo doesn't have one — flag in the rubric summary that the policy isn't documented and the review couldn't check against it.

## Multi-PR mode

qa-review naturally runs per PR. When the user asks to QA multiple PRs at once, spawn one sub-agent per PR (same pattern as `address-review`'s multi-PR mode):

- `isolation: "worktree"` per sub-agent so checkouts don't collide.
- Inline the full qa-review playbook into each prompt.
- Each agent reports back: round number, verdict, findings counts by severity, link to posted review.
- Parent relays a roll-up table.

Use agent discretion — for two PRs that touch the same files, serial in one context may actually be safer than parallel sub-agents (you avoid duplicating cross-PR findings). For independent PRs, parallel wins.

## Guardrails

- **Never review without consulting the rubric and ACs.** If `.github/qa-rubric.md` is missing, the review must say so. If no issue is linked, the review must say so. The dev agent needs to know what bar it's being held to.
- **Don't grow the bar between rounds.** New rubric items or new categories of nit in round 2 are how loops fail to converge. Stick to: (a) is the original bar met, (b) any regressions.
- **Honour the dev's triage.** Findings the dev pushed back on or deferred in a prior round are closed topics. Re-flagging them is how the loop fails to converge. Disagree once in "Previous round status" and let the human resolve — don't keep re-raising.
- **Self-PRs:** GitHub disallows self-approvals. If the PR author is the current `gh` user and the verdict is `approve`, downgrade to `comment` and note this in the body.
- **Don't write the rubric unsolicited.** Offer to scaffold `.github/qa-rubric.md` if missing, but the user has to say yes.
- **Always stamp the round marker.** Without `<!-- qa-review round:N -->` in the body, future rounds can't count and the escalation logic breaks.
- **Companion skill:** the developer-side counterpart is `address-review`, which reads the latest qa-review and triages/actions/pushes back. Mention it in the review summary on rounds 1–2 if Critical/High findings exist.

## Why these constraints

- **Round cap of 3** — pulled from typical code-review research (Cohen et al., Microsoft) showing reviewer fatigue and diminishing returns past 2–3 cycles. Beyond that, the loop is usually a disagreement about scope or taste that humans need to resolve, not more analysis.
- **Hybrid rubric (file + issue ACs)** — the file gives the dev agent something stable to read before pushing (faster convergence); the issue ACs prevent the global rubric from missing feature-specific requirements.
- **Escalation over auto-approve** — auto-approving a stuck loop ships unreviewed risk; force-requesting-changes without escalation leaves the PR rotting. A `needs-human` label is the only thing that actually changes hands.

## Bootstrap: scaffolding `.github/qa-rubric.md`

When the user agrees to scaffold a rubric (only when they ask), use this as a starting point and tailor to the repo's stack. Don't write more than the team will actually maintain.

```markdown
# QA rubric

Checked by qa-review on every PR. Keep this short and load-bearing.

## Must pass (blocking)
- [ ] No Critical/High findings outstanding
- [ ] All acceptance criteria from linked issue(s) met
- [ ] Tests added/updated for new behaviour
- [ ] CI green (typecheck, lint, tests)
- [ ] No secrets, no `eval`, no unguarded `dangerouslySetInnerHTML`

## Should pass (non-blocking, but flag)
- [ ] PR description explains the "why"
- [ ] Public APIs have types and JSDoc
- [ ] User-facing strings considered for i18n/copy
- [ ] No new TODOs without an issue link

## Project-specific
<!-- Add rules specific to this repo: framework conventions, perf budgets, a11y minimums, deployment gotchas. -->
```
