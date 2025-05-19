# Database Documentation

This directory contains all relevant documentation and artifacts for the application's PostgreSQL database schema.

## Overview

The application utilizes a PostgreSQL database organized into several logical schemas to manage different domains of data, all unified by a central `identity` schema for user management.

Key schemas include:
- **identity**: Core user accounts, roles, and access control.
- **habit**: User-specific habit tracking data, including Strava integration.
- **crm**: Customer relationship management, primarily inquiries.
- **fsa**: Data synchronized from the Food Standards Agency.
- **content**: Blog posts, authors, and public content (moved from public schema).

## Environment-Specific Configuration

The application uses environment-specific database configurations:

### Development
- Uses local PostgreSQL instance
- Configuration via environment variables:
  - `DEV_DB_HOST`
  - `DEV_DB_PORT`
  - `DEV_DB_NAME`
  - `DEV_DB_USER`
  - `DEV_DB_PASSWORD`
- Configured in local `.env` file

### Production
- Uses Heroku PostgreSQL
- Configuration via `DATABASE_URL`
- Enhanced connection pool settings:
  - Connection timeout: 10 seconds
  - Idle timeout: 30 seconds
  - Pool size: 2-10 connections
- SSL enabled with rejectUnauthorized: false

### Search Paths
Both environments use the following search path:
```sql
['public', 'identity', 'habit', 'crm', 'fsa', 'content']
```

## Schema Definitions & Diagrams

*   **Canonical DBML (`schema.dbml`):** 
    *   [View Detailed DBML](./schema.dbml)
    *   This file is the source of truth for the database structure, including all specific constraint names, index types, and detailed column notes. It's best for in-depth understanding by developers.

*   **DBML for Visualization (`schema-dbdiagram.dbml`):**
    *   [View DBML for dbdiagram.io](./schema-dbdiagram.dbml)
    *   This is a simplified version of `schema.dbml`, optimized for generating visual ERDs using tools like dbdiagram.io. It omits some detailed nomenclature for cleaner visuals.

*   **Visual Schema Diagram (`20250512_schema-angushallyapp.png`):**
    *   [View PNG Diagram](./20250512_schema-angushallyapp.png)
    *   A visual rendering of the database schema, likely generated from `schema-dbdiagram.dbml`.

## Migrations

The database schema is managed using Knex.js migrations.
*   **Migration Files Location:** `../server/migrations/`
*   **Knex Migrations Documentation:** [View Migrations README](../server/migrations/README.md)
    *   This file explains how to run migrations, create new ones, and outlines the existing migration history and specific schema versions.

## Backup Management

Database backups should never be committed to version control. Instead:
- Use Heroku's backup commands for production:
  ```bash
  heroku pg:backups:capture
  heroku pg:backups:download
  ```
- Store backups in a dedicated `db_backups/` directory (gitignored)
- Use `.gitignore` patterns to prevent accidental commits:
  ```
  *.dump
  *.sql
  db_backups/
  ```

## Key Considerations

*   **Unified Identity:** The `identity.users` table is the central record for all users across different application features.
*   **Foreign Keys:** Domain-specific tables (e.g., `habit.habit_log`, `crm.inquiries`) should have foreign keys pointing to `identity.users.id`.
*   **Data Integrity:** Constraints and relationships are defined to ensure data consistency.
*   **Schema Organization:** Each domain has its own schema for clear separation of concerns.
*   **Connection Management:** Environment-specific connection pools with optimized settings.

# Database Setup & Migrations Guide

This document provides detailed information about database setup, migrations, and maintenance procedures for **angushallyapp**.

## Schema Organization

The application uses a multi-schema PostgreSQL database with the following structure:

| Schema      | Purpose                                               |
|-------------|-------------------------------------------------------|
| `public`    | Contains only Knex migration tables                   |
| `identity`  | Authentication and user management tables             |
| `content`   | Blog posts, authors, and other content                |
| `habit`     | Habit tracking and activity data                      |
| `crm`       | Contact form submissions and inquiry management       |
| `fsa`       | Food Standards Agency data for hygiene ratings        |

## Environment Configuration

### Development Environment

Development environment uses individual credentials defined in `server/.env`:

```env
# Database
DEV_DB_HOST=localhost
DEV_DB_NAME=your_dev_db
DEV_DB_USER=your_dev_user
DEV_DB_PASSWORD=your_dev_password
DEV_DB_PORT=5432
DEV_DB_SEARCH_PATH=public,identity,habit,crm,fsa,content

# Authentication
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional
GOOGLE_MAPS_API_KEY=your_maps_api_key
GOOGLE_MAPS_MAP_ID=your_maps_map_id
```

### Production Environment

Production environment typically uses a single `DATABASE_URL` (Heroku-style):

