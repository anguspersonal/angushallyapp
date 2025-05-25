# ADR 0006: Standardize Security Middleware: CORS, Headers & Rate-Limiting

Date: 2025-05-25

## Status
Accepted

## Context
We needed a comprehensive security strategy that would:
- Protect against common web vulnerabilities
- Control cross-origin resource sharing
- Prevent abuse through rate limiting
- Apply consistent security policies across all endpoints
- Implement security measures early in the request pipeline
- Handle different rate limits for different endpoints
- Maintain security without impacting legitimate users

## Decision
We will apply global security headers, CORS policy, and rate-limiters early in index.js with the following specifications:
- Global rate limit of 100 requests per minute
- Stricter rate limit of 10 requests per minute for /api/contact
- Standard security headers (Helmet)
- Strict CORS policy
- All security middleware applied before route handlers
- Consistent security measures across all environments

## Consequences
- **Pros**
  - Enhanced protection against common attacks
  - Controlled resource access through CORS
  - Prevention of abuse through rate limiting
  - Consistent security across all endpoints
  - Early security checks in request pipeline
  - Different rate limits for different endpoints
  - Better protection against DDoS attacks

- **Cons**
  - Need to carefully tune rate limits
  - Potential impact on legitimate high-volume users
  - Need to maintain and update security policies
  - May need to adjust limits based on usage patterns
  - Additional complexity in request pipeline
  - Need to handle rate limit errors gracefully
  - May need to implement bypasses for certain use cases

## Related
- ADR 0001: Tech Stack
- ADR 0005: API Routing Pattern
- ADR 0009: Global Auth Middleware