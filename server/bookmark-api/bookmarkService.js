/**
 * @fileoverview Bookmark Service - Data and Business Logic Layer
 * 
 * Purpose:
 * Manages all bookmark data operations and business logic. This service layer provides
 * a clean separation between database operations and HTTP handling. It handles creating,
 * updating, and retrieving bookmarks, as well as logging sync operations.
 * 
 * Database Schema:
 * - bookmark.bookmarks: Stores bookmark data
 *   - user_id: UUID (FK to identity.users)
 *   - url: TEXT
 *   - title: TEXT
 *   - description: TEXT
 *   - source: TEXT
 *   - created_at: TIMESTAMP
 *   - updated_at: TIMESTAMP
 * 
 * - bookmark.bookmark_sync_logs: Tracks sync operations
 *   - user_id: UUID
 *   - item_count: INTEGER
 *   - status: TEXT
 *   - error_msg: TEXT
 *   - finished_at: TIMESTAMP
 * 
 * Dependencies:
 * - ../db.js: PostgreSQL database connection
 * - Simple chunk implementation: For batch processing
 * 
 * @module bookmarkService
 */

const db = require('../db');

// Simple chunk implementation to replace lodash.chunk
const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

class BookmarkService {
  /**
   * Upserts multiple bookmarks for a user with batch processing
   * @param {string} userId - The user's ID
   * @param {Array<Object>} bookmarks - Array of bookmark objects
   * @returns {Promise<Array>} - Array of created/updated bookmarks
   */
  async upsertBookmarks(userId, bookmarks) {
    const BATCH_SIZE = 100;
    const results = [];
    
    // Process bookmarks in chunks
    const batches = chunk(bookmarks, BATCH_SIZE);
    
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(bookmark => this.addBookmark(userId, bookmark))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Adds a single bookmark for a user
   * @param {string} userId - The user's ID
   * @param {Object} data - Bookmark data
   * @param {string} data.url - The bookmark URL
   * @param {string} [data.title] - Optional title
   * @param {string} [data.description] - Optional description
   * @param {string} [data.source='manual'] - Source of the bookmark
   * @returns {Promise<Object>} - Created bookmark
   */
  async addBookmark(userId, data) {
    const { url, title, description, source = 'manual' } = data;
    
    // First try to find existing bookmark
    const existing = await db.query(
      'SELECT * FROM bookmark.bookmarks WHERE user_id = $1 AND url = $2',
      [userId, url]
    );

    if (existing.length > 0) {
      // Update existing bookmark
      const updated = await db.query(
        `UPDATE bookmark.bookmarks 
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $3 AND url = $4
         RETURNING *`,
        [title, description, userId, url]
      );
      return updated[0];
    }

    // Create new bookmark
    const created = await db.query(
      `INSERT INTO bookmark.bookmarks 
       (user_id, url, title, description, source)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, url, title, description, source]
    );

    return created[0];
  }

  /**
   * Gets all bookmarks for a user
   * @param {string} userId - The user's ID
   * @returns {Promise<Array>} - Array of bookmarks
   */
  async getBookmarks(userId) {
    return db.query(
      'SELECT * FROM bookmark.bookmarks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  }

  /**
   * Logs a sync operation
   * @param {string} userId - The user's ID
   * @param {number} itemCount - Number of items processed
   * @param {string} status - Status of the sync
   * @param {string} [errorMsg] - Optional error message
   */
  async logSync(userId, itemCount, status, errorMsg = null) {
    await db.query(
      `INSERT INTO bookmark.bookmark_sync_logs 
       (user_id, item_count, status, error_msg, finished_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [userId, itemCount, status, errorMsg]
    );
  }

  /**
   * Gets unorganised bookmarks for a user
   * @param {string} userId - The user's ID
   * @returns {Promise<Array>} - Array of unorganised bookmarks
   */
  async getUnorganisedBookmarks(userId) {
    return db.query(
      'SELECT * FROM bookmark.bookmarks WHERE user_id = $1 AND is_organised = false ORDER BY created_at DESC',
      [userId]
    );
  }

  /**
   * Updates bookmark metadata
   * @param {string} userId - The user's ID
   * @param {number} bookmarkId - The bookmark's ID
   * @param {Object} metadata - The metadata to update
   * @returns {Promise<Object>} - Updated bookmark
   */
  async updateBookmarkMetadata(userId, bookmarkId, metadata) {
    const {
      title,
      description,
      image,
      site_name,
      resolved_url,
      is_organised
    } = metadata;

    const result = await db.query(
      `UPDATE bookmark.bookmarks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           image = COALESCE($3, image),
           site_name = COALESCE($4, site_name),
           resolved_url = COALESCE($5, resolved_url),
           is_organised = COALESCE($6, is_organised),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $7 AND id = $8
       RETURNING *`,
      [title, description, image, site_name, resolved_url, is_organised, userId, bookmarkId]
    );

    if (result.length === 0) {
      throw new Error('Bookmark not found');
    }

    return result[0];
  }
}

module.exports = new BookmarkService(); 