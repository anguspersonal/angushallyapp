# Technical Debt Log

This document tracks known technical debt, architectural issues, and improvement opportunities within **angushallyapp**. Each item includes a description, priority, and potential resolution approach.

## Schema & Database

### Schema Maintenance
- **Description**: Database timestamps are currently managed in application code rather than using PostgreSQL triggers
- **Priority**: Medium
- **Resolution**: Add database triggers for consistent timestamp management across all tables
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Index Optimization
- **Description**: Many frequent queries lack proper indexes, particularly for foreign keys
- **Priority**: High
- **Resolution**: Add indexes for frequently joined columns and commonly filtered fields
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Connection Pool Management
- **Description**: Database connection pool settings need tuning for production workloads
- **Priority**: Medium
- **Resolution**: Analyze actual connection usage and optimize pool settings
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Normalization Review
- **Description**: Review schemas for opportunities to normalize redundant data and improve data integrity
- **Priority**: Medium
- **Resolution**: Identify and refactor redundant data patterns
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Constraint Review
- **Description**: Add any missing foreign key constraints or check constraints to enforce data rules
- **Priority**: Medium
- **Resolution**: Review all relationships and add appropriate constraints
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Soft Deletes
- **Description**: Consider implementing soft deletes for critical data where audit history is important
- **Priority**: Medium
- **Resolution**: Add `deleted_at` timestamp or `is_deleted` flag instead of hard deletes
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Standardize Query Result Access Pattern
- **Description**: Direct `.rows` access on database query results is inconsistent and error-prone
- **Priority**: Medium
- **Resolution**: Standardize query result handling across all database operations
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Unified "Person" or "Entity" Record
- **Description**: Investigate a more normalized data model with a central "Person" or "Entity" table
- **Priority**: Low
- **Resolution**: Design schema where entities like `identity.users`, "inquirers", "authors" link to a central record
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

## API Design

### Error Response Standardization
- **Description**: API error responses are inconsistent across different routes
- **Priority**: Medium
- **Resolution**: Implement standardized error format with error codes, messages, and details
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Pagination Implementation
- **Description**: Pagination is inconsistently implemented across API endpoints
- **Priority**: Medium
- **Resolution**: Create a consistent pagination middleware with offset/limit or cursor-based pagination
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Validation Middleware
- **Description**: Input validation is implemented differently across routes
- **Priority**: High
- **Resolution**: Add centralized validation middleware using a schema validation library
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### API Versioning
- **Description**: No strategy for handling API versioning for breaking changes
- **Priority**: Medium
- **Resolution**: Plan and implement a strategy for API versioning
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### API Documentation Generation
- **Description**: API documentation must be manually maintained
- **Priority**: Low
- **Resolution**: Set up a tool (Swagger/OpenAPI) to automatically generate API documentation
- **Created**: 2025-05-17  
- **Status**: 🔴 Not Started

## Authentication

### Token Refresh Mechanism
- **Description**: JWT tokens have fixed expiration with no refresh mechanism
- **Priority**: High
- **Resolution**: Implement refresh token rotation for improved security
- **Created**: 2025-05-17
- **Status**: 🟡 In Progress

