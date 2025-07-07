# Next.js Migration Plan - Solo Developer with AI


## Executive Summary

**Recommendation: Continue Incremental Next.js Migration**

Based on comprehensive analysis, the optimal approach is to **continue the incremental Next.js migration** already in progress. The foundation is excellent, and the dual-app architecture allows zero-downtime migration.

### Current Progress (Updated 2025-07-07)
- ✅ **Infrastructure**: Dual-app setup working perfectly  
- ✅ **Build Process**: Next.js builds in ~17 seconds vs CRA's slower builds  
- ✅ **TypeScript**: Comprehensive type safety configured  
- ✅ **Mantine Integration**: Full UI library compatibility  
- ✅ **Phase 1 Complete**: Foundation setup (Next.js 15.3.5, TypeScript, Mantine UI v7)
- ✅ **Phase 2 Complete**: Shared infrastructure (AuthProvider, API client, shared types)
- ✅ **Routes Migrated**: 2/18 (About page, Home page)

**Migration Pattern Established and Validated**:
1. Copy component structure from CRA to Next.js
2. Update imports (React Router → Next.js Link)
3. Create supporting components with CSS modules
4. Migrate data utilities with TypeScript
5. Test functionality at `/next/[route]`
6. Verify proxy routing through Express

---

## Technical Implementation Details

> **2025-07-07 Note:**
> - TypeScript in `react-ui` (CRA) was downgraded to 5.1.6 to resolve ESLint compatibility warnings (see `docs/03_updates.md`).
> - `next-ui` remains on TypeScript 5.8.x+ (fully supported by Next.js 15).
> - See `docs/01_guidance.md` for documentation update workflow.

### TypeScript Migration Status

**Status**: 🔄 **In Progress** - React UI TypeScript migration with comprehensive progress tracking

#### Migration Progress Overview
- ✅ **Phase 1 Complete**: TypeScript configuration and build system setup
- ✅ **Phase 2 Complete**: Core type definitions (50+ types covering all major domains)
- ✅ **Phase 3 Complete**: Core application files converted (6 files)
- ✅ **Phase 4 Complete**: All 67 files converted to TypeScript (51 JSX → TSX, 16 JS → TS)
- 🔄 **Phase 5 In Progress**: Type error resolution (531 errors remaining, 45% reduction achieved)

#### File Migration Status by Feature Area

**🔖 Bookmarks (14 files) - Priority: HIGH**
- **Status**: 🔄 In Progress - Type error resolution
- **Key Issues**: Main Bookmarks.tsx component (641 lines), complex state management
- **Dependencies**: ✅ `BookmarkCardProps`, `BookmarkData` types complete
- **Files**: All converted, type errors being resolved

**🎯 Habit Tracker (8 files) - Priority: HIGH**
- **Status**: 🔄 87.5% Complete (7/8 files error-free)
- **Key Issues**: HabitDrawer complex type issues (26 errors), onChange handlers
- **Dependencies**: ✅ `HabitLog`, `HabitType` interfaces complete
- **Files**: All converted, HabitDrawer.tsx type errors in progress

**🎮 Data-Value-Game (8 files) - Priority: MEDIUM**
- **Status**: 🔄 75% Complete (6/8 files error-free)
- **Key Issues**: Gameboard complex state management (14 errors), CTA component
- **Dependencies**: ✅ `CardState`, `Industry` interfaces complete
- **Files**: All converted, Gameboard.tsx type errors in progress

**🍽️ Eat-Safe-UK (10 files) - Priority: MEDIUM**
- **Status**: 🔄 Pending type error resolution
- **Key Issues**: Google Maps typing, need `@types/google.maps` or `@vis.gl/react-google-maps`
- **Dependencies**: `GooglePlace`, `HygieneScore` types needed
- **Files**: All converted, type errors pending resolution

**🤖 AI + Strava (6 files) - Priority: MEDIUM**
- **Status**: 🔄 Pending type error resolution
- **Key Issues**: API response interfaces, optional fields
- **Dependencies**: Strava API types, AI service interfaces
- **Files**: All converted, type errors pending resolution

