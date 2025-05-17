const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Priority for loading environment variables:
// 1. Process environment variables (e.g., from Heroku)
// 2. .env.local (git-ignored local overrides)
// 3. .env

function loadEnv() {
    const NODE_ENV = process.env.NODE_ENV || 'development';
    const rootDir = path.resolve(__dirname, '..');

    // Load environment variables in order of priority
    const envFiles = [
        path.join(rootDir, '.env'),                    // Base config
        path.join(rootDir, `.env.${NODE_ENV}`),        // Environment-specific config
        path.join(rootDir, '.env.local')               // Local overrides (git-ignored)
    ];

    // Load each env file if it exists
    envFiles.forEach(file => {
        if (fs.existsSync(file)) {
            dotenv.config({ path: file });
        }
    });

    // Validate required environment variables
    const requiredVars = [
        // Database (development)
        'DEV_DB_HOST',
        'DEV_DB_NAME',
        'DEV_DB_USER',
        // Authentication
        'JWT_SECRET',
        'GOOGLE_CLIENT_ID',
    ];

    if (NODE_ENV === 'production') {
        // In production, we need either DATABASE_URL or all PROD_DB_ variables
        if (!process.env.DATABASE_URL && 
            !(process.env.PROD_DB_HOST && 
              process.env.PROD_DB_NAME && 
              process.env.PROD_DB_USER && 
              process.env.PROD_DB_PASSWORD)) {
            throw new Error('Production requires either DATABASE_URL or all PROD_DB_ variables');
        }
    }

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Return the loaded configuration
    return {
        // Application
        nodeEnv: NODE_ENV,
        port: parseInt(process.env.PORT || '5000', 10),
        
        // Database
        database: {
            // Main production URL (e.g., from Heroku)
            url: process.env.DATABASE_URL,
            
            // Detailed production config
            production: {
                host: process.env.PROD_DB_HOST,
                port: parseInt(process.env.PROD_DB_PORT || '5432', 10),
                name: process.env.PROD_DB_NAME,
                user: process.env.PROD_DB_USER,
                password: process.env.PROD_DB_PASSWORD,
                searchPath: process.env.PROD_DB_SEARCH_PATH?.split(',') || ['public', 'identity', 'habit', 'crm', 'fsa', 'content']
            },
            
            // Development config
            development: {
                host: process.env.DEV_DB_HOST,
                port: parseInt(process.env.DEV_DB_PORT || '5432', 10),
                name: process.env.DEV_DB_NAME,
                user: process.env.DEV_DB_USER,
                password: process.env.DEV_DB_PASSWORD,
                searchPath: process.env.DEV_DB_SEARCH_PATH?.split(',') || ['public', 'identity', 'habit', 'crm', 'fsa', 'content']
            }
        },

        // Authentication
        auth: {
            jwtSecret: process.env.JWT_SECRET,
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET
            }
        },

        // Google Services
        google: {
            mapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
            mapsMapId: process.env.GOOGLE_MAPS_MAP_ID
        },

        // Strava
        strava: {
            clientId: process.env.STRAVA_CLIENT_ID,
            clientSecret: process.env.STRAVA_CLIENT_SECRET,
            webhookSecret: process.env.STRAVA_WEBHOOK_SECRET,
            redirectUri: process.env.STRAVA_REDIRECT_URI,
            apiSettings: process.env.STRAVA_API_SETTINGS
        },

        // Email
        email: {
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASS,
            recipient: process.env.RECIPIENT_EMAIL
        },

        // Security
        security: {
            recaptchaSecret: process.env.RECAPTCHA_SECRET_KEY,
            recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY
        },

        // Heroku specific
        heroku: {
            cli: process.env.HEROKU_CLI
        }
    };
}

// Export the configuration
const config = loadEnv();
module.exports = config; 