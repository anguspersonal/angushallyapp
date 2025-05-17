# Development Updates

This file tracks development progress, current status, and next steps for the project.

## Update Log (Last Updated: 17/05/2025)

1.  **Initial Identity Schema & Migrations Created (Date: e.g., 10/05/2025)**
    - Set up PostgreSQL directly in WSL.
    - Configured Knex for migrations.
    - Created `identity` schema with `users`, `roles`, `user_roles`, and `access_requests` tables.
    - Successfully ran initial migrations.

2.  **Authentication System Basic Setup (Date: e.g., 10/05/2025)**
    - Implemented Google OAuth 2.0 integration (initial version).
    - Added JWT token management (initial version).
    - Implemented "Remember me" functionality (initial version).

3.  **Habit Tracking Basic Setup (Date: e.g., 11/05/2025)**
    - Created habit logging interface (initial version).
    - Implemented data visualization (initial version).
    - Added Strava integration (initial version).

4.  **FSA Data Integration Basic Setup (Date: e.g., 11/05/2025)**
    - Implemented data synchronization (initial version).
    - Created XML parsing system (initial version).
    - Set up automated updates (initial version).

5.  **Initial Documentation (Date: e.g., 12/05/2025)**
    - Consolidated FSA data sync documentation.
    - Created module-specific READMEs.
    - Updated root README.

6.  **Legacy User Data Backfill (Date: e.g., 12/05/2025)**
    - Created and successfully ran Knex migration to populate `identity.users` from `habit._deprecated_users` and `public.customers`.
    - Seeded initial roles for migrated active users.

7.  **Phase 1c - Habit Schema FK Updates (Date: e.g., 13/05/2025)**
    - Successfully ran Knex migration `20250512213610_update_fk_habit_tables_to_identity.js` after ensuring primary user for Strava data linkage was created in `20250512170732_backfill_identity_users.js`.
    - This processed FK updates for all relevant `habit` schema tables, linking them to `identity.users`.
    - Confirmed `is_active=TRUE` default for backfilled users.
    - Refined `server/db.js` for safer identifier quoting and separated db config logic.

8.  **Phase 1c - CRM Inquiry System & Initial Public Schema Cleanup (Date: e.g., 15/05/2025)**
    - Defined and created migration for new `crm.inquiries` table with links to `identity.users`.
    - Updated `server/routes/contact.js` to use the new `crm.inquiries` table.
    - Created migration to drop legacy `public.inquiries` and `public.customers` tables.

9.  **Phase 1d - Content Schema Creation & Refactor (Blog/Authors) (Date: 16/05/2025)**
    - Created `content` schema.
    - Migrated `public.authors` and `public.posts` tables to `content.authors` and `content.posts`.
    - Refactored `content.authors` (PK to UUID linked to `identity.users.id`, timestamps updated, columns renamed).
    - Refactored `content.posts` (author_id to UUID linked to `identity.users.id`, timestamps updated, columns dropped/updated).
    - Successfully ran all related migrations.

10. **Phase 1d - Content API Route & Initial Frontend Alignment (Date: 16/05/2025)**
    - Created `server/routes/contentRoute.js` with endpoints for `/api/content/posts` and `/api/content/authors/:author_id`, using `db.query` and joining to include author names with posts.
    - Mounted `contentRoute` in `server/index.js`.
    - Updated `react-ui/src/pages/blog/fetchBlogData.js` to use the new `/api/content/...` endpoints.
    - Updated related API documentation (`content-api/README.md`, `public-api/README.md`, `migrations/README.md`).

11. **Phase 1d - FSA Schema Review (Date: 16/05/2025)**
    - Inspected live schemas for all tables in the `fsa` domain.
    - Updated `server/fsa-data-sync/README.md` and `server/migrations/README.md` with accurate live schema definitions.
    - Confirmed `fsa` schema requires no immediate schema changes for user identity integration.
    - Added a note to `TECH_DEBT.md` regarding potential future user-interaction features with FSA data.

12. **Phase 1e - Migration Fixes & Schema Stabilization (Date: 17/05/2025)**
    - Fixed migration ordering issues with user columns and roles.
    - Successfully migrated development database to match production schema.
    - Added `auth_provider`, `first_name`, `last_name`, and other columns to `identity.users`.
    - Fixed `crm.inquiries` table creation to handle existing table.
    - Fixed content schema migration to properly handle existing tables.
    - Removed redundant migration for `auth_provider`.
    - Verified all migrations work in both development and production environments.

13. **Phase 1 Final Review & Phase 2 Preparation (Date: 17/05/2025)**
    - Completed comprehensive review of all Phase 1 changes
    - Verified schema integrity across all domains
    - Confirmed successful data migrations
    - Validated API route updates
    - Identified preparation needs for Phase 2
    - Updated all documentation
    - Documented outstanding technical improvements