**🤝 Collab Pages (6 files) - Priority: LOW**
- **Status**: 🔄 Pending type error resolution
- **Key Issues**: Mantine 7 props, slideshow item types
- **Dependencies**: `Testimonial`, `CaseStudy` interfaces
- **Files**: All converted, type errors pending resolution

**🏠 Core Pages (4 files) - Priority: HIGH**
- **Status**: 🔄 Pending type error resolution
- **Key Issues**: Main app pages, critical for user experience
- **Files**: All converted, type errors pending resolution

**🔧 Utils & Services (4 files) - Priority: MEDIUM**
- **Status**: 🔄 Pending type error resolution
- **Key Issues**: Core utility functions, service worker
- **Files**: All converted, type errors pending resolution

#### Type Error Resolution Strategy

**Current Status**: 531 TypeScript errors remaining (45% reduction achieved)
**Approach**: Feature-by-feature resolution with priority-based ordering

**Implementation Strategy**:
1. **High Priority**: Bookmarks, Habit Tracker, Core Pages
2. **Medium Priority**: Eat-Safe-UK, Data-Value-Game, AI + Strava, Utils & Services
3. **Low Priority**: Collab Pages

**ESLint Protection**: ✅ Added `@typescript-eslint/ban-ts-comment` rule to prevent new `@ts-nocheck` additions

**Git Branch Strategy**:
- **Feature branch**: `feature/typescript-migration-step-N`
- **Commit pattern**: `refactor(ts): type-safe [feature] - [description]`
- **PR strategy**: One PR per feature area for easier review

#### Component Migration Execution Progress

**Status**: 🔄 **In Progress** - Systematic component-by-component migration

**Current Progress (Updated 2025-01-27)**:
- **Components Migrated**: 3/14 (21% complete)
- **Files Fully Complete**: 2/14 (14% complete)
- **Files in Progress**: 1/14 (7% in progress)
- **TypeScript Errors Fixed**: ~50+ errors resolved
- **Mantine 7 Props Updated**: ~20+ prop migrations

**Completed Migrations**:
- ✅ **BookmarkCard.tsx** - Core component with complex props (100% complete)
- ✅ **Sidebar.tsx** - Navigation component (100% complete)
- 🔄 **ShareHandler.tsx** - Share functionality (80% complete, auth context issues remaining)

**Migration Pattern Established**:
1. Remove `@ts-nocheck` comment
2. Import types from shared type definitions
3. Fix Mantine 7 props (`spacing`→`gap`, `position`→`justify`, `weight`→`fw`)
4. Add proper component prop types
5. Type state variables and function parameters
6. Test TypeScript compilation and functionality

**Quality Assurance**:
- **Type Check**: `npm run type-check` after each component
- **Manual Testing**: Verify functionality in browser
- **Integration**: Ensure component interactions work
- **Performance**: No degradation in render performance

**Troubleshooting Common Issues**:
- **Auth Context Issues**: Verify `AuthContextType` interface for `isAuthenticated` property
- **Mantine Props**: Complete `leftIcon`→`leftSection`, remaining `spacing`→`gap`, `weight`→`fw`
- **Bookmark Type Extensions**: Add `enriched` property to `Bookmark` interface or handle optionally
- **Implicit Any Parameters**: Add explicit type annotations using shared types

**Next Priority Components**:
1. **Raindrops.tsx** - Animation component (simple, 30 minutes estimated)
2. **Bookmarks.tsx** - Main bookmarks page (complex, 2-3 hours estimated)
3. **Bookmarks.integration.test.tsx** - Integration tests (1 hour estimated)
4. **BookmarkCard.test.tsx** - Unit tests (30 minutes estimated)

**Projected Completion**:
- **Remaining 11 components**: ~7-8 hours
- **Testing & refinement**: ~2 hours
- **Total remaining**: **~10 hours** (1.5 days)

### TypeScript Configuration & Type Safety

**Status**: ✅ **Complete** - Comprehensive type safety configured for Next.js

#### Mantine Core Type Declarations
- **Location**: `next-ui/src/types/mantine.d.ts`
- **Key Features**:
  - Module augmentation for `@mantine/core` theme colors
  - Comprehensive type re-exports for application-wide access
  - Custom color palette with `MantineColorsTuple` typing
  - Navigation and component type interfaces

