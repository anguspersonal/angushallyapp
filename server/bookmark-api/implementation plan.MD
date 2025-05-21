## Bookmarking Service Implementation Plan & Decisions

**Context & Scope**

* We are building a dedicated bookmark service within our existing full-stack app, bypassing third-party APIs for now.
* The PWA share-target approach is backlogged.
* All code will live under `/server/bookmark-api` and integrate with existing auth, DB, and React UI.

---

### 1. Decisions

1. **Service-First**: Roll our own bookmark service immediately, no Instapaper or OAuth for v1.
2. **Folder Structure**: Use `/server/bookmark-api/` for all back-end code.
3. **Routes**:

   * **POST** `/api/bookmarks` → add one bookmark
   * **GET** `/api/bookmarks` → list bookmarks
   * *(Optional later)* **POST** `/api/bookmarks/batch`
   * *(Optional later)* **GET** `/api/bookmarks/add?url=…`
4. **Data Model**:

   * `bookmarks` table to store URL, metadata, user association, and source.
   * `bookmark_sync_logs` table for audit (backfilled if needed).
5. **Metadata**: Use an optional `openGraph.js` module to fetch page title/description on create.
6. **Auth**: Use existing JWT-based `authMiddleware` for all bookmark routes.
7. **Testing**: Jest + Supertest for unit and integration; migrations on a test DB.
8. **Front-End**: Extend React API client and add `<BookmarkList />` and `<AddBookmarkForm />` components.
9. **Backlog**: PWA share-target and Android intent handling deferred to later.

---

### 2. Phase-by-Phase Implementation Tasks -- Done✅

#### 🔧 A. Database & Migrations

* Create a Knex migration: `create_bookmarks_and_logs.js`

  ```
  exports.up = function(knex) {
    return knex.schema
      .createTable('bookmarks', tbl => {
        tbl.increments('id').primary();
        tbl.uuid('user_id').notNullable().references('users.user_id');
        tbl.text('url').notNullable();
        tbl.text('resolved_url');
        tbl.text('title');
        tbl.text('description');
        tbl.text('source').notNullable().defaultTo('manual');
        tbl.timestamp('created_at').defaultTo(knex.fn.now());
      })
      .createTable('bookmark_sync_logs', tbl => {
        tbl.increments('id').primary();
        tbl.uuid('user_id').notNullable();
        tbl.integer('item_count').notNullable();
        tbl.text('status').notNullable();
        tbl.text('error_msg');
        tbl.timestamp('started_at').defaultTo(knex.fn.now());
        tbl.timestamp('finished_at');
      });
  };

  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists('bookmark_sync_logs')
      .dropTableIfExists('bookmarks');
  };
  ```
* Run `knex migrate:latest` and verify tables.

#### 🛠 B. Back-End Implementation

1. **Service Layer** (`/server/bookmark-api/bookmarkService.js`)

   * `upsertBookmarks(userId, bookmarks[])` with batch chunking (100 items).
   * `addBookmark(userId, data)` wrapper for single.
2. **Metadata Fetcher** (`/server/bookmark-api/openGraph.js`)

   * Optional `fetchMetadata(url)` using `open-graph-scraper`.
3. **Controller** (`/server/bookmark-api/bookmarkController.js`)

   * `list(req, res)` → return all user bookmarks.
   * `createSingle(req, res)` → fetch metadata if needed, then add.
4. **Routes** (`/server/bookmark-api/bookmarkRoutes.js`)

   ```
   router.get('/', list);
   router.post('/', createSingle);
   router.get('/health', (req, res) => {
     res.status(200).json({ status: 'ok', timestamp: new Date() });
   });
   module.exports = router;
   ```
5. \*\*Mount in \*\*\`\`

   ```
   const bookmarkRouter = require('./bookmark-api/bookmarkRoutes');
   app.use('/api/bookmarks', authMiddleware, bookmarkRouter);
   ```

#### 🧪 C. Testing

* **Unit Tests**:
  * Mock DB calls to verify upsert logic and conflict resolution.
  * Mock `open-graph-scraper` for `fetchMetadata`.
  * Standardized test user setup with consistent UUIDs
  * Proper mocking of utility functions
* **Integration Tests**:
  * Use Supertest + test database.
  * Cover `GET /api/bookmarks` and `POST /api/bookmarks` end-to-end.
  * Enhanced database cleanup and connection handling
  * Fixed foreign key constraint issues
  * Improved async operation handling

#### 🎨 D. Front-End Integration

* **API Client** (`/react-ui/src/api/bookmarks.js`)

  ```
  export const fetchBookmarks = () => api.get('/bookmarks');
  export const addBookmark     = url => api.post('/bookmarks', { url });
  ```
* **Components**:

  * `<AddBookmarkForm />`: input + submit button.
  * `<BookmarkList />`: list cards/table of bookmarks.

#### 🚀 E. Deployment & Verification

* Deploy new migrations and code to staging.
* Verify endpoints with Postman and React UI.
* Validate auth and error handling.

---

**Next Step**: Kick off the migration and scaffold the `/server/bookmark-api` folder with empty files. Let me know when you're ready to start coding!
