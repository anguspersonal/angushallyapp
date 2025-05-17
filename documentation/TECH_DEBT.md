# Technical Debt

This file tracks known technical debt, areas for improvement, and potential refactoring opportunities in the codebase. Items should be reviewed periodically (e.g., during sprint planning) and prioritized.

## High Priority

### Authentication
- [ ] **Token Management - Rotation**: Implement token rotation for refresh tokens to enhance security.
- [ ] **Token Management - Rate Limiting**: Add rate limiting to authentication endpoints (login, register, token refresh) to prevent brute force and denial-of-service attacks.
- [ ] **Token Management - Session Invalidation**: Implement session invalidation on critical security events like password change or detected suspicious activity.

### Authentication - Error Handling
- [ ] **Improved Messages**: Refine error messages for authentication failures to be more user-friendly without revealing too much system information.
- [ ] **Security Event Logging**: Add robust logging for security-related events (e.g., failed login attempts, token validation failures, access violations).
- [ ] **Error Boundaries**: Implement proper error boundaries in the frontend for auth-related failures.

### Database - Performance
- [ ] **Index Review**: Add missing indexes for frequently queried columns across all schemas based on application usage patterns.
- [ ] **Query Optimization**: Analyze and optimize complex or slow-running database queries, particularly those involving joins across multiple tables.
- [ ] **Caching Strategy**: Implement caching for frequently accessed, rarely changing data (e.g., user roles, configuration settings).

### Database - Schema
- [ ] **Normalization Review**: Review schemas for opportunities to normalize redundant data and improve data integrity.
- [ ] **Constraint Review**: Add any missing foreign key constraints or check constraints to enforce data rules.
- [ ] **Soft Deletes**: Consider implementing soft deletes (e.g., `deleted_at` timestamp, `is_deleted` flag) for critical data where audit history is important, instead of hard deletes.

## Medium Priority

### Frontend - Code Organization
- [ ] **Component Refactoring**: Identify and refactor duplicate or overly complex React components.
- [ ] **State Management Review**: Evaluate and potentially refine the global and local state management strategy for consistency and performance.
- [ ] **TypeScript Adoption**: Plan and incrementally adopt TypeScript for improved type safety and developer experience in the frontend.

### Frontend - Performance
- [ ] **Code Splitting**: Implement route-based or component-based code splitting to reduce initial bundle size.
- [ ] **Bundle Optimization**: Analyze and optimize the production build bundle size (e.g., tree shaking, lazy loading assets).
- [ ] **Caching**: Implement browser caching strategies for static assets and API responses where appropriate.

### Backend - API Design
- [ ] **Standardize Error Responses**: Ensure all API endpoints return error responses in a consistent, well-defined format.
- [ ] **API Versioning**: Plan and implement a strategy for API versioning if significant breaking changes are anticipated.
- [ ] **Request Validation**: Implement comprehensive request validation (body, params, query) for all API endpoints using a library like Joi or Zod.

### Backend - Testing
- [ ] **Increase Unit Test Coverage**: Improve unit test coverage for backend services and utility functions.
- [ ] **Add Integration Tests**: Develop integration tests for key API flows and interactions between services.
- [ ] **E2E Testing Strategy**: Define and begin implementing end-to-end tests for critical user journeys.

### Backend - Database Interaction (`server/db.js` Refinements)
- [ ] **Dedicated Logger**: Replace `console.log/error` in `server/db.js` with a dedicated logger (e.g., `debug` or `pino`) for better log level control and structured logging.
- [ ] **Configurable Query Retries**: Make the number of database query retries in `server/db.js` configurable via an environment variable (e.g., `DB_QUERY_MAX_RETRIES`).
- [ ] **Robust Query Retry Logic**: Refactor the `query()` function in `server/db.js` to use a loop with exponential backoff for retries instead of simple recursion, for better resilience in high-error scenarios.

### Backend - Application Lifecycle
- [ ] **Graceful Shutdown**: Ensure the application calls `db.end()` during shutdown (e.g., on `SIGINT`, `SIGTERM`) to properly close the database connection pool. (This might be High Priority depending on deployment environment).

### Database & Migrations
- [ ] **Refine Knex Configuration**: Review `knexfile.js` for environment-specific optimizations (e.g., separate debug settings for dev, production pool tuning).
- [ ] **Automated `updated_at` Timestamps**: Implement database triggers or application-level logic (e.g., Knex hooks) to automatically update `updated_at` timestamps in all relevant tables (especially `identity` schema tables).
- [ ] **Complete Legacy Data Migration**: Create and run Knex migrations to port all remaining necessary data from `_deprecated_users` and `public._deprecated_customers` into `identity.users`, including handling any data transformations or conflict resolutions.
- [ ] **Standardize Schema Creation**: Ensure all application schemas (crm, fsa, habit, public_data) are explicitly created with `CREATE SCHEMA IF NOT EXISTS` in their first relevant migration, similar to how the `identity` schema is handled.
- [ ] **Foreign Key Updates**: Complete the process of updating all foreign keys in domain tables (`habit`, `crm`, `public_data`, `fsa`) to point to `identity.users.id`.
- [ ] **Drop Deprecated Tables**: After data migration and FK updates are verified, create a migration to safely drop the old `_deprecated_users` and `_deprecated_customers` tables.