#### CSS Module Type Declarations
- **Location**: `next-ui/src/types/css-modules.d.ts`
- **Features**:
  - Comprehensive declarations for `.module.css`, `.module.scss`, `.module.sass`
  - Specific interfaces for component styles
  - Inline style object type definitions with readonly properties
  - Type safety for all CSS module imports

#### Build Configuration
- **TypeScript Compiler**: Strict mode enabled with zero errors
- **Path Aliases**: Configured for `@/*` imports
- **Type Roots**: Includes custom type declarations
- **Module Resolution**: Optimized for Next.js bundler
- **ESLint Integration**: All linting errors resolved

#### Verification Results
- **Build Performance**: ~17 seconds compilation time (consistent)
- **TypeScript Errors**: 0 errors in strict mode
- **ESLint Warnings**: 0 warnings
- **Bundle Size**: Optimized (About page: 43.2 kB)
- **Type Safety**: Full coverage for Mantine, CSS modules, component props

#### Best Practices Implemented
- **Type Organization**: Centralized declarations in `src/types/`
- **Module Augmentation**: Proper third-party library extensions
- **Readonly Properties**: Immutable data structures
- **Import Strategy**: Type-only imports, proper re-exports
- **Code Quality**: Comprehensive type coverage with documentation

---

## Application Analysis

### Current Architecture
- **Scale**: Medium-large React application (~66 components, 18 routes)
- **Features**: Google OAuth, Maps, Charts, PWA, Blog, Bookmarks
- **Stack**: Express backend + CRA frontend monorepo
- **Dependencies**: 40+ production dependencies, Mantine UI v7
- **TypeScript**: Core infrastructure 100% migrated

### Build Issues (CRA)
1. **Performance**: Requires `--openssl-legacy-provider` flag
2. **Build Time**: Slow compilation times
3. **Test Compilation**: TypeScript namespace issues
4. **Development**: Hot reload performance degradation

### Route Complexity Assessment

#### 🟢 Low Complexity (1-2 days each)
- **Static Pages**: About ✅, Contact, CV
- **Simple Dynamic**: Blog posts, project pages
- **Estimated**: 6 routes, 1-2 weeks total

#### 🟡 Medium Complexity (2-3 days each)
- **Interactive Features**: Projects list, forms
- **Data Fetching**: Blog index, project galleries
- **Estimated**: 6 routes, 2-3 weeks total

#### 🔴 High Complexity (3-5 days each)
- **Authentication**: Login/logout flows
- **Complex Interactive**: Habit tracker, Bookmarks, Maps
- **PWA Features**: Share handler, offline functionality
- **Estimated**: 6 routes, 3-4 weeks total

---

## Solo Developer AI Strategy

### AI Model Recommendations

| Task Type | Complexity | AI Model | Cost Tier | Rationale |
|-----------|------------|----------|-----------|-----------|
| **Boilerplate & Simple Components** | Low | Cursor Standard | $ | File moves, basic conversions |
| **Complex State & Logic** | Medium | Claude Sonnet / GPT-4o | $$ | Component refactoring, hooks |
| **Authentication & Architecture** | High | GPT-4o / Claude Opus | $$$ | Critical auth flows, SSR patterns |
| **Background Tasks** | Any | Background Agent | $ | Lint fixes, import updates |

### Cost Optimization Strategy
1. **Default to Standard** model; upgrade only for:
   - 2+ consecutive error loops
   - Architectural decisions (Auth, SSR)
   - Complex component refactors
2. **Background Agent** for grunt work:
   - Import path fixes
   - Type error resolution
   - ESLint cleanup
3. **Premium models** (15% of prompts) for:
   - Authentication logic
   - SSR/hydration issues
   - Complex state management

---

## Implementation Phases

### Phase 1: Foundation ✅ COMPLETE
- [x] Next.js 15.3.5 setup with TypeScript
- [x] Dual-app Express routing
- [x] Mantine UI v7 integration
- [x] Custom theme porting
- [x] About page migration (proof of concept)

### Phase 2: Shared Infrastructure ✅ COMPLETE
**AI Assist: Standard → Sonnet for complex types**

