---
name: address-review
description: Developer-side companion to qa-review. Reads the latest QA review on a PR, triages each finding (action / push back / defer), makes the code changes, pushes, replies to inline comments, posts a summary comment, and updates the PR description. Use whenever the user wants to act on a code review — phrases like "address the QA review on PR #123", "respond to the review", "action the feedback", "fix what QA flagged", "/address-review". Pairs with qa-review for a dev↔QA loop; works on any PR review (not just qa-review output).
---

# address-review

Developer-agent skill: pick up the latest review on a PR, decide what's worth actioning, make the changes, push, and close the loop with the reviewer by replying inline and updating the PR description.

The whole point is to be honest: not every finding deserves a fix, and the convergence depends on the dev side being willing to push back with reasoning, not just silently ignoring nits or fixing everything reflexively.

## When to use

- User invokes `/address-review`
- User says "address the QA review", "respond to the review", "action the feedback", "fix what QA flagged", "go through the review comments"
- Paired with `qa-review` in a multi-agent dev↔QA loop, but also fine for human-authored reviews

If the user wants a fresh code review (not to act on an existing one), use `review-and-comment` or `qa-review`. If they want to triage incoming issues/bugs, use `triage`.

## Process

### 1. Resolve the PR and find the latest review to action

```bash
gh pr view <ref> --json number,url,headRefOid,baseRefName,headRefName,title,body,reviews,reviewRequests
```

Pick the **latest** review (by `submittedAt`). If multiple reviews are tied or the user specified a reviewer, prefer reviews authored by them. If the latest review is from `qa-review`, look for the `<!-- qa-review round:N -->` marker so you know which round you're closing.

Also fetch the inline review comments:

```bash
gh api /repos/{owner}/{repo}/pulls/{number}/comments \
  --jq '[.[] | {id, path, line, body, in_reply_to_id, user: .user.login, created_at}]'
```

### 2. Read the PR description, the diff, and the rubric (if it exists)

```bash
gh pr diff <number>
gh pr view <number> --json body
[ -f .github/qa-rubric.md ] && cat .github/qa-rubric.md
```

If a rubric exists, use it as the shared bar — disagreements with the QA review should reference the rubric where possible. ("This isn't blocking per rubric §X" is a much stronger pushback than just "I disagree".)

### 3. Triage each finding

For every finding in the review (both the body and inline comments), classify into one of three buckets:

- **Action** — agree, will fix. Critical/High should almost always land here.
- **Push back** — disagree, won't fix. Requires a written reason. Acceptable for Medium/Low when the QA is wrong or the cost outweighs the benefit. Rarely acceptable for High; never for Critical.
- **Defer** — agree the issue exists, but the fix doesn't belong in this PR. Auto-creates a tracking issue (see step 4b).

#### Defer rules (to avoid tracker spam)

- **Critical/High cannot be deferred.** They must be Action or — rarely, with proof — Push back.
- **Medium/Low can be deferred** only when the finding matches one of these reasons:
  1. **Scope creep** — fix touches files outside this PR's purpose and would bloat the diff.
  2. **Bigger pattern** — QA caught one instance of something repeated across the codebase; a targeted cleanup PR is better.
  3. **Blocked** — needs another team's input, a design decision, or an upstream dependency change.
  4. **Time pressure** — deadline/release-branch cut; fix benefits from more care next sprint.
  5. **Refactor masquerading as a nit** — real fix is structural and deserves its own PR.
- **Honest-intent test:** if you wouldn't actually pick this up in the next 1–2 sprints, it's not Defer — it's Push back. Be honest and close the topic.
- **Reason must be named.** "Defer" alone is not enough. The inline reply has to say `deferring because: <reason from list>, see #<issue>` so a human can audit the bar later. If every Medium/Low defer is "scope creep", your PRs are too big — that's diagnostic, not noise.

Show the triage table to the user before making changes:

```
Finding                              | Severity | Action     | Note
-------------------------------------|----------|------------|-----------------------------------------
auth.ts:42 missing null check        | High     | Action     | Add check + test
util.ts:88 prefer .map over forEach  | Low      | Push back  | Mutates an external array
README out of date re env vars       | Medium   | Defer      | Bigger pattern — docs sweep, will file
```

For multi-agent runs without a human in the loop, proceed without confirmation but log the triage table into the PR summary comment in step 6 so QA and humans can audit it.

### 4. Make the changes

#### 4a. Action findings

For each **Action** finding:
- Edit the file(s).
- Update or add tests where the QA review flagged missing coverage.
- Run the project's typecheck / lint / test commands. Read `CLAUDE.md`, `AGENTS.md`, `package.json` `scripts`, or `Makefile` to find them. Don't invent commands.

