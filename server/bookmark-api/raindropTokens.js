const db = require('../db');
const config = require('../../config/env');

/**
 * Get Raindrop tokens for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} The Raindrop tokens
 */
async function getRaindropTokens(userId) {
    console.log('Getting Raindrop tokens for user:', userId);
    console.log('Database config:', {
        isProduction: config.nodeEnv === 'production',
        database: config.database.url ? 'DATABASE_URL' : config.database.name,
        searchPath: config.database.searchPath
    });
    
    const result = await db.query(
        'SELECT * FROM raindrop.tokens WHERE user_id = $1',
        [userId]
    );
    console.log('Query result:', {
        rowCount: result.length,
        hasData: result.length > 0,
        firstRow: result[0] ? {
            user_id: result[0].user_id,
            hasAccessToken: !!result[0].access_token,
            hasRefreshToken: !!result[0].refresh_token,
            expires_at: result[0].expires_at
        } : null
    });
    return result[0];
}

/**
 * Save Raindrop tokens for a user
 * @param {Object} params - The parameters object
 * @param {string} params.userId - The user ID
 * @param {string} params.accessToken - The access token
 * @param {string} params.refreshToken - The refresh token
 * @param {number} params.expiresInSecs - The expiration time in seconds
 * @returns {Promise<void>}
 */
async function saveRaindropTokens({ userId, accessToken, refreshToken, expiresInSecs }) {
    console.log('Saving Raindrop tokens for user:', userId);
    
    await db.query(
        `INSERT INTO raindrop.tokens (user_id, access_token, refresh_token, expires_at)
         VALUES ($1, $2, $3, NOW() + INTERVAL '${expiresInSecs} seconds')
         ON CONFLICT (user_id) 
         DO UPDATE SET 
            access_token = $2,
            refresh_token = $3,
            expires_at = NOW() + INTERVAL '${expiresInSecs} seconds',
            updated_at = NOW()`,
        [userId, accessToken, refreshToken]
    );
}

module.exports = {
    getRaindropTokens,
    saveRaindropTokens
}; 