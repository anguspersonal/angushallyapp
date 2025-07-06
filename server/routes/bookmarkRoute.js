const express = require('express');
const { authMiddleware } = require('../middleware/auth.js');
const { getUserCanonicalBookmarksWithAutoTransfer, createCanonicalBookmark, validateBookmarkData, checkCanonicalBookmarkExists } = require('../bookmark-api/bookmarkService.js');
const openGraph = require('../bookmark-api/openGraph.js');
const crypto = require('crypto');

const router = express.Router();

/**
 * GET /api/bookmarks
 * Get user's canonical bookmarks from the bookmarks.bookmarks table
 * Automatically transfers from raindrop.bookmarks if canonical store is empty
 * Protected by authMiddleware
 */
router.get('/', authMiddleware(), async (req, res) => {
  try {
    const result = await getUserCanonicalBookmarksWithAutoTransfer(req.user.id);
    
    // Log automatic transfer for debugging
    if (result._metadata.autoTransfer) {
      console.log(`🎉 Automatic bookmark transfer completed for user ${req.user.id}:`, {
        transferred: result._metadata.transferStats.success,
        failed: result._metadata.transferStats.failed,
        enriched: result._metadata.transferStats.enrichmentStats.enriched
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching bookmarks with auto-transfer:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

/**
 * POST /api/bookmarks/share
 * Native Share Target endpoint - Create bookmark directly from shared URL
 * This is the core A0 implementation for PWA/Android/iOS sharing
 * Protected by authMiddleware
 */
router.post('/share', authMiddleware(), async (req, res) => {
  try {
    const { url, text, title } = req.body;
    
    // Validate required URL parameter
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        details: 'Please provide a url parameter with the content to bookmark'
      });
    }

    // Validate URL format
    if (!openGraph.isValidUrl(url)) {
      return res.status(400).json({ 
        error: 'Invalid URL format',
        details: 'Please provide a valid HTTP or HTTPS URL'
      });
    }

    console.log(`📱 Share target triggered for user ${req.user.id}: ${url}`);

    // Check for existing bookmark by URL to prevent duplicates
    // Use URL hash as a simple deduplication mechanism for share target
    const urlHash = crypto.createHash('md5').update(url).digest('hex');
    const existingBookmark = await checkCanonicalBookmarkExists(req.user.id, 'share', urlHash);
    
    if (existingBookmark) {
      console.log(`📌 Bookmark already exists for URL: ${url}`);
      return res.json({
        success: true,
        message: 'Bookmark already exists',
        bookmark: existingBookmark,
        duplicate: true
      });
    }

    // Fetch OpenGraph metadata for enrichment
    let enrichedMetadata = null;
    try {
      console.log(`📡 Fetching metadata for shared URL: ${url}`);
      enrichedMetadata = await openGraph.fetchMetadata(url);
      
      if (enrichedMetadata.error) {
        console.warn(`⚠️  Metadata fetch warning for ${url}:`, enrichedMetadata.error.message);
      } else {
        console.log(`✅ Metadata fetched successfully for: ${url}`);
      }
    } catch (error) {
      console.warn(`⚠️  Metadata enrichment failed for ${url}:`, error.message);
      enrichedMetadata = null;
    }

    // Prepare bookmark data with priority: user-provided data > OpenGraph > fallbacks
    const bookmarkData = {
      user_id: req.user.id,
      title: title || text || enrichedMetadata?.title || url,
      url: url,
      resolved_url: enrichedMetadata?.resolved_url || url,
      description: enrichedMetadata?.description,
      image_url: enrichedMetadata?.image,
      site_name: enrichedMetadata?.site_name,
      tags: [], // No tags from share target initially
      source_type: 'share',
      source_id: urlHash, // Use URL hash as unique source ID
      source_metadata: {
        share_source: 'native_share_target',
        original_text: text,
        original_title: title,
        metadata_enriched: !!enrichedMetadata,
        metadata_source: enrichedMetadata ? 'opengraph' : null,
        metadata_error: enrichedMetadata?.error || null,
        shared_at: new Date().toISOString()
      },
      is_organized: false,
      created_at: new Date()
    };

    // Validate bookmark data
    const validation = validateBookmarkData(bookmarkData);
    if (!validation.isValid) {
      console.error('❌ Share target validation failed:', validation.errors);
      return res.status(400).json({
        error: 'Invalid bookmark data',
        details: validation.errors
      });
    }

    // Create bookmark directly in canonical store
    const createdBookmark = await createCanonicalBookmark(bookmarkData);
    
    console.log(`✅ Share target bookmark created: ${createdBookmark.id} for ${url}`);

    // Return success response optimized for background processing
    res.status(201).json({
      success: true,
      message: 'Bookmark saved successfully',
      bookmark: {
        id: createdBookmark.id,
        title: createdBookmark.title,
        url: createdBookmark.url,
        enriched: !!enrichedMetadata
      }
    });

  } catch (error) {
    console.error('❌ Share target error:', error);
    res.status(500).json({ 
      error: 'Failed to save bookmark',
      details: 'An error occurred while processing the shared content'
    });
  }
});

module.exports = router; 