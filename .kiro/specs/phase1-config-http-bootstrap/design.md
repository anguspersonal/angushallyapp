# Design Document

## Overview

Phase 1 establishes the foundational infrastructure for angushallyapp by consolidating configuration management, standardizing HTTP client usage, and modularizing the server bootstrap. This design creates reusable patterns that will support both the production-ready main site and experimental demo projects.

The design follows a layered approach:
1. **Configuration Layer**: Centralized, validated configuration accessible to both frontend and backend
2. **HTTP Client Layer**: Unified client with retry, auth, logging, and error handling
3. **Server Bootstrap Layer**: Modular initialization with dependency injection support
4. **Cross-Cutting Concerns**: Structured logging, error taxonomy, and observability

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (Next.js Pages, Express Routes, React Components)          │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────┐
│                  Infrastructure Layer                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Config       │  │ HTTP Client  │  │ Logger       │     │
│  │ System       │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Server Bootstrap (Express)                   │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │  │
│  │  │ CORS   │  │Security│  │ Rate   │  │ Routes │   │  │
│  │  │Factory │  │Headers │  │Limiter │  │Registry│   │  │
│  │  └────────┘  └────────┘  └────────┘  └────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Configuration Flow

```
Environment Variables (.env files)
         │
         ▼
┌─────────────────────┐
│  Schema Validator   │ ← Validates types, formats, constraints
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Config Object      │ ← Typed, validated configuration
└──────────┬──────────┘
           │
           ├──────────────────┐
           │                  │
           ▼                  ▼
    ┌──────────┐      ┌──────────┐
    │ Frontend │      │ Backend  │
    │ (Next.js)│      │ (Express)│
    └──────────┘      └──────────┘
```

### HTTP Client Flow

```
Component/Route
      │
      ▼
┌──────────────────┐
│  HTTP Client     │
│  - Auth inject   │
│  - Retry logic   │
│  - Logging       │
│  - Error mapping │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Network Request │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Response/Error  │
│  - Structured    │
│  - Typed         │
│  - Logged        │
└──────────────────┘
```

## Components and Interfaces

### 1. Configuration System

**Location**: `config/configSystem.js` (backend), `next-ui/src/config/configSystem.ts` (frontend)

**Purpose**: Centralized configuration loading with schema validation

**Interface**:
```typescript
interface ConfigSchema {
  nodeEnv: 'development' | 'production' | 'test';
  ports: {
    webServer: number;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  cors: {
    origins: string[];
  };
  security: {
    headers: Record<string, string>;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    contactFormMax: number;
  };
  auth: {
    jwtSecret: string;
    googleClientId: string;
    googleClientSecret: string;
  };
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
}

class ConfigSystem {
  private config: ConfigSchema;
  
  constructor();
  load(): ConfigSchema;
  validate(config: Partial<ConfigSchema>): ValidationResult;
  get<K extends keyof ConfigSchema>(key: K): ConfigSchema[K];
}
```

**Validation Rules**:
- Required fields must be present
- URLs must be valid format
- Ports must be 1-65535
- Environment must be one of: development, production, test
- CORS origins must be valid URLs or wildcard patterns

### 2. HTTP Client

**Location**: `next-ui/src/lib/httpClient.ts`

**Purpose**: Unified HTTP client with consistent behavior across all API calls

**Interface**:
```typescript
interface HttpClientConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  authToken?: string;
  logger: Logger;
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retryable?: boolean;
}

interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  correlationId: string;
}

class HttpClient {
  constructor(config: HttpClientConfig);
  
  get<T>(endpoint: string, options?: Partial<RequestOptions>): Promise<HttpResponse<T>>;
  post<T>(endpoint: string, data: unknown, options?: Partial<RequestOptions>): Promise<HttpResponse<T>>;
  put<T>(endpoint: string, data: unknown, options?: Partial<RequestOptions>): Promise<HttpResponse<T>>;
  delete<T>(endpoint: string, options?: Partial<RequestOptions>): Promise<HttpResponse<T>>;
  
  private retry<T>(fn: () => Promise<T>, attempts: number): Promise<T>;
  private handleError(error: unknown, correlationId: string): never;
}
```

