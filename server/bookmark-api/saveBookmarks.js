const db = require('../db');

/**
 * Normalize a bookmark from Raindrop.io format to our database format
 * @param {Object} bookmark - The bookmark from Raindrop.io
 * @param {string} userId - The user's ID
 * @returns {Object} Normalized bookmark object
 */
const normalizeBookmark = (bookmark, userId) => {
  return {
    user_id: userId,
    raindrop_id: bookmark._id,
    title: bookmark.title,
    link: bookmark.link,
    tags: bookmark.tags || [],
    created_at: new Date(bookmark.created)
  };
};

/**
 * Save a single bookmark to the database
 * @param {Object} bookmark - The bookmark to save
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} The saved bookmark
 */
const saveBookmark = async (bookmark, userId) => {
  const normalizedBookmark = normalizeBookmark(bookmark, userId);
  
  try {
    const result = await db.query(
      `INSERT INTO raindrop.bookmarks (user_id, raindrop_id, title, link, tags, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, raindrop_id) 
       DO UPDATE SET 
         title = EXCLUDED.title,
         link = EXCLUDED.link,
         tags = EXCLUDED.tags,
         created_at = EXCLUDED.created_at
       RETURNING *`,
      [
        normalizedBookmark.user_id,
        normalizedBookmark.raindrop_id,
        normalizedBookmark.title,
        normalizedBookmark.link,
        normalizedBookmark.tags,
        normalizedBookmark.created_at
      ]
    );
    
    return result[0];
  } catch (error) {
    console.error('Error saving bookmark:', error);
    throw error;
  }
};

/**
 * Save multiple bookmarks to the database
 * @param {Array} bookmarks - Array of bookmarks to save
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of saved bookmarks
 */
const saveBookmarks = async (bookmarks, userId) => {
  // console.log('saveBookmarks called with:', {
  //   bookmarkCount: bookmarks.length,
  //   userId,
  //   firstBookmark: bookmarks[0] ? {
  //     title: bookmarks[0].title,
  //     _id: bookmarks[0]._id
  //   } : null
  // });
  
  const normalizedBookmarks = bookmarks.map(bookmark => normalizeBookmark(bookmark, userId));
  
  try {
    // Use a transaction to ensure all bookmarks are saved or none are
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      const savedBookmarks = [];
      for (const bookmark of normalizedBookmarks) {
        const result = await client.query(
          `INSERT INTO raindrop.bookmarks (user_id, raindrop_id, title, link, tags, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (user_id, raindrop_id) 
           DO UPDATE SET 
             title = EXCLUDED.title,
             link = EXCLUDED.link,
             tags = EXCLUDED.tags,
             created_at = EXCLUDED.created_at
           RETURNING *`,
          [
            bookmark.user_id,
            bookmark.raindrop_id,
            bookmark.title,
            bookmark.link,
            bookmark.tags,
            bookmark.created_at
          ]
        );
        savedBookmarks.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      // console.log('Successfully saved bookmarks:', savedBookmarks.length);
      return savedBookmarks;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving bookmarks:', error);
    throw error;
  }
};

/**
 * Get all bookmarks for a user from the database
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of bookmarks
 */
const getUserBookmarks = async (userId) => {
  try {
    const bookmarks = await db.query(
      'SELECT * FROM raindrop.bookmarks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    return bookmarks;
  } catch (error) {
    console.error('Error getting user bookmarks:', error);
    throw error;
  }
};

module.exports = {
  normalizeBookmark,
  saveBookmark,
  saveBookmarks,
  getUserBookmarks
}; 