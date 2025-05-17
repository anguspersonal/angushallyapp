# Content API

This API (or the relevant parts of the Public API if refactored) manages blog posts, authors, and other publicly accessible content.

## Database Schema (`content` schema)

### `content.authors` Table

Stores author information, directly linked to user identities.

```sql
CREATE TABLE content.authors (
    id UUID PRIMARY KEY REFERENCES identity.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,       -- Renamed from author_name
    created_at TIMESTAMPTZ NOT NULL,  -- Formerly author_createddate (DATE), type changed
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP -- Added
    -- Original columns like bio or a separate author_id VARCHAR were not present in the final live public.authors schema before migration.
    -- Email is now sourced from the linked identity.users record.
);
```

### `content.posts` Table

Stores blog post information.

```sql
CREATE TABLE content.posts (
    id SERIAL PRIMARY KEY,                       -- Unchanged
    title VARCHAR(255) NOT NULL,               -- Unchanged
    author_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE, -- Changed from VARCHAR, now direct FK to identity.users
    content TEXT NULLABLE,                     -- Unchanged
    content_md TEXT NULLABLE,                  -- Unchanged
    excerpt TEXT NOT NULL,                     -- Unchanged
    slug TEXT NULLABLE,                        -- Unchanged
    tags TEXT NULLABLE,                        -- Unchanged
    metadata JSONB NULLABLE,                   -- Unchanged
    cover_image VARCHAR(255) NULLABLE,         -- Unchanged
    alt_text TEXT NULLABLE,                    -- Unchanged
    attribution TEXT NULLABLE,                 -- Unchanged
    attribution_link TEXT NULLABLE,            -- Unchanged
    created_at TIMESTAMPTZ NOT NULL,           -- Type changed from DATE
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP -- Added (or type changed if existed)
    -- Original author_name VARCHAR column was dropped (info now via author_id join to identity.users/content.authors).
);
```

## API Endpoints

### Posts

#### List Posts

```http
GET /api/content/posts
```

Retrieves a paginated and sortable list of blog posts. Author's name is included.

**Query Parameters:**
- `limit` (number, optional, default: 10): Number of posts to return.
- `offset` (number, optional, default: 0): Number of posts to skip (for pagination).
- `sort_by` (string, optional, default: 'created_at'): Column to sort by (allowed: 'created_at', 'updated_at', 'title', 'id').
- `order` (string, optional, default: 'desc'): Sort order ('asc' or 'desc').

**Response Body (Example on Success - 200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "My First Post",
      "slug": "my-first-post",
      "excerpt": "A short summary...",
      "cover_image": "/path/to/image.jpg",
      "alt_text": "Description of image",
      "attribution": "Photo by Unsplash",
      "attribution_link": "https://unsplash.com",
      "tags": "tech,javascript",
      "metadata": {},
      "created_at": "2025-05-16T10:00:00.000Z",
      "updated_at": "2025-05-16T10:00:00.000Z",
      "author_id": "95288f22-6049-4651-85ae-4932ededb5ab",
      "author_name": "Angus Hally"
    }
    // ... other posts
  ],
  "pagination": {
    "total_items": 100,
    "limit": 10,
    "offset": 0,
    "total_pages": 10,
    "current_page": 1
  }
}
```

#### Get Single Post

```http
GET /api/content/posts/:identifier
```

Retrieves a single blog post by its `id` (integer) or `slug` (string). Author's name is included.

**Path Parameters:**
- `identifier` (number|string): The ID or slug of the post.

**Response Body (Example on Success - 200 OK):**
```json
{
  "id": 1,
  "title": "My First Post",
  "author_id": "95288f22-6049-4651-85ae-4932ededb5ab",
  "content": "Full content of the post...",
  "content_md": "Full markdown content...",
  "excerpt": "A short summary...",
  "slug": "my-first-post",
  "tags": "tech,javascript",
  "metadata": {},
  "cover_image": "/path/to/image.jpg",
  "alt_text": "Description of image",
  "attribution": "Photo by Unsplash",
  "attribution_link": "https://unsplash.com",
  "created_at": "2025-05-16T10:00:00.000Z",
  "updated_at": "2025-05-16T10:00:00.000Z",
  "author_name": "Angus Hally"
}
```

### Authors

#### Get Author Details

```http
GET /api/content/authors/:author_id
```

Retrieves details for a specific author, including their email from the linked identity record.

**Path Parameters:**
- `author_id` (UUID): The UUID of the author (which is their `identity.users.id`).

**Response Body (Example on Success - 200 OK):**
```json
{
  "id": "95288f22-6049-4651-85ae-4932ededb5ab",
  "name": "Angus Hally",
  "created_at": "2023-01-01T00:00:00.000Z", 
  "updated_at": "2025-05-16T10:00:00.000Z",
  "email": "angus.hally@gmail.com"
}
``` 