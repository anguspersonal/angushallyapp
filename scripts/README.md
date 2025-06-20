# Scripts Directory

This directory contains utility scripts for the AngusHallyApp project.

## Available Scripts

### 🔍 checkEnvSync.js

**Environment Sync Checker** - Verifies consistency between development and production environments before deployment.

#### Purpose
Prevents production deployment issues by detecting:
- Drifted database schemas (missing tables, columns)
- Missing essential data (empty tables in prod)
- Diverging migration versions or incomplete seed data

#### Usage
```bash
node scripts/checkEnvSync.js
```

#### Prerequisites
Set the following environment variables:

**Required:**
- `PROD_DATABASE_URL` or `DATABASE_URL` - Production database connection string
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Development database config
- `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `OPENAI_API_KEY` - Required by env.js

**Example:**
```bash
export PROD_DATABASE_URL="postgresql://user:pass@prod-host:5432/prod_db"
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_NAME="dev_db"
export DB_USER="dev_user"
export DB_PASSWORD="dev_password"

node scripts/checkEnvSync.js
```

#### What It Checks

1. **Database Connections**
   - ✅ Dev database connectivity
   - ✅ Prod database connectivity

2. **Table Existence**
   - ✅ `bookmarks.bookmarks` table exists in both environments
   - ❌ Table existence mismatches

3. **Row Counts**
   - ✅ `raindrop.bookmarks` and `bookmarks.bookmarks` row counts
   - ⚠️ Warns when prod has no data but dev does

4. **Migration Status**
   - ✅ Latest migration versions match
   - ❌ Migration version mismatches
   - ⚠️ Dev has newer migrations than prod

5. **Data Freshness**
   - ✅ Latest entry timestamps within 7 days
   - ⚠️ Large time gaps between environments

#### Output Examples

**Successful Check:**
```
🔍 Environment Sync Checker Starting...

📊 Checking Database Connections...
✅ [OK] Dev database connection successful
✅ [OK] Prod database connection successful

📋 Checking Table Existence...
✅ [OK] Table exists in both environments: bookmarks.bookmarks

📊 Checking Row Counts...
✅ [OK] Row counts - raindrop.bookmarks    Dev: 150, Prod: 145
✅ [OK] Row counts - bookmarks.bookmarks   Dev: 89, Prod: 87

⏰ Checking Latest Entry Timestamps...
✅ [OK] Latest entries are recent in both environments

🏗️ Checking Migration Status...
✅ [OK] Migration versions match    Latest: 20250620000000_migrate_raindrop_to_canonical_bookmarks.js

📈 Summary:
✅ Passed: 6
⚠️ Warnings: 0
❌ Failures: 0

✅ SYNC CHECK PASSED - Safe to deploy to production
```

**With Warnings:**
```
⚠️ [WARN] Prod has no canonical bookmarks while dev has data    Consider running bookmark sync in prod
⚠️ [WARN] Dev has newer migrations than prod    Pending: 20250621000000_new_feature.js

📈 Summary:
✅ Passed: 4
⚠️ Warnings: 2
❌ Failures: 0

⚠️ SYNC CHECK PASSED WITH WARNINGS
Review warnings before deploying to production.
```

**With Failures:**
```
❌ [FAIL] Table existence mismatch: bookmarks.bookmarks    Dev: exists, Prod: missing
❌ [FAIL] Migration versions do not match    Dev: 20250621000000_new_feature.js, Prod: 20250620000000_migrate_raindrop_to_canonical_bookmarks.js

📈 Summary:
✅ Passed: 2
⚠️ Warnings: 0
❌ Failures: 2

❌ SYNC CHECK FAILED - Production deployment is HIGH RISK
Please resolve failures before deploying to production.
```

#### Exit Codes
- `0` - Success (all checks passed or warnings only)
- `1` - Failure (critical issues found)

#### Integration with CI/CD
Use exit codes to gate deployments:

```bash
# In deployment pipeline
node scripts/checkEnvSync.js
if [ $? -eq 1 ]; then
    echo "Environment sync check failed - aborting deployment"
    exit 1
fi
```

#### Troubleshooting

**Connection Issues:**
```
❌ [FAIL] Prod database connection failed    Connection refused
```
- Verify `PROD_DATABASE_URL` is correct
- Check network connectivity to production database
- Ensure database credentials are valid

**Missing Environment Variables:**
```
❌ [FAIL] Production database URL not found    Set PROD_DATABASE_URL or DATABASE_URL
```
- Set `PROD_DATABASE_URL` environment variable
- Or set `DATABASE_URL` as fallback

**Schema Mismatches:**
```
❌ [FAIL] Table existence mismatch: bookmarks.bookmarks
```
- Run pending migrations in production
- Verify schema synchronization between environments

---

### Other Scripts

#### check-raindrop-bookmarks.js
Check Raindrop.io bookmark data for a specific user.
```bash
node scripts/check-raindrop-bookmarks.js <user-id>
```

#### sync-env.js
Synchronize environment variables for frontend builds.
```bash
node scripts/sync-env.js
```

#### generate-jwt.js
Generate JWT tokens for testing and development.
```bash
node scripts/generate-jwt.js
```

---

## Development Guidelines

- **Test scripts** before committing using realistic data
- **Include error handling** for all external dependencies
- **Use consistent logging** format (emojis + status prefixes)
- **Document environment requirements** clearly
- **Provide usage examples** in documentation 