const express = require('express');
const { getAuthUrl,
        exchangeCodeForTokens,
        refreshAccessToken } = require('../bookmark-api/raindropAuth.js');
const { saveRaindropTokens, getRaindropTokens } = require('../bookmark-api/raindropTokens.js');
const { getCollections, getBookmarksFromCollection } = require('../bookmark-api/fetchBookmarks.js');
const { saveBookmarks, getUserBookmarks } = require('../bookmark-api/saveBookmarks.js');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.js');
const config = require('../../config/env.js'); // Your existing config loader
const jwt = require('jsonwebtoken');

// server/routes/raindropRoute.js

// 1) Get OAuth URL (authenticated API call)
router.get('/oauth/start', authMiddleware(), (req, res) => {
  try {
    const { id } = req.user;

    // Create state token with timestamp for additional security
    const state = jwt.sign(
      { 
        user_id: id,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    const authUrl = getAuthUrl(state);
    console.log('Generated OAuth URL:', {
      authUrl,
      state,
      userId: id
    });
    
    // Return the auth URL instead of redirecting
    res.json({ authUrl });
  } catch (err) {
    console.error('OAuth start error:', err);
    
    // Provide specific error message for missing configuration
    if (err.message.includes('RAINDROP_REDIRECT_URI')) {
      res.status(500).json({ 
        error: 'Raindrop OAuth is not properly configured. Please contact support.',
        details: 'Missing redirect URI configuration'
      });
    } else {
      res.status(500).json({ error: 'Failed to start OAuth flow' });
    }
  }
});

// New endpoint to handle the token exchange after authentication
router.post('/oauth/exchange', authMiddleware(), async (req, res) => {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Missing code' });
    }
    try {
      const tokens = await exchangeCodeForTokens(code);
      await saveRaindropTokens({
        userId:        req.user.id,
        accessToken:   tokens.access_token,
        refreshToken:  tokens.refresh_token,
        expiresInSecs: tokens.expires_in
      });
      res.json({ message: 'Raindrop connected successfully' });
    } catch (err) {
      console.error('Exchange error:', err);
      res.status(500).json({ error: 'Raindrop authorization failed' });
    }
});

// 3) Verify connection status
router.get('/verify', authMiddleware(), async (req, res) => {
    try {
      const tokens = await getRaindropTokens(req.user.id);
      res.json({ isConnected: !!tokens });
    } catch (err) {
      console.error('Verify error:', err);
      res.status(500).json({ error: 'Failed to verify connection' });
    }
});

// 4) Sync bookmarks from Raindrop
router.post('/sync', authMiddleware(), async (req, res) => {
    try {
      const tokens = await getRaindropTokens(req.user.id);
      if (!tokens) {
        return res.status(401).json({ error: 'Raindrop not connected' });
      }

      if (!tokens.access_token) {
        console.error('No access token found for user:', req.user.id);
        return res.status(401).json({ error: 'Invalid Raindrop tokens - please reconnect' });
      }

      console.log('Retrieved tokens for sync:', {
        userId: req.user.id,
        hasAccessToken: !!tokens.access_token,
        accessTokenLength: tokens.access_token ? tokens.access_token.length : 0,
        hasRefreshToken: !!tokens.refresh_token,
        expiresAt: tokens.expires_at
      });

      // Fetch all bookmarks (collection ID 0 means all bookmarks)
      const allBookmarks = await getBookmarksFromCollection(tokens.access_token, 0);
      
      console.log('Fetched bookmarks:', {
        count: allBookmarks.length,
        firstBookmark: allBookmarks[0] ? {
          title: allBookmarks[0].title,
          link: allBookmarks[0].link
        } : null
      });

      // Save all bookmarks using the saveBookmarks service
      await saveBookmarks(allBookmarks, req.user.id);

      res.json({ 
        message: 'Bookmarks synced successfully',
        count: allBookmarks.length
      });
    } catch (err) {
      console.error('Sync error:', err);
      res.status(500).json({ error: 'Failed to sync bookmarks' });
    }
});

// 5) Get user's bookmarks
router.get('/bookmarks', authMiddleware(), async (req, res) => {
    try {
      const bookmarks = await getUserBookmarks(req.user.id);
      res.json({ bookmarks });
    } catch (err) {
      console.error('Bookmarks fetch error:', err);
      res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
});

// 6) (Optional) Endpoint to refresh tokens on-demand
router.post('/refresh', authMiddleware(), async (req, res) => {
    try {
      const tokens = await getRaindropTokens(req.user.id);
      if (!tokens || !tokens.refresh_token) {
        return res.status(401).json({ error: 'No refresh token available' });
      }
      
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      await saveRaindropTokens({
        userId:        req.user.id,
        accessToken:   newTokens.access_token,
        refreshToken:  newTokens.refresh_token,
        expiresInSecs: newTokens.expires_in
      });
      res.json({ message: 'Token refreshed' });
    } catch (err) {
      console.error('Refresh error:', err);
      res.status(500).json({ error: 'Failed to refresh token' });
    }
});

module.exports = router;
