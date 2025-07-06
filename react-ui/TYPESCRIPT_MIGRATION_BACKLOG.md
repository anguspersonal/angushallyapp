# TypeScript Migration Backlog (Option B)

## Overview
This document tracks the comprehensive TypeScript migration to remove all `@ts-nocheck` comments and restore full type safety across the codebase.

**Total Files to Migrate**: 53 files  
**Estimated Effort**: 3-4 dev-days  
**Current Status**: ✅ Step 2 Complete - Shared Types Established

---

## Progress Tracking

### Overall Progress: 0/53 files completed (0%)

| Feature Area | Files | Status | Estimated Time |
|-------------|-------|--------|---------------|
| **Bookmarks** | 14 | 🔄 Pending | ~1 day |
| **Eat-Safe-UK** | 10 | 🔄 Pending | ~0.5 day |
| **Habit Tracker** | 8 | 🔄 Pending | ~0.5 day |
| **Data-Value-Game** | 8 | 🔄 Pending | ~0.5 day |
| **AI + Strava** | 6 | 🔄 Pending | ~0.5 day |
| **Collab Pages** | 6 | 🔄 Pending | ~0.5 day |
| **Core Pages** | 4 | 🔄 Pending | ~0.25 day |
| **Utils & Services** | 4 | 🔄 Pending | ~0.25 day |

---

## Detailed File Tracking

### 🔖 Bookmarks (14 files) - Priority: HIGH
**Status**: 🔄 Pending  
**Key Issues**: Mantine 7 props (`spacing`→`gap`, `position`→`justify`), missing test mocks  
**Dependencies**: `BookmarkCardProps`, `BookmarkData` types needed

- [ ] `src/pages/projects/bookmarks/Bookmarks.tsx`
- [ ] `src/pages/projects/bookmarks/BookmarkCard.tsx`
- [ ] `src/pages/projects/bookmarks/components/sidebar.tsx`
- [ ] `src/pages/projects/bookmarks/ShareHandler.tsx`
- [ ] `src/pages/projects/bookmarks/Raindrops.tsx`
- [ ] `src/pages/projects/bookmarks/Bookmarks.integration.test.tsx`
- [ ] `src/pages/projects/bookmarks/components/BookmarkCard.test.tsx`

### 🍽️ Eat-Safe-UK (10 files) - Priority: MEDIUM
**Status**: 🔄 Pending  
**Key Issues**: Google Maps typing, need `@types/google.maps` or switch to `@vis.gl/react-google-maps`  
**Dependencies**: `GooglePlace`, `HygieneScore` types needed

- [ ] `src/pages/projects/eat-safe-uk/EatSafeUK.tsx`
- [ ] `src/pages/projects/eat-safe-uk/GMapView.tsx`
- [ ] `src/pages/projects/eat-safe-uk/GMapsSearchBar.tsx`
- [ ] `src/pages/projects/eat-safe-uk/Markers.tsx`
- [ ] `src/pages/projects/eat-safe-uk/NearbySearchButton.tsx`
- [ ] `src/pages/projects/eat-safe-uk/utils/askUserLocation.ts`
- [ ] `src/pages/projects/eat-safe-uk/utils/fetchHygieneScores.ts`
- [ ] `src/pages/projects/eat-safe-uk/utils/getDynamicPlaceholder.ts`
- [ ] `src/pages/projects/eat-safe-uk/utils/markerTestPlaces.ts`
- [ ] `src/pages/projects/eat-safe-uk/utils/nearbySearch.ts`

### 🎯 Habit Tracker (8 files) - Priority: HIGH
**Status**: 🔄 Pending  
**Key Issues**: `HabitLog`, `HabitType` enums, `aggregateService.ts` returns  
**Dependencies**: `HabitLog`, `HabitType` interfaces needed

- [ ] `src/pages/projects/habit/Habit.tsx`
- [ ] `src/pages/projects/habit/HabitCombobox.tsx`
- [ ] `src/pages/projects/habit/HabitDrawer.tsx`
- [ ] `src/pages/projects/habit/HabitHeader.tsx`
- [ ] `src/pages/projects/habit/HabitLogTable.tsx`
- [ ] `src/pages/projects/habit/HabitTile.tsx`
- [ ] `src/pages/projects/habit/aggregateService.ts`
- [ ] `src/pages/projects/habit/habit.ts`

### 🎮 Data-Value-Game (8 files) - Priority: MEDIUM
**Status**: 🔄 Pending  
**Key Issues**: Card state types, custom hooks like `useLabeledState<T>()`  
**Dependencies**: `CardState`, `Industry` interfaces needed

