// Set NODE_ENV to test before any modules are loaded
process.env.NODE_ENV = 'test';

// Load environment variables from .env file for development credentials
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load the .env file from the project root
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    console.log('Loading test environment from:', envPath);
    dotenv.config({ path: envPath });
}

// Override NODE_ENV back to test after loading .env
process.env.NODE_ENV = 'test';

// Ensure required environment variables are set with fallbacks
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-google-client-id';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key';

// Set test database variables (these will be mocked in most tests)
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'angushallyapp_test';
process.env.DB_USER = process.env.DB_USER || 'angus_dev';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'dev_password';

// Add Raindrop configuration for tests
process.env.RAINDROP_CLIENT_ID = process.env.RAINDROP_CLIENT_ID || 'test-raindrop-client-id';
process.env.RAINDROP_CLIENT_SECRET = process.env.RAINDROP_CLIENT_SECRET || 'test-raindrop-client-secret';
process.env.RAINDROP_REDIRECT_URI = process.env.RAINDROP_REDIRECT_URI || 'http://localhost:3000/auth/raindrop/callback';

// Mock database connections globally for all tests
// This prevents actual database connections during testing
jest.mock('../db', () => ({
    query: jest.fn(),
    end: jest.fn(),
    pool: {
        connect: jest.fn(),
        end: jest.fn(),
        on: jest.fn()
    }
}));

// Load environment configuration to validate everything is working
try {
    const config = require('../../config/env');
    console.log('✅ Environment configuration loaded successfully');
    console.log('Database config:', {
        host: config.database.host,
        port: config.database.port,
        name: config.database.name,
        user: config.database.user,
        // Don't log password
    });
} catch (error) {
    console.error('Warning: Could not load environment config in tests:', error.message);
}

// Suppress console.log during tests unless debugging
if (!process.env.DEBUG_TESTS) {
    const originalLog = console.log;
    console.log = (...args) => {
        // Only log important messages during tests
        if (args[0] && (
            args[0].includes('Error') || 
            args[0].includes('Loading environment') ||
            args[0].includes('✅') ||
            args[0].includes('❌') ||
            args[0].includes('Warning')
        )) {
            originalLog(...args);
        }
    };
}

// Global test timeout
jest.setTimeout(10000);