### Rate Limiting
- **Description**: Auth endpoints lack rate limiting, making them vulnerable to brute force attacks
- **Priority**: High
- **Resolution**: Add rate limiting middleware for all authentication endpoints
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Session Management
- **Description**: Current implementation lacks proper session invalidation
- **Priority**: Medium
- **Resolution**: Implement session tracking and server-side invalidation capabilities
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Authentication Loading States
- **Description**: Inconsistent loading states across components that perform auth operations
- **Priority**: High
- **Resolution**: Add consistent loading spinners, disable interactive elements during auth operations
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Authentication Retry Logic
- **Description**: No retry mechanism for failed auth operations
- **Priority**: High
- **Resolution**: Implement exponential backoff, maximum retry limits, and user feedback
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### TypeScript Migration for Auth
- **Description**: Auth-related code lacks type definitions
- **Priority**: High
- **Resolution**: Add TypeScript types for auth utilities, interfaces for user/token data
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Improved Error Messages
- **Description**: Error messages for authentication failures could be more user-friendly
- **Priority**: High
- **Resolution**: Refine error messages without revealing sensitive information
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Security Event Logging
- **Description**: Lacks robust logging for security-related events
- **Priority**: High
- **Resolution**: Add comprehensive logging for security events (failed logins, token issues)
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Error Boundaries
- **Description**: Missing proper error boundaries for auth-related failures in frontend
- **Priority**: High
- **Resolution**: Implement React error boundaries for auth components
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Enhanced Token Management
- **Description**: Token management needs additional security features
- **Priority**: High
- **Resolution**: Add token blacklisting, multiple active sessions, device tracking
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Auth State Persistence
- **Description**: "Remember me" functionality needs refinement
- **Priority**: Medium
- **Resolution**: Add granular control, secure token storage alternatives, session recovery
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Auth Flow Improvements
- **Description**: Authentication flows could be enhanced with additional security
- **Priority**: Medium
- **Resolution**: Add progressive authentication, 2FA/MFA, more social login providers
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Auth Monitoring
- **Description**: Limited visibility into authentication operations
- **Priority**: Medium
- **Resolution**: Add detailed auth logging, attempt tracking, suspicious activity detection
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Normalize with identity.auth_accounts Table
- **Description**: Authentication data should be in a separate table for better normalization
- **Priority**: Medium
- **Resolution**: Create `identity.auth_accounts` table to separate auth providers from user data
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Raindrop OAuth Token Verification
- **Description**: Raindrop OAuth integration has issues with token verification on the server side
- **Priority**: High
- **Resolution**: 
  - Debug token verification in auth middleware
  - Ensure proper token format and validation
  - Add better error handling and logging
  - Consider implementing token refresh mechanism
- **Created**: 2025-05-21
- **Status**: 🟡 In Progress

## Feature-Specific Issues

### Bookmark System - Generic Content Processing Architecture Debt
- **Description**: Major architectural assumption failure - generic video/audio content processing approach proven infeasible for social media platforms
- **Priority**: Critical
- **Resolution**: 
  - ✅ **RESOLVED** - Architectural pivot to F-Series Platform-Specific Content Intelligence (2025-06-23)
  - ✅ Deprecated C1 Content Ingestion Pipeline (generic approach)
  - ✅ Designed F1-F4 platform-specific intelligence modules
  - ✅ Implemented tiered processing approach (L1-L4) with certainty scoring
  - ✅ Updated documentation across README, roadmap, and updates
  - TODO: Implement F5 certainty scoring framework
  - TODO: Build F1 Instagram intelligence module (MVP)
  - TODO: Design user experience for progressive content enhancement
- **Created**: 2025-06-23
- **Status**: 🟡 In Progress - Pivot Complete, Implementation Pending
- **Context**: 
  - Original assumption that platforms like Instagram would provide meaningful metadata via OpenGraph/generic APIs has proven false
  - Current tagging produces inaccurate results due to insufficient platform-specific intelligence
  - Platform restrictions prevent direct media access for transcription
  - New approach focuses on platform-aware metadata extraction with confidence scoring

### Bookmark System Consolidation
- **Description**: Confusion between `raindrop.bookmarks` and `bookmarks.bookmarks` tables, with unclear data flow
- **Priority**: High
- **Resolution**: 
  - Document clear data flow between schemas
  - Plan migration strategy for unified bookmark storage
  - Design bookmark categorization system
  - Implement genAI integration for automatic categorization
- **Created**: 2025-05-25
- **Status**: 🟡 In Progress

