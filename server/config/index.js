const path = require('path');
const fs = require('fs');

let cachedConfig;

const SUPPORTED_ENVS = ['development', 'test', 'production'];

function parseEnvFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    value = value.replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
}

function loadEnvFiles(rootDir, nodeEnv) {
  const envFiles = [
    path.join(rootDir, '.env'),
    path.join(rootDir, `.env.${nodeEnv}`),
    path.join(rootDir, '.env.local'),
    path.join(rootDir, `.env.${nodeEnv}.local`),
  ];

  return envFiles.filter((file) => fs.existsSync(file)).map((file) => {
    parseEnvFile(file);
    return file;
  });
}

function coerceNumber(name, value, { defaultValue, min, max, positive, integer } = {}, errors) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    errors.push(`${name} must be a number`);
    return defaultValue;
  }
  if (integer && !Number.isInteger(num)) {
    errors.push(`${name} must be an integer`);
  }
  if (positive && num <= 0) {
    errors.push(`${name} must be positive`);
  }
  if (min !== undefined && num < min) {
    errors.push(`${name} must be >= ${min}`);
  }
  if (max !== undefined && num > max) {
    errors.push(`${name} must be <= ${max}`);
  }
  return num;
}

function coerceString(name, value, { required, url, defaultValue } = {}, errors) {
  const finalValue = value ?? defaultValue;
  if (required && !finalValue) {
    errors.push(`${name} is required`);
  }
  if (url && finalValue) {
    try {
      // eslint-disable-next-line no-new
      new URL(finalValue);
    } catch (_err) {
      errors.push(`${name} must be a valid url`);
    }
  }
  return finalValue;
}

