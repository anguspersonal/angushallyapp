const express = require('express');
const { authMiddleware } = require('../middleware/auth.js');
const { getUserCanonicalBookmarksWithAutoTransfer } = require('../bookmark-api/bookmarkService.js');

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

module.exports = router; 