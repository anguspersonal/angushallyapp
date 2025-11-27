const { createHttpClient } = require('../http/client');
const config = require('../../config/env');
const db = require('../db.js');

const STRAVA_CLIENT_ID = config.strava.clientId;
const STRAVA_CLIENT_SECRET = config.strava.clientSecret;
const stravaHttpClient = createHttpClient({
  baseURL: config.strava.baseUrl,
  config: config.http,
});

/**
 * Fetch the latest valid Strava token from the database.
 * ✅ Always retrieves the most recent access & refresh token.
 */
const getStoredTokens = async () => {
  try {
    const result = await db.query(
      `SELECT * FROM habit.strava_tokens ORDER BY expires_at DESC LIMIT 1`
    );

    return result.length > 0 ? result[0] : null;
  } catch (err) {
    console.error('❌ Error retrieving tokens from DB:', err);
    return null;
  }
};

/**
 * 🔹 Store or update the latest access & refresh token.
 * ✅ Access tokens expire in 6 hours, so we do NOT store old ones.
 * ✅ Refresh tokens MUST be updated each time we refresh.
 * ✅ Always keep only the latest refresh token to maintain access.
 */
const saveTokens = async (accessToken, refreshToken, expiresAt) => {
  try {
    const existingTokens = await getStoredTokens();

    if (existingTokens) {
      await db.query(
        `UPDATE habit.strava_tokens SET access_token = $1, refresh_token = $2, expires_at = $3 WHERE id = $4`,
        [accessToken, refreshToken, expiresAt, existingTokens.id]
      );
    } else {
      await db.query(
        `INSERT INTO habit.strava_tokens (access_token, refresh_token, expires_at) VALUES ($1, $2, $3)`,
        [accessToken, refreshToken, expiresAt]
      );
    }
  } catch (err) {
    console.error('❌ Error saving tokens to DB:', err);
  }
};

/**
 * 🔹 Exchange an authorization code for an access token.
 * ✅ This should only happen once, when the user authorizes the app.
 * ✅ After this, we use the refresh token to get new access tokens.
 * ❌ If the refresh token expires, the user must manually reauthorize.
 */
const getAccessToken = async (authCode) => {
  try {
    const response = await stravaHttpClient.post('/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code: authCode,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token, expires_at } = response.data;
    await saveTokens(access_token, refresh_token, expires_at);
    return response.data;
  } catch (error) {
    console.error('❌ Error exchanging auth code:', error.response?.data || error.message);
    return null;
  }
};

/**
 * 🔹 Refresh the access token using the latest refresh token.
 * ✅ Passes `storedTokens` as an argument to avoid redundant database calls.
 * ✅ Falls back to `getStoredTokens()` only if needed.
 */
const refreshAccessToken = async (storedTokens = null) => {
  if (!storedTokens) {
    storedTokens = await getStoredTokens();
  }

  if (!storedTokens || !storedTokens.refresh_token) {
    console.error('❌ No refresh token available. Manual reauthorization required.');
    return null;
  }

  try {
    const response = await stravaHttpClient.post('/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: storedTokens.refresh_token,
    });

    const { access_token, refresh_token, expires_at } = response.data;

    await saveTokens(access_token, refresh_token, expires_at);
    return access_token;
  } catch (error) {
    console.error('❌ Error refreshing access token:', error.response?.data || error.message);

    if (error.response?.status === 400) {
      console.log('❌ Refresh token is invalid or expired. Manual reauthorization required.');
      return null;
    }

    return null;
  }
};

/**
 * 🔹 Get a valid access token (refreshing if needed).
 * ✅ Uses existing token if valid.
 * ✅ If expired, passes `storedTokens` to `refreshAccessToken()` to avoid duplicate DB calls.
 * ❌ If refresh fails, user must manually reauthorize.
 */
const getValidAccessToken = async () => {
  const storedTokens = await getStoredTokens();

  if (storedTokens && storedTokens.expires_at > Math.floor(Date.now() / 1000)) {
    return storedTokens.access_token;
  }

  const refreshedToken = await refreshAccessToken(storedTokens);

  if (!refreshedToken) {
    return null;
  }

  return refreshedToken;
};

if (process.argv[2] === 'test') {
  (async () => {
    await getValidAccessToken();
  })();
}

module.exports = { getAccessToken, refreshAccessToken, getValidAccessToken, stravaHttpClient };

