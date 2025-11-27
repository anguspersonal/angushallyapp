const { raindropHttpClient } = require('./raindropClient');
const config = require('../../config/env');
const { saveRaindropTokens } = require('../bookmark-api/raindropTokens.js');

const RAINDROP_CLIENT_ID = config.raindrop.clientId;
const RAINDROP_CLIENT_SECRET = config.raindrop.clientSecret;
const RAINDROP_REDIRECT_URI = config.raindrop.redirectUri;

// Log configuration values
// console.log('\n=== Raindrop.io Configuration ===');
// console.log('Client ID:', RAINDROP_CLIENT_ID ? '✅ Set' : '❌ Missing');
// console.log('Client Secret:', RAINDROP_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
// console.log('Redirect URI:', RAINDROP_REDIRECT_URI ? '✅ Set' : '❌ Missing');
// if (RAINDROP_REDIRECT_URI) {
//     console.log('  Value:', RAINDROP_REDIRECT_URI);
// }
// console.log('================================\n');

/**
 * Get the Raindrop.io OAuth authorization URL
 * @param {string} state - The state parameter for OAuth security
 * @returns {string} The authorization URL with required parameters
 */
const getAuthUrl = (state) => {
  // Validate required configuration
  if (!RAINDROP_CLIENT_ID) {
    throw new Error('RAINDROP_CLIENT_ID is not configured');
  }
  if (!RAINDROP_REDIRECT_URI) {
    throw new Error('RAINDROP_REDIRECT_URI is not configured. Please set this environment variable.');
  }

  const params = new URLSearchParams({
    client_id: RAINDROP_CLIENT_ID,
    redirect_uri: RAINDROP_REDIRECT_URI,
    response_type: 'code',
    state
  });
  
  const authUrl = `${config.raindrop.baseUrl.replace(/\/$/, '')}/oauth/authorize?${params.toString()}`;
  // console.log('\n=== Generated Raindrop Auth URL ===');
  // console.log(`Authorization URL: ${authUrl}`);
  // console.log('===================================\n');
  
  return authUrl;
};

/**
 * Exchange authorization code for access token
 * @param {string} code - The authorization code received from Raindrop.io
 * @returns {Promise<Object>} Object containing access_token and refresh_token
 */
const exchangeCodeForTokens = async (code) => {
  try {
    const response = await raindropHttpClient.post(
      '/oauth/access_token',
      new URLSearchParams({
        client_id: RAINDROP_CLIENT_ID,
        client_secret: RAINDROP_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: RAINDROP_REDIRECT_URI
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (!response.data || !response.data.access_token) {
      throw new Error('Invalid response format from Raindrop.io');
    }

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in
    };
  } catch (error) {
    // console.error('Error exchanging auth code:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Refresh the access token using the refresh token
 * @param {string} refreshToken - The refresh token received from initial authentication
 * @returns {Promise<Object>} Object containing new access_token and refresh_token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await raindropHttpClient.post('/oauth/access_token', {
      client_id: RAINDROP_CLIENT_ID,
      client_secret: RAINDROP_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    return response.data;
  } catch (error) {
    // console.error('Error refreshing access token:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Store tokens in the database
 * @param {string} userId - The user's ID
 * @param {Object} tokens - Object containing access_token, refresh_token, and expires_in
 */
const storeTokens = async (userId, tokens) => {
  await saveRaindropTokens({
    userId: userId,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresInSecs: tokens.expires_in
  });
};

module.exports = {
  getAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  storeTokens
}; 