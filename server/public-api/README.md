# Public API

The Public API manages public-facing content and interactions. Functionality related to blog posts, authors, customer data, and contact form submissions has been refactored and integrated with dedicated schemas (`content`, `identity`, `crm`).

## Features

- Public access to published content (e.g., blog posts via API if still applicable).
- Management of other public-facing data or interactions not covered by more specific APIs.

## Database Schema

Schema definitions for blog posts and authors are now part of the `content` schema. Customer data is managed within the `identity` schema, and contact inquiries are managed within the `crm` schema. This API does not directly define these tables anymore.

(Previous definitions for `public.authors`, `public.posts`, `public.customers`, `public.inquiries` have been removed as these tables were moved, refactored, or dropped.)

## API Endpoints

(Note: The following endpoint descriptions may need significant updates or may be served by different APIs (e.g., a Content API or CRM API) following recent schema changes. Backend route handlers will require refactoring to align with new table structures, schemas, and ID types (UUIDs).)

### Blog Posts

#### Get Posts
```http
GET /api/public/posts
```

Retrieves all blog posts with optional filtering.

**Query Parameters:**
- `author`: Filter by author ID
- `limit`: Number of records to return
- `offset`: Pagination offset

#### Get Post
```http
GET /api/public/posts/:id
```

Retrieves a specific blog post.

#### Create Post
```http
POST /api/public/posts
```

Creates a new blog post.

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "author_id": "number"
}
```

### Authors

#### Get Authors
```http
GET /api/public/authors
```

Retrieves all authors.

#### Get Author
```http
GET /api/public/authors/:id
```

Retrieves a specific author.

### Contact Form

#### Submit Inquiry
```http
POST /api/public/contact
```

Submits a new contact form inquiry.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "message": "string"
}
```

## Implementation Details

### Authentication
- Public endpoints are accessible without authentication
- Admin endpoints require JWT token
- Token must be included in the Authorization header:
```http
Authorization: Bearer <token>
```

### Data Validation
- Input validation for all endpoints
- Email format validation
- Required field validation
- Content sanitization for blog posts

### Error Handling
Standard error responses:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `INVALID_INPUT`: Invalid request data
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error

## Development

### Adding New Features
1. Create necessary database migrations
2. Implement API endpoints
3. Add validation rules
4. Update documentation

### Testing
Run the test suite:
```bash
npm test
```

## Dependencies
- Express.js
- PostgreSQL
- JWT for authentication
- Markdown parser for blog content
- Nodemailer for contact form notifications

## Contributing
1. Follow the established code style
2. Add tests for new features
3. Update documentation
4. Submit a pull request 