### Bookmark Source Integration
- **Description**: Current bookmark system tightly coupled to Raindrop.io
- **Priority**: Medium
- **Resolution**: 
  - Design extensible bookmark source interface
  - Implement additional bookmark sources (e.g., Pocket, Instapaper)
  - Create unified bookmark sync system
- **Created**: 2025-05-17
- **Status**: 🟡 In Progress
- **Notes**: 2025-01-27 - Improved function naming consistency with "Raindrop" prefix to prepare for multi-platform architecture. Merged bookmark service files for better organization.

### Raindrop API Error Handling
- **Description**: Missing comprehensive error handling for Raindrop API integration
- **Priority**: Medium
- **Resolution**:
  - Implement rate limiting (429) response handling with exponential backoff
  - Add revoked scope (403) detection and user notification
  - Add network timeout handling for API calls
  - Implement partial sync failure recovery mechanisms
  - Add retry logic for transient failures
- **Created**: 2025-05-31
- **Status**: 🔴 Not Started

### Habit Tracking Improvements
- **Description**: Habit tracking module lacks streak calculation and goal setting
- **Priority**: Low
- **Resolution**: Implement streak calculation logic and goal-setting capabilities
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### FSA Data Processing
- **Description**: XML parsing for FSA data is inefficient and error-prone
- **Priority**: Medium
- **Resolution**: Refactor XML processing with better error handling and validation
- **Created**: 2025-05-16
- **Status**: 🔴 Not Started

### User Interaction with FSA Data
- **Description**: No mechanism for users to save or follow specific FSA establishments
- **Priority**: Low
- **Resolution**: Add ability for users to save favorite establishments and receive updates
- **Created**: 2025-05-16
- **Status**: 🔴 Not Started

### Blog - Display Author Names
- **Description**: Author names not displayed on blog post lists
- **Priority**: Low
- **Resolution**: Implement display of author names on blog post lists and full post views
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Blog - List Pagination UI
- **Description**: No frontend pagination for blog posts
- **Priority**: Low
- **Resolution**: Implement frontend UI components to interact with pagination data
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

## Deployment & DevOps

### Production Deployment Safety
- **Description**: Production deployments lacked preflight environment consistency checks
- **Priority**: High
- **Resolution**: ✅ **RESOLVED** - Implemented `scripts/checkEnvSync.js` for comprehensive environment validation
- **Created**: 2025-12-30
- **Status**: ✅ Complete
- **Details**: 
  - Verifies database connectivity between dev and prod environments
  - Validates table existence and schema consistency
  - Compares migration versions and data freshness
  - Provides clear pass/fail output with actionable troubleshooting
  - Integrates with CI/CD pipelines via exit codes
  - Comprehensive test coverage and documentation included

### Environment Configuration Management
- **Description**: Environment configuration management needs ongoing maintenance and improvements
- **Priority**: Medium
- **Resolution**: 
  - ✅ Implemented port validation and conflict detection
  - ✅ Separated web server and database port configuration
  - ✅ Added clear error messages for configuration issues
  - ✅ Implemented same-origin API base URL fallback in frontend to avoid invalid port issues
  - TODO: Create separate configuration files for different services
  - TODO: Add comprehensive validation for all environment variables
  - TODO: Consider using a configuration management library for larger scale
- **Created**: 2025-05-19
- **Updated**: 2025-05-19
- **Status**: 🟡 Partially Complete