If a fix is non-trivial or risky, note it so the next QA round can pay extra attention to that file.

#### 4b. Defer findings — create tracking issues

For each **Defer** finding, create a follow-up issue *before* posting the inline reply, so the reply can link to it:

```bash
gh issue create \
  --title "<short title — e.g. 'Sweep docs for stale env var references'>" \
  --body "$(cat <<'EOF'
Deferred from #<PR number> (round N QA review).

**Finding:** <one-line description, file:line>
**Defer reason:** <one of the five from step 3>
**Original QA context:** <link to the inline review comment>

<Any extra context that would help whoever picks this up.>
EOF
)" \
  --label "deferred-from-review"
```

Capture the resulting issue number — you'll paste it into the inline reply in step 6a. If the `deferred-from-review` label doesn't exist, create it once:

```bash
gh label create deferred-from-review --color C5DEF5 \
  --description "Spun out of a PR review because the fix didn't belong in that PR" 2>/dev/null || true
```

If a Defer finding has no honest 1–2 sprint intent, **don't create an issue** — go back to step 3 and reclassify it as Push back. The label exists to make tracker spam easy to find and prune later.

### 5. Commit and push

Group related fixes into focused commits. Reference the review where it helps:

```bash
git add <files>
git commit -m "fix(<scope>): address QA round N — <short summary>"
git push
```

If the branch is behind base, rebase before pushing rather than merging — keeps the PR history clean. If push fails because the remote moved, fetch, rebase, and retry. Don't `--force` without warning the user.

### 6. Close the loop on GitHub

This is the part that's easy to skip and shouldn't be.

#### 6a. Reply to each inline comment

For every actioned or pushed-back inline comment, post a reply in its thread so the conversation resolves visibly:

```bash
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/{owner}/{repo}/pulls/{number}/comments/{comment-id}/replies \
  -f body="Fixed in <sha>: <one-line what changed>."
```

For push-backs, the reply must contain the reason:

```
Disagree — <reasoning>. <Rubric reference if applicable.> Leaving as-is.
```

For defers, the reply must name the reason and link the issue created in step 4b:

```
Agree but out of scope for this PR. Deferring because: <reason from the five>. Tracked in #<issue>.
```

Example: `Deferring because: bigger pattern — same stale env var refs in 6 other doc files. Tracked in #482.`

#### 6b. Resolve threads where appropriate

