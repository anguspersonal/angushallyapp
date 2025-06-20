# 📚 Bookmark Sub-App – Unified Bookmarking & "Second Brain"

**Location:** `server/bookmark-api` (Backend) & `react-ui/src/pages/projects/bookmarks` (Frontend)

---

## ✨ Product Vision

Enable users to effortlessly send any content (URLs, articles, media) to a personal Second Brain that:

1. **Captures** information with _one click_ (from Raindrop today, more sources tomorrow)
2. **Enriches** and organises it automatically (metadata, tags, NLP enrichment)
3. **Surfaces** the right knowledge at the right moment (search, recommendations)

**Key Principle: Cross-Platform Aggregation**
The system is designed from the ground up to aggregate bookmarks from multiple sources (Raindrop, Instapaper, Readwise, manual entry) into a unified knowledge base. Raindrop is the first implementation, but the architecture supports seamless addition of other platforms.

Full context lives in the project-level docs but the essence is:

> Modern knowledge flows are chaotic. This app turns fleeting bookmarks into structured, searchable knowledge.

---

## 🎯 Vision in Action

**Example:** While browsing Instagram, a user sees "10 Hidden Gem Restaurants in London."

* Taps "Send to Second Brain."
* The app:
  * Extracts structured data (restaurant names, locations).
  * Tags the content.
  * Deduplicates if already saved via another platform.
  * Enriches metadata.
  * Makes the data searchable and retrievable when planning a night out in London.

---

## 🧑‍💻 User Problem

• Scattered content across Instagram, Twitter, blogs, etc.  
• Manual bookmarking/tagging is high-friction and low recall.  
• Users rarely revisit saved content.
• **Content is fragmented across multiple platforms** - users have bookmarks in Raindrop, Instapaper, Readwise, and other services with no unified view.

Our solution: a low-friction capture pipeline + automated enrichment so users can _find & act_ on what they save, **unified across all their bookmark sources**.

---

## 📦 Supported Content Types (current & planned)

| Type     | Examples                               | Bookmarking | Parsing/Enrichment |
|----------|----------------------------------------|-------------|--------------------|
| Text     | Articles, Tweets, Blog Posts           | ✅ MVP      | ✅ MVP            |
| Images   | Screenshots, Infographics              | ✅ MVP      | 🔄 Planned        |
| Video    | YouTube, TikTok, Reels                 | ✅ MVP      | 🔄 Planned        |
| Audio    | Podcasts, Interviews                   | ✅ MVP      | 🔄 Planned        |

**Note:** All content types can be bookmarked via URL in MVP. Text parsing and metadata extraction is currently implemented. Future work will add parsing capabilities for images, video, and audio content.

---

## 🏗️ Architecture & Flow

### System Structure
```mermaid
flowchart TD
  subgraph Client
    A[User – Google Login] --> B[React – /bookmarks UI]
  end

  subgraph Server
    B --> C[/auth/google → JWT]
    B --> D[/raindrop/oauth/*]
    B --> E[/raindrop/sync]
    style C fill:#f4f4f4,color:#333
  end

  C -->|JWT| F{authMiddleware}
  D --> F
  E --> F
  F -->|staging| G[(raindrop.bookmarks)]
  F -->|canonical| H[(bookmarks.bookmarks)]
  H --> I[(search / analytics)]
```

### Data Flow Process
| # | Step | Trigger | Storage | Components |
|---|------|---------|---------|------------|
| 1 | User Authentication | Google Login | `identity.users` | `/api/auth/google` |
| 2 | Authorise Source    | OAuth dance (e.g. Raindrop) | `raindrop.tokens` | `/api/raindrop/oauth/*` |
| 3 | **Sync** raw items  | User clicks **Sync** | `raindrop.bookmarks`, `raindrop.sync_logs` | `/api/raindrop/sync` |
| 4 | **OmniSync** build canonical | Auto after sync / cron | `bookmarks.bookmarks`, `bookmarks.sync_log` | *Transfer logic with validation implemented* |
| 5 | Enrichment Pipeline | Post-OmniSync | `bookmarks.bookmarks` (updated) | *Planned for future implementation* |

### 📋 Core Implementation Flow

The bookmark service currently follows this flow:

