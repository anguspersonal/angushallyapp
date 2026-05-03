# angushally.com — Design Amendment

**Amends:** angushally-redesign-brief.md
**Date:** April 2026
**Status:** Design direction locked. Content brief is unchanged; this document overlays visual direction on top.

---

## 1. Overall direction

The original brief was content-led and left visual direction open. This amendment sets the visual language.

### The narrative arc

The site is primarily for **investors**, with everyone else as a secondary audience. The aesthetic reflects that:

> **Bold and shiny outside. Warmer as you go deeper.**

The homepage is the pitch: confident, editorial, graphic. The About page is the handshake: still the same system, but with more space, more italics, and direct-on-background prose instead of glass panels. Blog and Projects sit between — confident structure, warmer content. There is one visual system across the site, not two. "Warmer" is achieved through content treatment, typography choices, and component density, never through changing the palette or type family.

### The two colour modes

The site supports **two user-selectable colour modes**:

- **Night mode** — animated teal gradient with drifting coral glow. Bold, modern, atmospheric.
- **Day mode** — soft cream gradient, very subtle. Clean, warm, editorial.

Both modes apply across the whole site. Mode is:

1. **Initialised from the user's OS preference** (`prefers-color-scheme`) on first visit.
2. **Toggleable via a control in the site header** that persists the user's choice (localStorage key `angus-site-mode`).
3. **Consistent across all pages** — Home, About, Projects, Blog, Contact, Work-with-me all render in the current mode.

### Night/day toggle

Placed in the top nav, to the right of the nav links, with auth (login/logout) sitting to its right. A simple sun/moon icon that flips on click. Respect `prefers-reduced-motion` — don't animate the palette swap if reduced motion is on; cross-fade statically instead.

---

## 2. Palette

### Night mode

**Base gradient** — applied to the outermost page wrapper:
```
linear-gradient(120deg, #0D1F1E 0%, #14302D 50%, #1F4A44 100%)
```

**Ambient coral glow** — layered on top as a second radial gradient:
```
radial-gradient(circle at var(--glow-x, 75%) var(--glow-y, 45%), rgba(240, 153, 123, 0.28), transparent 55%)
```

`--glow-x` and `--glow-y` are CSS custom properties updated via JS for the drift and scroll-link motion (see Section 6).

**Text on night:**
- Primary: `#FAF7F0` (warm cream)
- Secondary: `#FAF7F0` at 85% opacity
- Tertiary / captions: `#FAF7F0` at 65% opacity
- Accent (italics, highlights, CTA fill): `#F0997B` (coral)
- CTA text on coral: `#4A1B0C`

### Day mode

**Base gradient** — very subtle, gives the flat cream some atmosphere:
```
linear-gradient(180deg, #FAF7F0 0%, #F0ECE0 100%)
```

No ambient glow in day mode. No drift motion. The cream is the atmosphere.

**Text on day:**
- Primary: `#0D1F1E` (dark teal, near-black)
- Secondary: `#0D1F1E` at 75% opacity
- Tertiary / captions: `#0D1F1E` at 55% opacity
- Accent (italics, highlights, CTA fill): `#1F4A44` (deep teal)
- CTA text on teal: `#FAF7F0`

### Full palette reference

| Hex | Role |
|---|---|
| `#0D1F1E` | Dark teal. Night base start. Day text primary. |
| `#14302D` | Dark teal mid. Night gradient mid stop. |
| `#1F4A44` | Deep teal. Night gradient end. Day CTA fill. Day accent text. |
| `#F0997B` | Coral. Night ambient glow. Night accent text. Night CTA fill. |
| `#4A1B0C` | Dark coral. Text on coral CTA. |
| `#FAF7F0` | Warm cream. Day base start. Night text primary. |
| `#F0ECE0` | Cream mid. Day gradient end. |

Note: the warm browns and mid teals from earlier explorations have been dropped. Five core colours, deliberately.

### How to apply the palette

- The gradient goes on the outermost page wrapper, not on individual components.
- In night mode, the coral glow sits in a separate positioned element on top of the base gradient. It drifts and scroll-links (Section 6).
- In day mode, the base gradient is flat and still. Nothing drifts.
- Components sit on top of the gradient using glass-panel treatment (Section 4).
- Never place a solid dark fill on top of the night gradient. Use translucent panels.