**Retry Strategy**:
- Exponential backoff: 1s, 2s, 4s
- Retry on: 408, 429, 500, 502, 503, 504
- Do not retry on: 400, 401, 403, 404
- Maximum 3 attempts

### 3. Server Bootstrap

**Location**: `server/bootstrap/index.js`

**Purpose**: Modular server initialization with dependency injection

**Interface**:
```javascript
// server/bootstrap/index.js
function createApp(config, dependencies = {}) {
  const app = express();
  
  // Apply middleware in order
  applyLogging(app, dependencies.logger);
  applyCors(app, config.cors);
  applySecurityHeaders(app, config.security);
  applyRateLimiting(app, config.rateLimit);
  applyBodyParsing(app);
  applyCookieParsing(app);
  
  // Register routes
  registerRoutes(app, config, dependencies);
  
  // Error handling
  applyErrorHandler(app, dependencies.logger);
  
  return app;
}

function startServer(app, port) {
  return app.listen(port);
}

module.exports = { createApp, startServer };
```

**Middleware Factories**:
```javascript
// server/bootstrap/middleware/cors.js
function createCorsMiddleware(config) {
  return (req, res, next) => {
    const origin = req.headers.origin;
    if (config.origins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  };
}

// server/bootstrap/middleware/securityHeaders.js
function createSecurityHeadersMiddleware(config) {
  return (req, res, next) => {
    Object.entries(config.headers).forEach(([key, value]) => {
      res.header(key, value);
    });
    next();
  };
}

// server/bootstrap/middleware/rateLimit.js
function createRateLimitMiddleware(config) {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.maxRequests,
    message: { error: "Too many requests, please try again later." }
  });
}
```

### 4. Logger

**Location**: `server/lib/logger.js`, `next-ui/src/lib/logger.ts`

**Purpose**: Structured logging with correlation IDs

**Interface**:
```typescript
interface LogContext {
  correlationId?: string;
  userId?: string;
  requestPath?: string;
  [key: string]: unknown;
}

interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  
  child(context: LogContext): Logger;
}

class StructuredLogger implements Logger {
  constructor(serviceName: string);
  
  private format(level: string, message: string, context?: LogContext): string;
}
```

**Log Format**:
```json
{
  "timestamp": "2025-12-03T10:30:00.000Z",
  "level": "info",
  "service": "angushallyapp",
  "message": "HTTP request completed",
  "correlationId": "req-abc123",
  "userId": "user-xyz789",
  "method": "GET",
  "path": "/api/content/posts",
  "status": 200,
  "duration": 45
}
```

### 5. Error Taxonomy

**Location**: `server/lib/errors.js`, `next-ui/src/lib/errors.ts`

**Purpose**: Standardized error classification and handling

**Interface**:
```typescript
enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  EXTERNAL_SERVICE = 'external_service',
  DATABASE = 'database',
  INTERNAL = 'internal'
}

interface ErrorDetails {
  category: ErrorCategory;
  message: string;
  userMessage: string;
  statusCode: number;
  retryable: boolean;
  context?: Record<string, unknown>;
}

class AppError extends Error {
  constructor(details: ErrorDetails);
  
  readonly category: ErrorCategory;
  readonly userMessage: string;
  readonly statusCode: number;
  readonly retryable: boolean;
  readonly context?: Record<string, unknown>;
  
  toJSON(): object;
}

// Specific error classes
class ValidationError extends AppError;
class AuthenticationError extends AppError;
class NotFoundError extends AppError;
class RateLimitError extends AppError;
class ExternalServiceError extends AppError;
```

## Data Models

### Configuration Schema

