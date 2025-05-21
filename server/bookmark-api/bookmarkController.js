/**
 * @fileoverview Bookmark Controller - HTTP Request Handler Layer
 * 
 * Purpose:
 * Handles all HTTP interactions for the bookmark API endpoints. This controller layer
 * coordinates between the HTTP interface and the business logic layer (bookmarkService).
 * It manages request validation, response formatting, and error handling.
 * 
 * Endpoints:
 * GET /api/bookmarks
 * - Lists all bookmarks for authenticated user
 * - Returns: 200 OK with bookmark array
 * 
 * POST /api/bookmarks
 * - Creates a single bookmark with metadata
 * - Body: { url: string }
 * - Returns: 201 Created with bookmark object
 * 
 * POST /api/bookmarks/batch
 * - Creates multiple bookmarks in parallel
 * - Body: { bookmarks: Array<{ url: string }> }
 * - Returns: 201 Created with bookmark array
 * 
 * Error Responses:
 * - 400 Bad Request: Invalid URL or input format
 * - 401 Unauthorized: Missing or invalid authentication
 * - 500 Internal Server Error: Server-side failures
 * 
 * Dependencies:
 * - ./bookmarkService: Data and business logic operations
 * - ./openGraph: URL metadata fetching
 * 
 * Security:
 * - Requires valid JWT authentication
 * - User can only access their own bookmarks
 * - URL validation prevents malicious inputs
 * 
 * @module bookmarkController
 */

const bookmarkService = require('./bookmarkService');
const { fetchMetadata, isValidUrl } = require('./openGraph');

/**
 * Lists all bookmarks for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function list(req, res) {
  try {
    const bookmarks = await bookmarkService.getBookmarks(req.user.id);
    res.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({
      error: 'Failed to fetch bookmarks',
      details: error.message
    });
  }
}

/**
 * Creates a new bookmark with metadata
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createSingle(req, res) {
  const { url } = req.body;

  // Validate input
  if (!url) {
    return res.status(400).json({
      error: 'URL is required'
    });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({
      error: 'Invalid URL format'
    });
  }

  try {
    // Fetch metadata first
    const metadata = await fetchMetadata(url);

    // If there was an error fetching metadata, log it but continue
    if (metadata.error) {
      console.warn(`Warning fetching metadata for ${url}:`, metadata.error);
    }

    // Prepare bookmark data
    const bookmarkData = {
      url: metadata.resolved_url || url,
      title: metadata.title,
      description: metadata.description,
      image: metadata.image,
      site_name: metadata.site_name,
      source: 'manual'
    };

    // Create the bookmark
    const bookmark = await bookmarkService.addBookmark(req.user.id, bookmarkData);

    // Log the sync
    await bookmarkService.logSync(
      req.user.id,
      1,
      metadata.error ? 'partial_success' : 'success',
      metadata.error?.message
    );

    res.status(201).json(bookmark);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    
    // Log the failed sync
    try {
      await bookmarkService.logSync(
        req.user.id,
        0,
        'error',
        error.message
      );
    } catch (logError) {
      console.error('Error logging sync:', logError);
    }

    res.status(500).json({
      error: 'Failed to create bookmark',
      details: error.message
    });
  }
}

/**
 * Creates multiple bookmarks in batch
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createBatch(req, res) {
  const { bookmarks } = req.body;

  if (!Array.isArray(bookmarks)) {
    return res.status(400).json({
      error: 'Bookmarks must be an array'
    });
  }

  if (bookmarks.length === 0) {
    return res.status(400).json({
      error: 'At least one bookmark is required'
    });
  }

  try {
    // Fetch metadata for all URLs in parallel
    const metadataPromises = bookmarks.map(bookmark => 
      fetchMetadata(bookmark.url)
        .then(metadata => ({ ...bookmark, metadata }))
        .catch(error => ({ 
          ...bookmark, 
          metadata: { 
            error: { message: error.message, code: error.code || 'UNKNOWN_ERROR' } 
          } 
        }))
    );

    const bookmarksWithMetadata = await Promise.all(metadataPromises);

    // Prepare bookmark data with metadata
    const bookmarkData = bookmarksWithMetadata.map(bookmark => ({
      url: bookmark.url, // Use original URL
      title: bookmark.metadata.title,
      description: bookmark.metadata.description,
      image: bookmark.metadata.image,
      site_name: bookmark.metadata.site_name,
      source: 'manual'
    }));

    // Create all bookmarks
    const createdBookmarks = await bookmarkService.upsertBookmarks(req.user.id, bookmarkData);

    // Log the sync
    const hasErrors = bookmarksWithMetadata.some(b => b.metadata.error);
    await bookmarkService.logSync(
      req.user.id,
      createdBookmarks.length,
      hasErrors ? 'partial_success' : 'success',
      hasErrors ? 'Some bookmarks had metadata fetch errors' : null
    );

    res.status(201).json(createdBookmarks);
  } catch (error) {
    console.error('Error creating bookmarks:', error);
    
    // Log the failed sync
    try {
      await bookmarkService.logSync(
        req.user.id,
        0,
        'error',
        error.message
      );
    } catch (logError) {
      console.error('Error logging sync:', logError);
    }

    res.status(500).json({
      error: 'Failed to create bookmarks',
      details: error.message
    });
  }
}

module.exports = {
  list,
  createSingle,
  createBatch
}; 