## Low Priority

### Documentation - Code & API
- [ ] **Comprehensive JSDoc Coverage (Ongoing)**: Incrementally apply JSDoc to all backend JavaScript modules, public functions, classes, and complex type definitions adhering to project standards.
- [ ] **Algorithm Documentation**: Document complex algorithms and critical business logic clearly within the codebase or related documentation.
- [ ] **Inline Comment Review**: Review and improve inline comments for clarity on non-obvious code sections.
- [ ] **API Documentation Generation**: Set up a tool (e.g., Swagger/OpenAPI with relevant plugins) to automatically generate and serve API documentation.
- [ ] **API Doc Examples**: Add example requests and responses to the API documentation.
- [ ] **Rate Limit Documentation**: Document any API rate limits in the API documentation.

### Infrastructure
- [ ] **CI/CD Pipeline**: Set up a full CI/CD pipeline for automated testing, building, and deployment.
- [ ] **Deployment Strategy**: Investigate and implement a more robust deployment strategy (e.g., blue-green, canary) for production.
- [ ] **Monitoring & Alerting**: Implement comprehensive application and server monitoring with alerting for critical issues.
- [ ] **Security Audits**: Schedule and perform regular security audits of the application and infrastructure.
- [ ] **Dependency Management**: Regularly review and update dependencies to patch vulnerabilities and stay current. Use tools like `npm audit`.
- [ ] **Security Headers**: Implement or enhance security-related HTTP headers (CSP, HSTS, X-Frame-Options, etc.).
- [ ] **Node.js Update**: Investigate and Upgrade Node.js to a current LTS or a specific target version (e.g., v11.3.0 if still relevant, otherwise latest LTS).

## Recently Added / To Be Prioritized

<!-- New items can be quickly added here before being formally prioritized -->
- [ ] **Future Architecture: Unified "Person" or "Entity" Record:**
  - Investigate a more normalized data model where a central "Person" (or even a more abstract "Entity") table serves as the ultimate golden record.
  - Entities like `identity.users` (for authenticated app users), "inquirers" (from CRM), "authors" (from content), etc., would then flow from or be linked to this central record.
  - This would provide a single source of truth for all individuals/entities interacting with the system in any capacity, improving data integrity, reducing redundancy, and enabling a holistic view. This is a long-term consideration for a more mature state of the application.
- [ ] **FSA Data - User Features:** 
  - Consider future features where users might interact with FSA data (e.g., saving favorite establishments, submitting corrections/reviews, claiming business listings).
  - This would likely require new linking tables or columns to associate `identity.users` with `fsa.establishments`, but the core FSA data itself currently has no direct user links and doesn't require schema changes for user identity integration at this stage.
- [ ] **Blog - Display Author Names:** Implement display of author names on blog post lists (snippets) and full post views once multiple authors are supported or if deemed necessary for single-author context.
- [ ] **Blog - List Pagination UI:** Implement frontend UI components (e.g., Mantine Pagination) to interact with the pagination data now provided by the `/api/content/posts` endpoint.
<!-- Example: - [ ] Investigate GraphQL for public API -->

## Completed Items

### Authentication
- ✅ Implement Google OAuth 2.0
- ✅ Add JWT token support
- ✅ Implement "Remember me" functionality

### Database
- ✅ Set up initial `identity` schema (`users`, `roles`, `user_roles`, `access_requests`) using Knex migrations.
- ✅ Configured Knex for WSL PostgreSQL environment, resolving connection and schema issues.
- ✅ Established password authentication for local PostgreSQL user.
- ✅ Backfilled initial legacy user data into `identity.users` (from `habit._deprecated_users`, `public.customers`).
- ✅ Seeded initial roles for migrated active users.

### Frontend
- ✅ Set up React application
- ✅ Implement basic routing
- ✅ Add Material-UI components

### Deprecated / Old (These might have been superceded by the items above)
- Set up initial schema (Covered by identity schema setup)
- Implement migrations (Knex is set up)
- Add basic indexes (Done for identity schema, ongoing for others)

## How to Use This File

1.  **Adding New Items:**
    *   If unsure of priority, add the new technical debt item under the "Recently Added / To Be Prioritized" section with a clear description and context.
    *   During review (e.g., sprint planning), move items from this section into the appropriate High, Medium, or Low priority sections.
2.  **Working on an Item:**
    *   When starting work on an item, you can optionally add your name or a WIP note.
3.  **Updating Items:**
    *   Mark items as completed (e.g., `✅ Task description`) when done.
    *   Add a completion date or version if useful.
    *   Periodically move completed items to the "Completed Items" section to keep the active lists focused.
4.  **Review Process:**
    *   Review this file regularly (e.g., at the start of sprints or planning sessions).
    *   Re-evaluate priorities based on current project goals, business impact, user impact, development effort, and security implications.

## Notes
- This document is a living list and should be updated as new debt is identified or existing debt is resolved.
- Prioritization is key; not all debt needs to be (or can be) addressed immediately. 