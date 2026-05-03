# ADR 0031: "What I'm working on now" — HeyLina hero, not four-tile grid

**Date:** 2026-05-03
**Status:** Accepted. Supersedes the four-tile grid decision in [`0030-redesign-brief-amendment-2026-04.md`](./0030-redesign-brief-amendment-2026-04.md) §11.
**Related:** [`0029-redesign-brief-2026-04.md`](./0029-redesign-brief-2026-04.md), [`../vision.md`](../vision.md).

---

## Context

The redesign briefs (0029, 0030) framed a "What I'm working on now" four-tile grid on the homepage showing **Role, Building, Reading, Training**, intended as a snapshot of Angus's current life across four facets.

In practice, two things became clear once we sat with it:

1. **The homepage is the pitch.** Primary audience is investors landing cold. They do not need a four-facet life snapshot. They need a confident headline answer to "what is Angus doing right now?" — and the answer is HeyLina.
2. **The four-tile grid dilutes the signal.** Reading lists and training cadence are interesting context, not headlines. Surfacing them at equal weight to HeyLina on the landing page muddies the read for the audience that matters most on first impression.

The north star is unchanged: *"a person honestly documenting their one shot at life."* What changes is **where** each part of that documentation lives.

## Decision

The homepage "What I'm working on now" section becomes a **HeyLina-led hero**, not a four-tile grid.

- The section's job is to land one message: *Angus is building HeyLina. Here is what that looks like right now.*
- HeyLina gets the full real estate of the section: a prominent rich link card, a short scope line ("COO. I look after operations, hiring, fundraising, and partnerships..."), and a clear link out to heylina.ai.
- The "What I do there" copy stays in the section (it is part of the HeyLina headline).
- The "Also Reading" sidebar, the "Training" tile, and any other side-of-life facets are **removed from the homepage** and **deferred to the About page** as a "Currently" or "Beyond work" block.
- The section continues to sit between the hero and the professional timeline.

## Consequences

### What changes on the homepage

- The 65/35 primary/secondary split goes away. The section becomes single-column or generously centered, focused entirely on HeyLina.
- The "Also Reading" / "The Coming Wave" sidebar is removed.
- No "Training" tile is added. No "Building" tile distinct from HeyLina.
- The "What I do there" paragraph stays but is treated as part of the HeyLina headline, not as a separate "what I do" block.

### What changes on the About page

A new "Currently" block is added to the About page covering the deferred content:

- What Angus is reading
- Training / physical practice cadence
- Any side projects or skills he is actively building outside HeyLina

This is a living block, intended to be updated periodically. It sits after the intro paragraph and before the professional timeline, or wherever the rebuild lands it.

### What does not change

- The north star ([`vision.md`](../vision.md)).
- The dual-mode palette, glass treatment, typography, and motion system from 0030 §1–6.
- The professional timeline section that follows ("From classroom to startup").
- The site map, auth, and routing decisions in 0029.

## Why this is the right call

- **Matches the audience.** Investors land on the homepage. The first thing they need is confidence that Angus is fully committed to and clear-eyed about HeyLina. A four-tile grid says "here are my hobbies." A HeyLina hero says "here is the thing."
- **Matches the narrative arc** ([0030 §1](./0030-redesign-brief-amendment-2026-04.md)): *bold and shiny outside, warmer as you go deeper*. Headlines on the homepage; warmth on About.
- **Honest, not chest-beating.** This is not a HeyLina marketing page (heylina.ai is). It is one section of Angus's site that says "this is what I am doing now" — which is honestly HeyLina, full stop.
- **Easier to maintain.** A snapshot of a single thing stays accurate. A four-tile grid (Reading / Training / Building / Role) decays the moment one tile goes stale, and the whole grid feels neglected.

## Implementation notes (non-binding)

When the rebuild happens:

- Keep the existing `RichLinkCard` for HeyLina; give it more breathing room.
- Strip `nowZoneSecondary` and the `alsoList` markup from the homepage component.
- Move the deferred content to the About page as part of its rebuild (Section 5 of 0029, Section 7 of 0030).
- Section heading stays "What I'm working on now" — copy is fine, the framing is what changes.

Treat this ADR as the source of truth where it conflicts with 0030 §11.
