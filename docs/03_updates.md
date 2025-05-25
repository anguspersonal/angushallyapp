# Development Updates

This file tracks chronological changes to the project, with the most recent updates at the top.

## [Unreleased] – Current

### Heroku Deployment Fix - 2025-01-27
- **Bug Fix**: Resolved production deployment crash caused by `prestart` script
  - Problem: `prestart` script was using `cross-env` which is a devDependency not available in production
  - Solution: Removed `prestart` script from package.json
  - Heroku only installs production dependencies, not devDependencies
  - App is now successfully running on Heroku (release v136)
- **Environment Variable Loading**: Fixed issues with environment configuration
  - Updated `config/env.js` to properly handle `DATABASE_URL` parsing
  - Made database migration script idempotent to handle existing tables
  - Added proper `start` script for Heroku deployment
- **Deployment Status**: Application is now live and running correctly on production

### Raindrop Authentication Issues - 2025-05-24
- Identified issues with Raindrop OAuth flow:
  - Network connection errors affecting login functionality
  - Confusion between auth middleware routes and callbacks
  - Environment variable inconsistencies between prod and dev
  - Need to review and fix environment variable sync process
  - Will continue debugging tomorrow with focus on:
    - Verifying environment variable propagation
    - Checking auth middleware implementation
    - Testing OAuth callback flow
    - Ensuring consistent API base URLs

### Raindrop OAuth Integration - 2025-05-21
- Attempted to fix authentication issues with Raindrop OAuth integration:
  - Updated AuthContext to include token in context value
  - Modified getStoredUser to include token in user object
  - Updated Raindrop component to properly configure axios with token
  - Issue persists with token verification on server side
  - Will continue debugging tomorrow

### Test Suite Improvements - 2025-05-20
- Enhanced test suite reliability and coverage:
  - Fixed foreign key constraint issues in bookmark and habit tests
  - Added proper test user setup with UUID matching migrations
  - Implemented proper mocking of checkValueType utility
  - Improved test cleanup and database connection handling
  - Added Jest configuration for better async operation handling
  - Fixed undefined user ID issues in habit logging tests
  - Standardized test environment setup across all test suites

### Instapaper API - 2025-05-20
- Began work on instapaper api

### Mantine Layout Standardization - 2025-05-20
- Standardized layout hierarchy across all JSX files following Mantine best practices:
  - Root level: `Box > Container` for page structure
  - Component level: `Container > Box` for:
    - Animation wrappers (motion.div)
    - Layout control (flex, grid, positioning)
    - Component grouping
    - Style application
  - Background sections: `Box > Container > content` for full-width colored backgrounds
- Updated affected components:
  - Fixed AI.jsx header width issues
  - Refactored Collab.jsx layout structure
  - Verified consistency across Blog, Home, About, and Projects pages

### Development Workflow Improvement - 2025-05-19
- Added dedicated scripts for separate backend and frontend development:
  - `npm run server`: Starts only the Node backend with nodemon for auto-reloading
  - `npm run client`: Starts only the React frontend
- Refactored `npm run dev` to use concurrently for running both services simultaneously
- Improved robustness of development workflow with explicit server and client scripts


### Experimental AI Integration - 2025-05-19
- Added experimental AI text analysis feature using OpenAI's GPT model
- Created frontend interface for text input and analysis display
- Implemented backend API integration with OpenAI
- Note: This is a temporary detour from the main authentication implementation

### Frontend API Base URL & Environment Sync Fix – 2025-05-19
#### API Endpoint Resolution
- Added defensive fallback in `react-ui/src/utils/apiClient.js` to use `'/api'` when `REACT_APP_API_BASE_URL` is missing or invalid
- Ensures frontend always targets same-origin backend, relying on CRA proxy in development
- Resolved `http://localhost:undefined/...` fetch error caused by stray shell variables

#### Environment Configuration
- Enhanced `scripts/sync-env.js` documentation/comments to clarify automatic generation of React `.env.*` files
- Added guidance on unsetting stray shell variables that override `.env` values
- Fixed AI text analysis connection issues by ensuring proper server availability

#### Server Configuration
- Implemented robust port configuration system in config/env.js
- Added port validation and conflict detection
- Enforced explicit port separation between web server (5000) and database (5432)
- Added clear error messages for port conflicts
- Updated environment configuration documentation
- Fixed initial issue where Express server was incorrectly using PostgreSQL port
- Resolved environment synchronization problems that prevented API requests from reaching the server



### Phase 2: Auth Integration Implementation 

#### 🚧 Next Steps
- Implement session management
- Deploy changes to production
- Update existing routes:
  - Add authorization checks
  - Implement user filtering
  - Add role requirements
  - Update error handling

#### ✅ Completed
- ✅ Complete Google OAuth integration with:
  - Frontend Google Sign-In implementation
  - Backend token verification
  - User creation and updates
  - Role assignment
  - Error handling
- ✅ Extended JWT token expiry to 1 week
- ✅ Centralized configuration management
- ✅ Core authentication endpoints
- ✅ Enhanced middleware with role-based auth
- ✅ Google Sign-In integration
- ✅ Authentication error handling
- ✅ Fixed Google OAuth Integration:
  - Resolved duplicate user issues in database
  - Improved error handling in `authRoute.js`
  - Enhanced Google Sign-In button configuration
  - Added proper CORS and security headers
- ✅ Enhanced Authentication Flow:
  - Added graceful handling of verification errors
  - Improved token management
  - Added better error messages for users
  - Updated AuthContext to handle auth states better

## Phase 1 Schema Migration – 2025-05-17 ✅

### Major Changes
- ✅ Fixed deployment issues with Heroku slug size:
  - Removed database dumps from version control
  - Updated .gitignore to prevent future commits of dumps
