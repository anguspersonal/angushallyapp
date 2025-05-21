# Bookmark API Module

**Location:** `/server/bookmark-api`

## Purpose & Context
Provides a complete bookmarking service with metadata enrichment. This module allows users to save, manage, and retrieve bookmarks with automatically extracted metadata from the bookmarked URLs.

Key Design Decisions:
- Service-First: Custom bookmark service without third-party APIs (Instapaper integration backlogged)
- JWT Authentication: Using existing auth middleware
- Metadata Enrichment: OpenGraph scraping for URL metadata
- Testing: Jest + Supertest for unit and integration tests

## Implementation Status

### ✅ Completed
- Database migrations and schema setup
- Service layer with bookmark operations
- OpenGraph metadata fetching
- Controller with HTTP endpoints
- Basic test coverage
- Frontend integration

### 🚧 Backlog
- PWA share-target implementation
- Android intent handling
- Instapaper API integration
- Enhanced batch operations

## Interfaces / Exports

### HTTP Endpoints
```
GET /api/bookmarks
- Lists all bookmarks for authenticated user
- Returns array of bookmarks with metadata

POST /api/bookmarks
- Creates a single bookmark
- Body: { url: string }
- Returns created bookmark with metadata

POST /api/bookmarks/batch
- Creates multiple bookmarks
- Body: { bookmarks: Array<{ url: string }> }
- Returns array of created bookmarks

GET /api/bookmarks/health
- Health check endpoint
- Returns: { status: 'ok', timestamp: Date }
```

### Service Methods
```javascript
bookmarkService.addBookmark(userId, data) → Promise<Bookmark>
bookmarkService.getBookmarks(userId) → Promise<Bookmark[]>
bookmarkService.upsertBookmarks(userId, bookmarks[]) → Promise<Bookmark[]>
bookmarkService.logSync(userId, itemCount, status, errorMsg?) → Promise<void>
```

### Metadata Methods
```javascript
openGraph.fetchMetadata(url) → Promise<Metadata>
openGraph.isValidUrl(url) → boolean
```

## Dependencies & Integrations

### Internal Dependencies
- `../db.js` - Database connection
- JWT authentication middleware
- Identity service (user management)

### External Dependencies
- `open-graph-scraper` - For URL metadata extraction
- `lodash` - For batch processing utilities
- `jest` & `supertest` - For testing

### Database Schema
```sql
-- Bookmark storage
CREATE TABLE bookmark.bookmarks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES identity.users(id),
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  image TEXT,
  site_name TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Sync operation logging
CREATE TABLE bookmark.bookmark_sync_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  item_count INTEGER NOT NULL,
  status TEXT NOT NULL,
  error_msg TEXT,
  finished_at TIMESTAMP NOT NULL
);
```

## Frontend Integration

### API Client (`/react-ui/src/api/bookmarks.js`)
```javascript
export const fetchBookmarks = () => api.get('/bookmarks');
export const addBookmark = url => api.post('/bookmarks', { url });
```

### React Components
- `<BookmarkList />`: Displays user's bookmarks
- `<AddBookmarkForm />`: URL input and submission form

## Configuration & Usage

### Environment Variables
```env
# Required
DB_HOST=localhost
DB_PORT=5432
DB_NAME=angushallyapp_dev

# Optional
OG_TIMEOUT=10000  # Metadata fetch timeout in ms
```

### Example Usage
```javascript
// Create a bookmark
const response = await fetch('/api/bookmarks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${token}'
  },
  body: JSON.stringify({
    url: 'https://example.com'
  })
});

// List bookmarks
const bookmarks = await fetch('/api/bookmarks', {
  headers: { 'Authorization': 'Bearer ${token}' }
}).then(r => r.json());
```

## Security & Permissions
- All endpoints require valid JWT authentication
- Users can only access their own bookmarks
- URL validation prevents malicious inputs
- Rate limiting on metadata fetching
- SQL injection prevention via parameterized queries

## Testing
- Unit tests for service and metadata layers
- Integration tests for API endpoints
- Test database for integration testing
- Mocked OpenGraph scraping in tests

## Change History
- 2025-05-20: Initial implementation
  - Basic CRUD operations
  - OpenGraph metadata support
  - Batch processing capability
  - Sync logging
  - Frontend components
  - Test coverage 