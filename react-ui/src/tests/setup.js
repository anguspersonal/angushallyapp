// @ts-nocheck
// Set NODE_ENV to test before any modules are loaded
process.env.NODE_ENV = 'test';

// Configure React environment
process.env.REACT_APP_NODE_ENV = 'test';

// Provide minimal required environment variables for tests
// Note: Frontend tests don't need all backend environment variables
process.env.REACT_APP_GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'test-google-client-id';
process.env.REACT_APP_RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || 'test-recaptcha-key';
process.env.REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Import testing-library/jest-dom for custom matchers
import '@testing-library/jest-dom';

// Mock window.matchMedia for components that use Mantine responsive features
global.matchMedia = global.matchMedia || function (query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
};

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver for components that use it
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Google Maps API if components use it
global.google = {
  maps: {},
};

// Suppress console.log during tests unless debugging
if (!process.env.DEBUG_TESTS) {
    const originalLog = console.log;
    const originalWarn = console.warn;
    
    console.log = (...args) => {
        // Only log errors and important messages in tests
        if (args[0] && (args[0].includes('Error') || args[0].includes('Loading') || args[0].includes('Test'))) {
            originalLog(...args);
        }
    };
    
    console.warn = (...args) => {
        // Suppress common React warnings in tests unless debugging
        if (args[0] && !args[0].includes('Warning: React.createElement') && !args[0].includes('Warning: Each child in a list')) {
            originalWarn(...args);
        }
    };
}

// Global test timeout
jest.setTimeout(10000); 