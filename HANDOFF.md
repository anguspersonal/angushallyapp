# Handoff — PR #80 QA review (round 5, cap-override)

**Date:** 2026-06-01
**PR:** [anguspersonal/angushallyapp#80](https://github.com/anguspersonal/angushallyapp/pull/80) — `feat: chatbot v1, persona pages + /dev plasma, stats, mobile polish` (`dev` → `main`)
**Head reviewed:** `18cd1dbe6dc9122d5915579056897bbf9f2d4789`
**Outcome:** 🔴 **BLOCKING — the PR head does not compile.** Do not merge until fixed.

---

## TL;DR for the next agent

The HEAD merge commit on `dev` botched a conflict resolution and committed a **non-compiling** `src/app/api/contact/route.ts`. The build is red. The fix is small and unambiguous (below). Everything else in the post-round-3 delta reviews clean. Your job: **apply the fix, get `tsc` / `next build` / Vercel green, re-push.** Recommended path: run `/address-review`.

---

## What I was asked to do

1. Run the `qa-review` skill against the newly-opened PR (#80).
2. Post the results as a comment on the PR.

Then the owner added two directives:
- **"EXCEED CAP"** — explicitly override the skill's 3-round cap (the PR was already at a round-4 escalation).
- **"Focus specifically on these files"** — scope the review to the **14 files GitHub flagged as conflicting**.
- **"yes to fresh QA on the new delta"** — do a fresh pass on the work that landed after the round-3 approval.

## What I did

- Identified PR #80 and read its full review history: rounds 1, 2, 3 (clean approval at `3d2311e`), and a round-4 escalation (`82b2783`) that deferred the post-round-3 delta to a human.
- Scoped the review to the 14 conflicting files, diffing each `origin/main..origin/dev` and reading the substantive ones in full.
- **Found a Critical build break** (see below) and proved it three independent ways.
- Verified the other 13 files are clean (no surviving conflict markers, no duplicate bindings).
- Verified the escalation's flagged security risk (persona instructions feeding `/api/chat`) is **injection-safe**.
- Posted a `round:5` QA review to the PR as `COMMENT` (self-PR — GitHub blocks `REQUEST_CHANGES` from the author), intended verdict **request-changes (blocking)**.

Review URL: the most recent review on https://github.com/anguspersonal/angushallyapp/pull/80 (body starts with `<!-- qa-review round:5 -->`).

---

## 🔴 The blocking finding (must fix)

**File:** `src/app/api/contact/route.ts`
**Introduced by:** HEAD merge commit `18cd1db` "Merge branch 'main' into dev" (2026-06-01 17:52)
**Cause:** the conflict was "resolved" by deleting the `<<<<<<<` markers but keeping **both sides' code**, producing an invalid file:

1. **Duplicate import** — `import { validateEmailEnvOnce } from '@/lib/email/envValidation';` on **both line 4 and line 7** → `SyntaxError: Identifier 'validateEmailEnvOnce' has already been declared`.
2. **Two handler bodies fused** — `publicHandler(...)` receives `async ({ body, admin }) => { … return { message }; ` (the new thin-wrapper that delegates to `submitContact`) immediately followed by a second, never-opened `async ({ body }) => {` (the old inline reCAPTCHA + email body). The first arrow is never closed.
3. **`HttpError` used but not imported** — the old body still calls `new HttpError(...)` (lines 44/63/65) but `HttpError` was dropped from the `@/lib/api/handler` import on the new side.

### Proof (three independent tools agree)
| Tool | Result |
|---|---|
| `npx tsc --noEmit` | `src/app/api/contact/route.ts(70,1): error TS1109: Expression expected.` (exit 2) |
| `npx esbuild` | `ERROR: Unexpected ")" (cr.ts:70:0)` |
| Vercel deploy on head | **Error** (the red status currently on the PR) |

This is the root cause of GitHub's "14 conflicting files" display and the red Vercel deploy. It also **contradicts the round-4 escalation's framing** ("round 3 clean, delta is presentational") — merging on the round-3 approval would ship a non-compiling build.

### The fix (unambiguous — the rewritten test dictates it)
`src/app/api/contact/route.test.ts` was rewritten to mock `@/lib/contact/submitContact` and assert `POST` **delegates** to it (`expect(submitContact).toHaveBeenCalledWith(normalisedInput, { admin: null })`). So **keep the new thin-wrapper side** and delete the old inline body. Target state:

```ts
import { publicHandler } from '@/lib/api/handler';
import { submitContact } from '@/lib/contact/submitContact';
import { validateContactFormBody } from '@/lib/contact/validateContactForm';
import { validateEmailEnvOnce } from '@/lib/email/envValidation';

export const POST = publicHandler(
  { body: validateContactFormBody },
  async ({ body, admin }) => {
    validateEmailEnvOnce();
    const { message } = await submitContact(body, { admin });
    return { message };
  },
);
```

Delete: the duplicate `validateEmailEnvOnce` import; the entire old `async ({ body }) => { … }` inline body; the now-unused imports (`sendAcknowledgmentToUser`, `sendInquiryToOwner`, `EmailConfigError`, `nextResponseIfRecaptchaInvalid`, `verifyRecaptchaSite`) and the `logSendError` helper — all of that logic moved into `submitContact`.

### Verify after fixing
```bash
npx tsc --noEmit        # expect exit 0
npx vitest run          # expect green, incl. src/app/api/contact/route.test.ts
npx next build          # expect 42/42 pages, exit 0 (needs NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in build env — see round-2 review)
```
Then push to `dev` and confirm the Vercel deploy goes green.

---

## 🟡 Medium (worth addressing)

- **The unit suite did not catch this break.** `route.test.ts` mocks `submitContact`, so it passes even though `route.ts` doesn't parse. Only `tsc` / `next build` catch it. The `.github/qa-rubric.md` "CI green" item requires `next build` + `tsc` — **confirm CI actually runs `tsc --noEmit` / `next build` on the PR head**, not just `vitest`. If it does, CI should already be red; if it's green, the gate is misconfigured.

## 🟢 Low / nits (carried, non-blocking)

- three.js bundle sign-off note (`First Load JS` before/after) missing from PR body — ADR 0033 §4/§7. Code-split is correct; just needs the note.
- `PlasmaHero` `prefers-reduced-motion` — carried from round 2; unchanged.

---

## What's clean (verified — no action needed)

Only `contact/route.ts` is corrupt. The other 13 conflicting files resolved correctly:

- ✅ **`src/app/api/chat/route.ts`** — round-3 security fixes intact (`resolveClientIp` prefers `x-real-ip` → rightmost XFF hop; missing `CHAT_IP_HASH_PEPPER` fails closed with `unconfigured`). New optional `surface` field validated as `string`-when-present.
- ✅ **`src/lib/chat/personaInstructions.ts`** (new) — **injection-safe.** `buildPersonaInstructions(surface)` is a pure registry lookup (`PERSONA_CHAT_INSTRUCTIONS[surface]`); the attacker-controlled `surface` string can only select static authored text or return `null` — it is **never interpolated** into the prompt. Block appended after the cache breakpoint (no cache-hit regression). Well tested.
- ✅ **`useChat.ts` / `ChatPanel.tsx` / `src/lib/chat/types.ts`** — resolve `surface` via the shared `resolveSurface` registry; optional and back-compatible.
- ✅ **`src/components/ClientLayout.tsx`** — clean refactor from local `surfaceForPath` to shared `resolveSurface` (`def.kind === 'editorial'`).
- ✅ **`src/app/contact/page.tsx`** — consent-gated reCAPTCHA (#140): defers script until Security consent OR first form interaction; never blocks submission. Logic sound. *(But it ships alongside the broken `route.ts` — gated behind the same fix.)*
- ✅ **`.github/qa-rubric.md`** — substantial ADR-linked expansion. Good.
- ✅ **`package.json`** — `three@^0.184.0` + `@types/three`; new `stats:refresh` scripts.
- ✅ **`.gitignore`, `scripts/build-resume.mjs`** — flagged by GitHub but byte-identical on both branches (empty diff); nothing to review.

---

## State / context for the next agent

- **Branch to develop on:** `claude/serene-pascal-UByQP` (my designated branch). The fix itself belongs on **`dev`** (the PR head) — coordinate with the owner on whether to push the fix directly to `dev` or via the designated branch + a follow-up.
- **Round accounting:** past markers are `round:1`, `:2`, `:3`, `:4-escalation`, and now `:5`. PR carries the `needs-human` label (from the round-4 escalation); there is no `needs-qa` gate currently set.
- **Self-PR caveat:** the author is the owner (`anguspersonal`), so all QA verdicts post as `COMMENT` with the intended verdict stated in the body. Don't read the absence of a green check as a missing signal.
- **GitHub MCP** flaked mid-session (reconnected). I worked from the local clone for diffs/build checks, which is why the review is one consolidated comment with `file:line` refs rather than inline review comments. If you want inline comments on `contact/route.ts:1-70`, post them via the review API.
- **Git note:** I checked out `origin/dev` (detached) to run `tsc`, then restored to `claude/serene-pascal-UByQP`. Working tree is clean on that branch. The only new file I added is this `HANDOFF.md`.

## Suggested next steps

1. Run `/address-review` (or hand-fix) `src/app/api/contact/route.ts` per the target state above.
2. `npx tsc --noEmit && npx vitest run` locally → green.
3. Push to `dev`; confirm Vercel goes green.
4. Re-run `qa-review` for a confirming round, or merge if you're confident — the rest of the delta is already cleared.
