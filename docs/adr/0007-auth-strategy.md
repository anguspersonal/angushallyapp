# ADR 0007: Authentication Strategy: Google OAuth 2.0 + JWT

Date: 2025-05-25

## Status
Accepted

## Context
We needed an authentication strategy that would:
- Provide secure and reliable user authentication
- Support single sign-on capabilities
- Enable stateless session management
- Allow for role-based access control
- Integrate with existing Google accounts
- Support mobile and web clients
- Maintain security best practices

## Decision
We will combine Google OAuth for login with JWTs for session tokens, specifically:
- Use Google OAuth 2.0 for initial authentication
- Generate JWTs for session management
- Enrich JWT middleware with role lookup
- Implement fallback to Google ID tokens
- Store minimal user data in JWTs
- Use secure token storage and transmission
- Implement proper token refresh mechanisms

## Consequences
- **Pros**
  - Leverages Google's secure authentication
  - Stateless session management
  - Scalable across multiple services
  - Supports role-based access control
  - Familiar login experience for users
  - Reduced password management overhead
  - Strong security through industry standards

- **Cons**
  - Dependency on Google's authentication service
  - Need to handle token expiration and refresh
  - More complex implementation
  - Need to manage JWT secret rotation
  - Potential issues if Google service is down
  - Need to handle multiple token types
  - More complex testing requirements

## Related
- ADR 0001: Tech Stack
- ADR 0006: Security Headers & Rate Limiting
- ADR 0009: Global Auth Middleware