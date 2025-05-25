require('../config/env');
const { getRaindropTokens } = require('../server/bookmark-api/raindropTokens');
const { getBookmarksFromCollection } = require('../server/bookmark-api/fetchBookmarks');
const { saveBookmarks, getUserBookmarks } = require('../server/bookmark-api/saveBookmarks');

const TEST_USER_ID = '95288f22-6049-4651-85ae-4932ededb5ab';

async function testSync() {
  try {
    console.log('Testing Raindrop sync...\n');
    
    // 1. Get tokens
    console.log('1. Getting tokens for user:', TEST_USER_ID);
    const tokens = await getRaindropTokens(TEST_USER_ID);
    
    if (!tokens || !tokens.access_token) {
      console.error('No valid tokens found!');
      return;
    }
    
    console.log('   ✓ Tokens retrieved successfully');
    console.log('   - Has access token:', !!tokens.access_token);
    console.log('   - Token length:', tokens.access_token.length);
    
    // 2. Fetch bookmarks from Raindrop
    console.log('\n2. Fetching bookmarks from Raindrop.io...');
    const bookmarks = await getBookmarksFromCollection(tokens.access_token, 0);
    
    console.log('   ✓ Fetched', bookmarks.length, 'bookmarks');
    if (bookmarks.length > 0) {
      console.log('   - First bookmark:', {
        title: bookmarks[0].title,
        link: bookmarks[0].link,
        _id: bookmarks[0]._id
      });
    }
    
    // 3. Save bookmarks to database
    if (bookmarks.length > 0) {
      console.log('\n3. Saving bookmarks to database...');
      const savedBookmarks = await saveBookmarks(bookmarks, TEST_USER_ID);
      console.log('   ✓ Saved', savedBookmarks.length, 'bookmarks');
    }
    
    // 4. Retrieve bookmarks from database
    console.log('\n4. Retrieving bookmarks from database...');
    const dbBookmarks = await getUserBookmarks(TEST_USER_ID);
    console.log('   ✓ Found', dbBookmarks.length, 'bookmarks in database');
    
    if (dbBookmarks.length > 0) {
      console.log('   - First bookmark from DB:', {
        title: dbBookmarks[0].title,
        link: dbBookmarks[0].link,
        raindrop_id: dbBookmarks[0].raindrop_id
      });
    }
    
    console.log('\n✅ Sync test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during sync test:', error);
  } finally {
    process.exit(0);
  }
}

testSync(); 