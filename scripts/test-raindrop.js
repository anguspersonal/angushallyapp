require('../config/env');
const db = require('../server/db');
const { getRaindropTokens } = require('../server/bookmark-api/raindropTokens');
const { getUserBookmarks } = require('../server/bookmark-api/saveBookmarks');

async function testRaindropIntegration(userId) {
    try {
        console.log('Testing Raindrop Integration...\n');
        
        // Use provided user ID or default test user
        userId = userId || '00000000-0000-0000-0000-000000000000';
        
        console.log('1. Checking for Raindrop tokens...');
        const tokens = await getRaindropTokens(userId);
        
        if (!tokens) {
            console.log('❌ No tokens found for user:', userId);
            console.log('\nTo fix this, you need to:');
            console.log('1. Log in to the app');
            console.log('2. Go to the Raindrop page');
            console.log('3. Click "Connect Raindrop" and complete the OAuth flow');
            return;
        }
        
        console.log('✅ Tokens found:', {
            hasAccessToken: !!tokens.access_token,
            hasRefreshToken: !!tokens.refresh_token,
            expiresAt: tokens.expires_at
        });
        
        console.log('\n2. Checking for bookmarks in database...');
        const bookmarks = await getUserBookmarks(userId);
        
        console.log(`✅ Found ${bookmarks.length} bookmarks in database`);
        
        if (bookmarks.length > 0) {
            console.log('\nFirst 3 bookmarks:');
            bookmarks.slice(0, 3).forEach((bookmark, index) => {
                console.log(`${index + 1}. ${bookmark.title}`);
                console.log(`   URL: ${bookmark.link}`);
                console.log(`   Tags: ${bookmark.tags.join(', ')}`);
            });
        }
        
        // Check if we need to sync
        if (bookmarks.length === 0 && tokens) {
            console.log('\n⚠️  No bookmarks found but tokens exist.');
            console.log('You may need to click "Sync Bookmarks" in the UI.');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    } finally {
        await db.end();
    }
}

// Get user ID from command line if provided
const userIdArg = process.argv[2];
if (userIdArg) {
    console.log('Using provided user ID:', userIdArg);
}

testRaindropIntegration(userIdArg); 