### Heroku Release Phase Improvements
- **Description**: Current release phase lacks proper validation and rollback mechanisms
- **Priority**: Medium 
- **Resolution**: Enhance release process with health checks and automated rollback
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Backup Strategy
- **Description**: Database backups are manual and not verified automatically
- **Priority**: High
- **Resolution**: Implement automated backup verification and restoration testing
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Documentation Automation
- **Description**: API documentation must be manually maintained
- **Priority**: Low
- **Resolution**: Implement automated API documentation generation
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### CI/CD Pipeline
- **Description**: No automated CI/CD pipeline in place
- **Priority**: Low
- **Resolution**: Set up full CI/CD pipeline for automated testing, building, and deployment
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Enhanced Deployment Strategy
- **Description**: Current deployment could be more robust
- **Priority**: Low
- **Resolution**: Implement blue-green or canary deployment strategy
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Monitoring & Alerting
- **Description**: Limited application and server monitoring
- **Priority**: Low
- **Resolution**: Implement comprehensive monitoring with alerting for critical issues
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Security Audits
- **Description**: No regular security audits in place
- **Priority**: Low
- **Resolution**: Schedule and perform regular security audits
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Dependency Management
- **Description**: No regular review of dependencies for vulnerabilities
- **Priority**: Low
- **Resolution**: Regularly review and update dependencies, use `npm audit`
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Security Headers
- **Description**: Security-related HTTP headers could be enhanced
- **Priority**: Low
- **Resolution**: Implement or enhance security headers (CSP, HSTS, X-Frame-Options)
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Node.js Update
- **Description**: Node.js version may need updating
- **Priority**: Low
- **Resolution**: Investigate and upgrade Node.js to current LTS
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Heroku Optimization - Reduce Slug Size
- **Description**: Heroku slug size could be optimized
- **Priority**: Medium
- **Resolution**: Review and optimize `.slugignore`, implement production builds
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Production Script Dependencies
- **Description**: NPM scripts should not rely on devDependencies in production environments
- **Priority**: High
- **Resolution**: 
  - Review all npm scripts that might run in production (start, prestart, postinstall, etc.)
  - Ensure they only use dependencies available in production
  - Consider moving critical build tools to dependencies if needed for production builds
  - Add documentation about which scripts are dev-only vs production-safe
- **Created**: 2025-01-27
- **Status**: 🔴 Not Started
- **Context**: Discovered when `prestart` script using `cross-env` (a devDependency) caused production crash

### Clean Up Debug Messages
- **Description**: Debug console.log statements need cleanup
- **Priority**: Medium
- **Resolution**: Remove debug logs, create better logging strategy with environment toggles
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Graceful Shutdown
- **Description**: Application should handle graceful shutdown
- **Priority**: Medium
- **Resolution**: Ensure application calls `db.end()` during shutdown (SIGINT, SIGTERM)
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

## Frontend & UI

### Component Standardization
- **Description**: UI components have inconsistent props and styling approaches
- **Priority**: Medium
- **Resolution**: Create a component library with standardized APIs
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Performance Optimization
- **Description**: Several pages have unnecessary re-renders and inefficient data fetching
- **Priority**: Medium
- **Resolution**: Implement React.memo, useMemo, and useCallback appropriately
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Component Refactoring
- **Description**: Duplicate or overly complex React components
- **Priority**: Medium
- **Resolution**: Identify and refactor components for better reusability
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### State Management Review
- **Description**: Global and local state management could be more consistent
- **Priority**: Medium
- **Resolution**: Evaluate and refine state management strategy
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### TypeScript Adoption
- **Description**: Frontend lacks type safety
- **Priority**: Medium → **High** (Upgraded based on comprehensive analysis)
- **Resolution**: Plan and incrementally adopt TypeScript
- **Created**: 2025-05-17
- **Updated**: 2025-01-27
- **Status**: � Analysis Complete - Ready for Implementation
- **Analysis**: Comprehensive migration analysis completed. Project is exceptionally well-positioned for TypeScript adoption with TypeScript already installed, modern React patterns in use, and Create React App supporting seamless migration. See `docs/typescript-migration-analysis.md` for detailed implementation plan.

### Code Splitting
- **Description**: Large bundle size impacts initial load time
- **Priority**: Medium
- **Resolution**: Implement route-based or component-based code splitting
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Bundle Optimization
- **Description**: Production build bundle could be optimized
- **Priority**: Medium
- **Resolution**: Analyze and optimize bundle size with tree shaking, lazy loading
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Caching
- **Description**: Limited browser caching for static assets and API responses
- **Priority**: Medium
- **Resolution**: Implement appropriate caching strategies
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