```typescript
{
  nodeEnv: string,              // 'development' | 'production' | 'test'
  ports: {
    webServer: number           // 1-65535
  },
  api: {
    baseUrl: string,            // Valid URL
    timeout: number             // milliseconds
  },
  cors: {
    origins: string[]           // Valid URLs or '*'
  },
  security: {
    headers: {
      [key: string]: string
    }
  },
  rateLimit: {
    windowMs: number,
    maxRequests: number,
    contactFormMax: number
  },
  auth: {
    jwtSecret: string,
    googleClientId: string,
    googleClientSecret: string
  },
  database: {
    host: string,
    port: number,
    name: string,
    user: string,
    password: string
  }
}
```

### HTTP Request/Response Models

```typescript
// Request
{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  headers: Record<string, string>,
  body?: unknown,
  correlationId: string,
  timestamp: string
}

// Response
{
  data: T,
  status: number,
  headers: Record<string, string>,
  correlationId: string,
  duration: number
}

// Error Response
{
  error: {
    category: ErrorCategory,
    message: string,
    userMessage: string,
    statusCode: number,
    retryable: boolean,
    correlationId: string,
    timestamp: string
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, several properties were identified as redundant:
- Properties 8.1, 8.2, 8.3 duplicate properties 3.2, 3.3, 3.4 (middleware configuration)
- Property 8.4 overlaps with 4.4 (URL validation) and can be combined
- Properties about code structure (5.1, 5.2, 7.1, 7.2) are not runtime testable
- Properties about design goals (1.5, 2.6, 3.5, 7.4) are not runtime testable

The following properties provide unique validation value and will be implemented:

### Property 1: Configuration validation completeness
*For any* configuration object, when loaded by the Configuration System, all values should be validated against the schema and any validation errors should prevent application startup
**Validates: Requirements 1.1, 4.1, 4.5**

### Property 2: Configuration error messages are descriptive
*For any* invalid configuration value (missing required field, wrong type, out of bounds), the error message should include the field name and the specific validation failure
**Validates: Requirements 1.2, 4.2, 4.3**

### Property 3: Configuration provides typed values with defaults
*For any* optional configuration key, accessing it should return either the configured value or a defined default value of the correct type
**Validates: Requirements 1.3**

### Property 4: URL validation for configuration
*For any* configuration field that expects a URL (API base URL, CORS origins), invalid URL formats should be rejected during validation
**Validates: Requirements 4.4, 8.4**

### Property 5: HTTP client timeout consistency
*For any* HTTP request made through the HTTP Client, the request should respect the configured timeout value
**Validates: Requirements 2.1**

### Property 6: HTTP client retry behavior
*For any* HTTP request that fails with a transient error code (408, 429, 500, 502, 503, 504), the HTTP Client should retry with exponential backoff (1s, 2s, 4s) up to 3 attempts
**Validates: Requirements 2.2**

### Property 7: HTTP client auth injection
*For any* HTTP request when auth credentials are configured, the HTTP Client should include the Authorization header with the configured token
**Validates: Requirements 2.3**

### Property 8: HTTP client error taxonomy conformance
*For any* HTTP request that fails, the returned error should conform to the Error Taxonomy structure with category, userMessage, statusCode, and retryable fields
**Validates: Requirements 2.4**

### Property 9: HTTP client correlation ID propagation
*For any* HTTP request/response pair, both the request log and response log should contain the same correlation ID
**Validates: Requirements 2.5, 6.2, 6.3, 6.5**

### Property 10: Middleware configuration consistency
*For any* middleware (CORS, security headers, rate limiting), the runtime behavior should match the values specified in the Configuration System
**Validates: Requirements 3.2, 3.3, 3.4**

### Property 11: Error logging completeness
*For any* error that occurs in the system, the error log should include the error message, stack trace, correlation ID, and context fields
**Validates: Requirements 6.4**

### Property 12: API backward compatibility
*For any* existing API endpoint, after HTTP Client consolidation, the endpoint should continue to return the same response structure for the same inputs
**Validates: Requirements 5.3**

### Property 13: Security defaults application
*For any* missing optional security configuration, the system should apply secure defaults and emit a warning log
**Validates: Requirements 8.5**

## Error Handling

### Error Categories and HTTP Status Codes

| Category | Status Code | Retryable | User Message |
|----------|-------------|-----------|--------------|
| VALIDATION | 400 | No | "Invalid input - please check your data" |
| AUTHENTICATION | 401 | No | "Authentication required - please log in" |
| AUTHORIZATION | 403 | No | "Access denied - insufficient permissions" |
| NOT_FOUND | 404 | No | "Resource not found" |
| RATE_LIMIT | 429 | Yes | "Too many requests - please try again later" |
| EXTERNAL_SERVICE | 502/503 | Yes | "External service unavailable - please try again" |
| DATABASE | 500 | Yes | "Database error - please try again" |
| INTERNAL | 500 | No | "Internal server error - please contact support" |

### Error Handling Strategy

1. **Configuration Errors**: Fail fast at startup with detailed validation errors
2. **HTTP Client Errors**: Retry transient errors, return structured errors for non-retryable
3. **Middleware Errors**: Catch and log with correlation ID, return appropriate status code
4. **Unhandled Errors**: Catch at top level, log with full context, return 500 with generic message

### Error Response Format

```json
{
  "error": {
    "category": "validation",
    "message": "Invalid email format",
    "userMessage": "Invalid input - please check your data",
    "statusCode": 400,
    "retryable": false,
    "correlationId": "req-abc123",
    "timestamp": "2025-12-03T10:30:00.000Z",
    "context": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

## Testing Strategy

### Unit Testing

**Configuration System**:
- Test schema validation with valid and invalid configurations
- Test default value application for optional fields
- Test error message formatting for various validation failures
- Test URL format validation

**HTTP Client**:
- Test timeout application with mock requests
- Test retry logic with simulated transient failures
- Test auth header injection
- Test error mapping to taxonomy
- Test correlation ID generation and propagation

**Middleware Factories**:
- Test CORS middleware with various origins
- Test security headers application
- Test rate limiting with simulated requests
- Test configuration parameter passing

**Logger**:
- Test structured log formatting
- Test correlation ID inclusion
- Test child logger context inheritance

### Property-Based Testing

The project will use **fast-check** for JavaScript/TypeScript property-based testing. Each property-based test will run a minimum of 100 iterations.

**Property Test Framework**:
```typescript
import fc from 'fast-check';

// Example property test structure
describe('Property: Configuration validation completeness', () => {
  it('should validate all configuration values and prevent startup on errors', () => {
    fc.assert(
      fc.property(
        configArbitrary(), // Generator for random configurations
        (config) => {
          const result = configSystem.validate(config);
          // Property assertion
          if (hasInvalidFields(config)) {
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          } else {
            expect(result.valid).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property Test Tags**:
Each property-based test will be tagged with a comment referencing the design document:
```typescript
// **Feature: phase1-config-http-bootstrap, Property 1: Configuration validation completeness**
```

**Test Generators (Arbitraries)**:
- `configArbitrary()`: Generates random valid and invalid configurations
- `httpRequestArbitrary()`: Generates random HTTP requests
- `errorCodeArbitrary()`: Generates various HTTP error codes
- `urlArbitrary()`: Generates valid and invalid URLs
- `correlationIdArbitrary()`: Generates correlation ID strings

### Integration Testing

**Server Bootstrap**:
- Test full server initialization with real configuration
- Test middleware application order
- Test route registration
- Test health check endpoint availability
- Test app creation without port binding

**HTTP Client Integration**:
- Test real HTTP requests to test server
- Test retry behavior with flaky test endpoint
- Test auth flow with protected endpoints
- Test error handling with error-generating endpoints

**Configuration Loading**:
- Test loading from environment variables
- Test validation failure prevents startup
- Test configuration access from multiple modules

### Test Coverage Goals

- Unit tests: 90%+ coverage for core logic
- Property tests: All 13 correctness properties implemented
- Integration tests: All critical paths covered
- Edge cases: Boundary values, empty inputs, malformed data

## Implementation Notes

### Migration Strategy

1. **Phase 1a: Configuration System** (Week 1)
   - Implement configuration schema and validation
   - Create configuration loader for backend
   - Create configuration loader for frontend
   - Update existing code to use new configuration
   - Remove hardcoded configuration values

2. **Phase 1b: HTTP Client** (Week 2)
   - Implement unified HTTP client with retry and logging
   - Create migration guide for legacy fetch utilities
   - Update components to use new HTTP client
   - Remove `fetchBlogData.ts` and other ad-hoc utilities
   - Verify API backward compatibility

3. **Phase 1c: Server Bootstrap** (Week 3)
   - Extract middleware factories
   - Create modular bootstrap structure
   - Update server/index.js to use new bootstrap
   - Add health check endpoints
   - Test dependency injection for testing

4. **Phase 1d: Logging and Errors** (Week 4)
   - Implement structured logger
   - Implement error taxonomy
   - Update HTTP client to use logger
   - Update middleware to use logger
   - Update error handling throughout application

### Backward Compatibility

- All existing API endpoints must continue to work
- Frontend components should work during migration (dual HTTP client support temporarily)
- Configuration changes should be backward compatible (support old env var names with deprecation warnings)
- Database queries and schemas are not affected by this phase

### Performance Considerations

- Configuration loading happens once at startup (no performance impact)
- HTTP client retry adds latency only on failures (acceptable tradeoff)
- Structured logging has minimal overhead (JSON serialization)
- Middleware factories have no runtime overhead vs inline middleware

### Security Considerations

- Configuration validation prevents injection attacks via env vars
- CORS configuration is centralized and validated
- Security headers are applied consistently
- Rate limiting is configurable per environment
- Auth tokens are never logged
- Error messages don't leak sensitive information

## Dependencies

### New Dependencies

**Backend**:
- `joi` or `zod`: Schema validation for configuration
- `fast-check`: Property-based testing framework

**Frontend**:
- `zod`: Schema validation for configuration (TypeScript-first)
- `fast-check`: Property-based testing framework

### Existing Dependencies

- `express`: Web server framework
- `express-rate-limit`: Rate limiting middleware
- `cookie-parser`: Cookie parsing middleware
- `next`: Next.js framework
- `react`: React framework

## Deployment Considerations

### Environment Variables

All configuration must be provided via environment variables. Required variables:

```bash
# Core
NODE_ENV=production
PORT=5000

# API
API_BASE_URL=https://angushally.com/api
API_TIMEOUT=30000

# CORS
CORS_ORIGINS=https://angushally.com,http://localhost:3000

# Security
JWT_SECRET=<secret>
GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_CONTACT_FORM_MAX=10

# Database
DATABASE_HOST=<host>
DATABASE_PORT=5432
DATABASE_NAME=<name>
DATABASE_USER=<user>
DATABASE_PASSWORD=<password>
```

### Heroku Configuration

1. Set all environment variables via Heroku config vars
2. Configuration validation runs at startup (will prevent bad deploys)
3. Health check endpoint available at `/api/health`
4. Structured logs available via Heroku log drains

### Rollback Plan

If issues arise after deployment:
1. Revert to previous release via Heroku
2. Configuration is backward compatible (old env vars still work with deprecation warnings)
3. API contracts are unchanged (backward compatibility maintained)
4. No database migrations in this phase (safe to rollback)

## Future Enhancements

### Phase 2 Preparation

This phase establishes patterns that Phase 2 (Domain & Service Layer) will build upon:
- Configuration system will be used by service layer
- HTTP client will be used by frontend hooks
- Logger will be used by domain services
- Error taxonomy will be extended for domain errors

### Potential Improvements

- Configuration hot-reloading (reload without restart)
- HTTP client request/response interceptors
- Distributed tracing integration (OpenTelemetry)
- Metrics collection (Prometheus)
- Configuration UI for admin users
- A/B testing framework using feature flags
