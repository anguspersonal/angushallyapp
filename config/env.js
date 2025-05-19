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

    // Load each env file if it exists
    envFiles.forEach(file => {
        if (fs.existsSync(file)) {
            dotenv.config({ path: file });
        }
    });

    // Load and validate service ports
    const servicePorts = loadServicePorts();

    // Base required variables (needed in all environments)
    const baseRequiredVars = [
        'JWT_SECRET',
        'GOOGLE_CLIENT_ID',
        'OPENAI_API_KEY',
    ];

    // Environment-specific required variables
    const requiredVars = NODE_ENV === 'development' 
        ? [
            ...baseRequiredVars,
            // Database (development only)
            'DEV_DB_HOST',
            'DEV_DB_NAME',
            'DEV_DB_USER',
          ]
        : baseRequiredVars;

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
        ports: servicePorts, // New structured ports configuration
        
        // Database
        database: {
            // Main production URL (e.g., from Heroku)
            url: process.env.DATABASE_URL,
            
            // Detailed production config
            production: {
                host: process.env.PROD_DB_HOST,
                port: servicePorts.database, // Use validated database port
                name: process.env.PROD_DB_NAME,
                user: process.env.PROD_DB_USER,
                password: process.env.PROD_DB_PASSWORD,
                searchPath: process.env.PROD_DB_SEARCH_PATH?.split(',') || ['public', 'identity', 'habit', 'crm', 'fsa', 'content']
            },
            
            // Development config
            development: {
                host: process.env.DEV_DB_HOST,
                port: servicePorts.database, // Use validated database port
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

        // OpenAI
        openai: {
            apiKey: process.env.OPENAI_API_KEY
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