# Requirements Document

## Introduction

This specification addresses Phase 1 of the architecture modernization plan: Configuration & HTTP Client Consolidation, and Server Bootstrap Modularization.

**Project Context:** angushallyapp is a personal portfolio and project showcase monorepo for Angus Hally. It combines a production-ready main site (blog, portfolio, contact form, case studies) with multiple demo-ready experimental projects (habit tracker, Strava integration, FSA hygiene lookup, bookmark management, Instagram intelligence). The monorepo uses Next.js 15 for the frontend and Node.js/Express for the backend, deployed on Heroku with PostgreSQL.

**Current State:** The codebase suffers from configuration drift, duplicated HTTP client implementations, and a monolithic server bootstrap that intermixes cross-cutting concerns. Multiple HTTP utilities (`fetchBlogData.ts`, `apiClient.ts`) implement their own base-URL detection and error handling, creating inconsistent behavior. The server bootstrap (`server/index.js`) hardcodes CORS origins, security headers, and rate limits in a 226-line monolithic file.

**Goal:** This phase establishes the foundational infrastructure patterns that subsequent phases will build upon, enabling cleaner separation of concerns, easier testing, and more maintainable code as the portfolio grows with new experimental projects.

## Glossary

- **Configuration System**: The centralized mechanism for loading, validating, and providing environment-specific settings across frontend and backend
- **HTTP Client**: A unified abstraction for making outbound HTTP requests with consistent retry, timeout, auth, and error handling policies
- **Server Bootstrap**: The initialization sequence that configures middleware, routes, and starts the Express server
- **Middleware Factory**: A function that creates Express middleware with configurable behavior based on environment settings
- **Schema Validation**: The process of verifying configuration values against expected types, formats, and constraints
- **Structured Logging**: Log output with consistent fields (timestamp, correlation ID, level, context) suitable for machine parsing
- **Error Taxonomy**: A classification system for errors distinguishing recoverable vs. fatal, user-facing vs. internal

## Requirements

### Requirement 1

**User Story:** As a developer, I want a single source of truth for configuration, so that environment-specific settings are consistent across frontend and backend without duplication or drift.

#### Acceptance Criteria

1. WHEN the application starts THEN the Configuration System SHALL load settings from environment variables with schema validation
2. WHEN a required configuration value is missing THEN the Configuration System SHALL fail fast with a descriptive error message
3. WHEN configuration is accessed THEN the Configuration System SHALL provide typed values with defaults for optional settings
4. THE Configuration System SHALL expose CORS origins, API base URLs, auth tokens, and feature flags through a single interface
5. WHEN configuration changes THEN the Configuration System SHALL require only environment variable updates without code modifications

### Requirement 2

**User Story:** As a frontend developer, I want all HTTP requests to use a unified client, so that auth, retry, timeout, and error handling are consistent across all API calls.

#### Acceptance Criteria

1. WHEN making an outbound HTTP request THEN the HTTP Client SHALL apply consistent timeout policies
2. WHEN a request fails with a transient error THEN the HTTP Client SHALL retry with exponential backoff
3. WHEN a request requires authentication THEN the HTTP Client SHALL inject credentials from the Configuration System
4. WHEN a request fails THEN the HTTP Client SHALL return errors conforming to the Error Taxonomy
5. THE HTTP Client SHALL emit structured logs with correlation IDs for all requests and responses
6. WHEN the HTTP Client is used THEN it SHALL provide typed request and response interfaces

### Requirement 3

**User Story:** As a backend developer, I want the server bootstrap separated into modular components, so that I can test, modify, and understand individual concerns without navigating a monolithic initialization file.

#### Acceptance Criteria

1. WHEN the server starts THEN the Server Bootstrap SHALL compose middleware from separate factory modules
2. WHEN CORS middleware is configured THEN it SHALL read allowed origins from the Configuration System
3. WHEN security headers middleware is configured THEN it SHALL apply headers from the Configuration System
4. WHEN rate limiting middleware is configured THEN it SHALL use limits from the Configuration System
5. THE Server Bootstrap SHALL wire feature routes through a registry pattern that separates routing from initialization
6. WHEN the server initialization completes THEN it SHALL expose health check endpoints for monitoring

### Requirement 4

**User Story:** As a platform engineer, I want configuration schema validation enforced at startup, so that misconfigurations are caught before deployment rather than at runtime.

#### Acceptance Criteria

1. WHEN the Configuration System loads settings THEN it SHALL validate all values against a defined schema
2. WHEN a configuration value has an invalid type THEN the Configuration System SHALL report the field name and expected type
3. WHEN a configuration value is outside acceptable bounds THEN the Configuration System SHALL report the constraint violation
4. THE Configuration System SHALL validate URL formats for API endpoints and CORS origins
5. WHEN validation fails THEN the Configuration System SHALL prevent application startup and log all validation errors

### Requirement 5

**User Story:** As a developer, I want deprecated HTTP utilities removed, so that there is only one way to make HTTP requests and no confusion about which client to use.

#### Acceptance Criteria

1. WHEN the HTTP Client consolidation is complete THEN the system SHALL remove fetchBlogData.ts and other ad-hoc fetch utilities
2. WHEN legacy HTTP utilities are removed THEN all frontend components SHALL use the unified HTTP Client
3. WHEN legacy HTTP utilities are removed THEN the system SHALL maintain backward compatibility for existing API contracts
4. THE system SHALL provide migration documentation showing how to replace legacy fetch calls with the unified HTTP Client

### Requirement 6

**User Story:** As an operations engineer, I want structured logging throughout the configuration and HTTP layers, so that I can trace requests and diagnose issues in production.

#### Acceptance Criteria

1. WHEN the Configuration System loads THEN it SHALL log the configuration source and validation results with structured fields
2. WHEN the HTTP Client makes a request THEN it SHALL log request metadata including method, URL, and correlation ID
3. WHEN the HTTP Client receives a response THEN it SHALL log response metadata including status code, duration, and correlation ID
4. WHEN an error occurs THEN the system SHALL log error details with context, stack traces, and correlation IDs
5. THE system SHALL propagate correlation IDs from incoming requests through all outbound HTTP calls

### Requirement 7

**User Story:** As a developer, I want the server bootstrap to support dependency injection, so that I can test middleware and routes in isolation without starting the full server.

#### Acceptance Criteria

1. WHEN middleware factories are created THEN they SHALL accept configuration as parameters rather than accessing globals
2. WHEN route modules are registered THEN they SHALL accept service dependencies as parameters
3. THE Server Bootstrap SHALL expose a factory function that accepts configuration and returns a configured Express app
4. WHEN testing THEN developers SHALL be able to create test instances with mock configuration and dependencies
5. THE Server Bootstrap SHALL separate app creation from server listening to enable testing without port binding

## Requirements

### Requirement 8

**User Story:** As a security engineer, I want CORS, security headers, and rate limiting configured through validated settings, so that security policies are explicit, auditable, and environment-specific.

#### Acceptance Criteria

1. WHEN CORS middleware is initialized THEN it SHALL read allowed origins from validated configuration
2. WHEN security headers middleware is initialized THEN it SHALL apply headers specified in configuration
3. WHEN rate limiting middleware is initialized THEN it SHALL use window size and request limits from configuration
4. THE Configuration System SHALL validate that CORS origins are valid URLs or wildcard patterns
5. WHEN security configuration is missing THEN the system SHALL apply secure defaults and log warnings