---

## 3. Typography

### Display face

**League Gothic** for the nav brand, hero name, and section headings.

- `letter-spacing: -0.1em` (tight tracking)
- All-caps always
- Load via Google Fonts: `https://fonts.googleapis.com/css2?family=League+Gothic&display=swap`

### Body faces

Two body faces used selectively:

1. **Sans-serif** (keep current body face, e.g. Inter) for nav links, captions, pills, UI chrome, project and blog card body copy.
2. **Newsreader** for long-form prose on the About page and within blog posts. Serif. Warm. Has an excellent italic that we lean into for emphasis and rhythm. Load via Google Fonts: `https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&display=swap`. Use the optical size axis so it tunes for size automatically.

### Scale

| Use | Size (desktop) | Face | Letter-spacing |
|---|---|---|---|
| Hero name ("ANGUS HALLY") | 120–160px | League Gothic | -0.1em |
| Nav brand ("AH") | 24–26px | League Gothic | -0.1em |
| Nav links | 14px | Sans body | default |
| Section headings ("Latest work", "The path here") | 48–64px | League Gothic | -0.1em |
| Sub-section labels / kickers ("PROJECT · 2025") | 12px | Sans body | 0.08em |
| Body copy (UI / cards) | 14–16px | Sans body, 400 | default |
| Body copy (About / blog prose) | 18–20px | Newsreader, 400 | default |
| Italic accents (About, blog) | match surrounding | Newsreader italic | default |
| CTA pills | 13–14px | Sans body, 500 | default |

Hero scale drops to 48–72px on mobile.

### Brand mark

~~The nav brand is the letters **AH** in League Gothic, −10% tracking. Not an SVG logo. No custom mark. The existing AH logo is retired.~~

**Superseded 2026-05-03:** The nav brand is the **AH logo image** (`/public/AH_Logo.png`, 67×57 PNG). The League Gothic lettermark is dropped. The image renders at 32px height with width auto-scaled. League Gothic remains the display face for hero name, section headings, and other display copy in the rest of the site, just not for the nav brand.

---

## 4. Liquid glass treatment

Liquid glass is the primary surface language of the site. Glass panels host content while letting the animated night gradient (or subtle day gradient) read through them. This is what gives the site its "shiny outside, warm inside" character. Done badly, glass reads as dated 2013 frosted-acrylic or as flat cards with a faint tint. Done well, it feels like light playing through a thin material.

### Core principle

The glass surface must feel **material**, not painted. Three things create that feeling together, and removing any one breaks the effect:

1. **Real blur of what's behind.** The animated coral glow and gradient stops should softly smear through the panel. This is what makes it feel atmospheric rather than static.
2. **Low-opacity tint.** The panel has a barely-there fill; most of its colour comes from the blurred content behind it.
3. **Defined edge.** A 0.5px border at higher opacity than the fill. The edge is what tells the eye "this is a surface" instead of "this is a fuzzy patch."

If the ambient gradient is busy behind a glass panel, the panel feels alive. If it's not, the panel looks flat. This means **glass panels only exist where the gradient is rich** (night mode always, day mode mostly fine because of the subtle gradient) and never on pages that have flat solid regions.

### Two flavours: chrome glass and content glass

The site uses two distinct glass treatments. Don't mix them.

**Chrome glass** — for navigation, toggles, the hero CTA, and pill chips. Smaller, more opaque, higher-contrast border. Reads as UI.

**Content glass** — for cards and panels that hold content (projects, posts, timeline milestones, the "What I'm working on" grid). Larger, more translucent, softer border. Reads as a surface.

### Patterns