- ✅ Fixed content schema migration issues:
  - Rewritten migration to explicitly handle table creation and data copying
  - Successfully moved blog data from public to content schema
  - Verified schema integrity across all domains
- ✅ Current Schema Status:
  - `public`: Contains only Knex migration tables
  - `content`: Successfully holds authors and posts tables
  - `habit`: Retains all habit tracking tables
  - `identity`: Contains user authentication tables
  - `crm`: Contains inquiry management tables
- ✅ Deployment Status:
  - All migrations successfully applied
  - Application running on Heroku
  - Database schemas verified in production

## Phase 1 Final Review & Phase 2 Preparation – 2025-05-17 ✅

### Major Changes
- ✅ Completed comprehensive review of all Phase 1 changes
- ✅ Verified schema integrity across all domains
- ✅ Confirmed successful data migrations
- ✅ Validated API route updates
- ✅ Identified preparation needs for Phase 2
- ✅ Updated all documentation
- ✅ Documented outstanding technical improvements

## Migration Fixes & Schema Stabilization – 2025-05-17 ✅

### Major Changes
- ✅ Fixed migration ordering issues with user columns and roles
- ✅ Successfully migrated development database to match production schema
- ✅ Added `auth_provider`, `first_name`, `last_name`, and other columns to `identity.users`
- ✅ Fixed `crm.inquiries` table creation to handle existing table
- ✅ Fixed content schema migration to properly handle existing tables
- ✅ Removed redundant migration for `auth_provider`
- ✅ Verified all migrations work in both development and production environments

## FSA Schema Review – 2025-05-16 ✅

### Major Changes
- ✅ Inspected live schemas for all tables in the `fsa` domain
- ✅ Updated `server/fsa-data-sync/README.md` and `server/migrations/README.md` with accurate schema definitions
- ✅ Confirmed `fsa` schema requires no immediate schema changes for user identity integration
- ✅ Added note to `TECH_DEBT.md` regarding potential future user-interaction features with FSA data

## Content API Route & Frontend Alignment – 2025-05-16 ✅

### Major Changes
- ✅ Created `server/routes/contentRoute.js` with endpoints for `/api/content/posts` and `/api/content/authors/:author_id`
- ✅ Mounted `contentRoute` in `server/index.js`
- ✅ Updated `react-ui/src/pages/blog/fetchBlogData.js` to use the new `/api/content/...` endpoints
- ✅ Updated related API documentation (content-api/README.md, public-api/README.md, migrations/README.md)

## Content Schema Creation & Refactor – 2025-05-16 ✅

### Major Changes
- ✅ Created `content` schema
- ✅ Migrated `public.authors` and `public.posts` tables to `content.authors` and `content.posts`
- ✅ Refactored `content.authors` (PK to UUID linked to `identity.users.id`, timestamps updated, columns renamed)
- ✅ Refactored `content.posts` (author_id to UUID linked to `identity.users.id`, timestamps updated, columns dropped/updated)
- ✅ Successfully ran all related migrations

## CRM Inquiry System & Schema Cleanup – 2025-05-15 ✅

### Major Changes
- ✅ Defined and created migration for new `crm.inquiries` table with links to `identity.users`
- ✅ Updated `server/routes/contact.js` to use the new `crm.inquiries` table
- ✅ Created migration to drop legacy `

### Raindrop Connection UI Fix - 2025-01-27
- Fixed issue where "Connect Raindrop" button wasn't appearing:
  - Problem: Test tokens in database caused verify endpoint to return `isConnected: true`
  - Solution: Created `scripts/clear-raindrop-tokens.js` utility to remove test tokens
  - The UI correctly shows "Connect Raindrop" when no valid tokens exist
  - The verify endpoint checks for token existence, not validity (by design)
- Note: If you see "Sync Bookmarks" instead of "Connect Raindrop", run:
  ```bash
  node scripts/clear-raindrop-tokens.js <user-id>
  ```
- Created database migration for raindrop schema:
  - Added `raindrop.bookmarks` table for storing synced bookmarks
  - Added `raindrop.collections` table for future collection support
  - Migration handles existing `raindrop.tokens` table gracefully
- Updated documentation:
  - Added raindrop schema to `docs/04_schema.md`
  - Updated database documentation in `docs/05_database.md`
- Organized test files according to project structure:
  - Moved `insert_test_tokens.js` and `test_raindrop_sync.js` to `server/tests/`
- Created `scripts/check-raindrop-bookmarks.js` utility for debugging bookmark sync issues
- **Next steps for user**: Click "Sync Bookmarks" button in the UI to fetch bookmarks from Raindrop

## 2025-01-27

### Feature Work
- **Raindrop.io Integration** - Successfully implemented and debugged bookmark syncing functionality
  - Fixed API endpoint issue - was using incorrect endpoint for fetching bookmarks
  - Changed from iterating through collections to using collection ID 0 (all bookmarks)
  - Fixed database query result handling in `saveBookmarks.js`
  - Added comprehensive error logging and debugging
  - Successfully synced 3 bookmarks from user's Raindrop account
  - Frontend now properly displays synced bookmarks with title, link, and tags

### Bug Fixes
- Fixed Raindrop API endpoint from `/rest/v1/raindrops/{collectionId}` (was missing the 's')
- Fixed `saveBookmarks` function to use `result.rows[0]` instead of `result[0]`
- Added proper error handling and state management in React component
- Added debug logging to help diagnose display issues

### Technical Details
- Created test script `scripts/test-raindrop-sync.js` for manual testing
- Verified OAuth flow, token storage, and API communication all working correctly
- Database schema properly stores bookmarks with user association

### Next Steps
- Consider adding pagination for large bookmark collections
- Add bookmark search/filter functionality
- Implement bookmark categories/collections display
- Add ability to delete bookmarks from the UI