## Current Focus (as of 17/05/2025)

**Phase 2: Auth Integration Planning**
   - **Completed in Phase 1:**
     1. ✅ Fixed migration issues and stabilized schema across environments
     2. ✅ Verified all migrations work in both development and production
     3. ✅ Completed holistic review of Phase 1 changes
   - **Next Steps:** 
     1. Implement core authentication endpoints (`/auth/register`, `/auth/login`)
     2. Add role-based middleware and authorization
     3. Update existing routes with proper auth checks
   - *Associated Tasks from Implementation Plan:* Phase 2 tasks below

## Implementation Plan

### Phase 1: Schema & Initial Migrations (1 week) - ✅ COMPLETED
- Add `identity` schema with `users`, `roles`, `user_roles`, `access_requests` tables using Knex.

### Phase 1b: Data Migration & Seeding (Initial Backfill) - ✅ COMPLETED
- **Task:** Create Knex migration script to populate `identity.users` from `habit._deprecated_users` and `public.customers`.
    - Handled mapping of existing user IDs, emails, names, etc.
    - Set default `is_active` status for migrated users (requires final confirmation).
    - Handled basic conflict resolution for duplicate entries.
- **Task:** Create Knex seed script for `identity.user_roles` for migrated active users.
    - Assigned 'member' role to migrated active users in `identity.users`.

### Phase 1c: Update Foreign Keys & Finalize DB Setup (✅ COMPLETED)
- ✅ Configure application runtime (`server/db.js`)
- ✅ Create and run Knex migrations for all foreign key updates
  - ✅ `habit` schema: All tasks completed
  - ✅ `crm` schema: All tasks completed
  - ✅ `public_data` schema: All tasks completed (moved to `content` schema)
  - ✅ `fsa` schema: No immediate FK changes required

### Phase 1d & 1e: API Alignment, FSA Review, Final Review (✅ COMPLETED)
- ✅ `server/routes/dbRoute.js` updated for new `content` and `crm` tables
- ✅ `server/routes/contentRoute.js` created and mounted
- ✅ Frontend data fetching aligned with new content API
- ✅ All relevant READMEs updated
- ✅ FSA Schema review complete
- ✅ Migration fixes implemented and tested
- ✅ Schema stabilized across environments
- [ ] **Holistic final review of all Phase 1 changes (schema, API, data flow).**

### Phase 2: Auth Integration (Current Focus)

#### 2.1 Core Authentication (Sprint 1)
- [ ] Implement `/auth/register` endpoint
  - Email/password registration
  - Input validation
  - Email verification flow
  - Default role assignment
- [ ] Implement `/auth/login` endpoint
  - Local authentication
  - JWT issuance
  - Remember me functionality
  - Rate limiting
- [ ] Extend Google OAuth
  - Update `/auth/google` callback
  - Implement upsert into `identity.users`
  - Handle role assignment
  - Manage OAuth tokens

#### 2.2 Authorization Framework (Sprint 2)
- [ ] Implement role-based middleware
  - Create `authorize(roles...)` middleware
  - Add role verification
  - Handle unauthorized access
  - Log access attempts
- [ ] Add user activation checks
  - Verify `is_active` status
  - Handle inactive accounts
  - Implement activation flow
- [ ] Update JWT handling
  - Include roles in payload
  - Add token refresh
  - Implement token blacklisting
  - Handle token expiration

#### 2.3 Route Updates (Sprint 3)
- [ ] Update existing routes
  - Add authorization checks
  - Implement user filtering
  - Add role requirements
  - Update error handling
- [ ] Add new auth-related routes
  - Password reset
  - Email verification
  - Profile management
  - Token refresh

#### 2.4 Testing & Documentation (Sprint 4)
- [ ] Write comprehensive tests
  - Unit tests for auth logic
  - Integration tests for endpoints
  - Authorization test cases
  - Token handling tests
- [ ] Update documentation
  - API documentation
  - Auth flow diagrams
  - Example usage
  - Error handling guide

### Technical Improvements (Ongoing)
1. **Schema Maintenance**
   - Add database triggers for timestamps
   - Optimize indexes
   - Add FK indexes

2. **API Standardization**
   - Standardize error responses
   - Implement consistent pagination
   - Add validation middleware

3. **Deployment Process**
   - Enhance Heroku release phase
   - Improve backup strategy
   - Document rollback procedures

### Phase 3: Access-Request Workflow (Backlogged)
- Client form to POST /identity/access_requests.
- Admin UI (React) to list pending requests.
- Endpoints to approve/reject requests.
- Automatic role assignment on approval.

