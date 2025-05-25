const config = require('../../config/env');
const { getAuthUrl } = require('../bookmark-api/raindropIo.js');

// Test configuration
console.log('\n=== Raindrop.io Configuration Test ===\n');

// Test Client ID
console.log('Client ID:', config.raindrop.clientId ? '✅ Set' : '❌ Missing');

// Test Client Secret
console.log('Client Secret:', config.raindrop.clientSecret ? '✅ Set' : '❌ Missing');

// Test Redirect URI
console.log('Redirect URI:', config.raindrop.redirectUri ? '✅ Set' : '❌ Missing');
if (config.raindrop.redirectUri) {
    console.log('  Value:', config.raindrop.redirectUri);
}

// Generate and display auth URL
console.log('\n=== Testing Auth URL Generation ===\n');
try {
    const authUrl = getAuthUrl();
    console.log('Auth URL generated successfully:');
    console.log(authUrl);
    console.log('\n✅ Configuration appears valid!');
} catch (error) {
    console.error('\n❌ Error generating auth URL:', error.message);
}