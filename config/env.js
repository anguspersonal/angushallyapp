const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Priority for loading environment variables:
// 1. Process environment variables (e.g., from Heroku)
// 2. .env.local (git-ignored local overrides)
// 3. .env

/**
 * Validates a port number
 * @param {string|number} port - The port to validate
 * @param {string} serviceName - Name of the service for error messages
 * @returns {number} - The validated port number
 * @throws {Error} - If port is invalid
 */
function validatePort(port, serviceName) {
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        throw new Error(`Invalid port ${port} for ${serviceName}. Must be between 1 and 65535.`);
    }
    return portNum;
}

/**
 * Loads and validates service ports
 * @returns {Object} Object containing validated port configurations
 */
function loadServicePorts() {
    // Default ports for different services
    const defaults = {
        webServer: 5000,
        database: 5432,
        // Add other service ports here
    };

    // Always use explicit port 5000 for web server in development
    const webServerPort = process.env.NODE_ENV === 'production'
        ? validatePort(process.env.PORT || defaults.webServer, 'Web Server')
        : validatePort(defaults.webServer, 'Web Server');

    const ports = {
        webServer: webServerPort,
    };

    // Handle database port - if using DATABASE_URL, don't validate the port
    if (!process.env.DATABASE_URL) {
        ports.database = validatePort(process.env.DB_PORT || defaults.database, 'Database');
    }

    // In development, ensure web server and database ports are different
    if (process.env.NODE_ENV !== 'production' && ports.database === ports.webServer) {
        throw new Error(`Port conflict: Web server and database cannot use the same port (${ports.webServer})`);
    }

    return ports;
}

function loadEnv() {
    const NODE_ENV = process.env.NODE_ENV || 'development';
    const rootDir = path.resolve(__dirname, '..');

    // Load environment variables in order of priority
    const envFiles = [
        path.join(rootDir, '.env'),                    // Base config
        path.join(rootDir, `.env.${NODE_ENV}`),        // Environment-specific config
        path.join(rootDir, '.env.local')               // Local overrides (git-ignored)
    ];

    // Track which file sets each variable
    const variableSources = {};

    // First, track any variables already in process.env (e.g., from Heroku)
    Object.keys(process.env).forEach(key => {
        if (key.startsWith('DATABASE_') || key.startsWith('DB_') || key === 'NODE_ENV') {
            variableSources[key] = 'process.env (pre-existing)';
        }
    });

    // Load each env file if it exists
    envFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`Loading environment from: ${file}`);
            const result = dotenv.config({ path: file });
            
            if (result.parsed) {
                Object.keys(result.parsed).forEach(key => {
                    variableSources[key] = file;
                });
            }
        }
    });

    // Log DATABASE_URL if it exists
    if (process.env.DATABASE_URL) {
        console.log(`DATABASE_URL is set to: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0]} (from ${variableSources['DATABASE_URL'] || 'process.env'})`);
    }

    // Log final environment configuration
    console.log('Environment configuration:', {
        NODE_ENV,
        DATABASE_URL_SOURCE: variableSources['DATABASE_URL'] || (process.env.DATABASE_URL ? 'process.env' : 'Not set'),
        DB_HOST_SOURCE: variableSources['DB_HOST'] || (process.env.DB_HOST ? 'process.env' : 'Not set'),
        DB_NAME_SOURCE: variableSources['DB_NAME'] || (process.env.DB_NAME ? 'process.env' : 'Not set'),
        DB_SEARCH_PATH_SOURCE: variableSources['DB_SEARCH_PATH'] || variableSources['PROD_DB_SEARCH_PATH'] || (process.env.DB_SEARCH_PATH || process.env.PROD_DB_SEARCH_PATH ? 'process.env' : 'Using fallback')
    });

    // Load and validate service ports
    const servicePorts = loadServicePorts();

    // Base required variables (needed in all environments)
    const baseRequiredVars = [
        'JWT_SECRET',
        'GOOGLE_CLIENT_ID',
        'OPENAI_API_KEY',
    ];

    // In production, we use DATABASE_URL, so we don't need individual DB_* vars
    const requiredVars = NODE_ENV === 'production' 
        ? baseRequiredVars
        : [
            ...baseRequiredVars,
            'DB_HOST',
            'DB_PORT',
            'DB_NAME',
            'DB_USER',
            'DB_PASSWORD'
        ];

    if (NODE_ENV === 'production') {
        // In production, we must have DATABASE_URL
        if (!process.env.DATABASE_URL) {
            throw new Error('Production requires DATABASE_URL');
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
        ports: servicePorts, // New structured ports configuration
        
        // Database
        database: {
            // Main production URL (e.g., from Heroku)
            url: process.env.DATABASE_URL,
            
            // Search path configuration
            // Prefer DB_SEARCH_PATH from environment files
            // Also check PROD_DB_SEARCH_PATH for production environments
            // Fallback to default schemas if not specified
            searchPath: (process.env.DB_SEARCH_PATH || process.env.PROD_DB_SEARCH_PATH)?.split(',') || [
                'public',      // Default PostgreSQL schema
                'identity',    // User authentication and profiles
                'habit',       // Habit tracking
                'crm',        // Customer relationship management
                'fsa',        // Financial services
                'content',    // Content management
                'raindrop'    // Raindrop.io integration
            ],
            
            // Database config (now using generic DB_* vars)
            host: process.env.DB_HOST,
            port: servicePorts.database,
            name: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
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

        // OpenAI
        openai: {
            apiKey: process.env.OPENAI_API_KEY
        },

        // Raindrop.io
        raindrop: {
            clientId: process.env.RAINDROP_CLIENT_ID,
            clientSecret: process.env.RAINDROP_CLIENT_SECRET,
            redirectUri: process.env.RAINDROP_REDIRECT_URI
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