| Task | Duration | AI Model | Status |
|------|----------|----------|--------|
| Shared types barrel file | 0.5d | Standard | ✅ Complete |
| AuthContext → AuthProvider | 1.5d | GPT-4o | ✅ Complete |
| API client updates | 1d | Sonnet | ✅ Complete |
| Environment config sync | 1d | Standard | ✅ Complete |

**Technical Achievements:**
- **API Client**: Successfully ported from CRA to Next.js (`next-ui/src/shared/apiClient.ts`)
- **Auth Utils**: Migrated authentication utilities (`next-ui/src/shared/authUtils.ts`)
- **Type Definitions**: Created comprehensive shared types (`next-ui/src/shared/types/`)
- **AuthProvider**: Successfully converted from React Router to Next.js with SSR safety checks
- **Header Component**: Successfully migrated with full functionality and navigation handling

### Phase 3: Core Pages (1.5 weeks) 🔄 **IN PROGRESS**
**AI Assist: Standard for static, Sonnet for dynamic**

| Route | Complexity | Duration | AI Model | Status | Priority |
|-------|------------|----------|----------|--------|----------|
| `/` (Home) | Medium | 2d | Sonnet | ✅ Complete | High traffic |
| `/contact` | Low | 1d | Standard | 🔄 Next | Form handling |
| `/cv` | Low | 1d | Standard | ⏳ Pending | Static content |
| `/blog` | Medium | 2d | Sonnet | ⏳ Pending | Dynamic routing |
| `/blog/:slug` | Medium | 1.5d | Sonnet | ⏳ Pending | SSG setup |
| `/projects` | Low | 1d | Standard | ⏳ Pending | Overview page |

**Phase 3 Achievements:**
- **Home Page Migration**: Successfully migrated with full functionality preserved
  - Profile image, welcome text, latest blog/project snippets
  - Framer Motion animations working smoothly
  - Mantine UI components rendering correctly
  - TypeScript conversion with proper typing
  - Responsive design maintained
- **Supporting Components**: Created Snippet and ProjectSnippet components with CSS modules
- **Data Layer**: Migrated blog data utilities and project list data with TypeScript
- **Proxy Configuration**: Fixed Express proxy routing for seamless integration

### Phase 4: Authentication & Layout (1 week)
**AI Assist: Premium models for critical flows**

| Task | Duration | AI Model | Notes |
|------|----------|----------|-------|
| Next.js Middleware setup | 1d | GPT-4o | Protected routes |
| Login/logout flows | 2d | GPT-4o | Critical auth logic |
| Header/Footer updates | 1d | Standard | Navigation updates |
| Route protection | 1d | Sonnet | Auth guards |

### Phase 5: Interactive Projects (2 weeks)
**AI Assist: Mixed based on complexity**

| Project | Complexity | Duration | AI Model | Notes |
|---------|------------|----------|----------|-------|
| Data Value Game | Medium | 2d | Sonnet | Interactive UI |
| Eat Safe UK | High | 3d | GPT-4o | Google Maps SSR |
| Strava Dashboard | Medium | 2d | Sonnet | API integration |
| Habit Tracker | High | 3d | GPT-4o | Complex state |

### Phase 6: PWA & Advanced Features (1.5 weeks)
**AI Assist: Premium for edge cases**

| Feature | Complexity | Duration | AI Model | Notes |
|---------|------------|----------|----------|-------|
| Service Worker (next-pwa) | High | 2d | Claude Opus | PWA edge cases |
| Share Target handler | High | 2d | GPT-4o | Multipart parsing |
| Bookmarks dashboard | High | 3d | GPT-4o | Complex UI state |
| Offline functionality | Medium | 1d | Sonnet | Cache strategies |

### Phase 7: Cleanup & Deployment (3 days)
**AI Assist: Standard for cleanup tasks**

| Task | Duration | AI Model | Notes |
|------|----------|----------|-------|
| Remove CRA app | 0.5d | Standard | File cleanup |
| Update Express routing | 0.5d | Standard | Path updates |
| Production optimization | 1d | Sonnet | Performance tuning |
| Load testing | 1d | Standard | k6 script generation |

---

## Daily Solo-Dev Workflow

