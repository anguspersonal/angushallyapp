const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 1) Load the "base" vars from .env (shared across all envs)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 2) Determine mode and override with .env.development or .env.production
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

dotenv.config({ path: path.resolve(__dirname, `../.env.${mode}`) });
console.log(`🔄 sync-env loading .env.${mode}`, {
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL: process.env.API_BASE_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID: process.env.GOOGLE_MAPS_MAP_ID,
  RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY
});

// Build the React-style vars object
const out = {
  NODE_ENV: mode,
  REACT_APP_API_BASE_URL: process.env.API_BASE_URL || (mode === 'production' ? '/api' : ''),
  REACT_APP_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  REACT_APP_GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  REACT_APP_GOOGLE_MAPS_MAP_ID: process.env.GOOGLE_MAPS_MAP_ID || '',
  REACT_APP_RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY || ''
};

// Write to react-ui/.env
const dest = path.resolve(__dirname, '../react-ui/.env');
fs.writeFileSync(dest,
  Object.entries(out).map(([k,v]) => `${k}=${v}`).join('\n') + '\n'
);

console.log('✅ Generated', dest, out); 