// Set NODE_ENV to test before any modules are loaded
process.env.NODE_ENV = 'test';

// Provide minimal required environment variables for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-google-client-id';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key';

// Optional: Set test database variables if needed for integration tests
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'test_db';
process.env.DB_USER = process.env.DB_USER || 'test_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';

// Add Raindrop configuration for tests
process.env.RAINDROP_CLIENT_ID = process.env.RAINDROP_CLIENT_ID || 'test-raindrop-client-id';
process.env.RAINDROP_CLIENT_SECRET = process.env.RAINDROP_CLIENT_SECRET || 'test-raindrop-client-secret';
process.env.RAINDROP_REDIRECT_URI = process.env.RAINDROP_REDIRECT_URI || 'http://localhost:3000/auth/raindrop/callback';

// Load environment configuration to validate everything is working
try {
    require('../../config/env');
} catch (error) {
    console.error('Warning: Could not load environment config in tests:', error.message);
}

// Suppress console.log during tests unless debugging
if (!process.env.DEBUG_TESTS) {
    const originalLog = console.log;
    console.log = (...args) => {
        // Only log errors and warnings in tests
        if (args[0] && (args[0].includes('Error') || args[0].includes('Loading environment'))) {
            originalLog(...args);
        }
    };
}

// Global test timeout
jest.setTimeout(10000);