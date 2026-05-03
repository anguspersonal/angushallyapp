# ADR 0033: Performance budget and asset standards

**Date:** 2026-05-03
**Status:** Accepted.
**Related:** [`../vision.md`](../vision.md), [`../architecture.md`](../architecture.md), [`0032-responsive-layout-strategy.md`](./0032-responsive-layout-strategy.md).

---

## Context

The site is hosted on Vercel running Next.js 15 App Router — a near-perfect platform pairing for fast, server-rendered, edge-cached portfolios. An audit (2026-05-03) found we are **not realising that platform's value** because of avoidable configuration and asset hygiene gaps:

- [`next.config.mjs`](../../next.config.mjs) sets `images: { unoptimized: true }`, disabling Next.js Image entirely. No AVIF/WebP, no responsive `srcset`, no automatic resizing, no lazy loading.
- 34 image files in `public/` exceed 500KB. The Florence portrait is 3.7MB raw. The HeyLina strategy day photo is 5.6MB. These are served as-is on the homepage.
- No `priority` flag is set on any image, including the hero LCP candidate.
- Zero `dynamic(() => import())` usage. Project pages (Data Value Game, Habit, Eat Safe UK, Bookmarks) bundle into the homepage payload.
- Only one `<Suspense>` boundary in the entire app (on `/login`). No streaming gains from RSC.
- `@mantine/charts` is imported once. `@mantine/carousel` has zero imports. Both ship in the bundle.
- 15 components use `framer-motion`. Many use it for simple "fade in when in view" effects that CSS scroll-driven animations now handle natively in all evergreen browsers.

The architecture is sound — the homepage correctly uses a server component delegating to a client island, OG fetches use `revalidate: 86400`, fonts go through `next/font`. **One config flag and a handful of asset hygiene fixes close most of the gap.**

The site's primary audience on the homepage is investors landing cold ([`../vision.md`](../vision.md)). For that audience, perceived speed is part of the credibility signal. A 3-5s load budget on a mid-tier mobile device on a 4G connection is the bar.

## Decision

Adopt a **performance budget** with concrete numbers, then enforce a small set of **asset and code standards** that keep the site inside that budget.

### 1. Performance budget

| Metric | Target | Hard ceiling |
|---|---|---|
| **Largest Contentful Paint (LCP)** | < 2.0s | < 2.5s |
| **First Contentful Paint (FCP)** | < 1.2s | < 1.8s |
| **Cumulative Layout Shift (CLS)** | < 0.05 | < 0.1 |
| **Interaction to Next Paint (INP)** | < 150ms | < 200ms |
| **Total JS (gzipped, homepage)** | < 200KB | < 300KB |
| **Total page weight (homepage, first load)** | < 1.5MB | < 2.5MB |
| **Time to Interactive (mid-tier mobile, 4G)** | < 3.0s | < 5.0s |

Measured via WebPageTest (Moto G4 / 4G profile) and Vercel Analytics. Targets are the design intent; ceilings are the "stop and fix it" line.

### 2. Image standards

- **Next.js Image is on.** `images: { unoptimized: false }` (or simply remove the override). All images use `<Image>` from `next/image`. Raw `<img>` requires a comment explaining why.
- **Source images are pre-resized before commit.** Photographs cap at **2400px on the long edge** for hero / portrait use, **1600px** for thumbnails and OG images. Never commit a raw camera roll image. Use a tool (Squoosh, ImageOptim, `sharp` script) before staging.
- **`priority` flag is mandatory on the LCP candidate** (hero photo, hero card image). One per route.
- **`sizes` attribute is mandatory** on any `<Image>` used in a responsive layout. No exceptions.
- **AVIF first, WebP fallback** — Next.js handles this automatically once optimization is on.
- **Source images live in `public/images/<context>/<name>.<ext>`** with no `.original.*` duplicates committed. If a high-res master is needed, it lives outside the repo (Drive, S3).

### 3. Code-splitting standards

- **Heavy project pages are dynamic-imported.** Data Value Game, Habit, Strava, Eat Safe UK, Bookmarks. Pattern: `const DataValueGame = dynamic(() => import('./DataValueGame'), { ssr: false })`.
- **Charts are dynamic-imported** (`@mantine/charts` only loads on routes that render a chart).
- **`<Suspense>` boundaries** wrap async server components and dynamic imports. Each section that fetches independently gets its own boundary so the rest of the page streams.
- **No top-level imports of route-specific components** from the root layout or homepage.

