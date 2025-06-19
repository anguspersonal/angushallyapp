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

/**
 * Check if a bookmark already exists in canonical store by source
 * @param {string} userId - The user's ID
 * @param {string} sourceType - The source type (e.g., 'raindrop')
 * @param {string} sourceId - The source ID from the platform
 * @returns {Promise<Object|null>} Existing bookmark or null
 */
const checkCanonicalBookmarkExists = async (userId, sourceType, sourceId) => {
  try {
    const result = await db.query(
      'SELECT * FROM bookmarks.bookmarks WHERE user_id = $1 AND source_type = $2 AND source_id = $3',
      [userId, sourceType, sourceId]
    );
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error checking canonical bookmark existence:', error);
    throw error;
  }
};

/**
 * Transfer a single Raindrop bookmark to canonical store
 * @param {Object} raindropBookmark - The Raindrop bookmark to transfer
 * @returns {Promise<Object>} The transferred canonical bookmark
 */
const transferRaindropBookmarkToCanonical = async (raindropBookmark) => {
  try {
    // Check if bookmark already exists in canonical store by source
    const existingBookmark = await checkCanonicalBookmarkExists(
      raindropBookmark.user_id, 
      'raindrop',
      raindropBookmark.raindrop_id
    );

    
    // If bookmark exists in canonical store, update it
    if (existingBookmark) {
      // Update existing bookmark with any new metadata
      const result = await db.query(
        `UPDATE bookmarks.bookmarks 
         SET title = COALESCE($1, title),
             url = COALESCE($2, url),
             tags = COALESCE($3, tags),
             source_metadata = COALESCE($4, source_metadata),
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [
          raindropBookmark.title,
          raindropBookmark.link,
          raindropBookmark.tags,
          { raindrop_id: raindropBookmark.raindrop_id },
          existingBookmark.id
        ]
      );
      
      // Mark as organized in staging table
      await db.query(
        'UPDATE raindrop.bookmarks SET is_organized = true WHERE id = $1',
        [raindropBookmark.id]
      );
      
      return result[0];
    }
    
    // If bookmark does not exist in canonical store, create it
    const result = await db.query(
      `INSERT INTO bookmarks.bookmarks (
        user_id, title, url, tags, source_type, source_id, source_metadata, 
        is_organized, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        raindropBookmark.user_id,
        raindropBookmark.title,
        raindropBookmark.link,
        raindropBookmark.tags,
        'raindrop',
        raindropBookmark.raindrop_id,
        { raindrop_id: raindropBookmark.raindrop_id },
        false, // Will be set to true after enrichment
        raindropBookmark.created_at,
        new Date()
      ]
    );
    
    // Mark as organized in staging table
    await db.query(
      'UPDATE raindrop.bookmarks SET is_organized = true WHERE id = $1',
      [raindropBookmark.id]
    );
    
    return result[0];
  } catch (error) {
    console.error('Error transferring Raindrop bookmark to canonical:', error);
    throw error;
  }
};

/**
 * Get unorganized Raindrop bookmarks for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of unorganized Raindrop bookmarks
 */
const getUnorganizedRaindropBookmarks = async (userId) => {
  try {
    const bookmarks = await db.query(
      'SELECT * FROM raindrop.bookmarks WHERE user_id = $1 AND is_organized = false ORDER BY created_at ASC',
      [userId]
    );
    
    return bookmarks;
  } catch (error) {
    console.error('Error getting unorganized Raindrop bookmarks:', error);
    throw error;
  }
};

/**
 * Mark a Raindrop bookmark as organized in the staging table
 * @param {number} bookmarkId - The bookmark ID in raindrop.bookmarks
 * @returns {Promise<Object>} The updated bookmark
 */
const markRaindropBookmarkAsOrganized = async (bookmarkId) => {
  try {
    const result = await db.query(
      'UPDATE raindrop.bookmarks SET is_organized = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [bookmarkId]
    );
    
    if (result.length === 0) {
      throw new Error(`Bookmark with ID ${bookmarkId} not found`);
    }
    
    return result[0];
  } catch (error) {
    console.error('Error marking bookmark as organized:', error);
    throw error;
  }
};

/**
 * Transfer all unorganized Raindrop bookmarks to canonical store
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} Transfer results with success/failure counts
 */
const transferUnorganizedRaindropBookmarks = async (userId) => {
  console.log(`🔄 Starting transfer of unorganized Raindrop bookmarks for user ${userId}`);
  
  try {
    // Get all unorganized bookmarks
    const unorganizedBookmarks = await getUnorganizedRaindropBookmarks(userId);
    
    if (unorganizedBookmarks.length === 0) {
      console.log('ℹ️  No unorganized bookmarks found for transfer');
      return {
        success: 0,
        failed: 0,
        total: 0,
        errors: [],
        message: 'No unorganized bookmarks found'
      };
    }
    
    console.log(`📦 Found ${unorganizedBookmarks.length} unorganized bookmarks to transfer`);
    
    const results = {
      success: 0,
      failed: 0,
      total: unorganizedBookmarks.length,
      errors: [],
      transferredBookmarks: []
    };
    
    // Process each bookmark
    for (const bookmark of unorganizedBookmarks) {
      try {
        console.log(`🔄 Transferring bookmark: ${bookmark.title || 'Untitled'} (ID: ${bookmark.id})`);
        
        // Transfer to canonical store
        const transferredBookmark = await transferRaindropBookmarkToCanonical(bookmark);
        
        // Note: transferRaindropBookmarkToCanonical already marks the bookmark as organized
        // No need to call markRaindropBookmarkAsOrganized separately
        
        results.success++;
        results.transferredBookmarks.push({
          stagingId: bookmark.id,
          canonicalId: transferredBookmark.id,
          title: transferredBookmark.title
        });
        
        console.log(`✅ Successfully transferred bookmark: ${transferredBookmark.title}`);
        
      } catch (error) {
        console.error(`❌ Failed to transfer bookmark ${bookmark.id}:`, error.message);
        results.failed++;
        results.errors.push({
          bookmarkId: bookmark.id,
          title: bookmark.title || 'Untitled',
          error: error.message
        });
      }
    }
    
    console.log(`🎉 Transfer completed: ${results.success} successful, ${results.failed} failed`);
    
    return results;
    
  } catch (error) {
    console.error('Error in transferUnorganizedRaindropBookmarks:', error);
    throw error;
  }
};

/**
 * Validate bookmark data before transfer to canonical store
 * @param {Object} bookmark - The bookmark data to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
const validateBookmarkData = (bookmark) => {
  const errors = [];
  
  // Required fields validation
  if (bookmark.user_id === undefined || bookmark.user_id === null) {
    errors.push('user_id is required');
  } else if (typeof bookmark.user_id !== 'string' || !bookmark.user_id.trim()) {
    errors.push('user_id must be a non-empty string');
  }
  
  if (bookmark.title === undefined || bookmark.title === null) {
    errors.push('title is required');
  } else if (typeof bookmark.title !== 'string' || !bookmark.title.trim()) {
    errors.push('title must be a non-empty string');
  }
  
  if (bookmark.url === undefined || bookmark.url === null) {
    errors.push('url is required');
  } else if (typeof bookmark.url !== 'string' || !bookmark.url.trim()) {
    errors.push('url must be a non-empty string');
  } else {
    // Basic URL validation
    try {
      new URL(bookmark.url);
    } catch (e) {
      errors.push('url must be a valid URL format');
    }
  }
  
  if (bookmark.source_type === undefined || bookmark.source_type === null) {
    errors.push('source_type is required');
  } else if (typeof bookmark.source_type !== 'string' || !bookmark.source_type.trim()) {
    errors.push('source_type must be a non-empty string');
  }
  
  if (bookmark.source_id === undefined || bookmark.source_id === null) {
    errors.push('source_id is required');
  } else if (typeof bookmark.source_id !== 'string' || !bookmark.source_id.trim()) {
    errors.push('source_id must be a non-empty string');
  }
  
  // Optional fields validation
  if (bookmark.resolved_url !== undefined && bookmark.resolved_url !== null) {
    if (typeof bookmark.resolved_url !== 'string') {
      errors.push('resolved_url must be a string if provided');
    } else if (bookmark.resolved_url.trim()) {
      try {
        new URL(bookmark.resolved_url);
      } catch (e) {
        errors.push('resolved_url must be a valid URL format if provided');
      }
    }
  }
  
  if (bookmark.description !== undefined && bookmark.description !== null) {
    if (typeof bookmark.description !== 'string') {
      errors.push('description must be a string if provided');
    }
  }
  
  if (bookmark.image_url !== undefined && bookmark.image_url !== null) {
    if (typeof bookmark.image_url !== 'string') {
      errors.push('image_url must be a string if provided');
    } else if (bookmark.image_url.trim()) {
      try {
        new URL(bookmark.image_url);
      } catch (e) {
        errors.push('image_url must be a valid URL format if provided');
      }
    }
  }
  
  if (bookmark.image_alt !== undefined && bookmark.image_alt !== null) {
    if (typeof bookmark.image_alt !== 'string') {
      errors.push('image_alt must be a string if provided');
    }
  }
  
  if (bookmark.site_name !== undefined && bookmark.site_name !== null) {
    if (typeof bookmark.site_name !== 'string') {
      errors.push('site_name must be a string if provided');
    }
  }
  
  if (bookmark.tags !== undefined && bookmark.tags !== null) {
    if (!Array.isArray(bookmark.tags)) {
      errors.push('tags must be an array if provided');
    } else {
      // Validate each tag is a string
      bookmark.tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push(`tags[${index}] must be a string`);
        }
      });
    }
  }
  
  if (bookmark.source_metadata !== undefined && bookmark.source_metadata !== null) {
    if (typeof bookmark.source_metadata !== 'object' || Array.isArray(bookmark.source_metadata)) {
      errors.push('source_metadata must be an object if provided');
    }
  }
  
  if (bookmark.is_organized !== undefined && bookmark.is_organized !== null) {
    if (typeof bookmark.is_organized !== 'boolean') {
      errors.push('is_organized must be a boolean if provided');
    }
  }
  
  if (bookmark.created_at !== undefined && bookmark.created_at !== null) {
    if (!(bookmark.created_at instanceof Date) && isNaN(Date.parse(bookmark.created_at))) {
      errors.push('created_at must be a valid date if provided');
    }
  }
  
  // Field length validation
  if (bookmark.title && bookmark.title.length > 1000) {
    errors.push('title must be 1000 characters or less');
  }
  
  if (bookmark.url && bookmark.url.length > 2048) {
    errors.push('url must be 2048 characters or less');
  }
  
  if (bookmark.resolved_url && bookmark.resolved_url.length > 2048) {
    errors.push('resolved_url must be 2048 characters or less');
  }
  
  if (bookmark.description && bookmark.description.length > 5000) {
    errors.push('description must be 5000 characters or less');
  }
  
  if (bookmark.image_url && bookmark.image_url.length > 2048) {
    errors.push('image_url must be 2048 characters or less');
  }
  
  if (bookmark.image_alt && bookmark.image_alt.length > 500) {
    errors.push('image_alt must be 500 characters or less');
  }
  
  if (bookmark.site_name && bookmark.site_name.length > 200) {
    errors.push('site_name must be 200 characters or less');
  }
  
  if (bookmark.source_type && bookmark.source_type.length > 50) {
    errors.push('source_type must be 50 characters or less');
  }
  
  if (bookmark.source_id && bookmark.source_id.length > 255) {
    errors.push('source_id must be 255 characters or less');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Create a new bookmark in the canonical bookmarks.bookmarks table
 * @param {Object} enrichedData - The enriched bookmark data
 * @returns {Promise<Object>} The created canonical bookmark
 */
const createCanonicalBookmark = async (enrichedData) => {
  try {
    const result = await db.query(
      `INSERT INTO bookmarks.bookmarks (
        user_id, title, url, resolved_url, description, image_url, image_alt, site_name,
        tags, source_type, source_id, source_metadata, 
        is_organized, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        enrichedData.user_id,
        enrichedData.title,
        enrichedData.url,
        enrichedData.resolved_url || enrichedData.url,
        enrichedData.description,
        enrichedData.image_url,
        enrichedData.image_alt,
        enrichedData.site_name,
        enrichedData.tags || [],
        enrichedData.source_type,
        enrichedData.source_id,
        enrichedData.source_metadata || {},
        enrichedData.is_organized || false,
        enrichedData.created_at || new Date(),
        new Date()
      ]
    );
    
    return result[0];
  } catch (error) {
    console.error('Error creating canonical bookmark:', error);
    throw error;
  }
};

/**
 * Update an existing bookmark in the canonical bookmarks.bookmarks table
 * @param {string} bookmarkId - The canonical bookmark ID
 * @param {Object} data - The data to update
 * @returns {Promise<Object>} The updated canonical bookmark
 */
const updateCanonicalBookmark = async (bookmarkId, data) => {
  try {
    const result = await db.query(
      `UPDATE bookmarks.bookmarks 
       SET title = COALESCE($1, title),
           url = COALESCE($2, url),
           resolved_url = COALESCE($3, resolved_url),
           description = COALESCE($4, description),
           image_url = COALESCE($5, image_url),
           image_alt = COALESCE($6, image_alt),
           site_name = COALESCE($7, site_name),
           tags = COALESCE($8, tags),
           source_metadata = COALESCE($9, source_metadata),
           is_organized = COALESCE($10, is_organized),
           updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        data.title,
        data.url,
        data.resolved_url,
        data.description,
        data.image_url,
        data.image_alt,
        data.site_name,
        data.tags,
        data.source_metadata,
        data.is_organized,
        bookmarkId
      ]
    );
    
    if (result.length === 0) {
      throw new Error(`Canonical bookmark with ID ${bookmarkId} not found`);
    }
    
    return result[0];
  } catch (error) {
    console.error('Error updating canonical bookmark:', error);
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
  getUserRaindropBookmarks,
  checkCanonicalBookmarkExists,
  transferRaindropBookmarkToCanonical,
  getUnorganizedRaindropBookmarks,
  markRaindropBookmarkAsOrganized,
  transferUnorganizedRaindropBookmarks,
  // Canonical bookmark operations
  validateBookmarkData,
  createCanonicalBookmark,
  updateCanonicalBookmark
}; 