1. **Authenticate Raindrop.io connection** - OAuth flow with token management ✅
2. **Get bookmarks from Raindrop** - Sync to `raindrop.bookmarks` staging table ✅
3. **Display bookmarks on frontend** - Direct view from staging table ✅
4. **Transfer to canonical store** - Move to `bookmarks.bookmarks` with data validation and metadata enrichment 🔄 *Validation implemented, enrichment pending*

### Key Components

#### 1. Authentication Layer
* Google OAuth → JWT (7-day expiry) handled by `/api/auth/...` (see `middleware/auth.js`)
* All bookmark operations require valid JWT via `authMiddleware()`
* **JWT Storage:** Tokens stored in localStorage/sessionStorage (not HttpOnly cookies)
* **Token Transmission:** JWT sent via `Authorization: Bearer` headers
* **Security Note:** Consider migrating to HttpOnly cookies for enhanced XSS protection

#### 2. Staging Layer (Per-Source Schemas)
* **`raindrop.tokens`** – stores OAuth tokens per user
* **`raindrop.bookmarks`** – raw bookmarks fetched via `/raindrop/sync`
* Future sources (Pocket, Instapaper, Readwise…) will get their own schema as _staging_ areas
* **OAuth Security:** JWT-signed state tokens with user_id + timestamp + 5min expiry
* **Token Refresh:** Automatic refresh handling with fallback to re-authentication
* **Cross-Platform Architecture:** Each platform gets its own staging schema (e.g., `instapaper.bookmarks`, `readwise.bookmarks`) before merging into the canonical store

#### 3. Canonical Store
* **`bookmarks.bookmarks`** – single SOURCE OF TRUTH
* Merge logic (dedupe, metadata enrichment) planned for future implementation

#### 4. Enhancement Pipeline
* OpenGraph scraping → basic metadata (title, description, site)
* Optional LLM tagging (OpenAI) → smart tags

#### 5. Frontend Integration
* Current UI: `react-ui/src/pages/projects/bookmarks/raindrop.jsx`
  – shows connection status, sync button, list view
* Future: manual bookmark input & advanced search components

---

## ⚙️ Setup & Configuration

### Environment Configuration

**`.env.development`**
```env
RAINDROP_CLIENT_ID=your-dev-client-id
RAINDROP_CLIENT_SECRET=your-dev-client-secret
RAINDROP_REDIRECT_URI=http://localhost:5000/api/raindrop/oauth/callback
```

**`.env.production` (Heroku Config Vars)**
```env
RAINDROP_CLIENT_ID=your-prod-client-id
RAINDROP_CLIENT_SECRET=your-prod-client-secret
RAINDROP_REDIRECT_URI=https://angushally.com/api/raindrop/oauth/callback
```

### Raindrop.io Application Setup

Create two separate Raindrop.io applications for environment separation:

| Environment     | Raindrop App      | Redirect URI                                         |
| --------------- | ----------------- | ---------------------------------------------------- |
| **Production**  | `angushally-prod` | `https://angushally.com/api/raindrop/oauth/callback` |
| **Development** | `angushally-dev`  | `http://localhost:5000/api/raindrop/oauth/callback`  |

### File Structure

```
/server/routes/
├── raindropRoute.js           <-- Raindrop API endpoints
├── raindropCallback.js        <-- OAuth callback handler

/server/bookmark-api/
├── bookmarkService.js         <-- Core bookmark handling (fetch & save operations)
├── raindropAuth.js            <-- OAuth logic (auth URL, token exchange)
├── raindropTokens.js          <-- Token management
├── openGraph.js               <-- URL metadata fetching
├── instapaper.js              <-- Instapaper integration (placeholder)
```

### Testing Matrix

| Test Item        | Goal                                |
| ---------------- | ----------------------------------- |
| Dev OAuth Flow   | Ensure redirect to localhost works  |
| Token Exchange   | Tokens saved in `raindrop.tokens`   |
| Bookmark Fetch   | Data retrieved from Raindrop API    |
| DB Storage       | Bookmarks inserted for correct user |
| Frontend Display | UI renders bookmarks correctly      |
| Error Handling   | Detect expired/invalid tokens       |

### Sync Model

| Trigger Type    | Description                  |
| --------------- | ---------------------------- |
| Manual Sync     | Button triggers `POST /sync` |
| Auto Sync (opt) | Use Heroku Scheduler         |
| Refresh Token   | Re-auth on 401 or expiry     |

