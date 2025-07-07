# ADR 0013: Next.js Migration from Create React App

**Status**: Accepted  
**Date**: 2025-07-07  
**Deciders**: Development Team  

## Context

The application was using Create React App (CRA) for the frontend, which was experiencing significant technical debt and performance issues:

- **Build Performance**: CRA builds were slow and required `--openssl-legacy-provider` flag
- **Deprecation Concerns**: CRA is approaching end-of-life with limited future support
- **SEO Limitations**: Client-side rendering limits search engine optimization
- **Development Experience**: Hot reload performance degradation and slower development cycles
- **Modern Architecture**: Missing server-side rendering, App Router, and modern React patterns

The application had already completed a comprehensive TypeScript migration (ADR 0012) with 100% type safety, providing an excellent foundation for the Next.js migration.

## Decision

**Migrate from Create React App to Next.js 15.3.5** using an incremental migration approach with dual-app architecture.

### Migration Strategy
1. **Phase 1**: Foundation Setup (Next.js 15.3.5, TypeScript, Mantine UI v7)
2. **Phase 2**: Shared Infrastructure (AuthProvider, API client, shared types)
3. **Phase 3**: Core Pages Migration (route-by-route with dual-app architecture)
4. **Phase 4**: Authentication & Layout Integration
5. **Phase 5**: Interactive Projects Migration
6. **Phase 6**: PWA & Advanced Features
7. **Phase 7**: Cleanup & Deployment

### Implementation Approach
- **Incremental Migration**: Route-by-route migration with zero downtime
- **Dual-App Architecture**: Both CRA and Next.js running simultaneously during migration
- **Express Proxy Routing**: Seamless integration with existing backend
- **TypeScript Foundation**: Leverage existing 100% TypeScript coverage
- **Mantine UI Compatibility**: Maintain existing UI library integration

## Consequences

### Positive
- **Performance**: 3-4x faster build times (~17 seconds vs CRA)
- **SEO Ready**: Server-side rendering capabilities for improved search visibility
- **Modern Architecture**: App Router, Server Components, enhanced developer experience
- **Future-Proof**: Aligned with React ecosystem direction and best practices
- **Zero Downtime**: Incremental migration allows continuous feature development
- **Type Safety**: Maintains existing 100% TypeScript coverage
- **Developer Experience**: Enhanced tooling, faster development cycles, better debugging

### Negative
- **Development Time**: 6-8 weeks of focused migration effort
- **Learning Curve**: Team needs to adapt to Next.js patterns and App Router
- **Initial Setup**: Time to establish dual-app architecture and proxy routing
- **Temporary Focus**: Migration takes priority over new feature development

### Neutral
- **Backend Integration**: No changes required to Express backend
- **Database**: No impact on PostgreSQL database or schemas
- **Authentication**: Google OAuth flow remains unchanged
- **API Endpoints**: All existing API routes continue to work

## Technical Details

### Application Complexity
- **Scale**: Medium-large React application (~66 components, 18 routes)
- **Features**: Google OAuth, Maps, Charts, PWA, Blog, Bookmarks, Habit Tracker
- **Stack**: Express backend + CRA frontend monorepo
- **Dependencies**: 40+ production dependencies, Mantine UI v7
- **TypeScript**: Core infrastructure 100% migrated (ADR 0012)

### Migration Pattern Established
1. Copy component structure from CRA to Next.js
2. Update imports (React Router → Next.js Link)
3. Create supporting components with CSS modules
4. Migrate data utilities with TypeScript
5. Test functionality at `/next/[route]`
6. Verify proxy routing through Express

### Current Progress (2025-07-07)
- ✅ **Phase 1 Complete**: Foundation setup (Next.js 15.3.5, TypeScript, Mantine UI v7)
- ✅ **Phase 2 Complete**: Shared infrastructure (AuthProvider, API client, shared types)
- ✅ **Routes Migrated**: 2/18 (About page, Home page)
- ✅ **Build Performance**: 3-4x faster builds (~17 seconds vs CRA)
- ✅ **Type Safety**: 100% TypeScript coverage with strict mode
- ✅ **Dual App Architecture**: Both CRA and Next.js running simultaneously

### Technical Achievements
- **Infrastructure**: Dual-app setup with Express proxy routing working seamlessly
- **Authentication**: AuthProvider successfully migrated with SSR safety checks
- **Components**: Header, About, Home pages with full functionality preserved
- **Performance**: Optimized bundle sizes and significantly improved build times
- **Integration**: Seamless Mantine UI and Framer Motion compatibility maintained

### Risk Mitigation
- **Proven Pattern**: Established migration process validated with About and Home pages
- **Rollback Safety**: Can revert individual routes if needed
- **Comprehensive Testing**: Each route tested independently before deployment
- **Express Integration**: Seamless backend communication maintained

## Related ADRs
- ADR 0001: Tech Stack (React, Express, PostgreSQL)
- ADR 0007: Auth Strategy (Google OAuth + JWT)
- ADR 0010: Environment Configuration Management
- ADR 0012: TypeScript Migration for React UI

## References
- [Next.js Migration Plan](../09_nextjs_migration_plan.md) - Comprehensive migration implementation plan
- [Documentation Guidance](../01_guidance.md) - Project documentation standards
- [TypeScript Migration ADR](./0012-typescript-migration.md) - Foundation TypeScript migration 