## Testing

### Test Coverage
- **Description**: Unit test coverage is insufficient, particularly for critical auth flows
- **Priority**: High
- **Resolution**: Add comprehensive tests for authentication and data access
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Integration Testing
- **Description**: No automated integration tests for API endpoints
- **Priority**: Medium
- **Resolution**: Implement integration test suite using Jest and Supertest
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### End-to-End Testing
- **Description**: No end-to-end tests for critical user journeys
- **Priority**: Low
- **Resolution**: Add Cypress tests for key user flows
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Test Independence
- **Description**: Testing utilities are imported in production code
- **Priority**: Medium
- **Resolution**: Restructure to avoid production code having dependencies on test files
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

## Documentation

### Comprehensive JSDoc Coverage
- **Description**: Inconsistent JSDoc documentation across codebase
- **Priority**: Low
- **Resolution**: Apply JSDoc to all backend modules, functions, classes, and types
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Algorithm Documentation
- **Description**: Complex algorithms lack clear documentation
- **Priority**: Low
- **Resolution**: Document complex algorithms and critical business logic
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

### Inline Comment Review
- **Description**: Inline comments could be improved for clarity
- **Priority**: Low
- **Resolution**: Review and improve comments for non-obvious code sections
- **Created**: 2025-05-17
- **Status**: 🔴 Not Started

## Completed Items

### Authentication
- ✅ Implement Google OAuth 2.0
- ✅ Add JWT token support
- ✅ Implement "Remember me" functionality

### Database
- ✅ Set up initial `identity` schema (`users`, `roles`, `user_roles`, `access_requests`) using Knex migrations
- ✅ Configured Knex for WSL PostgreSQL environment, resolving connection and schema issues
- ✅ Established password authentication for local PostgreSQL user
- ✅ Backfilled initial legacy user data into `identity.users` (from `habit._deprecated_users`, `public.customers`)
- ✅ Seeded initial roles for migrated active users

### Frontend
- ✅ Set up React application
- ✅ Implement basic routing
- ✅ Add Material-UI components

## How to Use This File

1. **Adding New Items:**
   * If unsure of priority, add the new technical debt item with a clear description and context.
   * During review (e.g., sprint planning), assign appropriate priority.

2. **Working on an Item:**
   * When starting work on an item, update its status to 🟡 In Progress.

3. **Updating Items:**
   * Mark items as completed (✅) when done.
   * Move completed items to the "Completed Items" section.

4. **Review Process:**
   * Review this file regularly (e.g., at the start of sprints or planning sessions).
   * Re-evaluate priorities based on current project goals, business impact, and effort.

## Authentication & Authorization

### Raindrop OAuth Flow Issues
- **Priority**: High
- **Description**: Current Raindrop OAuth implementation has issues with:
  - Environment variable synchronization between development and production
  - Inconsistent API base URL handling
  - Auth middleware and callback route confusion
  - Network connection errors affecting login functionality
- **Impact**: Users cannot reliably authenticate with Raindrop service
- **Proposed Solution**: 
  1. Review and standardize environment variable handling
  2. Implement proper error handling for OAuth flow
  3. Add comprehensive logging for debugging
  4. Create test suite for OAuth flow
- **Estimated Effort**: 2-3 days



### Bookmark Source Integration
- **Description**: Current bookmark system tightly coupled to Raindrop.io
- **Priority**: Medium
- **Resolution**: 
  - Design extensible bookmark source interface
  - Implement additional bookmark sources (e.g., Pocket, Instapaper)
  - Create unified bookmark sync system
- **Created**: 2025-05-17
- **Status**: 🟡 In Progress
- **Notes**: 2025-01-27 - Improved function naming consistency with "Raindrop" prefix to prepare for multi-platform architecture. Merged bookmark service files for better organization. 