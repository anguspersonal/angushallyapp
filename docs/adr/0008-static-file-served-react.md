# ADR 0008: Serve React Build from Node Server

Date: 2025-05-25

## Status
Accepted

## Context
We needed a strategy for serving our React application that would:
- Support client-side routing
- Enable efficient static file serving
- Maintain consistent deployment
- Support development and production environments
- Enable proper caching strategies
- Handle API requests appropriately
- Support future scaling needs

## Decision
We will let Express serve the React production bundle under / and fall back to index.html for client-side routing. This means:
- Serve static files from the React build directory
- Implement proper caching headers
- Fall back to index.html for client-side routes
- Handle API routes before static file serving
- Configure proper security headers
- Support development and production builds
- Implement proper error handling

## Consequences
- **Pros**
  - Simplified deployment process
  - Consistent serving of static assets
  - Proper support for client-side routing
  - Efficient caching capabilities
  - Single server to maintain
  - Easier development workflow
  - Better control over serving configuration

- **Cons**
  - Additional load on Node.js server
  - Need to handle build process carefully
  - More complex server configuration
  - Need to manage cache invalidation
  - Potential performance impact
  - Need to coordinate build and deploy
  - More complex error handling

## Related
- ADR 0001: Tech Stack
- ADR 0005: API Routing Pattern
- ADR 0006: Security Headers & Rate Limiting