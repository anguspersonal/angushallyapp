# ADR 0004: Database Access Layer

Date: 2025-05-25

## Status
Accepted

## Context
We needed a database access layer that would:
- Provide a secure and controlled way to interact with our multi-schema database
- Prevent accidental access to unauthorized tables or columns
- Handle connection pooling efficiently
- Implement automatic retry logic for transient failures
- Maintain consistent query patterns across the application
- Support our security requirements for data access
- Integrate with our Node.js/Express stack

## Decision
We will implement a custom `db.js` wrapper over `pg.Pool` that provides:
- Enforced allowed-table/column lists for security
- Automatic connection pooling management
- Built-in retry logic for transient failures
- Consistent query interface
- Type safety where possible
- Transaction support
- Query logging and monitoring capabilities

## Consequences
- **Pros**
  - Enhanced security through access control
  - Consistent database access patterns
  - Better error handling and recovery
  - Improved connection management
  - Centralized query logging and monitoring
  - Easier to implement cross-cutting concerns
  - Simplified database access for application code

- **Cons**
  - Additional abstraction layer to maintain
  - Need to keep allowed-table/column lists up to date
  - Potential performance overhead from the wrapper
  - Learning curve for new team members
  - Need to ensure the wrapper keeps up with pg.Pool updates
  - Additional testing requirements

## Related
- ADR 0001: Tech Stack
- ADR 0002: Database Schema Separation
- ADR 0003: Migration Tooling