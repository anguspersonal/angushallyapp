# WSL to Windows Native Migration Guide
**Date:** December 2025

---

## Overview

This guide documents the migration of angushallyapp from WSL (Windows Subsystem for Linux) to native Windows execution. All WSL-specific paths and configurations have been updated for cross-platform compatibility.

---

## Changes Made

### 1. Fixed Hardcoded WSL Paths

**File:** `fix-staged-deletions.sh`

**Before:**
```bash
cd /home/ahally/angushallyapp
```

**After:**
```bash
# Get the directory where the script is located (works in both WSL and Windows)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"
```

This change makes the script work regardless of where it's located or what environment it's run in.

---

## Prerequisites for Windows Native

### Required Software

1. **Node.js** v20.x
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** v10.x or higher
   - Comes with Node.js
   - Verify installation: `npm --version`

3. **Git for Windows** (includes Git Bash)
   - Download from: https://git-scm.com/download/win
   - Required for bash scripts (`clean:node`, `clean:next`)
   - Verify installation: `git --version`

4. **PostgreSQL**
   - Download from: https://www.postgresql.org/download/windows/
   - Or use a cloud database (Heroku Postgres, etc.)
   - Verify installation: `psql --version`

5. **Heroku CLI** (optional, for deployment)
   - Download from: https://devcenter.heroku.com/articles/heroku-cli
   - Verify installation: `heroku --version`

---

## Installation Steps

### 1. Clone/Copy the Project

If transferring from WSL, copy the project to a Windows location:

```powershell
# Example: Copy from WSL to Windows
# In PowerShell (run as Administrator if needed)
xcopy \\wsl.localhost\Ubuntu\home\ahally\angushallyapp C:\Projects\angushallyapp /E /I /H /Y
```

Or use Git to clone if the repository is on GitHub:

```powershell
git clone https://github.com/angushally/angushallyapp.git
cd angushallyapp
```

### 2. Install Dependencies

```powershell
npm install
```

This will install dependencies for the root workspace and all sub-workspaces (`next-ui` and `server`).

### 3. Set Up Environment Variables

Copy the example environment file and configure it:

```powershell
# Copy example file
copy config\env.example .env

# Edit .env with your configuration
notepad .env
```

**Required Environment Variables:**
- Database connection details (PostgreSQL)
- Google OAuth credentials
- JWT secret
- Email configuration (if using contact form)
- Any API keys (Strava, OpenAI, etc.)

See `config/env.example` for the full list of required variables.

### 4. Set Up Database

**Option A: Local PostgreSQL**

1. Create a database:
   ```sql
   CREATE DATABASE angushallyapp;
   ```

2. Update `.env` with your local database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=angushallyapp
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

**Option B: Remote Database (Heroku Postgres, etc.)**

Update `.env` with your remote database connection string:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

### 5. Run Database Migrations

```powershell
npm run migrate
```

This will create all necessary database tables.

---

## Running the Application

### Development Mode (Full Stack)

```powershell
npm run dev
```

This starts both:
- Express server on `http://localhost:5000`
- Next.js dev server on `http://localhost:3000`

### Backend Only

```powershell
npm run server
```

Starts only the Express server on port 5000.

### Frontend Only

```powershell
npm run client
```

Starts only the Next.js dev server on port 3000.

---

## Windows-Specific Considerations

### Bash Scripts

The following npm scripts use bash and require Git Bash (included with Git for Windows):

- `npm run clean:node` - Cleans node_modules
- `npm run clean:next` - Cleans Next.js build cache

These scripts will work automatically if Git Bash is installed and in your PATH. If you encounter issues:

1. Ensure Git for Windows is installed
2. Verify Git Bash is in your PATH: `where bash`
3. Alternatively, run the scripts directly in Git Bash terminal

### Path Separators

All scripts use forward slashes (`/`) which work on both Windows and Unix systems. Node.js and npm handle path normalization automatically.

### Line Endings

If you encounter issues with line endings:

```powershell
# Configure Git to handle line endings automatically
git config --global core.autocrlf true
```

### Port Conflicts

If ports 3000 or 5000 are already in use:

```powershell
# Kill processes on specific ports
npm run kill-ports

# Or manually (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

---

## Testing the Migration

### 1. Verify Installation

```powershell
# Check Node.js version
node --version  # Should be v20.x

# Check npm version
npm --version  # Should be >= 10.x

# Check Git Bash availability
bash --version
```

### 2. Test Database Connection

```powershell
npm run config:check
```

This validates your database configuration.

### 3. Test Development Server

```powershell
npm run dev
```

Then visit:
- `http://localhost:5000` - Main application
- `http://localhost:3000` - Next.js dev server

### 4. Run Tests

```powershell
# Backend tests
npm test

# Frontend tests (from next-ui directory)
cd next-ui
npm test
```

---

## Troubleshooting

### Issue: "bash: command not found"

**Solution:** Install Git for Windows, which includes Git Bash. Ensure it's added to your PATH.

### Issue: Port already in use

**Solution:** 
```powershell
npm run kill-ports
```

Or manually kill the process using the port.

### Issue: Database connection errors

**Solution:**
1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure database exists
4. Check firewall settings if using remote database

### Issue: Module not found errors

**Solution:**
```powershell
# Clean and reinstall
npm run clean:node
npm install
```

### Issue: Next.js build errors

**Solution:**
```powershell
# Clean Next.js cache
npm run clean:next
npm run build-next
```

---

## Deployment

### Heroku Deployment

The deployment process remains the same:

```powershell
# Build for production
npm run build

# Deploy to Heroku
git push heroku main
```

Or use the deployment script (requires Git Bash):

```bash
bash scripts/deploy-heroku.sh
```

---

## File Structure Compatibility

All file paths in the codebase use relative paths or Node.js path utilities, making them cross-platform compatible. The following are handled automatically:

- Path separators (`/` vs `\`)
- Line endings (CRLF vs LF)
- File permissions (handled by Node.js)

---

## Verification Checklist

- [ ] Node.js v20.x installed
- [ ] npm v10.x+ installed
- [ ] Git for Windows installed (for bash scripts)
- [ ] PostgreSQL installed or remote database configured
- [ ] Environment variables configured in `.env`
- [ ] Database migrations run successfully
- [ ] `npm run dev` starts both servers
- [ ] Application accessible at `http://localhost:5000`
- [ ] Tests pass: `npm test`
- [ ] Build succeeds: `npm run build`

---

## Additional Resources

- [Node.js Windows Installation Guide](https://nodejs.org/en/download/)
- [Git for Windows](https://git-scm.com/download/win)
- [PostgreSQL Windows Installation](https://www.postgresql.org/download/windows/)
- [Cross-platform Node.js Development](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

## Notes

- All scripts have been tested for cross-platform compatibility
- The project uses `cross-env` for environment variable handling
- Path resolution uses Node.js built-in utilities for cross-platform support
- Bash scripts will work with Git Bash on Windows

---

**Last Updated:** December 2025
**Migration Status:** ✅ Complete


