# 10_heroku_nextjs_config.md

# 🚀 Heroku Next.js Configuration Guide

This document outlines the configuration needed to deploy the Next.js application to Heroku staging.

---

## 🔧 Environment Variables

Set these environment variables in your Heroku app via the dashboard or CLI:

### Required Variables
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
```

### Next.js Route Swapping (Optional)
Enable route swapping to test Next.js pages in production:

```bash
ENABLE_NEXT_LOGIN=true
ENABLE_NEXT_ABOUT=true
ENABLE_NEXT_PROJECTS=true
ENABLE_NEXT_BLOG=true
ENABLE_NEXT_CONTACT=true
ENABLE_NEXT_CV=true
ENABLE_NEXT_COLLAB=true
```

### Setting Variables via CLI
```bash
# Set required variables
heroku config:set NODE_ENV=production
heroku config:set PORT=5000
heroku config:set DATABASE_URL="your_database_url"
heroku config:set GOOGLE_CLIENT_ID="your_google_client_id"
heroku config:set GOOGLE_CLIENT_SECRET="your_google_client_secret"
heroku config:set JWT_SECRET="your_jwt_secret"

# Enable Next.js routes (optional)
heroku config:set ENABLE_NEXT_LOGIN=true
heroku config:set ENABLE_NEXT_ABOUT=true
```

---

## 🏗️ Build Process

The build process now works as follows:

1. **Heroku Pre-build**: Installs Next.js dependencies
2. **Heroku Post-build**: Syncs environment and builds Next.js
3. **Express Server**: Serves the static Next.js build

### Build Scripts
```json
{
  "build": "npm run sync-env:prod && npm run build-next",
  "build-next": "npm run build --prefix web",
  "heroku-prebuild": "npm install --prefix web --legacy-peer-deps --production=false",
  "heroku-postbuild": "npm run sync-env:prod && npm run build --prefix web"
}
```

---

## 🌐 Route Configuration

### Development Mode
- Next.js dev server runs on port 3000
- Express proxies `/next/*` requests to Next.js
- Express handles API routes on port 5000

### Production Mode
- Next.js builds to static files in `web/out/`
- Express serves static files from `web/out/`
- Route swapping redirects canonical paths to `/next/*` versions

### Route Swapping Logic
```javascript
// Example: Enable login route swapping
if (process.env.ENABLE_NEXT_LOGIN === 'true') {
  app.get('/login', (req, res) => res.redirect('/next/login'));
}
```

---

## 🚀 Deployment Process

### Quick Deploy
```bash
# Use the deployment script
./scripts/deploy-heroku.sh
```

### Manual Deploy
```bash
# 1. Build Next.js
npm run build-next

# 2. Commit changes
git add .
git commit -m "Deploy Next.js to Heroku"

# 3. Push to Heroku
git push heroku main

# 4. Run migrations
heroku run npm run migrate
```

---

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check build logs
   heroku logs --tail
   
   # Verify Next.js dependencies
   cd web && npm install
   ```

2. **Static Files Not Served**
   ```bash
   # Check if out directory exists
   ls -la web/out/
   
   # Verify Express static serving
   heroku logs --tail | grep "static"
   ```

3. **Environment Variables Missing**
   ```bash
   # Check current config
   heroku config
   
   # Set missing variables
   heroku config:set VARIABLE_NAME=value
   ```

### Logs and Monitoring
```bash
# View real-time logs
heroku logs --tail

# Check app status
heroku ps

# Open app in browser
heroku open
```

---

## 📋 Pre-deployment Checklist

- [ ] Environment variables set in Heroku
- [ ] Next.js builds successfully locally (`npm run build-next`)
- [ ] Static files generated in `web/out/`
- [ ] Express server starts without errors
- [ ] Database migrations ready
- [ ] Google OAuth redirect URIs updated for production

---

## 🔄 Migration Status

Current migration status can be tracked in:
- [Migration Plan](09_nextjs_migration_plan.md) - Overall strategy
- [Migration Tracker](09_migration_tracker.md) - Individual route progress
- [Migration Log](09_migration_log.md) - Completed work

---

## 📚 Related Documentation

- [Migration Plan](09_nextjs_migration_plan.md) - Strategic overview
- Root [`.env.example`](../.env.example) - Template for local `.env.local`; production env lives in Vercel
- [Express Server](server/index.js) - Server configuration
- [Next.js Config](web/next.config.mjs) - Next.js build settings 