# API Routes Documentation

This directory contains all Express.js route handlers for the angushallyapp API.

## Route Overview

| Route File | Base Path | Purpose | Auth Required |
|------------|-----------|---------|---------------|
| `authRoute.js` | `/api/auth` | Google OAuth authentication | No |
| `bookmarkRoute.js` | `/api/bookmarks` | Canonical bookmark management | Yes |
| `contact.js` | `/api/contact` | Contact form submissions | No |
| `contentRoute.js` | `/api/content` | Blog content management | No |
| `dbRoute.js` | `/api/db` | Database utilities | No |
| `habitRoute.js` | `/api/habit` | Habit tracking | Yes |
| `raindropRoute.js` | `/api/raindrop` | Raindrop.io integration | Yes |
| `raindropCallback.js` | `/api/raindrop/oauth/callback` | OAuth callback handler | No |
| `stravaRoute.js` | `/api/strava` | Strava integration | Yes |
| `analyseTextRoute.js` | `/api/analyseText` | AI text analysis | Yes |
| `hygieneScoreRoute.js` | `/api/hygieneScoreRoute` | Food hygiene scores | No |
| `hygieneScoreRouteSingle.js` | `/api/hygieneScoreRouteSingle` | Single hygiene score lookup | No |

## Authentication

Routes marked with "Yes" require authentication via JWT token in the `Authorization: Bearer <token>` header.

## New Routes

### bookmarkRoute.js

**Purpose**: Provides access to canonical bookmarks from the unified `bookmarks.bookmarks` table.

**Endpoints**:
- `GET /api/bookmarks` - Retrieve user's canonical bookmarks
  - **Auth**: Required
  - **Response**: `{ bookmarks: Array<Bookmark> }`
  - **Error**: `{ error: string }` (500 on failure, 401 on auth failure)

- `POST /api/bookmarks/share` - **Native Share Target** - Save shared URL directly ✨
  - **Auth**: Required
  - **Purpose**: Core A0 implementation for PWA/Android/iOS sharing
  - **Body**: `{ url: string, text?: string, title?: string }`
  - **Response**: `{ success: boolean, bookmark: Object, enriched: boolean }`
  - **Features**:
    - Direct canonical processing (bypasses staging)
    - OpenGraph metadata enrichment
    - URL deduplication via MD5 hash
    - Rich source metadata tracking
  - **Error Handling**: 
    - 400: Missing/invalid URL, validation errors
    - 500: Database or processing errors
    - 401: Authentication required

**Features**:
- Displays unified view of bookmarks from multiple sources (Raindrop, Manual, Share, etc.)
- Shows source indicators and enhanced metadata  
- **Native Share Integration**: App appears in mobile share menus
- Replaces staging table views with canonical data

**Usage Examples**:

**Retrieve Bookmarks:**
```javascript
const response = await fetch('/api/bookmarks', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  }
});
const { bookmarks } = await response.json();
```

**Share Target (PWA/Native):**
```javascript
const response = await fetch('/api/bookmarks/share', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com/article',
    title: 'Interesting Article',
    text: 'Shared from Instagram'
  })
});
const { success, bookmark, enriched } = await response.json();
```

## Testing

All routes have corresponding test files in `../tests/`:
- `testBookmarkRoute.test.js` - Tests for bookmark route
- `testRaindropTransferRoute.test.js` - Tests for raindrop transfer functionality
- `testHabitAPI.integration.test.js` - Integration tests for habit API
- And others...

Run tests with: `npm test`

## Error Handling

All routes follow consistent error handling patterns:
- 401: Authentication required/failed
- 400: Bad request (missing parameters, validation errors)
- 500: Internal server error

Error responses use the format: `{ error: "Error message" }`

## Rate Limiting

- Global: 100 requests per minute per IP
- Contact form: 10 requests per minute per IP
- Applied via `express-rate-limit` middleware 