```css
/* ——— CONTENT GLASS ——— */
/* Night mode */
.glass-content {
  background: rgba(250, 247, 240, 0.06);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  border: 0.5px solid rgba(250, 247, 240, 0.12);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 0 rgba(250, 247, 240, 0.08),
    0 1px 0 0 rgba(13, 31, 30, 0.2);
}

/* Day mode */
[data-mode="day"] .glass-content {
  background: rgba(13, 31, 30, 0.03);
  backdrop-filter: blur(24px) saturate(1.1);
  -webkit-backdrop-filter: blur(24px) saturate(1.1);
  border: 0.5px solid rgba(13, 31, 30, 0.08);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 0 rgba(250, 247, 240, 0.6),
    0 1px 0 0 rgba(13, 31, 30, 0.04);
}

/* ——— CHROME GLASS ——— */
/* Night mode */
.glass-chrome {
  background: rgba(250, 247, 240, 0.10);
  backdrop-filter: blur(20px) saturate(1.3);
  -webkit-backdrop-filter: blur(20px) saturate(1.3);
  border: 0.5px solid rgba(250, 247, 240, 0.20);
  border-radius: 999px; /* pills default, override for nav bar */
}

/* Day mode */
[data-mode="day"] .glass-chrome {
  background: rgba(250, 247, 240, 0.60);
  backdrop-filter: blur(20px) saturate(1.1);
  -webkit-backdrop-filter: blur(20px) saturate(1.1);
  border: 0.5px solid rgba(13, 31, 30, 0.10);
  border-radius: 999px;
}
```

### The inner highlight is load-bearing

Note the `inset 0 1px 0 0 rgba(...)` in the `box-shadow` above. This is a 1px highlight along the top inner edge of the panel. It's the single most important detail in making glass look like glass instead of like a faint card.

- **Night mode highlight** uses cream at low opacity. It reads as a thin sheen where light would catch the top edge.
- **Day mode highlight** uses cream at higher opacity. On cream-on-cream surfaces it almost becomes the edge itself, giving the panel an uplifted quality.

The outer `0 1px 0 0` shadow is the opposite: a very faint drop giving the panel a sense of sitting *in front of* the gradient rather than floating within it.

Do not add glow, blur, multi-layer shadows, or soft outer shadows. The inner highlight + single hairline drop is the whole shadow system.

### Interplay with the animated gradient (night)

The night gradient drifts and scroll-shifts (Section 6). That means the colour passing through the glass is not static. Three implications:

1. **Saturate the blur.** The `saturate(1.2)` in `backdrop-filter` compensates for the natural desaturation that blur introduces. Without it, the coral glow reads as dishwater beige through glass. With it, glass catches colour from the glow and *glows back*, faintly.
2. **Don't over-tint the panel.** Panel fill stays at 0.06 opacity so the gradient does most of the colour work. If you raise the fill opacity to "make the panel more visible", you kill the gradient reading through it and the whole effect dies.
3. **Let the edge catch the glow.** Because the border is at 0.12 opacity (roughly 2x the fill), the panel edge picks up more of the coral tone when the glow drifts past it. This is deliberate: edges ripple subtly with the ambient motion. Don't explicitly animate them — just let the physics happen.

### Interplay with the day gradient

Day mode is a subtle `#FAF7F0 → #F0ECE0` vertical gradient. Very quiet. This means:

1. **Glass has less to catch.** Day mode glass is a more subtle effect; it's mostly carrying the cream tone with a whisper of warmth near the bottom. This is fine — day mode doesn't need the same atmospheric depth as night.
2. **Fill opacity flips its role.** In day mode the panel fill is dark (`rgba(13, 31, 30, 0.03)`) not light, because we're tinting away from the cream base. Keep it very low; the effect should feel like a slightly cooler patch of air, not a grey rectangle.
3. **Inner highlight becomes more visible.** On cream, the cream-on-cream inner highlight is almost a separator. This is correct — it's carrying the "surface" signal day mode needs.

### Where to apply — content glass

- Project cards (Projects page grid)
- Latest work cards on the homepage
- Blog post cards (Blog page grid)
- The "What I'm working on" four-tile grid on the homepage (Role, Building, Reading, Training)
- The "Currently" status card (corner of the hero photo)
- Timeline milestone cards on the professional timeline (homepage)
- Full-timeline milestone cards on `/projects/timeline`
- Contact form panel

### Where to apply — chrome glass

- The nav bar container pill (the rounded nav that holds AH + links)
- The "Say hello" hero CTA
- The night/day mode toggle button
- The pill chips under the hero (Available for chats / Based in London / Shipping weekly)
- Any secondary UI pills (tag filters, etc.)

