const axios = require('axios');
require('../../config/env'); // Load environment variables

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://angushallyapp.herokuapp.com'
  : 'http://localhost:5000';

/**
 * Test script to verify automatic bookmark transfer functionality
 * 
 * This script simulates the production issue scenario:
 * 1. User has bookmarks in raindrop.bookmarks
 * 2. User has empty bookmarks.bookmarks (canonical store)
 * 3. User visits bookmarks page (calls GET /api/bookmarks)
 * 4. System should automatically transfer and return bookmarks
 */
async function testAutoTransfer() {
  console.log('🧪 Testing Automatic Bookmark Transfer Functionality');
  console.log('=' .repeat(60));
  
  try {
    // For testing, we'll need a valid JWT token
    // In a real scenario, this would come from the authenticated user
    console.log('ℹ️  Note: This test requires a valid user JWT token');
    console.log('ℹ️  To test manually, make authenticated GET request to /api/bookmarks');
    console.log('');
    
    // Test the endpoint structure (without authentication for now)
    console.log('📋 Testing endpoint availability...');
    
    const healthCheck = await axios.get(`${BASE_URL}/api/bookmarks`, {
      validateStatus: () => true // Don't throw on 4xx/5xx
    });
    
    console.log(`Status: ${healthCheck.status}`);
    
    if (healthCheck.status === 401) {
      console.log('✅ Endpoint correctly requires authentication');
    } else if (healthCheck.status === 200) {
      console.log('✅ Endpoint accessible (possibly test environment)');
    } else {
      console.log(`⚠️  Unexpected status: ${healthCheck.status}`);
    }
    
    console.log('');
    console.log('🔍 Manual Testing Instructions:');
    console.log('1. Log in to the application');
    console.log('2. Ensure you have bookmarks in raindrop.bookmarks table');
    console.log('3. Ensure bookmarks.bookmarks table is empty');
    console.log('4. Visit /bookmarks page or call GET /api/bookmarks');
    console.log('5. Should see automatic transfer logs in server console');
    console.log('6. Should see bookmarks displayed with metadata enrichment');
    
    console.log('');
    console.log('📊 Expected Behavior:');
    console.log('- Server logs: "Canonical store empty, checking for unorganized Raindrop bookmarks"');
    console.log('- Server logs: "Found X unorganized Raindrop bookmarks, starting automatic transfer"');
    console.log('- Server logs: "Automatic transfer completed: X successful, Y failed"');
    console.log('- API Response: { bookmarks: [...], _metadata: { autoTransfer: true, ... } }');
    console.log('- Frontend: Bookmarks display with enhanced metadata (titles, descriptions, images)');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

/**
 * Test the OpenGraph metadata enrichment function directly
 */
async function testMetadataEnrichment() {
  console.log('');
  console.log('🧪 Testing OpenGraph Metadata Enrichment');
  console.log('=' .repeat(60));
  
  try {
    const { fetchMetadata, isValidUrl } = require('../bookmark-api/openGraph');
    
    const testUrls = [
      'https://github.com',
      'https://stackoverflow.com',
      'https://invalid-url'
    ];
    
    for (const url of testUrls) {
      console.log(`🔍 Testing: ${url}`);
      
      if (!isValidUrl(url)) {
        console.log('❌ Invalid URL format');
        continue;
      }
      
      try {
        const metadata = await fetchMetadata(url);
        console.log('✅ Metadata fetched:', {
          title: metadata.title?.substring(0, 50) + '...',
          site_name: metadata.site_name,
          hasDescription: !!metadata.description,
          hasImage: !!metadata.image,
          error: metadata.error
        });
      } catch (error) {
        console.log('❌ Metadata fetch failed:', error.message);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Metadata enrichment test error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testAutoTransfer();
  await testMetadataEnrichment();
  
  console.log('');
  console.log('🎉 Test script completed');
  console.log('');
  console.log('💡 Next Steps:');
  console.log('1. Start the server: npm run server');
  console.log('2. Test with authenticated user in browser or Postman');
  console.log('3. Check server logs for automatic transfer messages');
  console.log('4. Verify bookmarks display with enhanced metadata');
  console.log('5. Check API response includes _metadata.autoTransfer: true');
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testAutoTransfer,
  testMetadataEnrichment
}; 