GitHub thread resolution is a separate GraphQL call (REST doesn't expose it). Resolving threads only makes sense for "Action" — push-backs and defers should stay open for the reviewer to accept.

```bash
gh api graphql -f query='
  mutation($threadId: ID!) {
    resolveReviewThread(input: {threadId: $threadId}) { thread { id } }
  }' -f threadId="<thread-node-id>"
```

Get thread IDs via:

```bash
gh api graphql -f query='
  query($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        reviewThreads(first: 100) {
          nodes { id isResolved comments(first: 1) { nodes { path line body } } }
        }
      }
    }
  }' -f owner=<owner> -f repo=<repo> -F number=<number>
```

If GraphQL fails or the user isn't on a plan that supports it, skip resolution and rely on the inline replies — don't block on this.

#### 6c. Post a top-level summary comment

One comment per address-review pass, summarising what changed:

```bash
gh pr comment <number> --body-file <path-to-summary.md>
```

Body:

```markdown
<!-- address-review for qa-review round:N -->
## Addressed round N review

Pushed <count> commits in response to the round N review.

### Triage
| Finding | Severity | Action | Note |
|---|---|---|---|
| ... | ... | ✅ Fixed in <sha> | ... |
| ... | ... | 🤝 Pushed back | <reason> |
| ... | ... | ⏭️ Deferred | Tracked in #<n> |

### Verification
- `<typecheck command>` — passing
- `<test command>` — passing (X new tests added)
- `<lint command>` — passing

Ready for round N+1 of QA review.

_Posted by address-review._
```

The `<!-- address-review for qa-review round:N -->` marker lets `qa-review` see what was addressed when computing round N+1.

#### 6d. Update the PR description

Append a "Changes after round N" section to the PR body (don't rewrite the original description):

```bash
current=$(gh pr view <number> --json body --jq .body)
new_section=$(cat <<'EOF'

---

### Changes after round N review
- <bullet of what changed>
- <bullet of what changed>
EOF
)
gh pr edit <number> --body "${current}${new_section}"
```

This keeps the top of the PR honest about what the reviewer should expect to see different.

#### 6e. Re-arm the QA gate (qa-review loops only)

If the review came from `qa-review` and you're genuinely ready for the next round — CI green, every Action finding landed, no Critical/High left unaddressed — add the `needs-qa` label to re-trigger qa-review for round N+1:

```bash
gh pr edit <number> --add-label needs-qa 2>/dev/null || true
```

`qa-review` removes `needs-qa` when it reviews, so re-adding it is the dev-side "ready for re-review" signal — it's what re-fires QA. **Don't re-arm** if CI is red, if you left a High/Critical unaddressed, or if the PR is in round-3 escalation (`needs-human` present); in those cases a human needs to act first.

### 7. Confirm to the user

Report: PR link, commits pushed, counts per triage bucket (actioned/pushed-back/deferred), CI/test status, whether the `needs-qa` gate was re-armed, and the next expected action (usually "ready for next QA review round").

## Guardrails

- **Don't action everything reflexively.** A dev that fixes every nit signals weakness in the loop and trains future QA reviews to grow. Push back on Medium/Low when justified.
- **Don't push back on Critical or High** unless you can prove the finding is wrong (with a test, a runtime trace, or a documented constraint). Default to fixing.
- **Don't defer Critical or High.** The bar is Action or Push-back-with-proof. Deferring a Critical/High is how serious risk leaks out of a PR into a tracker that nobody reads.
- **Don't defer without honest intent.** If you wouldn't pick it up in the next 1–2 sprints, it's Push back, not Defer. Spam in `deferred-from-review` defeats the point.
- **Don't silently drop findings.** Every finding gets a triage decision and a reply. Silence is how reviewers lose trust.
- **Never force-push without warning the user.** Even on a feature branch, force-push surprises reviewers and loses inline comment context. Rebase + push, then warn if force was needed.
- **CI must be green before declaring "ready for next round".** If tests fail, fix them or mark the PR `WIP` — don't punt to QA.
- **Re-arm the gate deliberately.** Only add `needs-qa` when you're genuinely ready for re-review (step 6e). Re-arming with red CI or an unaddressed High/Critical just wastes a QA round and a routine run.
- **Don't expand scope.** New refactors or unrelated cleanups during address-review pollute the review and make round N+1 harder. Track those as separate PRs or issues.

## Why these constraints

- **Triage transparency** — posting the triage table to GitHub lets a human or the QA agent see *why* you pushed back, not just *that* you pushed back. Without it, the loop devolves into "I keep flagging X" / "I keep ignoring X" and round 3 escalates needlessly.
- **One summary comment per round, marked** — gives `qa-review` a parseable signal of what to look at first in the next round, and keeps PR conversation noise down.
- **PR description gets a "changes after round N" section** — humans skimming the PR top should see the latest state, not have to scroll through review threads to reconstruct it.

## Multi-PR mode (parallel sub-agents)

When invoked across multiple PRs at once (`/address-review on PR 44, 47, 54`), spawn one sub-agent per PR rather than processing them serially in the same context. The pattern that converges fastest:

- One sub-agent per PR, `isolation: "worktree"` so they don't collide on git state.
- Inline the full address-review playbook into each agent's prompt — they need to operate self-contained because they don't see this conversation.
- Each agent reports back its own triage table, commits pushed, and ready / blocked status.
- The parent agent relays each report and surfaces any escalations or human-action items.

### When to spawn

- **Yes:** 3+ PRs at once, or any PR with non-trivial diff size in a batch.
- **Probably:** 2 independent PRs that don't share files or branches.
- **Maybe:** a single PR where the review is huge (20+ findings) and the findings cluster by file area — one sub-agent per cluster.
- **Skip:** trivial single-PR review with <10 findings; doing it in the parent is faster.

Use agent discretion. The goal is throughput when the PRs are genuinely independent — not bureaucracy or sub-agent-as-default.

### Briefing template

Each sub-agent's prompt should include:

1. PR number + title + one-line context.
2. Round number to address (and prior rounds' state if known — what was pushed back, what was deferred to which issue).
3. The full playbook content (sections 1–6 of this file).
4. Repo-specific conventions to know (branch-naming, package manager, test runner, env vars needed for the build).
5. Report-back format: PR URL, final HEAD sha, counts, status one-liner. Cap at ~300 words.

Critically: tell each agent **"you're working in an isolated git worktree; first moves are `git fetch origin && git checkout <pr-head-branch> && npm install` (or the repo's package-manager equivalent)"**.

Two failure modes if you skip these:

- **Without `git fetch && git checkout`**: the agent gets confused about which branch it should touch.
- **Without `npm install`**: any repo-managed hooks (e.g. Husky pre-push) silently don't fire. Husky's hook proxies live in `.husky/_/`, which is gitignored and regenerated by the `prepare` script — the `prepare` script only runs on `npm install`. A fresh worktree has no proxies. The agent's `git push` will succeed even if lint/typecheck/tests would have failed, because the gate isn't wired up. **The agent doesn't know the hook didn't fire** — git is silent about missing hooks. Voluntary checks in the prompt are not a substitute for the involuntary gate; always install.

If the repo uses a different package manager (pnpm/yarn/bun), substitute the install command. If the repo has no hook setup at all, the install is still cheap insurance for build-time dependency resolution.

### Don't let sub-agents take destructive shortcuts

Repeat the guardrails in each briefing. Sub-agents otherwise tend to:

- Close PRs unilaterally when QA recommends close — they shouldn't. Surface to parent.
- Force-push when a rebase feels load-bearing — they shouldn't. Defer the affected findings and report.
- Modify shared state (e.g. write to `main` or `dev` directly) — they shouldn't. PRs only.

## Repo conventions to respect

Before pushing, check for and respect documented conventions. Costs ~5 seconds, saves a forced rename or revert later.

- **Branch naming** — `docs/agents/branching.md`, `CONTRIBUTING.md`, or `AGENTS.md` may define required prefixes (`feat/`, `fix/`, `chore/`, etc.) for PR head branches. address-review usually pushes to an existing PR branch (which already has its name), so this rarely needs action. But if a finding involves opening a follow-up PR, name that branch per the convention. Local agent-tool branches (`claude/...`, `codex/...`, `cursor/...`) are fine as starting names — the convention applies to the remote, not the laptop.
- **Pre-push hooks** — if `.husky/pre-push` exists, it'll run on `git push` and may run lint/typecheck/tests. Don't bypass with `--no-verify` unless the push is a WIP backup that won't become a PR. Hook failure is information, not noise.
- **Commit style** — read the last 5 commits on the PR's branch (`git log --oneline -5`). Match the prefix style and tense. Most repos use Conventional Commits (`fix(scope): ...`).
- **PR base branch** — check the repo's flow doc. Many repos use `feature → dev → main` rather than feature-direct-to-main. If your changes belong on a `dev` integration branch, re-target with `gh pr edit <n> --base dev`.

## Database migrations: don't apply before review

If the PR touches `supabase/migrations/*.sql`, `db/migrations/*`, `prisma/migrations/*`, or similar — the SQL is **DDL** (Data Definition Language: schema-changing statements like `CREATE TABLE`, `ALTER COLUMN`, `DROP INDEX`). DDL is hard to reverse, so the convention in most repos is: **review the SQL before applying it to the upstream database**, not after.

Check the repo's docs for a documented policy — look for "migration" in `docs/agents/branching.md`, `CONTRIBUTING.md`, or `docs/guides/database*.md`. Follow whatever's documented. If nothing's documented, default to: **do not apply via tooling** (e.g. Supabase MCP `apply_migration`, `prisma migrate deploy`, `knex migrate:latest`) **against the production database** until the PR is reviewed and merged.

Specific behaviors:

- **If a finding requires modifying an already-applied migration**, flag in your summary that the SQL change requires a follow-up apply-and-verify after the PR merges. Don't try to re-apply the modified migration yourself.

- **If QA flags "applied before review" on a PR you're addressing**, that's a governance push-back, not a code fix. The migration is already live. Acknowledge in the reply, surface the broader pattern (look for or open a tracking issue), and **don't try to roll the migration back** as part of address-review.

- **If a finding asks for destructive DDL** (`DROP COLUMN`, `DROP TABLE`, `ALTER ... NOT NULL` on existing data, FK on populated tables) that wasn't in the original PR, **don't add it** — destructive DDL belongs in its own PR after the feature is stable. Defer with a follow-up issue.

- **If a finding can only be verified with the schema applied** (e.g. "this query needs the new column to exist"), recommend the expand-and-contract pattern in your reply: split into two PRs, schema first then code. Don't try to fake the verification by applying to prod mid-review.

## Pairing with qa-review

When the latest review is from `qa-review` (marker `<!-- qa-review round:N -->`):
- The summary comment marker should be `<!-- address-review for qa-review round:N -->` so the next QA round can identify which review it's responding to.
- The loop is **label-gated**: `qa-review` runs while the `needs-qa` label is present and removes it after each review. Re-arm it (step 6e) once you're ready for round N+1 — that re-add is what re-fires QA.
- Reference the rubric in pushbacks where applicable — it's the shared bar.
- After 3 rounds, `qa-review` will escalate to a human via `needs-human`. Don't try to push past round 3 by addressing again; surface the open disagreements to the user instead.