### Where NOT to apply glass

- **About page.** About uses direct-on-background prose, not glass panels. The philosophy pullquote is a typographic treatment, not a glass block. See Section 7.
- **Body of blog posts.** Prose sits directly on the gradient. Only the post header (title + meta) may sit on a glass block.
- **Footer.** Simple text links. No glass.
- **Inside another glass panel.** Never nest glass in glass — the blur compounds and turns muddy.
- **Over a solid fill.** If a region ever has a flat solid background (shouldn't happen in this system, but for safety), the glass effect falls apart because there's nothing to blur.

### Card anatomy with glass

A content glass card holds structured content. Typical anatomy:

- 24px padding (all sides) for standard cards; 32px for featured cards.
- Kicker label (12px sans, 0.08em tracking, secondary text colour) at top.
- Heading (League Gothic 24–32px, or sans 18–20px for non-hero cards).
- Body text (14–16px sans).
- Optional CTA arrow link ("Open →", "Read →") at bottom, left-aligned, same size as body.
- Internal dividers, if needed, use `0.5px` at the same colour as the panel border.

Don't put backgrounds on elements inside a glass panel. Interior content sits on the glass itself.

### Hover state

Content glass cards respond on hover:

```css
.glass-content {
  transition:
    transform 300ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 300ms ease,
    background 300ms ease;
}

.glass-content:hover {
  transform: translateY(-2px);
  border-color: rgba(250, 247, 240, 0.20); /* night */
  background: rgba(250, 247, 240, 0.08);   /* night */
}
```

The lift is small (2px). The edge brightens. The fill brightens a touch. No scale, no shadow grow, no tilt. Subtlety is the brief.

### Performance

`backdrop-filter: blur(24px)` is cheap on modern hardware but adds up. Rules:

- Don't stack more than ~10 glass panels in the initial viewport.
- For long lists (a blog index with 30 posts), lazy-render glass panels that are out of view, or drop to the `@supports not (backdrop-filter)` fallback after a count threshold.
- Avoid `will-change: backdrop-filter` — it's not universally respected and can hurt more than help.
- On scroll, if blur becomes a perf bottleneck, progressively reduce the blur radius during active scrolling (`blur(24px)` → `blur(12px)` while scrolling, restore on settle). Use a scroll-idle detection (e.g. `requestIdleCallback` or a 100ms debounce).

### Fallback (no `backdrop-filter` support)

Rare now but still possible (some embedded browsers, Firefox with privacy settings). Fall back to a slightly higher-opacity solid tint that approximates the glass:

```css
@supports not (backdrop-filter: blur(24px)) {
  .glass-content {
    background: rgba(250, 247, 240, 0.10);
    border-color: rgba(250, 247, 240, 0.18);
  }
  [data-mode="day"] .glass-content {
    background: rgba(250, 247, 240, 0.70);
    border-color: rgba(13, 31, 30, 0.10);
  }
  .glass-chrome {
    background: rgba(250, 247, 240, 0.16);
  }
  [data-mode="day"] .glass-chrome {
    background: rgba(250, 247, 240, 0.88);
  }
}
```

The fallback is functional but not pretty — the site loses most of its atmospheric character. Don't over-invest in making the fallback beautiful; it's a graceful degradation, not a design target.

### Accessibility

Contrast ratios must be checked with the gradient in its *most adverse* state:

- Night: check text contrast with the glass panel sitting *over* the lightest part of the gradient (where the coral glow is strongest). This is usually where contrast fails first. Text stays at `#FAF7F0` on night glass and typically clears AA at 18px+.
- Day: check text with the glass panel at the bottom of the page (where the gradient is darkest `#F0ECE0`). Text at `#0D1F1E` clears AAA easily.

Keep glass-panel interior text large enough to sit above 14px for AA compliance. Never put 12px body text on glass (kickers are okay because they're uppercase and tracked).

---

## 5. CTA button treatment

Pill-shaped. No border. No box-shadow.

**Night mode:**
```css
background: #F0997B;
color: #4A1B0C;
padding: 10px 20px;
border-radius: 999px;
font-size: 14px;
font-weight: 500;
```

**Day mode:**
```css
background: #1F4A44;
color: #FAF7F0;
/* other properties as above */
```

Hover: `transform: scale(1.02)` plus a slight brightness lift. Active: `transform: scale(0.98)`. No shadows.

### Primary CTA phrasing

The hero CTA is **"Say hello"** — warmer and less transactional than "Get in touch." Small coral dot (night) or teal dot (day) as a status indicator to the left of the label.

### Pill chips under the hero

Three small translucent pill chips sit under the hero copy as trust / context signals:

- `• Available for chats` (with coral/teal dot)
- `Based in London`
- `Shipping weekly`

These are glass chips, not full CTA treatment. Lower-contrast, smaller, feel like metadata. Wording to be finalised with Angus; "Shipping weekly" is placeholder.

---

## 6. Parallax and motion

`framer-motion` is the library. Parallax is a first-class design element, not a decoration.

### Ambient glow motion (night mode only)

The coral glow is animated in two layers:

1. **Slow drift.** The glow position orbits gently, `--glow-x` and `--glow-y` animate over 40–60 seconds in a slow infinite loop. Subtle: a 15–20% range, not a dramatic traverse.
2. **Scroll-linked shift.** On top of the drift, scroll position nudges the glow opposite to scroll direction by another 10–15%. This makes the glow feel anchored to the document rather than glued to the viewport.

Implementation sketch:

```js
// In the root layout, night mode only
const { scrollYProgress } = useScroll();
const glowY = useTransform(scrollYProgress, [0, 1], ['45%', '30%']);
// Layer a CSS keyframe animation for the slow drift on top
```

Day mode has no ambient glow and no drift. It stays still.

### Scroll-linked reveals

Project cards, timeline milestones, latest work cards, etc., fade and translate in as they enter the viewport. Use `whileInView` with `viewport={{ once: true, margin: "-10%" }}` so reveals fire slightly before the element is fully in view.

Typical reveal: `opacity: 0 → 1`, `y: 24 → 0`, duration ~0.6s, easing `[0.22, 1, 0.36, 1]`.

### Hero

On mount: the hero name scales in from 0.98 to 1 with a 0.8s ease-out. The supporting paragraph fades in with a 0.15s delay. The status chips cascade in with 0.05s stagger.

On scroll: the hero name drifts upward at 0.85x scroll speed (mild parallax) while the photo stays at 1x, creating a gentle depth layering.

### Timeline on homepage

The "From classroom to startup" timeline is horizontal on desktop. As the user scrolls through it, each milestone reveals with a short stagger. On mobile it becomes vertical.

### Full timeline page

The gated `/projects/timeline` page is vertical, more generously spaced, and uses stronger parallax: each era shifts slightly relative to the scroll, the central line draws itself as you scroll past.

### Reduced motion

`prefers-reduced-motion: reduce` disables:
- Ambient glow drift
- Scroll-linked glow shift
- Hero parallax
- All card reveal translations (keep a very short opacity fade)

Never disable legibility-critical motion. Only decorative motion.

---

## 7. About page — the warmer layer

About is the one page that visibly softens compared to the rest of the site. It stays within the same palette and display type, but treats content differently.

### What About does differently

1. **Photo front and centre.** A larger, more intimate portrait crop at the top of the page. Not a small corner thumbnail.
2. **More whitespace.** Generous vertical rhythm. Paragraphs separated more than standard body copy elsewhere on the site.
3. **Serif body copy.** Switch to the serif body face at 18–20px. Long-form, readable, personal.
4. **Heavy use of italic.** Use serif italics for emphasis, quoted phrases, and the kind of places where the rest of the site would use bold. Italics carry warmth; bolds carry authority.
5. **Fewer glass panels, more direct-on-background prose.** About does not use glass cards. Content sits directly on the gradient. The philosophy block (the "one shot at life" quote) gets an editorial pullquote treatment, not a glass panel.
6. **Section headings smaller and lighter.** Still League Gothic, but at 36–48px rather than 64px. Less magazine cover, more chapter heading.

### What About keeps the same

- Palette (both modes)
- League Gothic for headings and any display type
- The site's general layout width and grid
- Nav and footer treatment
- Parallax (subtle) — scroll-linked reveals still apply, just gentler

### About page order (unchanged from original brief)

1. Photo + name header
2. Intro paragraph (serif, 20px, italic flourishes)
3. Professional timeline (condensed)
4. Philosophy block — the spine quote, editorial pullquote treatment
5. Link to full timeline (gated)

---

## 8. Consistent application across pages

Every page supports both night and day modes based on the user's selected preference. No page is locked to a mode.

### What's identical across pages

- Gradient base (per mode)
- Ambient glow (night only)
- League Gothic for display
- Body face sans for UI, serif for long-form
- Glass panel treatment on cards
- CTA styling
- Motion and parallax treatment

### What varies by page

| Page | Glass panels? | Body face | Section heading size |
|---|---|---|---|
| Home | Yes, heavy | Sans | 48–64px |
| About | No | Serif + italic | 36–48px |
| Projects (index) | Yes | Sans | 48px |
| Projects (individual) | Sometimes, content-led | Mix | 36–48px |
| Timeline (full, gated) | Yes, per milestone | Sans | 48px |
| Blog (index) | Yes | Sans | 48px |
| Blog (individual post) | Header only | Serif | 36px |
| Contact | Single glass form panel | Sans | 36px |
| Work-with-me pages | Yes | Sans | 36–48px |

### Mode toggle behaviour

- First visit: read `prefers-color-scheme`. Apply matching mode.
- User clicks toggle: flip mode, persist choice (`localStorage['angus-site-mode']`).
- Subsequent visits: use persisted preference; ignore OS setting once the user has made an explicit choice.
- Palette cross-fades over 300ms on toggle (disable under `prefers-reduced-motion`).

---

## 9. What this replaces from the original brief

The following sections of the original brief are now more specific:

- **Section 4 Homepage / Hero:** Visual treatment is the dual-mode palette with League Gothic 120–160px display. CTA is a pill labelled "Say hello". Pill chips below the hero for status and context signals.
- **Section 5 About page:** Rewritten per Section 7 above. Serif body, italics, no glass panels, direct-on-background prose.
- **Section 8 Design intent / parallax:** Replaced by the dual-mode palette, animated night gradient, liquid glass, League Gothic, scroll-linked parallax, and the user-selectable night/day toggle.

All content, structure, auth, and site map decisions from the original brief stand unchanged.

---

## 10. Build order impact

Same order as Section 10 of the original brief, with these adjustments:

- A new **Step 0** is added: set up the design system layer first. This includes palette tokens, gradient root component, content and chrome glass components, mode toggle, League Gothic and Newsreader font loading, and the motion primitives (scroll reveal, glow drift). Nothing else can be built cleanly until this exists.
- **Step 1 (Homepage hero update)** grows. It now includes the gradient and drifting glow background, League Gothic hero at 120–160px, hero parallax, pill chip row, "Say hello" CTA, and the "What I'm working on now" four-tile grid.
- **Step 5 (About page rebuild)** grows. Newsreader body face, larger photo, new layout per Section 7.
- **New Step 8**: mode toggle UI, persistence, and palette cross-fade.

---

## 11. Confirmed decisions (previously open)

- **Serif body face** — Newsreader. Load via Google Fonts. Use regular and italic weights. Paired with League Gothic for display and the current sans for UI chrome.
- **"What I'm working on now" four-tile grid on homepage** — ~~adopted. Shows Role, Building, Reading, Training. Lives below the hero, above the professional timeline. Uses content glass treatment per Section 4. Intended to be updated as things change — treat as a snapshot, not a static element.~~ **Superseded by [ADR 0031](./0031-now-section-heylina-hero.md) (2026-05-03):** the section becomes a HeyLina-led hero on the homepage; reading / training / other facets defer to the About page.
- **Pill chip wording** — confirmed as written: `• Available for chats`, `Based in London`, `Shipping weekly`. All three are currently true. Update in copy if that changes.
- **AH nav mark link target** — links to Home (`/`).

---

## 12. Remaining open questions for Angus

None at time of writing. If new decisions come up during build, flag them in the Claude Code session.