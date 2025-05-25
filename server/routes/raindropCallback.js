const express = require('express');
const jwt = require('jsonwebtoken');
const { exchangeCodeForTokens } = require('../bookmark-api/raindropAuth.js');
const { saveRaindropTokens } = require('../bookmark-api/raindropTokens.js');
const config = require('../../config/env');

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('Raindrop callback received:', {
    query: req.query,
    headers: req.headers,
    path: req.path,
    originalUrl: req.originalUrl
  });

  const { code, state } = req.query;

  if (!code || !state) {
    console.log('Missing code or state:', { code, state });
    return res.redirect('/projects/bookmarks/raindrop?error=missing_params');
  }

  let userId;
  try {
    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    
    // Verify timestamp is within acceptable range (5 minutes)
    if (Date.now() - decoded.timestamp > 5 * 60 * 1000) {
      console.log('State token expired:', { 
        timestamp: decoded.timestamp,
        currentTime: Date.now(),
        difference: Date.now() - decoded.timestamp
      });
      return res.redirect('/projects/bookmarks/raindrop?error=state_expired');
    }

    if (!decoded.user_id) {
      console.log('Invalid state token:', { decoded });
      return res.redirect('/projects/bookmarks/raindrop?error=invalid_state');
    }
    
    userId = decoded.user_id;
    console.log('Successfully verified state token for user:', userId);
  } catch (err) {
    console.error('State token verification failed:', err);
    return res.redirect('/projects/bookmarks/raindrop?error=invalid_token');
  }

  try {
    console.log('Exchanging code for token...');
    const tokens = await exchangeCodeForTokens(code);
    console.log('Successfully obtained Raindrop tokens');

    await saveRaindropTokens({
      userId: userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresInSecs: tokens.expires_in
    });
    console.log('Successfully stored tokens in database');

    // Generate new application JWT
    const appJwt = jwt.sign(
      { 
        userId: userId,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set JWT in cookie with proper configuration
    res.cookie('Authorization', `Bearer ${appJwt}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/' // Ensure cookie is available for all paths
    });

    // Also set a non-httpOnly cookie for the frontend to read
    res.cookie('auth_token', appJwt, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    // Redirect back to the frontend with success
    res.redirect('/projects/bookmarks/raindrop?success=true');
  } catch (err) {
    console.error('Token exchange failed:', err);
    res.redirect('/projects/bookmarks/raindrop?error=token_exchange_failed');
  }
});

module.exports = router; 