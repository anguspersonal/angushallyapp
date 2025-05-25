# ADR 0010: Environment Configuration Management

## Status
Accepted

## Context
We run our full-stack app in three main modes:
1. **Server-only dev** (Express serves React build at `localhost:5000`)  
2. **CRA+server dev** (React dev server at `localhost:3000`, API on `localhost:5000`)  
3. **Production** (both front-end and API on `https://angushally.com`)

We need a consistent, maintainable way to:
- Point client code (fetch, axios, OAuth redirects) at the correct backend host/port  
- Provide secrets (Google, Maps, reCAPTCHA) to both server and client  
- Avoid scattering `if (NODE_ENV === 'development')` checks throughout our code

## Decision
1. **Root `.env` files** at project root:
   - `.env` (common defaults, git-ignored)  
   - `.env.development` (development overrides)  
   - `.env.production` (production overrides)  
   - `.env.local` (machine-specific, git-ignored)

   ```env
   # Example root .env.development
   API_BASE_URL=http://localhost:5000/api  # Single source of truth for API URL
   GOOGLE_CLIENT_ID=…
   GOOGLE_MAPS_API_KEY=…
   RECAPTCHA_SITE_KEY=…
   ```

   ```env
   # Example root .env.production
   API_BASE_URL=https://angushally.com/api  # Same variable name, different value for production
   GOOGLE_CLIENT_ID=…
   GOOGLE_MAPS_API_KEY=…
   RECAPTCHA_SITE_KEY=…
   ```

2. **sync-env.js** reads those root vars and emits:
   - `react-ui/.env.development`
   - `react-ui/.env.production`

   ```javascript
   // sync-env.js (excerpt)
   const isDev = process.env.NODE_ENV === 'development';
   const reactEnv = {
     NODE_ENV: isDev ? 'development' : 'production',
     REACT_APP_API_BASE_URL: process.env.API_BASE_URL,  // Single API_BASE_URL used everywhere
     REACT_APP_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
     /* …etc… */
   };
   // write reactEnv into react-ui/.env.{development|production}
   ```

3. **React code** uses only `process.env.REACT_APP_*`:
   ```javascript
   // src/utils/apiClient.js
   export const API_BASE = (
     process.env.REACT_APP_API_BASE_URL.replace(/\/$/, '')
     || '/api'
   );
   ```

4. **Express server** continues to load `config/env.js` against the root `.env*` files—no `server/.env*` directories needed.

## Consequences

### Positive
- **Simplicity**: All env vars come from root files; client sees only `REACT_APP_*`
- **Clarity**: No ad-hoc per-file dev/production if-blocks
- **Flexibility**: You can add new variables once in root, and they flow to both server and client automatically
- **CRA compatibility**: We honour CRA's loading order (`.env`, `.env.development`, `.env.local`), but generate only the necessary two `.env.*` files via `sync-env.js`
- **Single Source of Truth**: One `API_BASE_URL` configuration that's consistently used across the entire application

### Negative
- Requires running `sync-env.js` after changing root env vars
- Slightly more complex initial setup
- Need to maintain two sets of env var names (root vs `REACT_APP_*`)

## Implementation Notes
1. Root `.env` files should be in `.gitignore` except for `.env.example`
2. `sync-env.js` should be run:
   - After cloning the repo
   - After changing root env vars
   - As part of the build process
3. Server code should use `config/env.js` to access variables
4. Client code should only use `process.env.REACT_APP_*` variables
5. All API calls should use the centralized `API_BASE_URL` configuration
6. Avoid hardcoding API URLs in any part of the application
7. Ensure `API_BASE_URL` is defined in both `.env.development` and `.env.production` with appropriate values for each environment

