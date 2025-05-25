# ADR 0011: PostgreSQL Search Path Configuration in Environment Variables

Date: 2024-03-19

## Status
Accepted

## Context
We have a multi-schema PostgreSQL database architecture (as documented in ADR-0002) with schemas for different domains:
- identity
- habit
- crm
- fsa
- content
- raindrop

We needed a way to:
- Configure the search path consistently across all environments
- Ensure applications connect to the correct schemas
- Maintain schema separation while allowing cross-schema queries
- Keep the configuration flexible and environment-specific
- Support our database access layer (ADR-0004)

## Decision
We will configure the PostgreSQL search path through the `DB_SEARCH_PATH` environment variable in our `.env` files. This variable will:
- Be defined in the root `.env` files (as per ADR-0010)
- List all schemas in the correct order of precedence
- Be used by our database access layer to set the search path on connection
- Be consistent across all environments
- Be documented in `.env.example`

Example configuration:
```env
DB_SEARCH_PATH=public,identity,habit,crm,fsa,content,raindrop
```

## Consequences
- **Pros**
  - Centralized configuration of schema access
  - Consistent behavior across environments
  - Easy to modify schema precedence
  - Clear documentation of available schemas
  - Follows environment configuration patterns (ADR-0010)
  - Supports our database access layer design (ADR-0004)
  - Makes schema management more maintainable

- **Cons**
  - Need to ensure all environments have correct search path
  - Potential for confusion if search path differs between environments
  - Need to maintain search path when adding new schemas
  - Requires coordination with database access layer
  - May need to handle search path changes in migrations

## Related
- ADR-0002: Database Schema Separation
- ADR-0004: Database Access Layer
- ADR-0010: Environment Configuration Management 