---

## 🔐 OAuth Flow Implementation

> **Note:** The detailed OAuth flow below is specific to Raindrop (our MVP implementation). The architecture is designed to support other platforms (Instapaper, Readwise, etc.) with similar OAuth patterns. Each platform will follow the same staging → canonical flow but with platform-specific API endpoints and data structures.

### 1. User Authentication (Google → JWT)

1. **Trigger**: User hits `/login` (your `@login.jsx` UI).
2. **Google OAuth flow**: Redirect → Google → callback → you verify, then
3. **Issue JWT**: You mint a JWT (with 7-day TTL, stored in localStorage/sessionStorage) and send it to the client.
4. **Client state**: Client now includes that JWT in `Authorization: Bearer …` for all subsequent `/api/*` calls.

> **Current Implementation:** JWT is stored in localStorage/sessionStorage and transmitted via Authorization headers.
> **Security Note:** While HttpOnly cookies provide better XSS protection, the current localStorage approach is functional.

### 2. Raindrop "Connect" (React UI → Backend → Raindrop)

1. **UI**: User visits `raindrop.jsx` and clicks **Connect Raindrop**.
2. **API Call**: Frontend makes authenticated request to backend

   ```jsx
   const response = await api.get('/raindrop/oauth/start');
   ```

3. **Server** (`GET /api/raindrop/oauth/start`)

   * Read `req.user` from your JWT middleware.
   * Generate a **`state`** payload (JWT-signed with user_id + timestamp + 5min expiry).
   * Return JSON response with auth URL:

     ```json
     { "authUrl": "https://raindrop.io/oauth/authorize?client_id=...&state=<signed-state>" }
     ```

4. **Client Redirect**: Frontend redirects to Raindrop auth URL

   ```jsx
   window.location.href = response.authUrl;
   ```

> **Best Practice:** State token is JWT-signed and includes user_id + timestamp for security.

### 3. Callback & Token Exchange (Raindrop → Your Backend)

1. **Raindrop** sends user back to

   ```
   GET /api/raindrop/oauth/callback?code=<code>&state=<state>
   ```
