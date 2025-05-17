# Database Documentation

This directory contains all relevant documentation and artifacts for the application's PostgreSQL database schema.

## Overview

The application utilizes a PostgreSQL database organized into several logical schemas to manage different domains of data, all unified by a central `identity` schema for user management.

Key schemas include:
- **identity**: Core user accounts, roles, and access control.
- **habit**: User-specific habit tracking data, including Strava integration.
- **crm**: Customer relationship management, primarily inquiries.
- **fsa**: Data synchronized from the Food Standards Agency.
- **public_data**: Publicly accessible content like blog posts and author information.

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

## Key Considerations

*   **Unified Identity:** The `identity.users` table is the central record for all users across different application features.
*   **Foreign Keys:** Domain-specific tables (e.g., `habit.habit_log`, `crm.inquiries`) should have foreign keys pointing to `identity.users.id`.
*   **Data Integrity:** Constraints and relationships are defined to ensure data consistency.
*   **Search Path:** The default database connection `searchPath` is configured in `server/knexfile.js` to include `public, identity, habit, crm, fsa`. 