const axios = require('axios');
const db = require('../db');

// ===== BOOKMARK FETCHING FUNCTIONS =====

/**
 * Fetch all collections from Raindrop.io
 * @param {string} accessToken - The access token for Raindrop.io API
 * @returns {Promise<Array>} Array of collections
 */
const getRaindropCollections = async (accessToken) => {
  // console.log('getCollections called with accessToken:', {
  //   hasToken: !!accessToken,
  //   tokenLength: accessToken ? accessToken.length : 0,
  //   tokenPreview: accessToken ? accessToken.substring(0, 10) + '...' : 'undefined'
  // });
  
  try {
    const response = await axios.get('https://api.raindrop.io/rest/v1/collections', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data || !response.data.items) {
      throw new Error('Invalid response format from Raindrop.io');
    }

    return response.data.items;
  } catch (error) {
    console.error('Error fetching collections:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetch bookmarks from a specific Raindrop collection
 * @param {string} accessToken - The access token for Raindrop.io API
 * @param {string} collectionId - The ID of the collection to fetch bookmarks from
 * @returns {Promise<Array>} Array of bookmarks
 */
const getRaindropBookmarksFromCollection = async (accessToken, collectionId) => {
  // console.log('getBookmarksFromCollection called with:', {
  //   accessToken: accessToken ? 'present' : 'missing',
  //   collectionId
  // });
  
  try {
    const response = await axios.get(`https://api.raindrop.io/rest/v1/raindrops/${collectionId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        perpage: 50,  // Maximum allowed by API
        page: 0
      }
    });

    // console.log('Raindrop API response:', {
    //   status: response.status,
    //   hasData: !!response.data,
    //   hasItems: !!response.data?.items,
    //   itemCount: response.data?.items?.length || 0
    // });

    if (!response.data || !response.data.items) {
      throw new Error('Invalid response format from Raindrop.io');
    }

    return response.data.items;
  } catch (error) {
    console.error('Error fetching bookmarks:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

/**
 * Fetch all bookmarks from all Raindrop collections
 * @param {string} accessToken - The access token for Raindrop.io API
 * @returns {Promise<Array>} Array of all bookmarks
 */
const getAllRaindropBookmarks = async (accessToken) => {
  try {
    // First get all collections
    const collections = await getRaindropCollections(accessToken);
    
    // Then fetch bookmarks from each collection
    const allBookmarks = [];
    for (const collection of collections) {
      const bookmarks = await getRaindropBookmarksFromCollection(accessToken, collection._id);
      allBookmarks.push(...bookmarks);
    }
    
    return allBookmarks;
  } catch (error) {
    console.error('Error fetching all Raindrop bookmarks:', error.message);
    throw error;
  }
};

// ===== BOOKMARK SAVING FUNCTIONS =====

/**
 * Normalize a bookmark from Raindrop.io format to our database format
 * @param {Object} bookmark - The bookmark from Raindrop.io
 * @param {string} userId - The user's ID
 * @returns {Object} Normalized bookmark object
 */
const normalizeRaindropBookmark = (bookmark, userId) => {
  return {
    user_id: userId,
    raindrop_id: bookmark._id,
    title: bookmark.title,
    link: bookmark.link,
    tags: bookmark.tags || [],
    created_at: new Date(bookmark.created),
    is_organised: false
  };
};

/**
 * Save a single Raindrop bookmark to the database
 * @param {Object} bookmark - The bookmark to save
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} The saved bookmark
 */
const saveRaindropBookmark = async (bookmark, userId) => {
  const normalizedBookmark = normalizeRaindropBookmark(bookmark, userId);
  
  try {
    const result = await db.query(
      `INSERT INTO raindrop.bookmarks (user_id, raindrop_id, title, link, tags, created_at, is_organised)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, raindrop_id) 
       DO UPDATE SET 
         title = EXCLUDED.title,
         link = EXCLUDED.link,
         tags = EXCLUDED.tags,
         created_at = EXCLUDED.created_at,
         is_organised = EXCLUDED.is_organised
       RETURNING *`,
      [
        normalizedBookmark.user_id,
        normalizedBookmark.raindrop_id,
        normalizedBookmark.title,
        normalizedBookmark.link,
        normalizedBookmark.tags,
        normalizedBookmark.created_at,
        normalizedBookmark.is_organised
      ]
    );
    
    return result[0];
  } catch (error) {
    console.error('Error saving Raindrop bookmark:', error);
    throw error;
  }
};

/**
 * Save multiple Raindrop bookmarks to the database
 * @param {Array} bookmarks - Array of bookmarks to save
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of saved bookmarks
 */
const saveRaindropBookmarks = async (bookmarks, userId) => {
  // console.log('saveRaindropBookmarks called with:', {
  //   bookmarkCount: bookmarks.length,
  //   userId,
  //   firstBookmark: bookmarks[0] ? {
  //     title: bookmarks[0].title,
  //     _id: bookmarks[0]._id
  //   } : null
  // });
  
  const normalizedBookmarks = bookmarks.map(bookmark => normalizeRaindropBookmark(bookmark, userId));
  
  try {
    // Use a transaction to ensure all bookmarks are saved or none are
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      const savedBookmarks = [];
      for (const bookmark of normalizedBookmarks) {
        const result = await client.query(
          `INSERT INTO raindrop.bookmarks (user_id, raindrop_id, title, link, tags, created_at, is_organised)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (user_id, raindrop_id) 
           DO UPDATE SET 
             title = EXCLUDED.title,
             link = EXCLUDED.link,
             tags = EXCLUDED.tags,
             created_at = EXCLUDED.created_at,
             is_organised = EXCLUDED.is_organised
           RETURNING *`,
          [
            bookmark.user_id,
            bookmark.raindrop_id,
            bookmark.title,
            bookmark.link,
            bookmark.tags,
            bookmark.created_at,
            bookmark.is_organised
          ]
        );
        savedBookmarks.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      // console.log('Successfully saved Raindrop bookmarks:', savedBookmarks.length);
      return savedBookmarks;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving Raindrop bookmarks:', error);
    throw error;
  }
};

/**
 * Get all Raindrop bookmarks for a user from the database
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of Raindrop bookmarks
 */
const getUserRaindropBookmarks = async (userId) => {
  try {
    const bookmarks = await db.query(
      'SELECT * FROM raindrop.bookmarks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    return bookmarks;
  } catch (error) {
    console.error('Error getting user Raindrop bookmarks:', error);
    throw error;
  }
};

module.exports = {
  // Raindrop bookmark fetching functions
  getRaindropCollections,
  getRaindropBookmarksFromCollection,
  getAllRaindropBookmarks,
  // Raindrop bookmark saving functions
  normalizeRaindropBookmark,
  saveRaindropBookmark,
  saveRaindropBookmarks,
  getUserRaindropBookmarks
}; 