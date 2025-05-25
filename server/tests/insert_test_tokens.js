const db = require('./server/db');

async function insertTestTokens() {
    const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';
    
    // Note: These are fake tokens for testing - they won't work with the real API
    const TEST_ACCESS_TOKEN = 'test_access_token_12345';
    const TEST_REFRESH_TOKEN = 'test_refresh_token_67890';
    
    try {
        console.log('Inserting test tokens for user:', TEST_USER_ID);
        
        await db.query(
            `INSERT INTO raindrop.tokens (user_id, access_token, refresh_token, expires_at)
             VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')
             ON CONFLICT (user_id) 
             DO UPDATE SET 
                access_token = $2,
                refresh_token = $3,
                expires_at = NOW() + INTERVAL '1 hour',
                updated_at = NOW()`,
            [TEST_USER_ID, TEST_ACCESS_TOKEN, TEST_REFRESH_TOKEN]
        );
        
        console.log('Test tokens inserted successfully');
        
        // Verify the insertion
        const result = await db.query(
            'SELECT * FROM raindrop.tokens WHERE user_id = $1',
            [TEST_USER_ID]
        );
        
        console.log('Verification query result:', {
            found: result.length > 0,
            user_id: result[0]?.user_id,
            hasAccessToken: !!result[0]?.access_token,
            hasRefreshToken: !!result[0]?.refresh_token,
            expires_at: result[0]?.expires_at
        });
        
    } catch (error) {
        console.error('Error inserting test tokens:', error);
    } finally {
        process.exit(0);
    }
}

insertTestTokens(); 