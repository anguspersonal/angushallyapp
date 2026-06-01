# QA rubric

Checked by `qa-review` on every PR. Keep this short and load-bearing.

## Must pass (blocking)
- [ ] No Critical/High findings outstanding
- [ ] All acceptance criteria from linked issue(s) met
- [ ] Tests added/updated for new behaviour (`vitest`)
- [ ] CI green — the `ci` workflow passes: typecheck, lint, tests
- [ ] No secrets committed; no `eval`; no unguarded `dangerouslySetInnerHTML`
- [ ] Supabase access respects RLS / auth — no service-role key or bypass on a client path

## Should pass (non-blocking, but flag)
- [ ] PR description explains the "why", not just the "what"
- [ ] Public lib functions / API handlers are typed (no implicit `any`)
- [ ] User-facing copy reviewed
- [ ] No new TODOs without an issue link
- [ ] Head branch matches the prefixes in `docs/agents/branching.md`

## Project-specific
- [ ] **Chat feature** (`src/lib/chat`): if touched, injection patterns, output filter, and spend cap remain enforced and covered by tests
- [ ] **Secrets boundary**: server-only env (Supabase service key, Anthropic key, nodemailer creds) is never imported into a client component
- [ ] **Images**: use `next/image`, not raw `<img>`
- [ ] **DB migrations** (`supabase/migrations/*.sql`): not applied to prod before review; destructive DDL split from feature code; local apply + test evidence in the PR body