function parseList(value, fallback = []) {
  if (!value) return fallback;
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildConfig() {
  if (cachedConfig) return cachedConfig;

  const rootDir = path.resolve(__dirname, '..', '..');
  const nodeEnv = process.env.NODE_ENV?.toLowerCase() || 'development';
  const normalizedEnv = SUPPORTED_ENVS.includes(nodeEnv) ? nodeEnv : 'development';
  const loadedEnvFiles = loadEnvFiles(rootDir, normalizedEnv);
  const raw = { ...process.env, NODE_ENV: normalizedEnv };
  const errors = [];

  const parsed = {
    NODE_ENV: normalizedEnv,
    PORT: raw.PORT,
    CORS_ALLOWED_ORIGINS: raw.CORS_ALLOWED_ORIGINS,
    HTTP_TIMEOUT_MS: coerceNumber('HTTP_TIMEOUT_MS', raw.HTTP_TIMEOUT_MS, { defaultValue: 10_000, integer: true, positive: true }, errors),
    HTTP_MAX_RETRIES: coerceNumber('HTTP_MAX_RETRIES', raw.HTTP_MAX_RETRIES, { defaultValue: 2, integer: true, min: 0, max: 5 }, errors),
    HTTP_RETRY_DELAY_MS: coerceNumber('HTTP_RETRY_DELAY_MS', raw.HTTP_RETRY_DELAY_MS, { defaultValue: 100, integer: true, min: 0 }, errors),
    HTTP_RETRY_BACKOFF_FACTOR: coerceNumber('HTTP_RETRY_BACKOFF_FACTOR', raw.HTTP_RETRY_BACKOFF_FACTOR, { defaultValue: 2, positive: true }, errors),
    JWT_SECRET: coerceString('JWT_SECRET', raw.JWT_SECRET, { required: true }, errors),
    GOOGLE_CLIENT_ID: coerceString('GOOGLE_CLIENT_ID', raw.GOOGLE_CLIENT_ID, { required: true }, errors),
    GOOGLE_CLIENT_SECRET: coerceString('GOOGLE_CLIENT_SECRET', raw.GOOGLE_CLIENT_SECRET, { required: true }, errors),
    OPENAI_API_KEY: coerceString('OPENAI_API_KEY', raw.OPENAI_API_KEY, { required: true }, errors),
    OPENAI_BASE_URL: coerceString('OPENAI_BASE_URL', raw.OPENAI_BASE_URL, { defaultValue: 'https://api.openai.com/v1', url: true }, errors),
    GOOGLE_MAPS_API_KEY: raw.GOOGLE_MAPS_API_KEY,
    GOOGLE_MAPS_MAP_ID: raw.GOOGLE_MAPS_MAP_ID,
    STRAVA_CLIENT_ID: coerceString('STRAVA_CLIENT_ID', raw.STRAVA_CLIENT_ID, { required: true }, errors),
    STRAVA_CLIENT_SECRET: coerceString('STRAVA_CLIENT_SECRET', raw.STRAVA_CLIENT_SECRET, { required: true }, errors),
    STRAVA_WEBHOOK_SECRET: raw.STRAVA_WEBHOOK_SECRET,
    STRAVA_REDIRECT_URI: coerceString('STRAVA_REDIRECT_URI', raw.STRAVA_REDIRECT_URI, { required: true, url: true }, errors),
    STRAVA_BASE_URL: coerceString('STRAVA_BASE_URL', raw.STRAVA_BASE_URL, { defaultValue: 'https://www.strava.com/api/v3', url: true }, errors),
    STRAVA_OAUTH_BASE_URL: coerceString('STRAVA_OAUTH_BASE_URL', raw.STRAVA_OAUTH_BASE_URL, { defaultValue: 'https://www.strava.com', url: true }, errors),
    RAINDROP_CLIENT_ID: coerceString('RAINDROP_CLIENT_ID', raw.RAINDROP_CLIENT_ID, { required: true }, errors),
    RAINDROP_CLIENT_SECRET: coerceString('RAINDROP_CLIENT_SECRET', raw.RAINDROP_CLIENT_SECRET, { required: true }, errors),
    RAINDROP_REDIRECT_URI: coerceString('RAINDROP_REDIRECT_URI', raw.RAINDROP_REDIRECT_URI, { required: true, url: true }, errors),
    RAINDROP_OAUTH_BASE_URL: coerceString('RAINDROP_OAUTH_BASE_URL', raw.RAINDROP_OAUTH_BASE_URL, { defaultValue: 'https://raindrop.io', url: true }, errors),
    RAINDROP_BASE_URL: coerceString('RAINDROP_BASE_URL', raw.RAINDROP_BASE_URL, { defaultValue: 'https://api.raindrop.io', url: true }, errors),
    RECAPTCHA_SECRET_KEY: coerceString('RECAPTCHA_SECRET_KEY', raw.RECAPTCHA_SECRET_KEY, { required: true }, errors),
    RECAPTCHA_SITE_KEY: raw.RECAPTCHA_SITE_KEY,
    RECAPTCHA_VERIFY_URL: coerceString('RECAPTCHA_VERIFY_URL', raw.RECAPTCHA_VERIFY_URL, { defaultValue: 'https://www.google.com/recaptcha/api/siteverify', url: true }, errors),
    DB_HOST: raw.DB_HOST,
    DB_PORT: coerceNumber('DB_PORT', raw.DB_PORT, { integer: true, positive: true }, errors),
    DB_NAME: raw.DB_NAME,
    DB_USER: raw.DB_USER,
    DB_PASSWORD: raw.DB_PASSWORD,
    DATABASE_URL: coerceString('DATABASE_URL', raw.DATABASE_URL, { url: true }, errors),
    DB_SEARCH_PATH: raw.DB_SEARCH_PATH,
    PROD_DB_SEARCH_PATH: raw.PROD_DB_SEARCH_PATH,
    EMAIL_USER: raw.EMAIL_USER,
    EMAIL_PASS: raw.EMAIL_PASS,
    RECIPIENT_EMAIL: raw.RECIPIENT_EMAIL,
    APIFY_API_TOKEN: raw.APIFY_API_TOKEN,
    APIFY_INSTAGRAM_ACTOR_ID: raw.APIFY_INSTAGRAM_ACTOR_ID,
    HEROKU_CLI: raw.HEROKU_CLI,
    KNEX_DEBUG_CONNECT: raw.KNEX_DEBUG_CONNECT,
  };

  const required = ['JWT_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'OPENAI_API_KEY'];
  if (normalizedEnv !== 'test' && !parsed.DATABASE_URL) {
    ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'].forEach((key) => required.push(key));
  }
  if (normalizedEnv === 'production') {
    required.push('DATABASE_URL');
  }
  required.forEach((key) => {
    if (!parsed[key]) {
      errors.push(`${key} is required`);
    }
  });

  const port = coerceNumber('PORT', parsed.PORT, { defaultValue: 5000, integer: true, min: 1, max: 65535 }, errors);
  if (errors.length) {
    throw new Error(`Config validation failed: ${errors.join('; ')}`);
  }

  /** @type {const} */
  const config = {
    nodeEnv: parsed.NODE_ENV,
    loadedEnvFiles,
    server: {
      port,
      isProduction: parsed.NODE_ENV === 'production',
    },
    http: {
      timeoutMs: parsed.HTTP_TIMEOUT_MS,
      maxRetries: parsed.HTTP_MAX_RETRIES,
      retryDelayMs: parsed.HTTP_RETRY_DELAY_MS,
      retryBackoffFactor: parsed.HTTP_RETRY_BACKOFF_FACTOR,
    },
    cors: {
      allowedOrigins: parseList(parsed.CORS_ALLOWED_ORIGINS, [
        'http://localhost:3000',
        'http://localhost:5000',
        'https://angushally.com',
      ]),
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
    database: {
      url: parsed.DATABASE_URL,
      host: parsed.DB_HOST,
      port: parsed.DB_PORT || 5432,
      name: parsed.DB_NAME,
      user: parsed.DB_USER,
      password: parsed.DB_PASSWORD,
      searchPath: parseList(parsed.DB_SEARCH_PATH || parsed.PROD_DB_SEARCH_PATH, [
        'public',
        'identity',
        'habit',
        'crm',
        'fsa',
        'content',
        'raindrop',
      ]),
    },
    auth: {
      jwtSecret: parsed.JWT_SECRET,
      google: {
        clientId: parsed.GOOGLE_CLIENT_ID,
        clientSecret: parsed.GOOGLE_CLIENT_SECRET,
      },
    },
    google: {
      mapsApiKey: parsed.GOOGLE_MAPS_API_KEY,
      mapsMapId: parsed.GOOGLE_MAPS_MAP_ID,
    },
    strava: {
      clientId: parsed.STRAVA_CLIENT_ID,
      clientSecret: parsed.STRAVA_CLIENT_SECRET,
      webhookSecret: parsed.STRAVA_WEBHOOK_SECRET,
      redirectUri: parsed.STRAVA_REDIRECT_URI,
      baseUrl: parsed.STRAVA_BASE_URL || 'https://www.strava.com/api/v3',
      oauthBaseUrl: parsed.STRAVA_OAUTH_BASE_URL || 'https://www.strava.com',
    },
    email: {
      user: parsed.EMAIL_USER,
      password: parsed.EMAIL_PASS,
      recipient: parsed.RECIPIENT_EMAIL,
    },
    security: {
      recaptchaSecret: parsed.RECAPTCHA_SECRET_KEY,
      recaptchaSiteKey: parsed.RECAPTCHA_SITE_KEY,
      verifyUrl: parsed.RECAPTCHA_VERIFY_URL || 'https://www.google.com/recaptcha/api/siteverify',
    },
    openai: {
      apiKey: parsed.OPENAI_API_KEY,
      baseUrl: parsed.OPENAI_BASE_URL,
    },
    raindrop: {
      clientId: parsed.RAINDROP_CLIENT_ID,
      clientSecret: parsed.RAINDROP_CLIENT_SECRET,
      redirectUri: parsed.RAINDROP_REDIRECT_URI,
      oauthBaseUrl: parsed.RAINDROP_OAUTH_BASE_URL,
      baseUrl: parsed.RAINDROP_BASE_URL,
    },
    apify: {
      apiToken: parsed.APIFY_API_TOKEN,
      actors: {
        instagramScraper: parsed.APIFY_INSTAGRAM_ACTOR_ID || 'pratikdani/instagram-posts-scraper',
      },
    },
    heroku: {
      cli: parsed.HEROKU_CLI,
    },
    debug: {
      knexDebugConnect: parsed.KNEX_DEBUG_CONNECT === 'true',
    },
  };

  cachedConfig = Object.freeze(config);
  return cachedConfig;
}

function validateConfig() {
  return buildConfig();
}

const frozenConfig = buildConfig();
const exported = { ...frozenConfig, config: frozenConfig, loadConfig: buildConfig, validateConfig };

module.exports = Object.freeze(exported);
