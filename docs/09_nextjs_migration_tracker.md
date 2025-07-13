# 09_migration_tracker.md

# 🛠️ Next.js Migration Tracker

This is the **working task board** for the CRA → Next.js migration of `angushallyapp`.

---

## 🔄 In Progress

### 🚨 Current Issues to Resolve
- [ ] **Build Manifest Errors** – Multiple ENOENT errors for `_buildManifest.js.tmp` files in Next.js dev server
- [x] **Missing CSS Module** – `./strava.module.css` not found in `/projects/strava` page ✅ **RESOLVED**
- [x] **Port Conflicts** – Multiple Next.js dev servers running on port 3001 causing conflicts ✅ **RESOLVED** (2025-07-12)
- [x] **Authentication Token Field Mismatch** – Backend expects `token` field, frontend sends `credential` ✅ **RESOLVED** (2025-07-10)
- [ ] **/collab Performance Tuning** – Optimize load speed and reduce CPU spikes in Next.js dev mode 🔄 **IN PROGRESS**

### 🔧 Infrastructure Issues
- [ ] **Next.js Build Stability** – Resolve Turbopack compilation errors and manifest issues
- [x] **Development Environment** – Clean up multiple running processes and port conflicts ✅ **RESOLVED** (2025-07-11)
- [x] **CSS Module Migration** – Ensure all CSS modules are properly copied and imported ✅ **RESOLVED**
- [x] **Static Asset Loading** – Fixed CSS import issues in layout.tsx ✅ **RESOLVED**

---

## ⏭️ Next Priority

- [x] `/projects` – Static overview page of all projects ✅
- [x] Complete Data Value Game migration (remaining components) ✅
- [x] Migrate other simple project pages (Instapaper AI, etc.) ✅ **COMPLETED**
- [x] `/blog` – Dynamic blog index page (list, tags, metadata) ✅
- [x] `/blog/:slug` – Blog post page with SSG (`generateStaticParams`) ✅
- [x] `/cv` – Static resume page ✅ **COMPLETED**
- [x] **Fix Strava Project** – Resolve missing CSS module and complete migration ✅ **RESOLVED**
- [x] `/collab` – Complex collaboration page with multiple components ✅ **COMPLETED**

---

## 🔃 Backlog

### 🔥 High Complexity (SSR, State-heavy)
- [x] `/projects/habit` – Complex UI state + goal tracking ✅
- [x] `/projects/strava` – Strava API integration, graph display ✅ **CSS Module Issue Resolved**

### ✅ Bookmark Sub-Project Migration Complete
- [x] `/projects/bookmarks` – Complete bookmark management system with Instagram Intelligence
  - [x] Create directory structure `next-ui/src/app/projects/bookmarks/`
  - [x] Migrate main page component to Next.js App Router
  - [x] Create supporting components (BookmarkCard, Sidebar)
  - [x] Migrate Instagram Intelligence components (InstagramEnhancer, InstagramAnalysisDisplay)
  - [x] Create shared types in `next-ui/src/types/common.ts`
  - [x] Install required dependencies (@mantine/notifications)
  - [x] Test locally at `/next/projects/bookmarks`
  - [x] Verify page loads correctly via Express proxy
  - [x] **Status**: ✅ **Complete** - All components migrated with TypeScript support

### 🔁 PWA & Offline
- [ ] Migrate Service Worker – Switch to `next-pwa`, match CRA logic
  - **Status**: Ready to revisit after SSR routes are stable and hydration issues are eliminated
  - **Note**: Service worker and manifest now conditionally disabled in development
- [ ] Offline Route Handling – Ensure fallback behavior and cache versioning

### 🧼 Cleanup
- [ ] Remove CRA App – Fully delete CRA when all routes are migrated
- [ ] Optimize Express Routing – Remove CRA proxy rules, compress static
- [ ] Final Lighthouse Audit – Performance & SEO pass
- [ ] Consolidate types + utils – Move final shared files to `/shared`

---

## ✅ Completed

### Critical Infrastructure Fixes ✅
- [x] **Static Asset Loading Fix** – Resolved CSS import issues preventing Next.js app from rendering
  - [x] Copied `index.css` and `general.css` from CRA to `next-ui/src/`
  - [x] Updated `layout.tsx` to import CSS files from correct location
  - [x] Verified Next.js app renders successfully at http://localhost:3000
  - [x] Confirmed no 404s for static assets (CSS/JS chunks)

