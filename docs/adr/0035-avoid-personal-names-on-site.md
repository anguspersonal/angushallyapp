# ADR 0035: Avoid personal names on the site (default, not hard rule)

Date: 2026-05-06

## Status

Accepted

## Context

The site is a personal portfolio. Long-form content — especially `src/data/personalTimeline.json` and any future biographical surface — naturally pulls in the names of people from Angus's life: ex-partners, friends, colleagues, family.

Those names are on the public web once they ship. They're indexed, cached, scraped, and impossible to fully retract. The named person rarely consented to being on a stranger's portfolio, and the cost of getting it wrong is asymmetric: small upside (a slightly more vivid sentence) versus a real privacy or relational cost to someone else.

A specific case prompted this: an ex-partner's first name appeared in two timeline entries. Removing it cost nothing — "my first serious partner" and "my partner and I broke up" carry the same narrative weight. That pattern generalises.

## Decision

**Default: avoid using identifiable personal names on user-facing site content.** Prefer role-based phrasing ("my partner", "a colleague", "a friend", "my brother").

This is a default, not a hard rule. Exceptions are fine when the name is load-bearing and the named person is implicitly or explicitly OK with being mentioned. The two main carve-outs today:

- **Immediate family** — parents, siblings — when their inclusion is part of the story being told (e.g. the foundational entry naming Angus's parents and brother). Family is generally OK; reconsider only if a specific person has asked otherwise.
- **Angus's partner/fiancée/spouse** — Laura is a public co-author of Angus's life and consents to being named. The "Met Laura" / "Engaged to Laura" entries stand.

Past relationships, casual acquaintances, colleagues, classmates, and anyone else who didn't sign up to be on this site default to anonymised role-phrasing.

This applies to:
- `src/data/personalTimeline.json` and any other long-form biographical content
- Blog posts and project write-ups
- Public profile copy (`/about`, footers, system windows)

It does **not** apply to:
- Internal docs (`docs/`, ADRs) — those can use real names for clarity. Already-shipped ADRs (e.g. `0029-redesign-brief-2026-04.md`) intentionally keep the original names as a historical record of the source material.
- Public collaborators where naming is the point (HeyLina, Anmut, employers — these are organisations, not the constraint).

## Consequences

- **Positive**
  - Lower privacy and relational risk; less chance of an awkward conversation a year from now.
  - Forces tighter writing — role-based phrasing usually reads cleaner than first-name-dropping anyway.
  - One default to apply across all content surfaces; AI agents and human editors both have a clear rule to follow.
- **Negative**
  - Some narrative texture is lost (a name is more vivid than a role).
  - Edge cases ("a former teammate at X" might still identify someone via context) need judgement; the rule doesn't replace thinking.
- **Operational**
  - When adding new biographical content, ask: would this person be happy to find their name here? If unsure, anonymise.
  - When reviewing existing content, prefer anonymising over keeping a name unless the person is in the explicit carve-out list above.

## Related

- `src/data/personalTimeline.json` — primary surface this rule governs today
- `docs/adr/0029-redesign-brief-2026-04.md` — pre-rule snapshot; intentionally retains original names as historical record