```env
# Database (either DATABASE_URL or individual credentials)
DATABASE_URL=your_database_url
# OR
PROD_DB_HOST=your_prod_host
PROD_DB_NAME=your_prod_db
PROD_DB_USER=your_prod_user
PROD_DB_PASSWORD=your_prod_password
PROD_DB_PORT=5432
PROD_DB_SEARCH_PATH=public,identity,habit,crm,fsa,content

# Authentication
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional
GOOGLE_MAPS_API_KEY=your_maps_api_key
GOOGLE_MAPS_MAP_ID=your_maps_map_id
```

## Database Connection Management

The application uses `knexfile.js` to manage database connections for different environments:

### Development

- Uses environment variables prefixed with `DEV_` (e.g., `DEV_DB_HOST`, `DEV_DB_NAME`, etc.) defined in `server/.env`.
- Connects to a local or WSL-based PostgreSQL instance.
- Knex commands use the `development` configuration block:
  ```bash
  npx knex migrate:latest --env development
  ```

### Production

- Typically uses a single `DATABASE_URL` environment variable (provided by Heroku or another hosting platform).
- Includes SSL configuration for secure connections:
  ```javascript
  production: {
    client: 'postgresql',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    // ... migrations, seeds
  }
  ```

## Migration Management

### Running Migrations Locally

```bash
# Run latest migrations
cd server
npx knex migrate:latest --env development

# Create a new migration
npx knex migrate:make migration_name --env development
```

### Migration Structure

Migration files are stored in `server/migrations/` and follow this pattern:

```javascript
exports.up = function(knex) {
  // Changes to be made (e.g., creating tables, adding columns)
  return knex.schema.createTable('table_name', table => {
    // Table definition
  });
};

exports.down = function(knex) {
  // How to revert changes
  return knex.schema.dropTable('table_name');
};
```

## Heroku Deployment & Migrations

### Pre-Deployment Preparation

1. **Database Backup (Critical)**
   ```bash
   heroku pg:backups:capture --app YOUR_HEROKU_APP_NAME
   heroku pg:backups:download --app YOUR_HEROKU_APP_NAME
   ```

   Verify backup integrity:
   ```bash
   pg_restore --verbose --clean --no-acl --no-owner -h localhost -U yourlocaluser -d yourlocaltempdb latest.dump
   ```

2. **Local Testing with Production Data**
   - Restore production backup to local development environment
   - Test migrations against this data to identify potential issues

3. **Configure Heroku Release Phase**
   In `Procfile` at project root:
   ```
   web: node server/index.js
   release: NODE_ENV=production npx knex migrate:latest --knexfile server/knexfile.js
   ```

### Deployment Workflow

1. **Schedule Maintenance Window**
   - Inform users of planned downtime

2. **Enable Maintenance Mode**
   ```bash
   heroku maintenance:on --app YOUR_HEROKU_APP_NAME
   ```

3. **Deploy with Migrations**
   ```bash
   git push heroku main
   ```

4. **Verify Deployment**
   - Check migration logs: `heroku logs --tail`
   - Verify database schema integrity
   - Test application functionality

5. **Disable Maintenance Mode**
   ```bash
   heroku maintenance:off --app YOUR_HEROKU_APP_NAME
   ```

## Deployment Checklist

1. **Pre-deployment Tasks:**
   - [ ] Run all tests
   - [ ] Update configurations for production domain
   - [ ] Verify environment variables
   - [ ] Backup production database

2. **Deployment Steps:**
   - [ ] Push changes to GitHub
   - [ ] Deploy to Heroku
   - [ ] Monitor migration progress
   - [ ] Verify database schema
   - [ ] Monitor for errors

3. **Post-deployment Verification:**
   - [ ] Test authentication flow
   - [ ] Verify database queries
   - [ ] Check error logs
   - [ ] Perform smoke tests of critical features

## Database Maintenance Best Practices

1. **Regular Backups**
   - Schedule automated backups through Heroku or custom scripts
   - Periodically verify backup integrity

2. **Index Optimization**
   - Monitor query performance
   - Add indexes for frequently accessed columns
   - Add foreign key indexes to improve join performance

3. **Schema Management**
   - Use database triggers for timestamps
   - Maintain consistent naming conventions
   - Document schema changes in migration files

4. **Performance Monitoring**
   - Monitor query execution time
   - Identify and optimize slow queries
   - Consider database connection pooling

## Troubleshooting Common Issues

### Migration Failures

1. **Check migration ordering**
   - Ensure migrations run in the correct sequence
   - Verify there are no circular dependencies

2. **Handle existing tables**
   - Use `createTableIfNotExists()` or check if tables exist before creating
   - For column additions, check if column exists first

3. **SSL Connection Issues**
   - Verify SSL settings in Knex configuration
   - Try different SSL options: `{ ssl: { rejectUnauthorized: false } }` or `{ sslmode: 'require' }`

### Connection Pool Errors

1. **Increase pool size for heavy load**
   ```javascript
   pool: {
     min: 2,
     max: 10
   }
   ```

2. **Implement connection timeout handling**
   ```javascript
   acquireConnectionTimeout: 10000
   ``` 