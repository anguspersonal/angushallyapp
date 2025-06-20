const express = require('express');
const { authMiddleware } = require('../middleware/auth.js');
const { getUserCanonicalBookmarks } = require('../bookmark-api/bookmarkService.js');

const router = express.Router();

/**
 * GET /api/bookmarks
 * Get user's canonical bookmarks from the bookmarks.bookmarks table
 * Protected by authMiddleware
 */
router.get('/', authMiddleware(), async (req, res) => {
  try {
    const bookmarks = await getUserCanonicalBookmarks(req.user.id);
    res.json({ bookmarks });
  } catch (error) {
    console.error('Error fetching canonical bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

module.exports = router; 