### 4. Dependencies

- **Drop `@mantine/carousel`** — zero imports.
- **Drop `@mantine/charts`** unless the one chart user (CV/timeline/strava) is kept; if kept, dynamic-import only on that route.
- Any new dependency added to `package.json` must include a one-line note in the PR description on why it earns its weight. Anything > 30KB gzipped requires explicit sign-off.

### 5. Animation discipline

- **CSS-first.** Simple fade / translate / scale on viewport entry uses `animation-timeline: view()` + `prefers-reduced-motion`. No JS, no hydration dependency.
- **Framer Motion only where choreography genuinely needs JS.** Hero entrance (multi-property orchestrated sequence), `useScroll` + `useTransform` for scroll-linked values, hover state machines. Audit existing usage; downgrade simple cases.
- **No `framer-motion` in route-level pages that do not need it.** It is fine in components imported by those pages, but the page itself stays as RSC where possible.

### 6. Server-rendering posture

- **Default to RSC.** A page is `'use client'` only when it has interactive state (forms, accordions, modals) or motion that requires JS. Static + animated content can almost always split: server data + structure, thin client island for motion.
- **Per-route `revalidate` exports** for any page rendering external data (OG, blog index, project metadata). 24h default; tune per source.
- **View Transitions API** for cross-route navigation (Next.js 15 native support). Adopt once the layout refactor (0032) settles.

### 7. Measurement

- **Before/after WebPageTest** on every perf-sensitive PR. Paste the comparison in the PR description.
- **Vercel Analytics** monitored monthly. If any Core Web Vital trend crosses the *target* line (not the ceiling) for two consecutive weeks, open an investigation.
- **Lighthouse CI** in GitHub Actions on PRs touching `app/`, `components/`, or `next.config.mjs`. Fails the build if scores drop > 5 points on any metric.

## Consequences

### What this fixes (immediately, this week)

- 3.7MB Florence and 5.6MB HeyLina images become ~150KB and ~300KB respectively after Next.js Image optimization plus source resize. **Single biggest LCP win.**
- Hero `priority` flag eliminates the LCP penalty from lazy-loaded hero images.
- Project pages stop bundling into the homepage; first-load JS for visitors who never visit `/projects/data-value-game` drops materially.
- Dropping `@mantine/carousel` and (likely) `@mantine/charts` trims ~80-120KB gzipped from the bundle.

### What this fixes (over the next month)

- Animation pass downgrades the 15 framer-motion users; CSS-first reveals stop blocking hydration on simple sections.
- View Transitions make cross-page navigation feel native-app fast.
- Per-route `revalidate` cuts the work Vercel does on warm edges.

### What this costs

- One-time effort to resize the source image catalogue (1-2 hours).
- Ongoing discipline: every new image goes through the resize step. Worth a `scripts/optimize-images.mjs` helper in the repo.
- A few PRs will be held up by the WebPageTest comparison ask. Net positive.
- Lighthouse CI in GitHub Actions adds ~2 minutes to the PR pipeline.

### What this does not change

- The redesign briefs (0029, 0030, 0031) stand.
- Mantine remains the form / button / modal / layout-utility layer.
- Framer Motion stays in the dependency list — just used more selectively.
- The hosting target (Vercel + Supabase) is unchanged.

## Sequencing

Aligns with the agreed plan-of-record:

1. **This week — perf foundations.** Image config flip, source image resize, `priority` flags, drop unused Mantine subpackages, dynamic-import the project pages. Add the `scripts/optimize-images.mjs` helper. WebPageTest before / after, paste in PR.
2. **Next — layout refactor** ([ADR 0032](./0032-responsive-layout-strategy.md)). With perf headroom secured, the layout primitives can be designed CSS-first.
3. **After — animation discipline pass.** Audit the 15 framer-motion users; downgrade simple fades; adopt View Transitions for navigation.

Treat this ADR as the source of truth for performance decisions. Subsequent perf-related decisions amend or supersede this document; they do not start a parallel narrative.
