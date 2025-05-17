const fs = require('fs');
const path = require('path');

// Load the main configuration
const config = require('../config/env');

// Define which variables should be exposed to the frontend
function generateEnvContent(isDev = true) {
    const baseUrl = isDev ? `http://localhost:${config.port}` : '';
    
    const vars = {
        REACT_APP_API_BASE_URL: `${baseUrl}/api`,
        REACT_APP_GOOGLE_CLIENT_ID: config.auth.google.clientId,
        REACT_APP_GOOGLE_MAPS_API_KEY: config.google?.mapsApiKey || '',
        REACT_APP_GOOGLE_MAPS_MAP_ID: config.google?.mapsMapId || '',
        REACT_APP_RECAPTCHA_SITE_KEY: config.security.recaptchaSiteKey || '',
        NODE_ENV: isDev ? 'development' : 'production'
    };

    return Object.entries(vars)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
}

// Ensure the react-ui directory exists
const reactUiDir = path.resolve(__dirname, '../react-ui');
if (!fs.existsSync(reactUiDir)) {
    console.error('react-ui directory not found!');
    process.exit(1);
}

// Write development environment variables
const devEnvPath = path.join(reactUiDir, '.env.development');
fs.writeFileSync(devEnvPath, generateEnvContent(true));
console.log('Development environment variables written to:', devEnvPath);

// Write production environment variables
const prodEnvPath = path.join(reactUiDir, '.env.production');
fs.writeFileSync(prodEnvPath, generateEnvContent(false));
console.log('Production environment variables written to:', prodEnvPath);

// Write default .env (can be overridden locally)
const defaultEnvPath = path.join(reactUiDir, '.env');
if (!fs.existsSync(defaultEnvPath)) {
    fs.writeFileSync(defaultEnvPath, generateEnvContent(true));
    console.log('Default environment variables written to:', defaultEnvPath);
} 