- [ ] `src/pages/projects/data-value-game/DataValueGame.tsx`
- [ ] `src/pages/projects/data-value-game/Card.tsx`
- [ ] `src/pages/projects/data-value-game/CTA-GuessAutomotive.tsx`
- [ ] `src/pages/projects/data-value-game/DVGFooter.tsx`
- [ ] `src/pages/projects/data-value-game/DVGHeader.tsx`
- [ ] `src/pages/projects/data-value-game/Gameboard.tsx`
- [ ] `src/pages/projects/data-value-game/Lose.tsx`
- [ ] `src/pages/projects/data-value-game/Welcome.tsx`
- [ ] `src/pages/projects/data-value-game/Win.tsx`

### 🤖 AI + Strava (6 files) - Priority: MEDIUM
**Status**: 🔄 Pending  
**Key Issues**: API response interfaces, optional fields  
**Dependencies**: Strava API types, AI service interfaces

- [ ] `src/pages/projects/ai/AI.tsx`
- [ ] `src/pages/projects/ai/AIProjects.tsx`
- [ ] `src/pages/projects/ai/Instapaper.tsx`
- [ ] `src/pages/projects/ai/TextAnalysisAI.tsx`
- [ ] `src/pages/projects/ai/ai.ts`
- [ ] `src/pages/projects/strava/Strava.tsx`
- [ ] `src/pages/projects/strava/setupStrava.ts`
- [ ] `src/pages/projects/strava/stravaDataService.ts`
- [ ] `src/pages/projects/strava/test.ts`

### 🤝 Collab Pages (6 files) - Priority: LOW
**Status**: 🔄 Pending  
**Key Issues**: Mantine 7 props, slideshow item types  
**Dependencies**: `Testimonial`, `CaseStudy` interfaces

- [ ] `src/pages/Collab.tsx`
- [ ] `src/pages/collab/components/Carousel.tsx`
- [ ] `src/pages/collab/components/CaseStudySlide.tsx`
- [ ] `src/pages/collab/components/FounderJourney.tsx`
- [ ] `src/pages/collab/components/TestimonialSlide.tsx`
- [ ] `src/pages/collab/components/TraitGrid.tsx`

### 🏠 Core Pages (4 files) - Priority: HIGH
**Status**: 🔄 Pending  
**Key Issues**: Main app pages, critical for user experience

- [ ] `src/pages/Home.tsx`
- [ ] `src/pages/Login.tsx`
- [ ] `src/pages/SoftwareCV.tsx`

### 🔧 Utils & Services (4 files) - Priority: MEDIUM
**Status**: 🔄 Pending  
**Key Issues**: Core utility functions, service worker

- [ ] `src/serviceWorker.ts`
- [ ] `src/theme.ts`
- [ ] `src/utils/calculateUnits.ts`
- [ ] `src/utils/checkValueTypeFrntEnd.ts`

---

## Implementation Strategy

### Phase 1: Foundation (Step 2)
1. **Create shared types** in `/src/types/common.ts`
2. **Essential interfaces**: `Bookmark`, `HabitLog`, `GooglePlace`, etc.

### Phase 2: High Priority Features
1. **Bookmarks** (most complex, many tests)
2. **Habit Tracker** (core functionality)
3. **Core Pages** (user-facing)

### Phase 3: Medium Priority Features
1. **Eat-Safe-UK** (Google Maps complexity)
2. **Data-Value-Game** (custom hooks)
3. **AI + Strava** (API integrations)

### Phase 4: Final Cleanup
1. **Collab Pages** (less critical)
2. **Utils & Services** (foundational)

---

## Next Steps

### ✅ Step 1: Enable Per-File Tracking (COMPLETED)
- [x] Create this backlog file
- [x] Add ESLint rule to prevent new `@ts-nocheck`
- [x] Organize files by feature area

### ✅ Step 2: Establish Shared Types (COMPLETED)
- [x] Create `/src/types/common.ts` with comprehensive type definitions
- [x] Define essential interfaces: `Bookmark`, `HabitLog`, `GooglePlace`, `Industry`, etc.
- [x] Export reusable types for tests and components
- [x] Include AI, Strava, Collaboration, and UI types
- [x] Add utility types and custom hooks interfaces

### 🔄 Step 3: Begin Feature Migration
- [ ] Start with Bookmarks (highest complexity)
- [ ] Remove `@ts-nocheck` one file at a time
- [ ] Fix Mantine 7 props and TypeScript errors
- [ ] Update tests with proper mocks

---

## ESLint Protection
✅ Added `@typescript-eslint/ban-ts-comment` rule to prevent new `@ts-nocheck` additions

## Git Branch Strategy
- **Feature branch**: `feature/typescript-migration-step-N`
- **Commit pattern**: `refactor(ts): type-safe [feature] - [description]`
- **PR strategy**: One PR per feature area for easier review

---

*Last updated: [Current Date]*
*Progress tracking: This file should be updated as files are migrated*