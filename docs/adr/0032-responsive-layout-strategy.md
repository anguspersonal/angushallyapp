# ADR 0032: Responsive layout strategy and primitives

**Date:** 2026-05-03
**Status:** Accepted.
**Related:** [`../vision.md`](../vision.md), [`0029-redesign-brief-2026-04.md`](./0029-redesign-brief-2026-04.md), [`0030-redesign-brief-amendment-2026-04.md`](./0030-redesign-brief-amendment-2026-04.md), [`0033-performance-budget.md`](./0033-performance-budget.md).

---

## Context

The site has working but inconsistent responsive provisions:

- Mantine theme defines breakpoints as the source of truth (`xs 36em / sm 48em / md 62em / lg 75em / xl 88em`) in [`src/lib/theme.ts`](../../src/lib/theme.ts).
- Fourteen raw media queries are scattered across CSS modules using mixed values (`380px`, `480px`, `575px`, `768px` ×8, `1200px`). None reference the theme tokens.
- `768px` is the de facto mobile breakpoint, duplicated as a literal across `RichLinkCard`, `Timeline`, `CareerTimeline`, `general.css`, and others, instead of using the existing `--mantine-breakpoint-sm` variable.
- Most components jump straight from "mobile" to "desktop" at 768px. Tablet (768–992px) and ultrawide are afterthoughts.
- Custom max-widths (`760px`, `900px`, `640px`, `680px`, `800px`) are sprinkled at component level. Not tokenised.
- The `now` section had zero media queries, relied entirely on `clamp()` for fluid scaling, and broke on mobile.

The result is a design system that **assumes a desktop row layout and patches mobile reactively**, which is the wrong way round for a site whose primary audience increasingly arrives on phones.

## Decision

Adopt a **column-first universal layout model** with a small, named set of layout primitives. Mobile is the base case; horizontal layouts are an explicit opt-in by component.

### 1. Column-first principle

The entire app skeleton stacks vertically by default:

```
<body>
  <AppShell>           ← flex column
    <Header />
    <main>             ← flex column
      <Section />      ← flex column
      <Section />
      <Section />
    </main>
    <Footer />
  </AppShell>
</body>
```

Vertical rhythm comes from a `gap` on the column wrapper, not from `padding-top` / `padding-bottom` on each child. Anything that needs to be horizontal at any breakpoint is wrapped in a primitive that explicitly opts in.

### 2. The five primitives

A canonical vocabulary. Anything that does not fit one of these is a smell.

| Primitive | Purpose | Behaviour |
|---|---|---|
| **`<Stack>`** | The default. Flex column with token gap. | Always column. Universal. |
| **`<Section>`** | A section of a page. | `<Stack>` + `<Container>` + tokenised vertical padding. One component for "a section." |
| **`<Cluster>`** | Inline content that may wrap. | Flex row, `flex-wrap: wrap`, token gap. For pills, link rows, footer columns, tag chips. |
| **`<Switcher>`** | Two-up that collapses by content width. | Row above a content threshold, column below. Uses container queries (preferred) or Every Layout's flex-basis trick as fallback. |
| **`<Sidebar>`** | Content + side rail with explicit collapse. | Row at declared breakpoint, column below. Used sparingly. |

Card grids continue to use Mantine `<SimpleGrid cols={{ base, sm, md }}>` — it already does the right thing.

### 3. Tokens

Locked as CSS custom properties at `:root`:

```css
:root {
  /* Vertical rhythm */
  --section-gap: clamp(3rem, 6vw, 6rem);
  --intra-section-gap: clamp(1rem, 2vw, 2rem);
  --content-gap: clamp(0.75rem, 1.5vw, 1.25rem);

  /* Horizontal max-widths (canonical only) */
  --container-narrow: 720px;   /* prose, About, blog post body */
  --container-default: 960px;  /* most sections */
  --container-wide: 1200px;    /* card grids, timelines, hero */

  /* Breakpoints (mirror Mantine theme, used in CSS modules) */
  --bp-xs: 36em;  /* 576px */
  --bp-sm: 48em;  /* 768px */
  --bp-md: 62em;  /* 992px */
  --bp-lg: 75em;  /* 1200px */
  --bp-xl: 88em;  /* 1408px */
}
```

The breakpoint tokens duplicate Mantine's values intentionally: Mantine consumes them via JS, CSS modules consume them via these vars. Single source of intent (the brief), two consumers.

### 4. Breakpoint discipline

Hard rules:

- **No raw `px` breakpoints in CSS modules.** Use `var(--bp-*)` only. Lint or review-enforced.
- **No new custom max-widths.** Use one of the three canonical containers. Adding a fourth requires an ADR amendment.
- **Container queries are preferred** over media queries for component-internal responsiveness (e.g. `<Switcher>`, card layouts). Falls back gracefully on the rare browser without support.
- **Media queries only for layout primitives**, never for cosmetic adjustments. Cosmetic responsiveness goes through `clamp()`.

### 5. Mantine vs custom

- Keep Mantine `<Container>` for horizontal max-width and gutter — it handles safe-area insets correctly and integrates with the theme.
- Build `<Stack>`, `<Section>`, `<Cluster>`, `<Switcher>`, `<Sidebar>` as our own thin wrappers. No logic, just structure + tokens. Mantine's own `<Stack>` is too opinionated about gap and does not respect our tokens cleanly.
- Mantine `<SimpleGrid>` continues to handle card grids. No replacement needed.

### 6. Migration strategy

Pilot first, sweep second:

1. **Pilot on the homepage.** Build the five primitives. Migrate `HomePageClient` to use them. Validate on real device sizes (375px, 768px, 1280px, 2560px). Iterate the primitive APIs until they feel right.
2. **Sweep outward.** About → Projects → Blog → Contact → Work-with-me. One PR per page; each PR removes raw px breakpoints from the CSS modules it touches.
3. **Final pass.** Remove the last raw px breakpoints. Add a CI guardrail (regex check) that fails the build if a CSS module reintroduces them.

Existing patterns may coexist with the new primitives during migration. Do not big-bang.

## Consequences

### What this fixes

- One place to change vertical rhythm; no more hunting through `section-padding` rules.
- Mobile is the default state, not an override. "Broken on mobile" becomes hard to ship because mobile *is* the layout.
- Tokenised breakpoints kill drift; "what does 768px mean here?" becomes "what does `--bp-sm` mean across the site?"
- Container queries let components be responsive to their actual size, not the viewport — so the same `<Switcher>` behaves correctly inside a sidebar or a full-width section.
- Tablet and ultrawide stop being afterthoughts because the primitives are explicit about when they go horizontal, not implicit.

### What this costs

- A short period of two patterns coexisting during migration.
- Five new components to learn. Worth it: the surface area is small and the names are self-explanatory.
- Container queries have edge cases (parent must be a `container-type: inline-size` context); a small footgun until the team builds reflexes.

### What this does not change

- Mantine stays. No replacement of the form / button / modal layer.
- The redesign briefs (0029, 0030) stand. This ADR formalises *how* their layout intent is implemented; the visual brief is unchanged.
- The dual-mode palette, glass treatment, typography, and motion system in 0030 are unaffected.

## Open questions

- **Container query polyfill?** Not adding one. Browsers without support are rare enough (~1.5% globally as of 2026-05) and the fallback behaviour (single column) is acceptable.
- **Where to land the primitives in the codebase?** Proposal: `src/components/layout/` with one file per primitive. Confirm during pilot.
- **CI guardrail for raw px breakpoints?** Worth adding once the migration is complete. Stylelint rule or a grep-based check in pre-commit.