### Phase 4: RBAC Middleware & Data Guards (Backlogged)
- Build `authorize(roles…)` middleware.
- Apply to admin routes.
- Update existing routes to filter by `req.user.id`.
- Write integration tests.

### Phase 5: Frontend Changes (1-2 weeks)
- Add login/register pages
- Update JWT storage in apiClient
- Implement Auth context
- Build "Request Access" page
- Build Admin dashboard

### Phase 6: QA & Roll-out (1 week)
- End-to-end tests
- Security review
- Deployment
- Monitoring

## Development Guidelines

### Code Style
- Follow ESLint configuration defined in the project.
- Use Prettier for consistent code formatting.
- Write clear and meaningful comments for complex logic.
- **JSDoc for Backend Code:** Actively use JSDoc for all backend JavaScript modules, public functions, classes, and complex type definitions. This aids in understanding, type inference (for IDEs), and can be used for future documentation generation.
  - Example: `/** @param {string} userId - The ID of the user. */`
  - Example: `/** @returns {Promise<Array<Object>>} A promise that resolves to an array of user objects. */`
- **React Component Documentation:** Follow established patterns for documenting React components (e.g., PropTypes, comments for props and state).

### Testing
- Write unit tests for new features and bug fixes.
- Aim for reasonable test coverage for critical paths.
- Run tests locally (`npm test`) before submitting Pull Requests.
- Integration tests should cover interactions between modules/services.
- Consider E2E tests for key user flows.

### Documentation & Planning
- Keep all README files (root, module-specific, /documentation folder) up to date.
- Document new features and significant changes in the relevant READMEs.
- Include code examples where helpful.
- Update API documentation for any backend changes.
- Regularly update this DEVELOPMENT.md with current status and next steps.
- Log new issues and track progress in [Technical Debt Log](./TECH_DEBT.md).

## Development Notes

### Authentication
- Consider implementing refresh token rotation
- Add rate limiting for auth endpoints
- Implement session management

### Habit Tracking
- Add support for more habit types
- Implement habit streaks
- Add social features

### FSA Data
- Optimize XML parsing
- Implement data validation
- Add error recovery mechanisms

## Environment Setup

### Required Services
- PostgreSQL
- Redis (for caching)
- Node.js
- npm/yarn

### API Keys Needed
- Google OAuth
- Strava API
- FSA API
- Google Maps

### Database Connection Management (Development vs. Production)
- The application uses `knexfile.js` to manage database connections for different environments.
- **Development:** 
    - Typically uses environment variables prefixed with `DEV_` (e.g., `DEV_DB_HOST`, `DEV_DB_NAME`, `DEV_DB_USER`, `DEV_DB_PASSWORD`) defined in `server/.env`.
    - Connects to a local or WSL-based PostgreSQL instance.
    - Knex commands like `npx knex migrate:latest --env development` explicitly use the `development` configuration block from `knexfile.js`.
