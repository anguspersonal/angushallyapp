const axios = require('axios');
const db = require('../db');
const openGraph = require('./openGraph');

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
 * Transfer a single Raindrop bookmark to canonical store with metadata enrichment
 * @param {Object} raindropBookmark - The Raindrop bookmark to transfer
 * @returns {Promise<Object>} The transferred canonical bookmark
 */
const transferRaindropBookmarkToCanonical = async (raindropBookmark) => {
  try {
    console.log(`🔄 Starting transfer for bookmark: ${raindropBookmark.title || 'Untitled'} (ID: ${raindropBookmark.id})`);
    
    // Step 1: Fetch OpenGraph metadata from the URL
    let enrichedMetadata = null;
    if (raindropBookmark.link && openGraph.isValidUrl(raindropBookmark.link)) {
      try {
        console.log(`📡 Fetching metadata for: ${raindropBookmark.link}`);
        enrichedMetadata = await openGraph.fetchMetadata(raindropBookmark.link);
        
        if (enrichedMetadata.error) {
          console.warn(`⚠️  Metadata fetch failed for ${raindropBookmark.link}:`, enrichedMetadata.error.message);
        } else {
          console.log(`✅ Metadata fetched successfully for: ${raindropBookmark.link}`);
        }
      } catch (error) {
        console.warn(`⚠️  Metadata enrichment failed for ${raindropBookmark.link}:`, error.message);
        enrichedMetadata = null;
      }
    }

    // Step 2: Merge Raindrop data with enriched metadata
    // Priority: Raindrop data first, then OpenGraph data as fallback/enhancement
    const mergedData = {
      title: raindropBookmark.title || enrichedMetadata?.title || 'Untitled',
      url: raindropBookmark.link,
      resolved_url: enrichedMetadata?.resolved_url || raindropBookmark.link,
      description: raindropBookmark.description || enrichedMetadata?.description,
      image_url: enrichedMetadata?.image,
      site_name: enrichedMetadata?.site_name,
      tags: raindropBookmark.tags || []
    };

    // Step 3: Transform to canonical format for validation
    const canonicalFormat = {
      user_id: raindropBookmark.user_id,
      title: mergedData.title,
      url: mergedData.url,
      resolved_url: mergedData.resolved_url,
      description: mergedData.description,
      image_url: mergedData.image_url,
      site_name: mergedData.site_name,
      tags: mergedData.tags,
      source_type: 'raindrop',
      source_id: String(raindropBookmark.raindrop_id),
      source_metadata: { 
        raindrop_id: raindropBookmark.raindrop_id,
        original_created_at: raindropBookmark.created_at,
        metadata_enriched: !!enrichedMetadata,
        metadata_source: enrichedMetadata ? 'opengraph' : null,
        metadata_error: enrichedMetadata?.error || null
      },
      is_organized: false,
      created_at: raindropBookmark.created_at
    };

    // Step 4: Validate the enriched bookmark data
    const validation = validateBookmarkData(canonicalFormat);
    if (!validation.isValid) {
      const validationError = new Error(`Bookmark validation failed: ${validation.errors.join(', ')}`);
      validationError.name = 'ValidationError';
      validationError.details = validation.errors;
      throw validationError;
    }

    // Step 5: Check if bookmark already exists in canonical store
    const existingBookmark = await checkCanonicalBookmarkExists(
      raindropBookmark.user_id, 
      'raindrop',
      String(raindropBookmark.raindrop_id)
    );

    // Step 6: Update or create bookmark in canonical store
    if (existingBookmark) {
      console.log(`🔄 Updating existing bookmark: ${existingBookmark.id}`);
      
      // Prepare update data with enriched metadata
      const updateData = {
        title: canonicalFormat.title,
        url: canonicalFormat.url,
        resolved_url: canonicalFormat.resolved_url,
        description: canonicalFormat.description,
        image_url: canonicalFormat.image_url,
        site_name: canonicalFormat.site_name,
        tags: canonicalFormat.tags,
        source_metadata: canonicalFormat.source_metadata
      };

      // Update existing bookmark with enriched data
      const result = await db.query(
        `UPDATE bookmarks.bookmarks 
         SET title = COALESCE($1, title),
             url = COALESCE($2, url),
             resolved_url = COALESCE($3, resolved_url),
             description = COALESCE($4, description),
             image_url = COALESCE($5, image_url),
             site_name = COALESCE($6, site_name),
             tags = COALESCE($7, tags),
             source_metadata = COALESCE($8, source_metadata),
             updated_at = NOW()
         WHERE id = $9
         RETURNING *`,
        [
          updateData.title,
          updateData.url,
          updateData.resolved_url,
          updateData.description,
          updateData.image_url,
          updateData.site_name,
          updateData.tags,
          updateData.source_metadata,
          existingBookmark.id
        ]
      );
      
      // Mark as organized in staging table
      await db.query(
        'UPDATE raindrop.bookmarks SET is_organized = true WHERE id = $1',
        [raindropBookmark.id]
      );
      
      console.log(`✅ Updated bookmark: ${existingBookmark.id}`);
      return result[0];
    } else {
      console.log(`🆕 Creating new bookmark with enriched metadata`);
      
      // Create new bookmark with enriched data
      const result = await db.query(
        `INSERT INTO bookmarks.bookmarks (
          user_id, title, url, resolved_url, description, image_url, image_alt, site_name,
          tags, source_type, source_id, source_metadata, 
          is_organized, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          canonicalFormat.user_id,
          canonicalFormat.title,
          canonicalFormat.url,
          canonicalFormat.resolved_url,
          canonicalFormat.description,
          canonicalFormat.image_url,
          null, // image_alt - not currently supported by OpenGraph service
          canonicalFormat.site_name,
          canonicalFormat.tags,
          canonicalFormat.source_type,
          canonicalFormat.source_id,
          canonicalFormat.source_metadata,
          canonicalFormat.is_organized,
          canonicalFormat.created_at,
          new Date()
        ]
      );
      
      // Mark as organized in staging table
      await db.query(
        'UPDATE raindrop.bookmarks SET is_organized = true WHERE id = $1',
        [raindropBookmark.id]
      );
      
      console.log(`✅ Created new bookmark: ${result[0].id}`);
      return result[0];
    }
  } catch (error) {
    // Enhanced error logging with validation details
    if (error.name === 'ValidationError') {
      console.error('❌ Bookmark validation failed:', {
        bookmarkId: raindropBookmark.id,
        title: raindropBookmark.title,
        validationErrors: error.details
      });
    } else {
      console.error('❌ Error transferring Raindrop bookmark to canonical:', error);
    }
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
    console.log(`🔍 Metadata enrichment will be attempted for each bookmark`);
    
    const results = {
      success: 0,
      failed: 0,
      total: unorganizedBookmarks.length,
      errors: [],
      transferredBookmarks: [],
      enrichmentStats: {
        enriched: 0,
        failed: 0,
        skipped: 0
      }
    };
    
    // Process each bookmark
    for (const bookmark of unorganizedBookmarks) {
      try {
        console.log(`🔄 Transferring bookmark: ${bookmark.title || 'Untitled'} (ID: ${bookmark.id})`);
        
        // Transfer to canonical store with metadata enrichment
        const transferredBookmark = await transferRaindropBookmarkToCanonical(bookmark);
        
        // Track enrichment statistics from source_metadata
        if (transferredBookmark.source_metadata) {
          if (transferredBookmark.source_metadata.metadata_enriched) {
            results.enrichmentStats.enriched++;
            console.log(`✅ Bookmark enriched with metadata from: ${transferredBookmark.source_metadata.metadata_source}`);
          } else if (transferredBookmark.source_metadata.metadata_error) {
            results.enrichmentStats.failed++;
            console.log(`⚠️  Metadata enrichment failed: ${transferredBookmark.source_metadata.metadata_error.message}`);
          } else {
            results.enrichmentStats.skipped++;
            console.log(`ℹ️  Metadata enrichment skipped (invalid URL or other reason)`);
          }
        }
        
        results.success++;
        results.transferredBookmarks.push({
          stagingId: bookmark.id,
          canonicalId: transferredBookmark.id,
          title: transferredBookmark.title,
          enriched: transferredBookmark.source_metadata?.metadata_enriched || false
        });
        
        console.log(`✅ Successfully transferred bookmark: ${transferredBookmark.title}`);
        
      } catch (error) {
        // Enhanced error handling for validation vs other errors
        if (error.name === 'ValidationError') {
          console.error(`❌ Validation failed for bookmark ${bookmark.id}:`, {
            title: bookmark.title,
            validationErrors: error.details
          });
          results.failed++;
          results.errors.push({
            bookmarkId: bookmark.id,
            title: bookmark.title,
            error: `Validation failed: ${error.details.join(', ')}`,
            errorType: 'validation'
          });
        } else {
          console.error(`❌ Transfer failed for bookmark ${bookmark.id}:`, error.message);
          results.failed++;
          results.errors.push({
            bookmarkId: bookmark.id,
            title: bookmark.title || 'Untitled',
            error: error.message,
            errorType: 'database'
          });
        }
      }
    }
    
    // Final summary with enrichment statistics
    console.log(`🎉 Transfer completed: ${results.success} successful, ${results.failed} failed`);
    console.log(`📊 Metadata enrichment summary:`);
    console.log(`   - Enriched: ${results.enrichmentStats.enriched}`);
    console.log(`   - Failed enrichment: ${results.enrichmentStats.failed}`);
    console.log(`   - Skipped enrichment: ${results.enrichmentStats.skipped}`);
    
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

/**
 * Get user's canonical bookmarks from the bookmarks.bookmarks table
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of canonical bookmarks
 */
const getUserCanonicalBookmarks = async (userId) => {
  try {
    const result = await db.query(
      'SELECT * FROM bookmarks.bookmarks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    return result;
  } catch (error) {
    console.error('Error fetching canonical bookmarks:', error);
    throw error;
  }
};

/**
 * Get user's canonical bookmarks with automatic transfer from raindrop if canonical store is empty
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} Object containing bookmarks and metadata about auto-transfer
 */
const getUserCanonicalBookmarksWithAutoTransfer = async (userId) => {
  try {
    // Step 1: Check canonical store first
    const canonicalBookmarks = await getUserCanonicalBookmarks(userId);
    
    // Step 2: If canonical store has bookmarks, return them directly
    if (canonicalBookmarks.length > 0) {
      console.log(`📚 Found ${canonicalBookmarks.length} canonical bookmarks for user ${userId}`);
      return {
        bookmarks: canonicalBookmarks,
        _metadata: {
          autoTransfer: false,
          source: 'canonical',
          totalBookmarks: canonicalBookmarks.length
        }
      };
    }
    
    // Step 3: Canonical store is empty, check for unorganized Raindrop bookmarks
    console.log(`📭 Canonical store empty for user ${userId}, checking for unorganized Raindrop bookmarks`);
    const unorganizedBookmarks = await getUnorganizedRaindropBookmarks(userId);
    
    if (unorganizedBookmarks.length === 0) {
      console.log(`ℹ️  No unorganized Raindrop bookmarks found for user ${userId}`);
      return {
        bookmarks: [],
        _metadata: {
          autoTransfer: false,
          source: 'none',
          totalBookmarks: 0,
          message: 'No bookmarks found in either canonical or raindrop stores'
        }
      };
    }
    
    // Step 4: Found unorganized bookmarks, trigger automatic transfer
    console.log(`🔄 Found ${unorganizedBookmarks.length} unorganized Raindrop bookmarks, starting automatic transfer`);
    
    const transferResult = await transferUnorganizedRaindropBookmarks(userId);
    
    // Step 5: Get the transferred bookmarks from canonical store
    const transferredBookmarks = await getUserCanonicalBookmarks(userId);
    
    console.log(`✅ Automatic transfer completed: ${transferResult.success} successful, ${transferResult.failed} failed`);
    
    return {
      bookmarks: transferredBookmarks,
      _metadata: {
        autoTransfer: true,
        source: 'raindrop',
        totalBookmarks: transferredBookmarks.length,
        transferStats: {
          success: transferResult.success,
          failed: transferResult.failed,
          total: transferResult.total,
          enrichmentStats: transferResult.enrichmentStats
        },
        message: `Automatic transfer completed: ${transferResult.success} bookmarks transferred with metadata enrichment`
      }
    };
    
  } catch (error) {
    console.error('Error in getUserCanonicalBookmarksWithAutoTransfer:', error);
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
  updateCanonicalBookmark,
  getUserCanonicalBookmarks,
  getUserCanonicalBookmarksWithAutoTransfer
}; 