### Morning Focus Block (2-3 hours)
1. **Pick Priority Route** from current phase
2. **AI Strategy**: Start with Standard, upgrade if needed
3. **Migration Pattern**:
   ```
   1. Copy component to next-ui/src/app/[route]/page.tsx
   2. Update imports (React Router → Next.js)
   3. Preserve functionality (Mantine, animations)
   4. Test at /next/[route]
   5. Add Express redirect when ready
   ```

### Afternoon Background Work
1. **Queue Background Agent** for:
   - Import path fixes
   - ESLint error cleanup
   - Type error resolution
2. **Review & Test** morning's work
3. **Update Migration Log** in this document

### Evening Wrap-up
1. **Commit & Push** with descriptive messages
2. **Update Phase Progress** below
3. **Plan Next Day** priority route

---

## Risk Mitigation

### Technical Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OAuth redirect mismatch | Medium | High | Update Google Console early |
| SSR hydration issues | Low | Medium | Use dynamic imports for client-only |
| Performance regression | Low | Medium | Lighthouse monitoring |
| PWA cache conflicts | Low | Medium | Version service worker cache |

### AI Assistance Risks
| Risk | Mitigation |
|------|------------|
| Model hallucination | Always test generated code |
| Cost overrun | Monitor usage, stick to tier strategy |

---

## Migration Progress Tracker

### Completed Routes (2/18)
- ✅ `/about` - About page with full functionality
- ✅ `/` - Home page with latest content fetching

### Infrastructure Ready
- ✅ Shared types and utilities
- ✅ Authentication system
- ✅ Build pipeline optimized
- ✅ Express proxy working
- ✅ Component patterns established

### Next Priority Routes
1. **`/projects`** - Projects showcase page
2. **`/blog`** - Blog listing page  
3. **`/contact`** - Contact form page

### Success Metrics
- **Migration Speed**: Home page completed in ~2 hours
- **Functionality**: 100% feature parity with CRA version
- **Performance**: Maintained fast build times (3-4x improvement)
- **Type Safety**: Full TypeScript coverage
- **User Experience**: Zero disruption during migration

### Development Workflow Improvements
- **Cache Management**: Added development cache-busting headers to prevent stale asset issues
- **Build Process**: Integrated rebuild workflow to handle asset filename changes
- **Error Prevention**: Proactive handling of browser cache conflicts during development

---

## Documentation Consolidation

**Status**: ✅ **Consolidated** - This document now serves as the single source of truth for migration progress

**Archived Documents** (following docs/01_guidance.md):
- ❌ `MIGRATION_PROGRESS.md` (progress tracker above)
- ❌ `PHASE_3_HOME_PAGE_MIGRATION.md` (details integrated above)
- ❌ `migration-status.md` (progress tracker above)
- ❌ `typescript-migration-analysis.md` (moved to ADR 0012)
- ❌ `react-ui/STEP_3_EXECUTION_SUMMARY.md` (execution progress integrated above)
- ❌ `react-ui/STEP_3_INSTRUCTIONS.md` (implementation guide integrated above)
- ✅ `ADR 0012` (reconciled to decision record format)

**Integration with Global Docs**:
- ✅ `docs/02_roadmap.md` - Strategic positioning and timeline
- ✅ `docs/03_updates.md` - High-level decision and impact tracking
- ✅ `docs/06_tech_debt.md` - Technical debt resolution tracking

**Change History**:
- 2025-01-27: Created consolidated migration plan
- 2025-01-27: About page migration successful
- 2025-07-07: Home page migration complete
- 2025-07-07: Documentation consolidation complete
- 2025-01-27: Reconciled ADR 0012 to decision record format, integrated TypeScript progress tracking
- 2025-01-27: Integrated STEP_3 execution progress and implementation guide into migration plan

---

## References

- [TypeScript Migration ADR](../adr/0012-typescript-migration.md) - Decision to migrate to TypeScript
- [React UI TypeScript Backlog](../../react-ui/BACKLOG.md) - Detailed TypeScript migration tracking
- [Documentation Guidance](../01_guidance.md) - Project documentation standards

---

The foundation is excellent, the pattern is proven, and the path forward is clear. Continue the incremental migration with confidence! 🚀