- **Production:**
    - Typically uses a single `DATABASE_URL` environment variable (e.g., provided by Heroku or another hosting platform).
    - The `



### Live database migration

Okay, using `git push heroku main` for deployments simplifies some aspects but also means we need to be very careful with how database migrations are handled, especially with breaking changes like the ones we've made.

Heroku has a mechanism for running migrations, often as part of its release phase.

**Revised Strategy for Heroku Deployment:**

**Phase 1: Pre-Deployment - Preparation & Safeguards (Mostly the same, with Heroku specifics)**

1.  **Full Production Database Backup (Critical):**
    *   Use Heroku PGBackups: `heroku pg:backups:capture --app YOUR_HEROKU_APP_NAME`
    *   Download the backup: `heroku pg:backups:download --app YOUR_HEROKU_APP_NAME`
    *   **Verify the backup:** Restore it to a local PostgreSQL instance or a different Heroku Postgres addon to confirm its integrity.
        `pg_restore --verbose --clean --no-acl --no-owner -h localhost -U yourlocaluser -d yourlocaltempdb latest.dump` (adjust for your local setup).
'm 
2.  **Review All Migrations:**
    *   Thoroughly review every migration script.
    *   **Local Testing (as Staging):** Your local environment, when pointed to a *copy* of your production data (restored from the backup), will serve as your primary staging/testing ground. Ensure all migrations run correctly against this data.

3.  **Production Knex Configuration (`server/knexfile.js`):**
    *   The `production` block in your `knexfile.js` should be configured to use `process.env.DATABASE_URL`. Heroku automatically sets this environment variable for your Postgres addon.
    *   Ensure `ssl: { rejectUnauthorized: false }` or appropriate SSL settings are in the production connection object in `knexfile.js` if your Heroku Postgres requires SSL (which it usually does). Example:
        ```javascript
        production: {
          client: 'postgresql',
          connection: {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false } // Or { sslmode: 'require' } or true depending on Heroku's SSL
          },
          // ... migrations, seeds
        }
        ```

4.  **Heroku Release Phase for Migrations:**
    *   Heroku uses a `Procfile` to define your application's processes. You can add a `release` process to this `Procfile` to run database migrations automatically whenever you deploy new code.
    *   **`Procfile` (at the root of your project):**
        ```
        web: node server/index.js  # Or whatever your web process command is
        release: NODE_ENV=production npx knex migrate:latest --knexfile server/knexfile.js
        ```
    *   When you `git push heroku main`, Heroku will first build your app, then run the `release` command (migrations), and if successful, then deploy the new `web` dynos.
    *   **Important:** If the `release` command (migrations) fails, the new version of your app will *not* be deployed, which is good as it prevents running new code against an incompletely migrated database.

5.  **Application Code Deployment Strategy (Maintenance Window Still Advised):**
    *   Because we have breaking schema changes, even with Heroku's release phase, a brief maintenance window is wise. The release phase itself can take some time if migrations are lengthy.

**Phase 2: Deployment - The Actual Migration (Heroku Flow)**

1.  **Schedule/Announce Maintenance Window (Recommended):**
    *   Inform users.

2.  **Enable Heroku Maintenance Mode (Optional but Recommended):**
    *   `heroku maintenance:on --app YOUR_HEROKU_APP_NAME`
    *   This takes your app offline and shows a maintenance page, preventing users from accessing it during the migration and new code deployment.

3.  **Commit and Push Changes:**
    *   Ensure all your migration files are committed.
    *   Ensure your application code (e.g., `server/routes/contentRoute.js`, `server/routes/dbRoute.js`, `server/index.js` with mounted route, frontend changes in `fetchBlogData.js`) is committed.
    *   `git add .`
    *   `git commit -m "Implementing content schema, refactoring posts/authors, updating APIs"`
    *   `git push heroku main`

4.  **Monitor Heroku Build and Release Phase:**
    *   `heroku logs --tail --app YOUR_HEROKU_APP_NAME`
    *   Watch the logs closely. You'll see the build process, then the `release` command (your migrations) running.
    *   **If migrations fail:**
        *   The release will fail, and Heroku will not switch to your new code. Your application will continue running the old version.
        *   Examine the logs to understand the error.
        *   You'll need to:
            *   Fix the migration script locally.
            *   Potentially run `heroku pg:reset DATABASE_URL --app YOUR_HEROKU_APP_NAME` (if the database is severely messed up and you're okay with data loss for this dev/early stage app, **BE VERY CAREFUL WITH THIS COMMAND ON A REAL PROD DB**). More likely, you'd try to connect to the DB and manually revert or fix, or restore from your backup if it's a true production scenario.
            *   If you fix a migration, commit, and push again, the release phase will re-run.
            *   For a production database, if a migration fails mid-way, you'd typically restore from the backup taken in Step 1, fix the migration, and try the deployment process again.

5.  **If Migrations Succeed:**
    *   Heroku will proceed to deploy your new application code.

**Phase 3: Post-Deployment (Heroku)**

1.  **Disable Heroku Maintenance Mode (If Enabled):**
    *   `heroku maintenance:off --app YOUR_HEROKU_APP_NAME`

2.  **Thorough Testing in Production:**
    *   Test all affected parts of your application as outlined before.
    *   Check Heroku logs (`heroku logs --tail`) for any runtime errors.

3.  **Monitor Closely.**

**Key Considerations for Heroku:**

*   **`Procfile` `release` phase is critical.** This is how Heroku automates running migrations.
*   **Test `down` migrations locally:** While the release phase only runs `up` (`migrate:latest`), if you ever need to manually roll back on Heroku (e.g., using `heroku run bash` and then running knex commands), your `down` migrations need to be reliable.
*   **Database Connection Pooling:** Heroku dynos have limited resources. Ensure your `pg` pool settings in `server/config/dbConfig.js` (or `knexfile.js` if Knex manages the pool directly for runtime) are sensible for Heroku's environment (e.g., not too many connections per dyno). Heroku's smaller plans often have connection limits on the database itself.

This Heroku-specific workflow automates the migration execution. The most important parts are still the **backup**, **thorough local/staging testing of migrations against production-like data**, and having a **correctly configured `Procfile`**.

Are you comfortable setting up or verifying the `release` phase in your `Procfile`? And have you configured the production settings in your `knexfile.js` for Heroku's `DATABASE_URL`?
