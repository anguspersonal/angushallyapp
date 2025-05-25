# ADR 0002: Database Schema Separation

Date: 2025-05-25

## Status
Accepted

## Context
We needed to organize our PostgreSQL database in a way that would:
- Provide clear domain boundaries and ownership
- Enable tighter security controls
- Support multiple teams working on different domains
- Allow for independent scaling and maintenance
- Prevent accidental cross-domain data access

## Decision
We will isolate different domains into separate PostgreSQL schemas:
- **identity**: User authentication and authorization
- **habit**: Habit tracking and related data
- **crm**: Customer relationship management
- **fsa**: Financial services and accounting
- **content**: User-generated content and media

Each schema will have its own:
- Access controls and permissions
- Migration path
- Backup strategy
- Maintenance window

## Consequences
- **Pros**
  - Clear separation of concerns
  - Granular security controls
  - Independent scaling and maintenance
  - Reduced risk of cross-domain data access
  - Better organization for multiple teams
  - Easier to implement domain-specific optimizations

- **Cons**
  - More complex database management
  - Need to handle cross-schema queries carefully
  - Additional complexity in backup and restore procedures
  - More complex migration management
  - Potential performance overhead for cross-schema operations

## Related
- ADR 0001: Tech Stack
