# env.js and dotenv Configuration Guide

This document explains why we use a custom `env.js` loader in the backend instead of relying solely on a flat `.env` file, outlines the separate `.env` conventions in the React frontend, and shows how to add new credentials (client ID, client secret, redirect URI) for both development and production.

# Configuration Management

This directory contains configuration management for the application.

## Environment Variables

The `env.js` module provides a centralized way to manage environment variables:

* **Validation & Coercion**: It checks required variables (e.g. `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `DATABASE_URL` or `DB_*`), validates ports, and throws early if something is missing or malformed.

---

## 1. Why `env.js` in the Backend

### Centralized Loading & Validation

* **Deterministic Load Order**: `env.js` reads files in this sequence:

  1. `.env` (base defaults)
  2. `.env.${NODE_ENV}` (e.g. `.env.development` or `.env.production`, if present)
  3. `.env.local` (machine-specific overrides, git-ignored)
* **Validation & Coercion**: It checks required variables (e.g. `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `DATABASE_URL` or `DEV_DB_*`), validates ports, and throws early if something is missing or malformed.
* **Typed Config Object**: Exports a structured `config` object instead of scattering raw `process.env.*` across the codebase.

### Benefits over a Flat `.env`

* **Early Failures**: Catch missing or invalid values at startup, not at runtime.
* **Clear Precedence**: Environment-specific overrides without manual edits or `dotenv.config({ path })` calls sprinkled in code.
* **Cleaner Code**: Downstream modules access `config.auth.jwtSecret` or `config.ports.webServer`, not `process.env.JWT_SECRET || 'fallback'`.

> *Tech Debt Note*: We currently use one `.env` file and may split into `.env.development` and `.env.production` later. That improvement is tracked in the [TECH\_DEBT.md](TECH_DEBT.md) backlog.

---

## 2. React Frontend (`react-ui`) `.env` Convention

The React app (Create React App) has its own dotenv loader limited to files in `/react-ui`:

* `/react-ui/.env`             → loaded in every environment
* `/react-ui/.env.development` → overrides for `npm start` (development)
* `/react-ui/.env.production`  → overrides for `npm run build` (production)

**All** frontend vars **must** be prefixed with `REACT_APP_`, for example:

```ini
# /react-ui/.env.development
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_STRAVA_REDIRECT_URI=http://localhost:5000/api/strava/callback
```

When building (`npm run build`), CRA picks up `.env` then `.env.production` instead.

---

## 3. Adding New Credentials for a Service

When you onboard a new integration (e.g. WidgetCo), you'll typically need:

* **CLIENT ID**
* **CLIENT SECRET**
* **REDIRECT URI**

### 3.1 Backend Setup (Root)

1. **Add keys to your root `.env`**:

   ```ini
   # WidgetCo Integration
   WIDGETCO_CLIENT_ID=your-client-id
   WIDGETCO_CLIENT_SECRET=your-client-secret
   WIDGETCO_REDIRECT_URI=https://your-domain.com/api/widgetco/callback
   ```
2. **(Optional) Local dev override**: If you need a local callback URL different from production, create/edit `/ .env.development`:

   ```ini
   WIDGETCO_REDIRECT_URI=http://localhost:5000/api/widgetco/callback
   ```
3. **Use in code**:

   ```js
   // env.js will inject these
   const { widgetCo: { clientId, clientSecret, redirectUri } } = config;
   ```
4. **Register both URIs** in your service's dashboard:

   * `https://your-domain.com/api/widgetco/callback`
   * `http://localhost:5000/api/widgetco/callback`

### 3.2 Frontend Setup (`react-ui`)

1. **Add to `/react-ui/.env` or `.env.development`** (must use `REACT_APP_` prefix):

   ```ini
   REACT_APP_WIDGETCO_CLIENT_ID=your-client-id
   REACT_APP_WIDGETCO_REDIRECT_URI=http://localhost:3000/auth/widgetco/callback
   ```
2. **Production build** (`/react-ui/.env.production`):

   ```ini
   REACT_APP_WIDGETCO_REDIRECT_URI=https://your-live-site.com/auth/widgetco/callback
   ```
3. **Consume in React**:

   ```js
   const clientId = process.env.REACT_APP_WIDGETCO_CLIENT_ID;
   const redirectUri = process.env.REACT_APP_WIDGETCO_REDIRECT_URI;
   ```
4. **Update your OAuth flow** to use these dynamic vars when constructing authorization URLs.

---

## 4. Workflow for New Developers

1. **Clone the repo** and `cd` into the project root.
2. **Copy** `env.example` → `.env` and fill in your credentials.
3. **(Optional)** for local overrides, copy `.env` → `.env.development` and adjust values (e.g. localhost URIs).
4. **In `react-ui`**, copy its `env.example` → `.env.development` and fill `REACT_APP_…` variables.
5. **Install & start** the backend:

   ```bash
   npm install
   npm run dev   # NODE_ENV=development
   ```
6. **Install & start** the frontend:

   ```bash
   cd react-ui
   npm install
   npm start
   ```

By following this guide, you'll have both backend and frontend loading the right credentials for your environment without manual edits at deploy time.

---

*Last updated: May 24, 2025*
