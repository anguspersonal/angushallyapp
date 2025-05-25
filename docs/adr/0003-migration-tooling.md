# ADR 0003: Database Migration Tooling

Date: 2025-05-25

## Status
Accepted

## Context
We needed a database migration solution that would:
- Support our multi-schema PostgreSQL architecture
- Provide consistent schema evolution across environments
- Enable reliable data seeding for development and testing
- Handle environment-specific configurations
- Integrate well with our Node.js/Express stack
- Support both up and down migrations
- Provide a clear migration history

## Decision
We will adopt Knex.js as our database migration tool because it:
- Provides a JavaScript/TypeScript-based migration system
- Supports PostgreSQL natively
- Offers a clean API for schema modifications
- Includes built-in seeding capabilities
- Handles environment-specific configurations
- Integrates well with our existing Node.js stack
- Provides transaction support for safe migrations

## Consequences
- **Pros**
  - JavaScript/TypeScript-based migrations align with our stack
  - Strong PostgreSQL support
  - Built-in seeding capabilities
  - Environment-specific configuration handling
  - Transaction support for safe migrations
  - Active community and good documentation
  - Easy integration with our Node.js ecosystem

- **Cons**
  - Additional dependency to maintain
  - Learning curve for team members new to Knex
  - Need to ensure consistent migration practices across team
  - Potential performance impact for large migrations
  - Requires careful management of migration history

## Related
- ADR 0001: Tech Stack
- ADR 0002: Database Schema Separation