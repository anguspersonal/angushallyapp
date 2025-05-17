# CRM API

The CRM API manages customer inquiries and interactions from the contact form and other customer touchpoints.

## Features

- Contact form inquiry management
- Inquiry status tracking
- Customer data management
- Integration with public blog system

## Database Schema

### Inquiries Table
```sql
CREATE TABLE crm.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitter_user_id UUID NULLABLE REFERENCES identity.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NULLABLE,
    message TEXT NULLABLE,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'open', 'assigned', 'pending_customer_reply', 'pending_agent_reply', 'resolved', 'closed', 'spam')),
    assigned_to_user_id UUID NULLABLE DEFAULT '95288f22-6049-4651-85ae-4932ededb5ab' REFERENCES identity.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
-- Note: Indexes on submitter_user_id, email, status, assigned_to_user_id are also created.

## API Endpoints

### Contact Form Submission

```http
POST /api/crm/inquiries
```

Creates a new inquiry from the contact form. If submitted by an authenticated user, `submitter_user_id` may be automatically populated.

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "subject": "string (optional)",
  "message": "string (optional)"
}
```
**Response Body (Example on Success - 201 Created):**
```json
{
  "id": "uuid-string-for-new-inquiry",
  "submitter_user_id": "uuid-string-if-user-authenticated-else-null",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "subject": "Question about product X",
  "message": "I have a question regarding...",
  "status": "new",
  "assigned_to_user_id": "95288f22-6049-4651-85ae-4932ededb5ab", // Default assignee
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Get Inquiries

```http
GET /api/crm/inquiries
```

Retrieves inquiries with optional filtering. Supports pagination.

**Query Parameters:**
- `status`: Filter by status (e.g., 'new', 'open', 'assigned', 'pending_customer_reply', 'pending_agent_reply', 'resolved', 'closed', 'spam')
- `submitter_user_id`: Filter by the UUID of the submitting user.
- `assigned_to_user_id`: Filter by the UUID of the user assigned to the inquiry.
- `email`: Filter by submitter's email.
- `limit`: Number of records to return (e.g., 25).
- `offset`: Pagination offset (e.g., 0).
- `sort_by`: Column to sort by (e.g., 'created_at', 'updated_at', 'status').
- `order`: Sort order ('ASC' or 'DESC', defaults to 'DESC' for time-based fields).

**Response Body (Example):**
```json
{
  "data": [
    {
      "id": "uuid-string",
      "submitter_user_id": null,
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "subject": "Support Request",
      "message": "Details of the request...",
      "status": "open",
      "assigned_to_user_id": "uuid-of-assigned-user",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
    // ... other inquiries
  ],
  "pagination": {
    "total_items": 100,
    "limit": 25,
    "offset": 0,
    "total_pages": 4,
    "current_page": 1
  }
}
```

### Update Inquiry Status or Assignment

```http
PATCH /api/crm/inquiries/:id
```

Updates the status and/or assignee of an inquiry. The `:id` is the UUID of the inquiry.

**Request Body:**
```json
{
  "status": "string (e.g., 'assigned', 'resolved', 'closed')",
  "assigned_to_user_id": "UUID (optional, to assign/reassign inquiry)"
}
```
**Response Body (Example on Success - 200 OK):**
```json
{
  "id": "uuid-string-of-updated-inquiry",
  "submitter_user_id": "uuid-string-if-user-authenticated-else-null",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "subject": "Question about product X",
  "message": "I have a question regarding...",
  "status": "assigned", // updated status
  "assigned_to_user_id": "newly-assigned-user-uuid", // updated assignee
  "created_at": "timestamp",
  "updated_at": "timestamp" // will be updated
}
```

## Implementation Details

### Authentication
All endpoints require authentication via JWT token. The token must be included in the Authorization header:
```http
Authorization: Bearer <token>
```

### Data Validation
- Input validation for all endpoints
- Email format validation
- Required field validation
- Status value validation

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
- Nodemailer for email notifications

## Contributing
1. Follow the established code style
2. Add tests for new features
3. Update documentation
4. Submit a pull request 