### `/contact` Migration ✅
- [x] Copy CRA component to `next-ui/src/app/contact/page.tsx`
- [x] Convert to TSX + use App Router
- [x] Test locally at `/next/contact`
- [x] Install required dependencies (@mantine/form, react-google-recaptcha)
- [x] Fix TypeScript color issues for Mantine v7
- [x] Update form validation and reCAPTCHA integration
- [x] Verify page loads correctly via Express proxy

### Footer Layout Integration ✅
- [x] Create Footer component for Next.js app
- [x] Migrate from CRA Footer with TypeScript and Mantine v7 colors
- [x] Add Footer to ClientLayout using AppShell.Footer
- [x] Fix color compatibility issues (dimmed → secondary, gray → secondary)
- [x] Verify footer appears on all pages via Express proxy

### `/projects` Migration ✅
- [x] Copy CRA component to `next-ui/src/app/projects/page.tsx`
- [x] Convert to TSX + use App Router
- [x] Use existing project data from `next-ui/src/data/projectList.ts`
- [x] Test locally at `/next/projects`
- [x] Verify page loads correctly via Express proxy

### Individual Project Pages Migration ✅
- [x] `/projects/ai/text-analysis` – Simple AI text analysis tool
  - [x] Create directory structure `next-ui/src/app/projects/ai/text-analysis/`
  - [x] Migrate main component to Next.js App Router
  - [x] Create supporting `ai.ts` utility with API client integration
  - [x] Fix Mantine v7 compatibility issues (LoadingOverlay, Box styling)
  - [x] Test locally at `/next/projects/ai/text-analysis`
  - [x] Verify page loads correctly via Express proxy

- [x] `/projects/ai/instapaper` – Instapaper AI analysis tool
  - [x] Create directory structure `next-ui/src/app/projects/ai/instapaper/`
  - [x] Create main page component with TypeScript and Mantine v7
  - [x] Implement placeholder AI analysis interface
  - [x] Add future features roadmap and integration plans
  - [x] Fix Mantine v7 color compatibility issues
  - [x] Test build compilation and TypeScript compliance
  - [x] **Status**: ✅ **Complete** - Ready for future Instapaper API integration

- [x] `/projects/eat-safe-uk` – Google Maps + hygiene score integration
  - [x] Create directory structure `next-ui/src/app/projects/eat-safe-uk/`
  - [x] Migrate main component to Next.js App Router with TypeScript
  - [x] Create supporting components (GMapView, GMapsSearchBar, NearbySearchButton, Markers)
  - [x] Migrate utility functions (fetchHygieneScores, nearbySearch, askUserLocation, getDynamicPlaceholder)
  - [x] Install required dependencies (@vis.gl/react-google-maps, axios)
  - [x] Fix authentication error handling in Next.js AuthProvider
  - [x] Copy CSS files and maintain styling
  - [x] Test locally at `/next/projects/eat-safe-uk`
  - [x] Verify Google Maps integration and hygiene score functionality

### Data Value Game Migration ✅
- [x] Create directory structure `next-ui/src/app/projects/data-value-game/`
- [x] Migrate main component to Next.js App Router
- [x] Create DVGHeader component and CSS
- [x] Create Welcome component
- [x] Migrate remaining components (GameBoard, Card, Win, Lose, etc.)
- [x] Create CTA-GuessAutomotive component
- [x] Copy all CSS files (DataValueGame.css, Gameboard.css, DVGFooter.css, DVGHeader.css)
- [x] Copy Industries.json data
- [x] Test game functionality

### `/login` Migration ✅
- [x] Copy CRA component to `next-ui/src/app/login/page.tsx`
- [x] Convert to TSX + use App Router
- [x] Test locally at `/next/login`
- [x] (Optional) Test in production at `/next/login`
- [x] Redirect `/login` to Next.js version in Express
- [x] Remove CRA login page
- [x] Move page from `/next/login` → `/login`

### `/blog` Migration ✅
- [x] Copy CRA components to `next-ui/src/app/blog/` and `next-ui/src/app/blog/[slug]/`
- [x] Convert to TSX + use App Router with dynamic routing
- [x] Install required dependencies (react-markdown, remark-gfm)
- [x] Update blog types to match CRA version
- [x] Migrate fetchBlogData utility with proper TypeScript types
- [x] Create BlogSnippet component with attribution handling
- [x] Add CSS styling for markdown content
- [x] Fix Mantine v7 compatibility issues (color props)
- [x] Test locally at `/next/blog` and `/next/blog/[slug]`
- [x] Verify blog listing and individual post pages load correctly

