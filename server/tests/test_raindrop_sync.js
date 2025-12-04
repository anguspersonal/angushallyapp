const jwt = require('jsonwebtoken');
const { httpClient } = require('../http/client');

// Load environment variables
require('dotenv').config();

// Test user ID (from auth middleware)
const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

// Generate a valid JWT token for testing
const token = jwt.sign(
  {
    userId: TEST_USER_ID,
    email: 'test@example.com',
    roles: ['member']
  },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('Generated test JWT token:', token);

// Test the Raindrop endpoints
async function testRaindropEndpoints() {
  const baseURL = 'http://localhost:5000/api/raindrop';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log('\n=== Testing Raindrop Endpoints ===');
    
    // Test verify endpoint
    console.log('\n1. Testing /verify endpoint...');
    const verifyResponse = await httpClient.get(`${baseURL}/verify`, { headers });
    console.log('Verify response:', verifyResponse.data);

    // Test sync endpoint (this should show the access token issue)
    console.log('\n2. Testing /sync endpoint...');
    try {
      const syncResponse = await httpClient.post(`${baseURL}/sync`, {}, { headers });
      console.log('Sync response:', syncResponse.data);
    } catch (syncError) {
      console.log('Sync error:', {
        status: syncError.response?.status,
        data: syncError.response?.data,
        message: syncError.message
      });
    }

    // Test OAuth start endpoint
    console.log('\n3. Testing /oauth/start endpoint...');
    const oauthResponse = await httpClient.get(`${baseURL}/oauth/start`, { headers });
    console.log('OAuth start response:', oauthResponse.data);

  } catch (error) {
    console.error('Test error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

// Run the test
testRaindropEndpoints(); 