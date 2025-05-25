# ADR 0005: Structure API with Express Routers per Domain

Date: 2025-05-25

## Status
Accepted

## Context
We needed an API structure that would:
- Support our multi-domain architecture
- Enable independent development of different domains
- Maintain clear boundaries between domains
- Allow for domain-specific middleware and error handling
- Support scalable team organization
- Enable easier testing and maintenance
- Keep related functionality together

## Decision
We will mount each domain's routes on its own express.Router (e.g. /api/habit, /api/content), keeping modules self-contained. This means:
- Each domain gets its own router instance
- Routes are prefixed with their domain (e.g., /api/habit/*)
- Domain-specific middleware is applied at the router level
- Each domain module is responsible for its own route definitions
- Cross-domain dependencies are minimized
- Each domain can be developed and tested independently

## Consequences
- **Pros**
  - Clear separation of concerns
  - Independent development possible
  - Easier to maintain and test
  - Better code organization
  - Domain-specific middleware and error handling
  - Scalable team structure
  - Reduced coupling between domains

- **Cons**
  - Need to manage cross-domain dependencies carefully
  - Potential for code duplication
  - Need to ensure consistent patterns across domains
  - More complex initial setup
  - Need to coordinate shared middleware and utilities
  - May need to refactor if domain boundaries change

## Related
- ADR 0001: Tech Stack
- ADR 0002: Database Schema Separation
- ADR 0004: Database Access Layer