### `/collab` Migration ✅
- [x] Create directory structure `next-ui/src/app/collab/`
- [x] Migrate main page component to Next.js App Router with TypeScript
- [x] Create supporting components (TraitGrid, CustomCarousel, TestimonialSlide, CaseStudySlide, FounderJourney)
- [x] Migrate data files (testimonials.ts, caseStudies.tsx) with proper TypeScript interfaces
- [x] Install required dependencies (@mantine/carousel, embla-carousel-autoplay)
- [x] Fix Mantine v7 compatibility issues (color props, Group justify, Button rightSection)
- [x] Update routing from React Router to Next.js Link
- [x] Convert complex animations and interactions to TypeScript
- [x] Test locally at `/next/collab`
- [x] Verify all sections load correctly (Hero, TraitGrid, Accordion, Carousel, FounderJourney)

### `/cv` Migration ✅
- [x] Create directory structure `next-ui/src/app/cv/`
- [x] Migrate main page component to Next.js App Router with TypeScript
- [x] Preserve all CV sections and responsive design
- [x] Maintain styling and layout consistency
- [x] Test locally at `/next/cv`
- [x] Verify page loads correctly via Express proxy

### `/projects/habit` Migration ✅
- [x] Create directory structure `next-ui/src/app/projects/habit/`
- [x] Migrate main page component to Next.js App Router with TypeScript
- [x] Create supporting components (HabitHeader, HabitTile, HabitDrawer, HabitCombobox)
- [x] Add habit types to `next-ui/src/types/common.ts` (HabitLog, HabitType, DrinkCatalogItem, etc.)
- [x] Migrate utility functions (habit.ts, aggregateService.ts, calculateUnits.ts)
- [x] Fix Mantine v7 compatibility issues (color props, ActionIcon variants)
- [x] Update API client integration to use shared apiClient
- [x] Test locally at `/next/projects/habit`
- [x] Verify habit tracking functionality and drawer interactions

### `/projects/strava` Migration ✅
- [x] Create directory structure `next-ui/src/app/projects/strava/`
- [x] Migrate main page component to Next.js App Router with TypeScript
- [x] Copy CSS module files and resolve import issues
- [x] Maintain Strava API integration and graph display
- [x] Fix Mantine v7 compatibility issues
- [x] Test locally at `/next/projects/strava`
- [x] Verify Strava integration and functionality

### `/projects/bookmarks` Migration ✅
- [x] Create directory structure `next-ui/src/app/projects/bookmarks/`
- [x] Migrate main page component to Next.js App Router with TypeScript
- [x] Create supporting components (BookmarkCard, Sidebar)
- [x] Migrate Instagram Intelligence components (InstagramEnhancer, InstagramAnalysisDisplay)
- [x] Create shared types in `next-ui/src/types/common.ts`
- [x] Install required dependencies (@mantine/notifications)
- [x] Test locally at `/next/projects/bookmarks`
- [x] Verify page loads correctly via Express proxy
- [x] **Status**: ✅ **Complete** - All components migrated with TypeScript support

### `layout.tsx` Shared Layout Migration ✅
- [x] Create `next-ui/src/app/layout.tsx` with Mantine and global styles
- [x] Port `Header` and `Footer` components to Next.js
- [x] Wrap all pages in `ClientLayout`
- [x] Register service worker in layout
- [x] Confirm layout applies to all routes

### Auth Flow Migration ✅
- [x] Update backend auth routes to use secure HttpOnly cookies
- [x] Add cookie-parser middleware to Express server
- [x] Update auth middleware to read from cookies and headers
- [x] Create Next.js API routes for login/logout
- [x] Update Next.js AuthProvider to use cookie-based auth
- [x] Create Next.js middleware for route protection
- [x] Update API client to use credentials and remove token handling
- [x] Update login page to use new cookie-based flow

See [`09_migration_log.md`](09_migration_log.md) for full changelog.

---

## 🧠 Notes

- When you complete an item:
  - [x] Check it off here
  - ➕ Add it to `09_migration_log.md` with date + details
- When moving a task:
  - Backlog → Next → In Progress → Log
- Review and update this tracker at the **start and end of each work session**

> Maintained per [01_guidance.md](01_guidance.md) documentation rules.