2. **Server** (`/oauth/callback`)

   * Verify the incoming `state` matches your stored record (and isn't expired).
   * POST to Raindrop's token endpoint with `code`, `client_id`, `client_secret`, `redirect_uri`.
   * Receive `{ access_token, refresh_token, expires_in, … }`.
   * **Persist** these tokens in your `raindrop.tokens` table, linking them to `user_id`.
   * Redirect the user back to your React page—e.g.

     ```js
     res.redirect('/projects/bookmarks/raindrop');
     ```

> **Tip:** Store token expiry (`Date.now() + expires_in * 1000`) so you know when to auto-refresh.

### 4. Fetching & Syncing Bookmarks

1. **Initial load of `raindrop.jsx`**

   * On mount, client calls `GET /api/raindrop/bookmarks`.

2. **Server** (`/bookmarks`)

   * Look up the user's Raindrop tokens.
   * If `expires_at < now`, do a **refresh**:

     ```js
     POST https://raindrop.io/oauth/access_token
     { 
       grant_type: 'refresh_token', 
       refresh_token, 
       client_id, 
       client_secret 
     }
     ```
   * If refresh fails (refresh token revoked/expired), throw a 401 so React can show "Connect Raindrop" again.
   * Otherwise, call Raindrop's API with `access_token` → fetch bookmarks → return them as JSON.

3. **UI**

   * Display bookmarks in `raindrop.jsx`.
   * Optionally show a **Sync** button to re-fetch on demand.

> **UX Note:** If the user "Connects" successfully but you detect no tokens, show "Sync Bookmarks" (i.e. "You're connected—click to load").

### 5. Error & Edge-Case Handling

* **State mismatch / replay** → 400 "Invalid state, please retry."
* **Token refresh failure** → 401 "Connection expired—please reconnect."
* **API rate-limits or network errors** → 502 or 503 with friendly retry UI.
* **Revoked scopes** → treat like refresh failure.

### OAuth Implementation Checklist

* [x] JWT issued & sent securely.
* [x] `/oauth/start` is a redirect, not a CORS-raftered fetch.
* [x] `state` is cryptographically protected and tied to `user_id`.
* [x] Exchange `code` immediately on the server.
* [x] Persist `access_token` & `refresh_token` with expiries.
* [x] Auto-refresh tokens when needed, with fallback UX.
* [x] Sync endpoint for bookmarks with proper error codes.

---

## 📜 Module Status

### Module Classification
- **A-series**: Foundation & Data Ingestion (OAuth, sync, staging)
- **B-series**: MVP Completion (UI, enrichment, privacy)
- **C-series**: Advanced Organization (tags, context, versioning)
- **D-series**: Search & Retrieval (full-text, semantic, ranking)
- **E-series**: Intelligence & Insights (dashboard, feedback, LLM)

### ✅ Completed
* A1 – OAuth + Token Management (Raindrop)
  * Authenticate user with Raindrop.io.
  * Exchange auth code for access token.
    * _Note: Both a server-side redirect flow (`/raindrop/oauth/callback`) and a client-side code exchange flow (`/raindrop/oauth/exchange`) are implemented._
  * Save token securely in database with conflict resolution (`ON CONFLICT DO UPDATE`).
  * JWT-signed state tokens with 5-minute expiry for security.
  * Token refresh mechanism with **manual** fallback to re-authentication. _(Note: an endpoint `/api/raindrop/refresh` exists, but automatic refresh on API failure is not implemented; the UI prompts for re-connection on auth errors)._
  * Environment-specific configuration validation.
  * **Pattern established** for future platform integrations (Instapaper, Readwise, etc.).
* A2 – Raindrop Sync + Staging (`raindrop.bookmarks`)
  * Fetch list of bookmarks from Raindrop API. _(Note: Pagination is only partially implemented; the system fetches the first page of 50 items but does not currently iterate through subsequent pages for collections with >50 bookmarks)._
  * Store raw results in `raindrop.bookmarks` staging table.
  * Transaction-based batch saving for data integrity.
  * Collection-based fetching (supports specific collections and "all bookmarks" via collection ID `0`).
  * Comprehensive error logging and response validation.
  * Automatic conflict resolution for duplicate bookmarks (`ON CONFLICT DO UPDATE`).
  * **Staging pattern established** for future platform integrations.
* A3 – Bookmark Transfer to Canonical
  * **Status**: ✅ **Complete** - 2025-01-27
  * **Goal**: Move clean entries from `raindrop.bookmarks` to `bookmarks.bookmarks`.
  * **Completed**:
    * ✅ Database schema and migration (`20250531000000_create_bookmarks_schema.js`)
    * ✅ `validateBookmarkData(bookmark)` - Comprehensive validation with 37 test cases
    * ✅ `createCanonicalBookmark(enrichedData)` - Create new canonical bookmarks
    * ✅ `updateCanonicalBookmark(bookmarkId, data)` - Update existing canonical bookmarks
    * ✅ `checkCanonicalBookmarkExists(userId, sourceType, sourceId)` - Deduplication logic
    * ✅ `transferRaindropBookmarkToCanonical(raindropBookmark)` - Single bookmark transfer
    * ✅ `transferUnorganizedRaindropBookmarks(userId)` - Batch transfer with error handling
    * ✅ API endpoint (`POST /api/raindrop/transfer`) - Manual transfer triggering
    * ✅ Comprehensive test coverage (100+ test cases)
    * ✅ **Data validation integration**: `validateBookmarkData()` integrated into transfer process with comprehensive error handling
    * ✅ **Metadata enrichment pipeline integration**: OpenGraph enrichment during transfer with fallback handling
  * **Metadata Enrichment Features**:
    * ✅ OpenGraph metadata fetching with 10-second timeout
    * ✅ Fallback to Twitter Card and HTML metadata
    * ✅ Priority system: Raindrop data first, OpenGraph as enhancement
    * ✅ Enhanced fields: description, image_url, site_name, resolved_url
    * ✅ Comprehensive error handling and logging
    * ✅ Enrichment statistics tracking in batch operations
  * **Canonical merge pattern** established for future platform integrations.
* A3.1 – Display Canonical Bookmarks on Frontend
  * **Status**: ✅ **Complete** - 2025-06-20
  * **Goal**: Show unified view of bookmarks from `bookmarks.bookmarks` table.
  * **Implemented**:
    * ✅ New backend route `GET /api/bookmarks` with authentication
    * ✅ Frontend component `Bookmarks.jsx` for unified bookmark display
    * ✅ Source indicator display (Raindrop, Manual, Instapaper, Readwise)
    * ✅ Enhanced metadata display (description, site_name)
    * ✅ **Preview image support** with fallback handling
    * ✅ Reusable `BookmarkCard` component with image preview
    * ✅ Comprehensive test coverage (100% coverage)
    * ✅ Route documentation in `server/routes/README.md`
  * **Access**: Visit `/projects/bookmarks/bookmarks` for canonical view
  * **Preview Image Features**:
    * ✅ Mantine `Image` component with `fallbackSrc`
    * ✅ Support for `image_url` and `image_alt` fields
    * ✅ Graceful error handling for broken image URLs
    * ✅ Consistent card layout across all bookmark views
    * ✅ Unit tests for image handling scenarios
* A3.2 – Automatic Bookmark Transfer System
  * **Status**: ✅ **Complete** - 2025-01-27
  * **Goal**: Automatically transfer bookmarks from staging to canonical store when users access bookmarks
  * **Problem Solved**: Production issue where users saw "No bookmarks found" despite having bookmarks in raindrop staging table
  * **Implemented**:
    * ✅ `getUserCanonicalBookmarksWithAutoTransfer()` - Smart bookmark retrieval with automatic transfer
    * ✅ Enhanced `GET /api/bookmarks` endpoint with auto-transfer logic
    * ✅ Bulk migration via `npm run migrate` for existing users
    * ✅ Frontend notification system for successful auto-transfers
    * ✅ Comprehensive logging and error handling
    * ✅ Transfer statistics and enrichment tracking
    * ✅ Test coverage for all auto-transfer scenarios
  * **User Experience**:
    * ✅ Seamless first-time bookmark viewing (no manual transfer required)
    * ✅ Rich metadata enrichment during transfer (OpenGraph integration)
    * ✅ User feedback via notification system
    * ✅ Zero-downtime deployment (backward compatible)
  * **Technical Features**:
    * ✅ Hybrid approach: on-demand transfer + bulk migration
    * ✅ Enhanced API response format with `_metadata` object
    * ✅ Enrichment statistics tracking (enriched, failed, skipped)
    * ✅ Production-ready logging and monitoring
* OpenGraph metadata fetching
  * 10-second timeout configuration with fallback handling.
  * Support for OpenGraph, Twitter cards, and regular HTML metadata.
  * Structured error handling with error codes.
  * URL validation for security.
* Frontend integration
  * OAuth callback URL parameter handling.
  * Connection status verification.
  * Manual sync functionality with loading states.
  * Error state management with user notifications.
  * Real-time bookmark display from staging table.
  * **Missing:** Tag filtering functionality (UI exists but not implemented).
  * **Missing:** Tag editing functionality (UI exists but not implemented).

### 🔄 MVP (In Progress / Planned)
* A4 – Sync Scheduler (cron-ready background jobs)
  * Background job runner configured for routine syncs.
  * Foundation for cross-platform sync orchestration.
  * **Missing:** Actual cron job implementation.
  * **Missing:** Sync status tracking and reporting.
* B1 – Manual URL Input (API & UI)
  * Accept single or multiple links for ingestion.
  * Basic UI or API endpoint for manual submissions.
  * **Missing:** API endpoints for manual bookmark creation.
  * **Missing:** Frontend UI for manual bookmark input.
* B2 – Basic Metadata Enrichment Engine
  * Parse title, domain, and key terms.
  * Prepare structure for LLM enrichment later.
  * **Missing:** Integration with bookmark saving process.
  * **Missing:** Domain extraction and analysis.
  * **Missing:** Key term extraction.
* B3 – Canonical Content Registry
  * Normalize incoming items into `bookmarks.bookmarks` table.
  * Deduplicate based on URL and hash.
  * **Status:** Core functionality implemented in A3.
  * ✅ Canonical table implemented (`bookmarks.bookmarks`)
  * ✅ Deduplication logic implemented (`checkCanonicalBookmarkExists`)
  * **Missing:** URL-based deduplication across different source platforms
  * **Missing:** Content hash-based deduplication
* B4 – Bookmark Viewer UI (Initial)
  * Simple frontend view of imported bookmarks.
  * Show title, tags, and origin source.
  * **Status**: ✅ **Complete** - 2025-01-27
  * **Implemented**:
    * ✅ Unified bookmark display from canonical table
    * ✅ Source indicator display (Raindrop, Manual, Instapaper, Readwise)
    * ✅ Preview image support with fallback handling
    * ✅ Reusable `BookmarkCard` component
    * ✅ Consistent UI across all bookmark views
    * ✅ Tag display and interaction
    * ✅ Responsive grid layout
    * ✅ Error handling and loading states
* B5 – Privacy Defaults
  * Ensure bookmarks are private by default.
  * Establish `user_id` access boundaries.
  * **Status:** Implemented - all bookmarks are user-scoped.
* B6 – Instapaper Integration
  * Implement OAuth flow for Instapaper.
  * Create `instapaper.bookmarks` staging table.
  * Extend sync logic to handle Instapaper data.
  * **Status:** File exists (`instapaper.js`) but is empty (0 bytes).
* B7 – Readwise Integration
  * Implement OAuth flow for Readwise.
  * Create `readwise.bookmarks` staging table.
  * Extend sync logic to handle Readwise data.
* B8 – Cross-Platform Sync Orchestration
  * Manage multiple platform tokens and sync schedules.
  * Unified sync status dashboard.
  * Cross-platform deduplication logic.

###  🗓️ Backlog
* C0 - Content Type Identification System
  * C0.1 **Initial Content Type Detection**:
    * URL pattern analysis
    * Meta tag inspection
    * File extension checking
    * Platform-specific detection (YouTube, Instagram, etc.)
  * C0.2 **Embedded Content Detection**:
    * Identify multiple content types within a single URL
    * Map content hierarchy and relationships
    * Determine primary and secondary content types
  * C0.3 **Processing Strategy Selection**:
    * Map content types to appropriate processing techniques
    * Prioritize processing order
    * Handle rate limits and access restrictions

* C1 - Content Ingestion Pipeline
  * C1.1 **Text Content Processing**:
    * HTML parsing and text extraction
    * PDF content extraction
    * Plain text processing
    * Language detection and translation if needed
  * C1.2 **Audio Content Processing**:
    * Audio stream extraction
    * Whisper API integration for transcription
    * Audio metadata analysis
    * Podcast/show notes extraction
  * C1.3 **Video Content Processing**:
    * Video stream extraction
    * Key frame analysis using GPT-4 Vision
    * Audio transcription
    * Thumbnail and visual content analysis
  * C1.4 **Image Content Processing**:
    * Image downloading and analysis
    * OCR for text extraction
    * Visual content analysis using GPT-4 Vision
    * Image metadata extraction
* C2 – Tag Hierarchies & Auto-Taxonomy
* C3 – Temporal Context Engine
* C4 – Change Detection & Versioning
* C5 – PWA Share-Target Implementation
* C6 – Android Intent Handling
* C7 – Instapaper API Integration (following same staging → canonical pattern as Raindrop)
* C8 – Readwise API Integration (following same staging → canonical pattern as Raindrop)
* C9 – Enhanced Batch Operations
* C10 – Cross-Platform Sync Orchestration (manage multiple platform tokens and sync schedules)
* C11 – Front-End Display & Management
  * C11.1 **Unified Bookmark Display**:
    * **Status**: ✅ **Complete** - 2025-01-27
    * ✅ Show bookmarks from canonical `bookmarks.bookmarks` table
    * ✅ Display source indicator (Raindrop, Manual, Instapaper, Readwise)
    * ✅ Preview image support with fallback handling
    * ✅ Reusable `BookmarkCard` component
    * ✅ Responsive grid layout
    * **Missing:** Tag filtering functionality (UI exists but not implemented)
    * **Missing:** Tag editing functionality (UI exists but not implemented)
  * C11.2 **Tag Management System**:
    * Update UI to show AI-generated tags
    * Add tag filtering and search
    * Implement tag editing capabilities
    * Show content type indicators
  * C11.3 **Content Preview System**:
    * **Status**: 🔄 **Partially Complete** - 2025-01-27
    * ✅ Enhanced preview cards with image support
    * ✅ Image preview with fallback handling
    * ✅ Consistent card layout across content types
    * **Missing:** Thumbnail generation for videos
    * **Missing:** Audio player integration
    * **Missing:** Image galleries
  * C11.4 **Sync Controls & Token Management**:
    * Sync Options (automatic toggle, manual sync, batch sync, re-sync)
    * Token Usage (display limits, usage breakdown, warning system, optimization options)
    * Sync Status Dashboard (progress, last sync time, pending/failed syncs, retry options)
* D1 – Full-Text Search Engine
* D2 – Semantic Search Engine
* D3 – Contextual Ranking Engine
* E1 – Personal Knowledge Insights Dashboard
* E2 – Feedback-Aware Search Tuning
* E3 – LLM Copilot & Suggestions Engine

### Technical Considerations

1. **Rate Limiting & Performance**:
   * Implement exponential backoff for API calls
   * Cache results to avoid re-processing
   * Respect robots.txt and site policies
   * Handle timeouts and errors gracefully

2. **Storage & Processing**:
   * Efficient storage of extracted content
   * Processing queue management
   * Background job system for long-running tasks
   * Result caching strategy

3. **Error Handling**:
   * Graceful fallbacks for each content type
   * Comprehensive error logging
   * User feedback for processing status
   * Retry mechanisms for failed processing


> Detailed roadmap lives in `/docs/02_roadmap.md`. Tech-debt items in `/docs/06_tech_debt.md`.

_See the 📜 **Change Log** section below for a dated record of milestones._

---

## 🔄 Detailed Technical Workflow

> **Note:** This section provides detailed technical implementation of the Raindrop sync process. For high-level architecture, see the **Architecture & Flow** section above.

### Database Schema Details

#### raindrop.bookmarks (Staging Table)
```sql
CREATE TABLE raindrop.bookmarks (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id UUID NOT NULL REFERENCES identity.users(id),
    raindrop_id INTEGER NOT NULL,
    title TEXT,
    link TEXT NOT NULL,
    description TEXT,
    tags TEXT[],
    is_organized BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, raindrop_id)
);
```

#### bookmarks.bookmarks (Canonical Table)
```sql
CREATE TABLE bookmarks.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES identity.users(id),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    resolved_url TEXT,
    description TEXT,
    image_url TEXT,
    image_alt TEXT,
    site_name TEXT,
    tags TEXT[],
    source_type TEXT NOT NULL,
    source_id TEXT NOT NULL,
    source_metadata JSONB,
    is_organized BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, source_type, source_id)
);
```

### Field Mapping Between Systems

| Raindrop.io API    | raindrop.bookmarks | OpenGraph/Twitter  | bookmarks.bookmarks | Notes |
|-------------------|-------------------|-------------------|-----------------------|--------|
| _id (integer)     | raindrop_id (integer) | -             | source_id (string)    | Unique ID from Raindrop, converted to string for canonical storage |
| title             | title             | og:title / twitter:title | title          | Title of the bookmark |
| link              | link              | -                 | url                   | The actual URL |
| tags              | tags              | -                 | tags                  | Array of tags stored as TEXT[] |
| excerpt           | description       | og:description / twitter:description | description | Description/summary |
| domain            | -                 | og:site_name      | site_name             | Website name |
| -                 | -                 | og:image / twitter:image | image_url      | Primary image URL |
| -                 | -                 | og:image:alt      | image_alt             | Alternative text for image |
| -                 | -                 | -                 | source_type           | Set to 'raindrop' |
| -                 | -                 | -                 | source_metadata       | Additional metadata from source |
| -                 | -                 | -                 | resolved_url          | Final URL after redirects |

### Step-by-Step Process Flow

#### 1. Authentication & Authorization
- User authenticates via Google OAuth → JWT token
- User connects Raindrop account via OAuth flow
- Tokens stored in `raindrop.tokens` table

#### 2. Bookmark Sync (Staging)
- **Trigger**: Manual sync button or scheduled job
- **Process**:
  1. Fetch bookmarks from Raindrop API (paginated, 50 per page)
  2. Store raw data in `raindrop.bookmarks` staging table
  3. Log sync operation in `raindrop.sync_logs`
  4. Handle conflicts with `ON CONFLICT DO UPDATE`

#### 3. Metadata Enrichment (Planned)
- **Trigger**: Automatic after sync or manual enrichment
- **Process**:
  1. Query unorganized bookmarks (`is_organized = false`)
  2. For each bookmark:
     - Fetch OpenGraph/Twitter Card metadata
     - Extract title, description, image, site_name
     - Handle redirects to get resolved_url
  3. Update bookmark with enriched metadata

#### 4. Canonical Transfer (Planned)
- **Success Path**:
  1. Validate bookmark data using `validateBookmarkData(bookmark)` function
  2. Create entry in `bookmarks.bookmarks` with enriched data
  3. Set `source_type = 'raindrop'` and `source_id = raindrop_id`
  4. Update `is_organized = true` in `raindrop.bookmarks`
  5. Log successful transfer
- **Failure Path**:
  1. Log validation errors for manual review
  2. Keep bookmark in staging with `is_organized = false`
  3. Log failure reason for manual review

### Error Handling & Monitoring

#### Sync Failures
- Network errors: Logged with retry capability
- API rate limits: Exponential backoff (planned)
- Token expiry: Automatic refresh with fallback to re-auth

#### Metadata Enrichment Failures
- Invalid URLs: Skip and log
- Timeout errors: Configurable timeout (currently 10 seconds)
- Missing metadata: Partial enrichment allowed

#### Monitoring Points
- Sync success/failure rates
- Metadata enrichment completion rates
- Token refresh frequencies
- API response times and error rates

### Future Technical Improvements

1. **Automatic Sync Scheduling**
   - Implement cron job for periodic syncs
   - User-configurable sync frequency

2. **Enhanced Metadata Pipeline**
   - Multiple image variants support
   - Article content extraction
   - Media type detection

3. **Cross-Platform Deduplication**
   - URL-based duplicate detection
   - Content similarity matching
   - User-controlled merge options

4. **Performance Optimizations**
   - Batch metadata fetching
   - Concurrent processing
   - Result caching strategies

---

## ⚙️ API Surface (current)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET  | `/api/raindrop/verify`       | JWT | Check token presence |
| GET  | `/api/raindrop/oauth/start`  | JWT | Begin OAuth flow |
| GET  | `/api/raindrop/oauth/callback`

---

## 📜 Change Log

### 2025-01-27 - A3 Bookmark Transfer to Canonical ✅ **COMPLETE**
- **Major Milestone**: Completed bookmark transfer from staging to canonical store
- **Database**: Implemented `bookmarks.bookmarks` schema with comprehensive validation
- **API**: Added `POST /api/raindrop/transfer` endpoint for manual transfer triggering
- **Validation**: Comprehensive data validation with 37 test cases
- **Metadata Enrichment**: OpenGraph integration with fallback handling
- **Testing**: 100+ test cases with full coverage
- **Frontend**: Unified bookmark display from canonical table

### 2025-06-20 - A3.1 Display Canonical Bookmarks on Frontend ✅ **COMPLETE**
- **Frontend**: New `Bookmarks.jsx` component for unified display
- **API**: `GET /api/bookmarks` endpoint for canonical bookmarks
- **UI**: Enhanced `BookmarkCard` component with image preview support
- **Features**: Source indicators, metadata display, responsive grid layout
- **Testing**: Comprehensive test coverage for all components

### 2025-01-15 - A2 Raindrop Sync + Staging ✅ **COMPLETE**
- **OAuth**: Complete Raindrop.io OAuth flow implementation
- **Sync**: Manual and automatic bookmark synchronization
- **Staging**: `raindrop.bookmarks` table for raw data storage
- **Error Handling**: Comprehensive error handling and logging
- **Pagination**: Basic pagination support (50 items per page)

### 2025-01-10 - A1 OAuth + Token Management ✅ **COMPLETE**
- **Authentication**: Google OAuth → JWT token system
- **Raindrop OAuth**: Complete OAuth flow with token management
- **Security**: JWT-signed state tokens with 5-minute expiry
- **Token Refresh**: Automatic refresh with manual fallback
- **Pattern**: Established pattern for future platform integrations

### 2024-12-15 - Project Foundation
- **Architecture**: Established staging → canonical data flow pattern
- **Database**: Multi-schema PostgreSQL setup
- **Documentation**: Comprehensive README and technical documentation
- **Testing**: Jest test framework setup with comprehensive coverage

---

> **Next Major Milestones:**
> - A4: Sync Scheduler (cron jobs)
> - B1: Manual URL Input (API & UI)
> - B6: Instapaper Integration
> - B7: Readwise Integration