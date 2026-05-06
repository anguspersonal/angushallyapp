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

> **Errata** (logged during Phase 4 implementation):
> - The plan's `WindowContext` state shape used `isOpen`. In practice, "open" is encoded by the window's presence in the map (close removes; AnimatePresence handles the visual exit). The simpler shape avoids a stale-`isOpen=true` zombie state during the close transition.
> - Window kind merged from {`project`, `archived`} into a single `project` discriminator. The window-type lookup in Phase 5 reads `project.status` to pick Rich vs WriteUp vs TerseArchived — that's a render concern, not an engine concern, so the engine doesn't need to know.
> - WindowContext kinds: `project` | `archive-folder` | `about` | `resume`. No `archived` kind exists at the engine layer.
> - Drag implementation chose manual pointer events over Framer Motion's `drag` prop to avoid the conflict between `motion.div`'s open-animation `x/y` transform and a controlled drag offset. Open/close anims still use Framer Motion (initial/animate/exit + AnimatePresence); drag uses plain pointer events on the header with `setPointerCapture`.

- [x] `WindowContext` — central state: `Map<windowId, WindowState>` + `openCount` (cascade index) + `topZ` (focus). Built in `src/components/projects-desktop/WindowContext.tsx`. Reducer-backed (`useReducer`) so all mutations route through a single switch, which makes the state machine debuggable. Window IDs are derived from `kind` (`windowIdFor`) so re-clicking an open project just re-focuses — no duplicates. Convenience hooks `openProject` / `openArchiveFolder` / `openAbout` / `openResume` keep call sites tight and avoid repeating the kind discriminator.
- [x] Cascade positioning: track `openCount`, offset `30px` per existing window, wrap at 5 — implemented in the reducer's `'open'` case. `cascadeIdx = openCount % 5`, position = `(baseX + idx * 30, baseY + idx * 30)`. Base x is `(viewport.w - windowSize.w) / 2 - 60` (slightly left-of-centre so the cascade reads "stack growing right"). Base y is 60, clear of the 28px menu bar. `openCount` only increments on genuinely new opens, never on re-focus, so re-clicking an open window doesn't shift it.
- [x] `<WindowFrame>` — base component with traffic-light header, content slot, glass body — built in `src/components/projects-desktop/WindowFrame.tsx`. Glass material follows the chrome family (blur 24, sat 1.1-1.2, theme-aware) for material consistency with menu bar / dock / IconTile. `GlassContent` from the original plan doesn't exist as a standalone component in this codebase — the IconTile recipe is the actual reference, and WindowFrame mirrors it directly.
- [x] Drag-by-header — pointer events, 1:1 motion, 1° tilt during active drag — manual implementation on the header element (`onPointerDown` / `Move` / `Up` / `Cancel`). Uses `setPointerCapture` so the drag survives the cursor leaving the header. `data-dragging="true"` on the window element triggers the 0.5° rotation via CSS (closer to 0.5° than a full degree because the windows are larger than physical Mac windows and a 1° tilt at this scale reads as broken rather than playful). Buttons inside the header are marked `data-no-drag` so the close button doesn't initiate a drag.
- [x] Click-to-front — clicking unfocused window bumps z-index + adds shadow density (150ms transition) — `onMouseDownCapture` on the window root dispatches `focus`, which bumps the window's `z` to `topZ + 1`. Shadow density is theme-aware in `WindowFrame.module.css` via `[data-focused='true']` selectors with deeper, darker box-shadows. Transition is `box-shadow 150ms ease`, suspended during drag so the shadow doesn't pulse mid-drag.
- [x] Traffic lights — light up on window hover, glyph (×, −, ⤢) shows on lights hover — three 12px circles in the header. Background is grey by default and gets the macOS colours (`#ff5f57` / `#febc2e` / `#28c840`) only when the window itself is hovered or focused. Glyphs are SVG and stay at `opacity: 0` until `.trafficLights:hover` lifts them in. Close is fully wired (`closeWindow(win.id)`); minimise + expand are visually present and accessibility-labelled but `disabled` until later phases give them work to do.
- [x] Open animation — `motion.div` from clicked icon's screen position to destination, 280ms `cubic-bezier(0.32, 0.72, 0, 1)` — implemented manually rather than via `layoutId`. Origin rect is captured at click time by the icon component (`DockIcon` / `DesktopIcon` read `e.currentTarget.getBoundingClientRect()`) and passed up as an `OriginRect`. WindowFrame computes `originDelta = iconCentre - windowCentre` and animates `initial={{ scale: 0.05, x: delta.x, y: delta.y }}` → `animate={{ scale: 1, x: 0, y: 0 }}`. Picked manual over `layoutId` because the icon and window aren't sibling layout elements — the icon stays mounted while the window mounts elsewhere — and `layoutId` works cleanest for actual layout transitions.
- [x] Close animation — reverse of open — `exit={{ scale: 0.05, x: delta.x, y: delta.y }}` on the same `motion.div`, with `<AnimatePresence>` in WindowManager keeping the element alive until the exit transition finishes. The reducer removes the window from state immediately on close, but Framer keeps the DOM node painting the exit. Critically: this means a re-open during close doesn't race with a delayed remove — there is no delayed remove.
- [x] Bounds-checking — windows can't be dragged completely off-screen — `clampPosition` in WindowFrame applied during pointerMove. `MIN_VISIBLE = 200` keeps at least 200px of the header on-screen on the X axis. Top edge is clamped to `y >= 0` (the menu bar visually covers the first 28px but the position itself is locked to the viewport top, so dragged windows can't be lost above it). Bottom edge: `y <= viewport.h - HEADER_HEIGHT` so the header is always reachable.
- [x] `Esc` → closes focused window — `useEffect` in `WindowProvider` listens to `keydown`. Skips when the user is typing in an input/textarea/contenteditable (otherwise an `<input>` with form-Escape behaviour like Mantine's combobox close gets hijacked). Calls `closeWindow(focusedId)` only when a window is actually focused.
- [x] `Tab` → cycles focus through dock + desktop icons; `Enter` → opens — works "for free" because every chrome surface (`DockIcon`, `DesktopIcon`, `MenuBar` brand button, archive folder button) is a real `<button>`. Native browser Tab order handles the cycle; Enter triggers the click handler. Focus rings are already styled in each component's CSS module.

### Phase 5 — Window types

- [x] **`<RichProjectWindow>`** — 720×540, two-pane. Used for **DVG + Timeline** only (the two with hero screenshots).
  - Left sidebar (~30%): title, status badge, tags, "Built with" chips, `Visit project →` button
  - Right main (~70%): hero screenshot + write-up
  - CTA opens `/projects/{slug}` in same tab
  - Built in `src/components/projects-desktop/RichProjectWindow.tsx` with CSS module for responsive layout
- [x] **`<WriteUpWindow>`** — narrower (~580×440), single-pane. Used for **Strava + AI Text** (active but no hero — gated/private surfaces). Title, status badge, tags, "Built with" chips, write-up, `Visit project →` button. Sits between `<RichProjectWindow>` and `<TerseArchivedWindow>` in fidelity so the dock doesn't visually demote them to "archived".
  - Built in `src/components/projects-desktop/WriteUpWindow.tsx` with compact header + scrollable content
- [x] **`<TerseArchivedWindow>`** — smaller (~520×360), single-pane:
  - Title, status, 1-line description, tags, "Archived because…" note, CTA
  - Built in `src/components/projects-desktop/TerseArchivedWindow.tsx` with accent-bordered note box
- [x] **`<FinderWindow>`** — Archive folder behaviour:
  - Standard window chrome
  - Sidebar with `📁 Archive` highlighted
  - Main pane: icon-view grid, archived projects in chronological order (Eat Safe UK → Habit → Instapaper → Bookmarks)
  - Click archive icon → opens its terse window alongside Finder (multi-window)
  - Built in `src/components/projects-desktop/FinderWindow.tsx` with grid layout and origin-aware click handlers
- [x] **`<SystemWindow>`** for About + Resume:
  - Single-pane (no sidebar)
  - About embeds `/about` page content via iframe
  - Resume.pdf embeds `/cv` page content via iframe
  - No internal CTA — content is right there
  - Built in `src/components/projects-desktop/SystemWindow.tsx`

### Phase 6 — Boot intro

- [x] Port `NewspaperIntro` infrastructure → new `<MacBootIntro>` component
  - Built in `src/components/projects-desktop/MacBootIntro.tsx` + CSS module
  - Mirrors NewspaperIntro pattern: sessionStorage gate, skip handlers, reduced-motion respect
- [x] 5-phase animation timeline (~2.6s total):
  - 0→0.6s: dark bg, AH monogram fades in centred, scale 0.95→1.0
  - 0.6→1.6s: thin progress bar fills under monogram in accent colour (site-coral)
  - 1.6→2.0s: monogram + bar fade as wallpaper crossfades in (darkBg opacity 1→0)
  - 2.0→2.3s: menu bar fades in from top, dock slides up from bottom (handled by MacDesktop children mounting)
  - 2.3→2.6s: icons populate left-to-right, ~30ms stagger (dock/menu appear via fade)
- [x] SessionStorage gate: key `projects-boot-shown`, plays once per tab session
  - Implemented in MacBootIntro.tsx; checked on mount with SSR-safe pattern (initial null state)
- [x] Skip handlers: any key, click, or tap dismisses immediately
  - `onClick` on overlay container + `keydown` listener dismiss to sessionStorage + unmount
- [x] `prefers-reduced-motion`: skips entire intro, page renders assembled
  - `useReducedMotion()` from Framer Motion; if true, component returns null immediately

### Phase 7 — Mobile (iOS Home Screen)

- [x] Breakpoint detection: ≤1024px (covers phones + tablets) switches to mobile shell
  - `useMobileBreakpoint()` hook in `src/components/projects-desktop/useMobileBreakpoint.ts`
  - SSR-safe (defaults to `false` during server render, checks on mount)
- [x] `<MobileHomeScreen>` component: 3-4 column grid of icons (same `<ProjectAppIcon>` reused at 72px size)
  - Built in `src/components/projects-desktop/MobileHomeScreen.tsx`
  - Responsive: 4 columns default, 3 columns on smaller phones (<352px)
  - Archive folder in separate row below grid
- [x] Tap icon → fullscreen sheet animates up from bottom with project content
  - `MobileProjectSheet` component with Framer Motion spring animation
  - Sheet uses existing window components (RichProjectWindow, WriteUpWindow, TerseArchivedWindow)
  - Drag-down handle + X button to dismiss
  - Backdrop tap dismisses
- [x] Archive folder → opens to its own grid view (iOS folder pattern, no Finder window)
  - `MobileArchiveFolder` component - centered modal with blurred backdrop
  - Shows 3-column grid of archived projects
  - Tap opens project sheet (closes folder first)
- [x] No drag, no multi-window, no z-index management on mobile
  - Single `selectedProjectId` state in MobileLayout
  - No WindowProvider needed for mobile path (but kept for code simplicity)
- [x] Mobile boot intro: same 5-phase but scaled to viewport
  - `MobileBootIntro` component with 64px monogram (vs 96px desktop)
  - Same sessionStorage gate (`projects-boot-shown`)
  - "Tap to skip" hint instead of "Press any key"
- [x] Menu bar adapts: simplified title header for narrow widths
  - `MacDesktopMobile.module.css` with sticky glass-morphism header
  - Shows "Projects" title only (site nav moved to main site header on mobile)

### Phase 8 — Polish

- [x] Dock hover magnification — cursor-distance scale curve, adjacent icons scale partially (Mac dock equation)
  - `getMagnification()` function in Dock.tsx using cosine ease curve
  - Max 1.5x scale at cursor, falls off over 150px distance
  - Applied via CSS custom property `--dock-scale` for smooth 150ms transitions
- [x] Animation easing tuning — dock icon transitions tightened to 150ms cubic-bezier(0.22, 1, 0.36, 1)
- [x] Focus rings visible on all interactive elements (icons, buttons, traffic lights, menu items)
  - Already implemented in all components via `focus-visible` styles
  - Coral outline (#f0997b) on DockIcon, DesktopIcon, folder buttons, traffic lights
- [x] ARIA labels on every icon: `${name}, ${status}${gated ? ', sign-in required' : ''}`
  - DockIcon: uses tooltipLabel as aria-label (name + status + gated)
  - MobileIcon: same format via tooltipParts.join(' · ')
  - DesktopIcon: `aria-label={`Open ${label}`}`
- [x] `prefers-reduced-motion` respected across all animations (intro skip, no scale-up on window open, no drag tilt)
  - All CSS modules have `@media (prefers-reduced-motion: reduce)` blocks
  - Boot intros use `useReducedMotion()` from Framer Motion
  - Dock magnification disabled in reduced motion mode
- [x] Live clock: 24h or 12h based on locale, updates every minute
  - LiveClock.tsx uses `hour12: undefined` to let locale decide format
- [x] Day/night wallpaper crossfade when user toggles theme
  - Wallpaper.module.css: `transition: background-color 500ms ease, background-image 500ms ease`

### Phase 9 — Content wire-up + QA

- [x] Wire 4 active-project write-ups into windows (DVG + Timeline get rich+hero, Strava + AI Text get write-up-only)
  - **DVG (id: 0)**: `writeUp` field populated (~155 words), `screenshot: '/data_value_game_screenshot.png'` → `RichProjectWindow`
  - **Timeline (id: 8)**: `writeUp` field populated (~95 words), `screenshot: '/timeline_screenshot.png'` → `RichProjectWindow`
  - **Strava (id: 3)**: `writeUp` field populated (~85 words), no screenshot → `WriteUpWindow`
  - **AI Text (id: 5)**: `writeUp` field populated (~95 words), no screenshot → `WriteUpWindow`
  - WindowManager routes: `screenshot ? RichProjectWindow : WriteUpWindow`
- [x] Wire 4 archived "Archived because…" lines into terse windows
  - **Eat Safe UK (id: 1)**: `archivedReason` populated → `TerseArchivedWindow`
  - **Habit Tracker (id: 4)**: `archivedReason` populated → `TerseArchivedWindow`
  - **Instapaper (id: 6)**: `archivedReason` populated → `TerseArchivedWindow`
  - **Bookmarks (id: 7)**: `archivedReason` populated → `TerseArchivedWindow`
  - Note: Plan mentioned 5 archived projects, but actual count is 4 (Blog is `in-progress`, not archived)
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
