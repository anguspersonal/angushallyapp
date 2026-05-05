# Projects page — macOS desktop redesign

Build plan for redesigning `/projects` from a flat grid into a full-bleed mock macOS desktop. Active projects in the dock, archived in a Finder folder, CV as a desktop file. Multi-window draggable workspace on desktop, iOS Home Screen on mobile.

Locked design decisions in `<concept>` block at end. This doc is the **tactical** how-to-build counterpart.

---

## Production checklist

### Phase 0 — Design assets (can start any time, parallelise with Phase 1+)

- [ ] **Wallpaper** — Big-Sur-style abstract gradient mesh **in your palette** (cream/ink + coral/teal accents). Day + night variants. CSS-generated via `radial-gradient` + filters or one SVG with stops. Avoid Apple's blues/purples.
- [ ] **AH monogram** — small glass-tile glyph for menu-bar apple-corner. Reusable across boot intro and menu bar.
- [ ] **Per-project glyph + tint mapping** — pick one Lucide icon + one palette tint for each:
  - Data Value Game → `LayoutGrid` + (tint TBD)
  - Strava → `Activity` + (tint TBD)
  - Timeline → `Clock` + (tint TBD)
  - AI Text Analysis → `Sparkles` + (tint TBD)
  - Eat Safe UK → `Map` + (tint TBD)
  - Habit Tracker → `Repeat` + (tint TBD)
  - Instapaper → `Newspaper` + (tint TBD)
  - Bookmarks → `Bookmark` + (tint TBD)
- [ ] **Folder icon** — same glass frame, folder silhouette inside (visually distinct from app icons)
- [ ] **Document icon** — same glass frame, document shape inside (for `Resume.pdf`)
- [ ] **4 active-project hero screenshots** — clean, full-bleed captures for window main panes (~720×360 area)
- [ ] **4 active-project write-ups** — 100-200 words each. Structure: what it does / why I built it / what I learned / tech stack as chips
- [ ] **5 archived-project "Archived because…" notes** — 1 line each explaining why it stopped

### Phase 1 — Route shell

- [ ] Update `/projects/page.tsx`: replace `SimpleGrid` of `ProjectSnippet` with new `MacDesktop` component
- [ ] Hide global site header on `/projects` route (mirror the per-route header pattern blog already uses)
- [ ] Add `<MacDesktop>` shell: full-viewport, no scroll, no site footer until you scroll past
- [ ] Wallpaper component renders behind everything; reads day/night from existing Mantine color scheme
- [ ] Title `MY PROJECTS` (League Gothic ~280px, ~10% opacity) and help text `Click an app to get started` (~25% opacity) on wallpaper
- [ ] No client-side data fetching — `projectList.ts` is the source of truth (already exists)

### Phase 2 — Menu bar

- [ ] `<MenuBar>` component anchored to top, full width, ~28px tall, glass material
- [ ] Left zone: AH monogram (clickable) + decorative labels `File / Edit / View / Help`
- [ ] Right zone: site nav (`Home / Blog / About / Contact`) + `<LiveClock>` (auto-updating, your locale)
- [ ] AH monogram → opens About window
- [ ] App-menu labels: dropdowns either don't open or show a single greyed-out stub (`Nothing to see here`). Real items deferred to v2.
- [ ] Right-side links route normally (standard `<Link>`)

### Phase 3 — Dock + icons (static visual first)

- [ ] `<Dock>` component, glass material, anchored bottom-centre, fixed-width with rounded corners
- [ ] `<DockIcon>` component: glass tile (~64px), 22% radius, project tint overlay, Lucide glyph centred
- [ ] Dock layout: `[DVG] [Timeline•🔒] [Strava] [AI Text 🔒]   ｜   [📁 Archive]`
  - Vertical divider rule between active apps and Archive folder
- [ ] In-progress dot indicator (6px solid, accent colour, ~8px below icon) — visible on Timeline only
- [ ] Lock badge (16-18px glass circle with `Lock` glyph, top-right corner) — visible on Timeline + AI Text
- [ ] Tooltips on hover: `Project name · Status · Sign-in note (if gated)`
- [ ] `<DesktopIcon>` for `Resume.pdf` — single icon on the desktop area, label below

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

- [ ] **`<RichProjectWindow>`** — 720×540, two-pane:
  - Left sidebar (~30%): title, status badge, tags, "Built with" chips, `Visit project →` button
  - Right main (~70%): hero screenshot + write-up
  - CTA opens `/projects/{slug}` in same tab
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

- [ ] Wire 4 active-project write-ups + hero screenshots into rich windows
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
