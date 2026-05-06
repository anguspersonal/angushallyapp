# Projects page — macOS desktop redesign

Build plan for redesigning `/projects` from a flat grid into a full-bleed mock macOS desktop. Active projects in the dock, archived in a Finder folder, CV as a desktop file. Multi-window draggable workspace on desktop, iOS Home Screen on mobile.

Locked design decisions in `<concept>` block at end. This doc is the **tactical** how-to-build counterpart.

---

## Production checklist

### Phase 0 — Design assets (can start any time, parallelise with Phase 1+)

> **Errata** (logged during Phase 0 implementation):
> - Icon library is `@tabler/icons-react`, not Lucide. Plan now reflects this throughout.
> - `GlassContent` uses `border-radius: 20px` (not iOS's 22%). The desktop primitives match for material consistency.
> - Codebase already uses a `data-surface` pattern (`data-surface='blog'`) for per-route token overrides. Phase 1 should adopt the same convention with `data-surface='projects'` rather than inventing a new mechanism.
> - Original plan said "5 archived-project notes". Actual count is 4 (Blog is `in-progress`, not archived).

- [x] **Wallpaper** — Big-Sur-style abstract gradient mesh in your palette. Day + night variants. Built as `<Wallpaper>` in `src/components/projects-desktop/Wallpaper.tsx` (radial-gradient mesh + grain layer + faded title overlay).
- [x] **AH monogram** — small glass-tile glyph reusable across menu bar and boot intro. Built as `<AHMonogram>` in `src/components/projects-desktop/IconTile.tsx` (League Gothic "AH" inside the shared glass tile).
- [x] **Per-project glyph + tint mapping** — locked in `src/components/projects-desktop/iconMapping.ts`:
  - Data Value Game → `IconLayoutGrid` + mustard `#c8a951`
  - Eat Safe UK → `IconMap` + sage `#7a9c83`
  - Strava → `IconActivity` + coral `#f0997b` (site accent)
  - Habit Tracker → `IconRepeat` + brick `#b4654a`
  - AI Text Analysis → `IconSparkles` + plum `#8b6a90`
  - Instapaper → `IconNews` + slate `#576366`
  - Bookmarks → `IconBookmark` + site-teal `#1f4a44`
  - Timeline → `IconClock` + periwinkle `#7898b5`
- [x] **Folder icon** — `<FolderIcon>` in `IconTile.tsx`. Glass frame + custom SVG folder silhouette in tint.
- [x] **Document icon** — `<DocumentIcon>` in `IconTile.tsx`. Glass frame + SVG document shape with `PDF` badge.
- [x] **2 hero screenshots** — DVG (`/data_value_game_screenshot.png`) + Timeline (`/timeline_screenshot.png`) wired into `src/data/projectList.ts`. Strava + AI Text are gated/private and ship as write-up-only windows. Blog has its own screenshot via the blog surface (not consumed here).
- [x] **4 active-project write-ups** — DVG (~155w), Timeline (~95w), Strava (~85w), AI Text (~95w) wired into `src/data/projectList.ts`. Bonus: Eat Safe UK got a long-form writeUp too (~140w) because the human story behind it earned the length. `writeUp` JSDoc broadened from "rich (active)" to "any project window". Habit Tracker, Instapaper, and Bookmarks `desc` fields tightened from corporate-speak to plain language. `builtWith` chips confirmed accurate during review.
- [x] **4 archived-project "Archived because…" notes** — populated for all 4 archived projects in `src/data/projectList.ts` (`archivedReason` field). Note: count is 4, not 5 — the original plan miscounted (Blog is in-progress, not archived).

### Phase 1 — Route shell

- [x] Update `/projects/page.tsx`: replace `SimpleGrid` of `ProjectSnippet` with new `MacDesktop` component (now `<MacDesktop />` only — see `src/app/projects/page.tsx`).
- [x] Hide global site header on `/projects` route — added `'projects'` surface to `ClientLayout.tsx`, mirroring the blog pattern. Site Header, Footer, AppShell, and GradientRoot all suppressed for `/projects` exact match. Sub-routes (`/projects/strava` etc.) intentionally keep default site chrome so direct links remain standalone pages.
- [x] Add `<MacDesktop>` shell: full-viewport, no scroll. Built in `src/components/projects-desktop/MacDesktop.tsx` — `position: relative; height: 100dvh; overflow: hidden` (dvh chosen over vh to avoid mobile browser-chrome scroll jitter). Site footer is suppressed entirely for this surface (the "scroll past" behaviour from the original plan was dropped — full-viewport with no scroll is cleaner).
- [x] Wallpaper component renders behind everything; reads day/night from existing Mantine color scheme — already wired in Phase 0, now activated by `<MacDesktop>` mounting it as its first child.
- [x] Title `MY PROJECTS` (League Gothic ~280px, ~10% opacity) and help text `Click an app to get started` (~25% opacity) on wallpaper — already present in `<Wallpaper>` from Phase 0; default props match this spec.
- [x] No client-side data fetching — `projectList.ts` is the source of truth (already exists).

### Phase 2 — Menu bar

- [x] `<MenuBar>` component anchored to top, full width, ~28px tall, glass material — built in `src/components/projects-desktop/MenuBar.tsx`. Mounted by `<MacDesktop>` so the page surface is `<MacDesktop />` only. Glass material mirrors `IconTile` (blur 24, saturation 1.1–1.2) for chrome-family consistency, with a `@supports not (backdrop-filter)` fallback.
- [x] Left zone: AH monogram (clickable) + decorative labels `File / Edit / View / Help` — monogram rendered via the existing `<AHMonogram>` primitive at `size={22}`.
- [x] Right zone: site nav (`Home / Blog / About / Contact`) + `<LiveClock>` (auto-updating, your locale) — built in `src/components/projects-desktop/LiveClock.tsx`. Aligns its tick to the next minute boundary so the displayed value flips with the wall clock; SSR renders a hidden placeholder of the right approximate width to avoid hydration reflow. Note: `Projects` deliberately omitted from the nav — visitors are already on the projects desktop.
- [x] AH monogram → opens About window — wired as a `<button>` with a no-op `onClick` for now. Phase 4 connects it to `WindowContext.openAbout()` without restructuring; a comment in `MenuBar.tsx` flags the wire-up site.
- [x] App-menu labels: dropdowns either don't open or show a single greyed-out stub (`Nothing to see here`). Real items deferred to v2 — implemented with Mantine `Menu` + a single disabled `Menu.Item`. Picked the stub option (over "don't open") because it's the more delightful version of the metaphor.
- [x] Right-side links route normally (standard `<Link>`) — uses `next/link`. They remain functional even before the window manager exists, which is the right behaviour: menu bar is system chrome, not part of the playful desktop metaphor.

### Phase 3 — Dock + icons (static visual first)

- [x] `<Dock>` component, glass material, anchored bottom-centre, fixed-width with rounded corners — built in `src/components/projects-desktop/Dock.tsx`. Glass material mirrors MenuBar + IconTile (blur 24, saturation 1.1–1.2) for chrome-family consistency, with an `@supports not (backdrop-filter)` fallback. `z-index: 90` (sits below the menu bar at 100). Click handlers are deliberately no-ops — Phase 4 will swap them for `WindowContext.openProject(id)` / `openFinder('archive')` without restructuring the JSX.
- [x] `<DockIcon>` component: glass tile (~64px), 22% radius, project tint overlay, Tabler glyph centred — built in `src/components/projects-desktop/DockIcon.tsx`. Composes the existing `<ProjectAppIcon>` primitive so the tile shares its 20px-radius glass material (errata: actual radius is 20px, not 22%). Hover/focus lifts via `translateY(-4px) scale(1.06)` with a `cubic-bezier(0.22, 1, 0.36, 1)` curve; reduced-motion users get no transform.
- [x] Dock layout: `[DVG] [Timeline•🔒] [Strava] [AI Text 🔒]   ｜   [📁 Archive]` — order is hard-coded (`DOCK_PROJECT_IDS = [0, 8, 3, 5]`) per the plan's curated reading order rather than derived from `status`. Vertical divider implemented as a `1px` low-opacity bar with theme-aware colour.
- [x] In-progress dot indicator (6px solid, accent colour, ~8px below icon) — visible on Timeline only. Rendered as `.statusDot` (6×6, `var(--site-coral, #f0997b)`, soft glow). Non-in-progress icons render an invisible `.statusDotPlaceholder` of the same size so the icon row's vertical baseline doesn't shift.
- [x] Lock badge (16-18px glass circle with `Lock` glyph, top-right corner) — visible on Timeline + AI Text. 18px circle with its own miniature glass material (blur 12), positioned at `top: -4px; right: -4px` so it overhangs the tile corner like an applied indicator rather than feeling "inside" the tile.
- [x] Tooltips on hover: `Project name · Status · Sign-in note (if gated)` — Mantine `<Tooltip>`, `position="top"`, `offset={14}`, `openDelay={250}`, with arrow. Tooltip label is also the button's `aria-label`, so the same string is announced to screen readers.
- [x] `<DesktopIcon>` for `Resume.pdf` — single icon on the desktop area, label below. Built in `src/components/projects-desktop/DesktopIcon.tsx` as a generic primitive (label + children + onClick + className) so later phases can drop additional desktop icons in without a new component. The Resume slot is positioned via the exported `desktopSlot.resume` class (top-right, clear of the menu bar). Label uses theme-aware text-shadow for legibility on both day and night wallpapers — chosen over a pill background because it keeps the desktop visually quieter.

### Phase 4 — Window manager (engine)

- [ ] `WindowContext` — central state: `Map<windowId, { x, y, z, isOpen, kind, payload }>`
- [ ] Cascade positioning: track `openCount`, offset `30px` per existing window, wrap at 5
- [ ] `<WindowFrame>` — base component with traffic-light header, content slot, `GlassContent` body
- [ ] Drag-by-header — pointer events, 1:1 motion, 1° tilt during active drag
- [ ] Click-to-front — clicking unfocused window bumps z-index + adds shadow density (150ms transition)
- [ ] Traffic lights — light up on window hover, glyph (×, −, ⤢) shows on lights hover
- [ ] Open animation — `Framer Motion` `layoutId` or manual `motion.div` from clicked icon's screen position to destination, 280ms `cubic-bezier(0.32, 0.72, 0, 1)`
- [ ] Close animation — reverse of open (scale + translate back to icon)
- [ ] Bounds-checking — windows can't be dragged completely off-screen (header always reachable)
- [ ] `Esc` → closes focused window
- [ ] `Tab` → cycles focus through dock + desktop icons; `Enter` → opens

### Phase 5 — Window types

- [ ] **`<RichProjectWindow>`** — 720×540, two-pane. Used for **DVG + Timeline** only (the two with hero screenshots).
  - Left sidebar (~30%): title, status badge, tags, "Built with" chips, `Visit project →` button
  - Right main (~70%): hero screenshot + write-up
  - CTA opens `/projects/{slug}` in same tab
- [ ] **`<WriteUpWindow>`** — narrower (~580×440), single-pane. Used for **Strava + AI Text** (active but no hero — gated/private surfaces). Title, status badge, tags, "Built with" chips, write-up, `Visit project →` button. Sits between `<RichProjectWindow>` and `<TerseArchivedWindow>` in fidelity so the dock doesn't visually demote them to "archived".
- [ ] **`<TerseArchivedWindow>`** — smaller (~520×360), single-pane:
  - Title, status, 1-line description, tags, "Archived because…" note, CTA
- [ ] **`<FinderWindow>`** — Archive folder behaviour:
  - Standard window chrome
  - Sidebar with `📁 Archive` highlighted
  - Main pane: icon-view grid, archived projects in chronological order (Eat Safe UK → Habit → Instapaper → Bookmarks)
  - Click archive icon → opens its terse window alongside Finder (multi-window)
- [ ] **`<SystemWindow>`** for About + Resume:
  - Single-pane (no sidebar)
  - About embeds `/about` page content
  - Resume.pdf embeds `/cv` page content
  - No internal CTA — content is right there

### Phase 6 — Boot intro

- [ ] Port `NewspaperIntro` infrastructure → new `<MacBootIntro>` component
- [ ] 5-phase animation timeline (~2.6s total):
  - 0→0.6s: dark bg, AH monogram fades in centred, scale 0.95→1.0
  - 0.6→1.6s: thin progress bar fills under monogram in accent colour
  - 1.6→2.0s: monogram + bar fade as wallpaper crossfades in
  - 2.0→2.3s: menu bar fades in from top, dock slides up from bottom
  - 2.3→2.6s: icons populate left-to-right, ~30ms stagger
- [ ] SessionStorage gate: key `projects-boot-shown`, plays once per tab session
- [ ] Skip handlers: any key, click, or tap dismisses immediately
- [ ] `prefers-reduced-motion`: skips entire intro, page renders assembled

### Phase 7 — Mobile (iOS Home Screen)

- [ ] Breakpoint detection: ≤1024px (covers phones + tablets) switches to mobile shell
- [ ] `<MobileHomeScreen>` component: 3-4 column grid of icons (same `<DockIcon>` reused at slightly larger size)
- [ ] Tap icon → fullscreen sheet animates up from bottom with project content
  - Sheet uses single-pane layout (sidebar collapses to top, main below)
  - Drag-down or X to dismiss
- [ ] Archive folder → opens to its own grid view (iOS folder pattern, no Finder window)
- [ ] No drag, no multi-window, no z-index management on mobile
- [ ] Mobile boot intro: same 5-phase but scaled to viewport
- [ ] Menu bar adapts: hamburger or compressed nav for narrow widths

### Phase 8 — Polish

- [ ] Dock hover magnification — cursor-distance scale curve, adjacent icons scale partially (Mac dock equation)
- [ ] Animation easing tuning — feel-test all transitions, tighten where needed
- [ ] Focus rings visible on all interactive elements (icons, buttons, traffic lights, menu items)
- [ ] ARIA labels on every icon: `${name}, ${status}${gated ? ', sign-in required' : ''}`
- [ ] `prefers-reduced-motion` respected across all animations (intro skip, no scale-up on window open, no drag tilt)
- [ ] Live clock: 24h or 12h based on locale, updates every minute
- [ ] Day/night wallpaper crossfade when user toggles theme

### Phase 9 — Content wire-up + QA

- [ ] Wire 4 active-project write-ups into windows (DVG + Timeline get rich+hero, Strava + AI Text get write-up-only)
- [ ] Wire 5 archived "Archived because…" lines into terse windows
- [ ] Verify on actual screen sizes: 1920px, 1440px, 1024px, 768px, 414px (iPhone), 390px
- [ ] Verify iOS path on actual phone (touch targets, sheet animation)
- [ ] Verify `prefers-reduced-motion` path (system setting on/off)
- [ ] Verify keyboard navigation: Tab through icons, Enter opens, Esc closes, focus rings visible
- [ ] Verify deep links: `/projects/strava` etc. still work for direct navigation
- [ ] Verify back button after CTA: visitor goes Strava window → `/projects/strava` → back → desktop returns to a sensible state
- [ ] Cross-browser: Chrome, Safari, Firefox

---

## Suggested build sequence

Bundle into roughly four shippable milestones:

1. **Milestone 1 — Static visual (Phases 0+1+2+3)** — Page looks right but nothing opens. Worth a dev-only deploy to feel the chrome.
2. **Milestone 2 — Window manager works (Phases 4+5)** — All window types open, drag, close. Content can be placeholder.
3. **Milestone 3 — Polish + intro + content (Phases 6+8+9)** — Feels alive. Real content. Production-ready desktop.
4. **Milestone 4 — Mobile (Phase 7)** — Ships separately if needed; desktop can launch first.

Total realistic effort: **~4-6 weeks** of focused work, depending on icon design speed and screenshot/write-up production.

---

## Locked concept

<concept>
Full-bleed immersive macOS desktop at /projects. Site header hidden, OS menu bar = site nav. Active projects (4) in dock left of divider, Archive folder right of divider. Single Resume.pdf icon on desktop. Multi-window draggable workspace with origin-aware scaling animations and dock magnification. iOS Home Screen metaphor on mobile (≤1024px). Fidelity: Mac-shaped, your-branded — uses GlassContent material, League Gothic, your palette (not Apple's). Mac-boot intro mirrors blog's NewspaperIntro pattern. Two-pane window layout (metadata sidebar + content main) for project windows; single-pane for system windows (About, Resume).
</concept>
