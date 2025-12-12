// Set NODE_ENV to test before any modules are loaded
process.env.NODE_ENV = 'test';

// Load environment variables from .env.test (preferred) or fall back to examples
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envTestPath = path.join(__dirname, '../../.env.test');
const envExampleTestPath = path.join(__dirname, '../../.env.test.example');
const envPath = path.join(__dirname, '../../.env');
const selectedEnvPath = [envTestPath, envExampleTestPath, envPath].find((candidate) => fs.existsSync(candidate));

if (selectedEnvPath) {
    console.log('Loading test environment from:', selectedEnvPath);
    dotenv.config({ path: selectedEnvPath });
} else {
    console.warn('No test env file found (.env.test or .env.test.example). Using process environment only.');
}

// Override NODE_ENV back to test after loading env files
process.env.NODE_ENV = 'test';

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
