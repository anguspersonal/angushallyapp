# Startup Commands Guide

This document provides a comprehensive reference for all application startup commands, development workflows, and deployment procedures for the angushallyapp dual-architecture system.

---

## 🚀 Quick Reference Table

| Command | What It Does | Ports | Use Case |
|---------|-------------|-------|----------|
| `npm run dev` | **React UI + Server** | 5000, 3000 | **Current production app** |
| `npm run dev-next` | **Next.js UI + Server** | 5000, 3001 | **Next.js migration testing** |
| `npm run server` | **Server only** | 5000 | **Backend development** |
| `npm run client` | **React UI only** | 3000 | **Frontend development** |
| `npm run client-next` | **Next.js UI only** | 3001 | **Next.js development** |

---

## 📋 Detailed Command Breakdown

### **1. Full Stack Development (Current Production)**
```bash
npm run dev
```
- **Starts**: Express server (port 5000) + React UI (port 3000)
- **Access**: `http://localhost:5000` (proxied through Express)
- **Use**: Your current production application with all features
- **Environment**: Automatically syncs development environment variables

### **2. Next.js Migration Testing**
```bash
npm run dev-next
```
- **Starts**: Express server (port 5000) + Next.js UI (port 3001)
- **Access**: 
  - `http://localhost:5000` (Express server)
  - `http://localhost:5000/next/*` (Next.js routes via proxy)
- **Use**: Testing migrated routes during Next.js migration
- **Environment**: Automatically syncs development environment variables

### **3. Individual Component Development**

#### **Backend Only**
```bash
npm run server
```
- **Starts**: Express server only (port 5000)
- **Use**: API development, database work, backend testing
- **Features**: Hot reloading with nodemon, database migrations, API testing

#### **React UI Only**
```bash
npm run client
```
- **Starts**: React development server (port 3000)
- **Use**: React component development, hot reloading
- **Features**: Create React App dev server, proxy to backend API

#### **Next.js UI Only**
```bash
npm run client-next
```
- **Starts**: Next.js development server (port 3001)
- **Use**: Next.js component development, migration work
- **Features**: Turbopack, App Router, TypeScript compilation

---

## 🎯 Recommended Workflows

### **For Daily Development (Current Production App)**
```bash
# Start the full React + Server stack
npm run dev

# Access your app at:
# http://localhost:5000
```

### **For Next.js Migration Work**
```bash
# Start Next.js + Server for migration testing
npm run dev-next

# Access migrated routes at:
# http://localhost:5000/next/about
# http://localhost:5000/next/
```

### **For Backend Development**
```bash
# Start server only
npm run server

# Test APIs at:
# http://localhost:5000/api/*
```

### **For Frontend Component Development**
```bash
# For React components
npm run client

# For Next.js components  
npm run client-next
```

---

## 🔄 Port Configuration

| Service | Port | Purpose |
|---------|------|---------|
| **Express Server** | 5000 | Main application server, API endpoints |
| **React UI** | 3000 | Current production frontend |
| **Next.js UI** | 3001 | Next.js migration frontend |

---

## 🛠️ Build & Deployment Commands

### **Build Commands**
```bash
# Build React UI for production
npm run build-client

# Build Next.js UI for production  
npm run build-next

# Build both UIs
npm run build-with-next

# Production build (React only)
npm run build
```

### **Environment Management**
```bash
# Sync environment variables for development
npm run sync-env:dev

# Sync environment variables for production
npm run sync-env:prod
```

### **Database Operations**
```bash
# Run database migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Check migration status
npm run migrate:status

# Create new migration
npm run migrate:make
```

### **Testing Commands**
```bash
# Run backend tests
npm run test

# Run backend tests with verbose output
npm run test--verbose
```

### **Utility Commands**
```bash
# Kill processes on ports 5000 and 3000
npm run kill-ports

# Start production server
npm start
```

---

## 🚨 Important Notes

### **Environment Variables**
- All development commands automatically sync environment variables via `sync-env:dev`
- Environment config is loaded from `config/env.js`
- Production builds use `sync-env:prod`

### **Proxy Configuration**
- React UI proxies API calls to `http://localhost:5000`
- Next.js routes are proxied through Express at `/next/*`
- CRA proxy configuration in `react-ui/package.json`

### **Development vs Production**
- **Development**: Uses hot reloading and development servers
- **Production**: Uses built static files served by Express
- **Heroku**: Automatic deployment with `Procfile` configuration

### **Migration Strategy**
- **Current**: Use `npm run dev` for production app
- **Migration**: Use `npm run dev-next` to test migrated routes
- **Future**: Switch to `npm run dev-next` when migration is complete

---

## 🆕 Port Conflict Handling (Interactive Check)

### **Automatic Port Checking**
All startup and development scripts now include an **interactive port check** using `scripts/check-port.js`.

- Before starting any dev server (Express, React, Next.js), the script checks if the required port is in use.
- If a port is occupied, you will see a prompt showing the PID and command using the port.
- You can choose to kill the process (`y`) or abort startup (`n`).
- This works for:
  - `npm run dev` (checks 5000, 3000)
  - `npm run dev-next` (checks 5000, 3001)
  - `npm run server` (checks 5000)
  - `npm run client` (checks 3000)
  - `npm run client-next` (checks 3001)
  - `cd react-ui && npm start` (checks 3000)
  - `cd next-ui && npm run dev` (checks 3001)

**Example prompt:**
```bash
❌ Port 3000 is already in use:
COMMAND    PID   USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
node    12345 ahally   28u  IPv4 ... TCP *:3000 (LISTEN)

🔍 Process using port 3000:
   PID: 12345
   Command: node

❓ Kill this process and continue? (y/n):
```

- If you choose `y`, the process is killed and startup continues.
- If you choose `n`, startup is aborted and you can resolve the conflict manually.

### **How it Works**
- The utility is located at `scripts/check-port.js`.
- It is called automatically by all relevant npm scripts in the root, `react-ui`, and `next-ui` package.json files.
- You can also run it manually:
  ```bash
  node scripts/check-port.js 5000 3000 3001
  ```

---

## 🔧 Troubleshooting (Updated)

### **Port Conflicts**
- If you see a port conflict prompt, follow the instructions to kill the process or abort.
- If you abort, you can manually kill the process using:
  ```bash
  lsof -i :<port>
  kill <PID>
  ```
- You can also use the provided script:
  ```bash
  npm run kill-ports
  ```
- The port check utility prevents accidental double-starts and makes port issues much easier to resolve.

### **Environment Issues**
```bash
# Force environment sync
npm run sync-env:dev

# Check environment variables
node -e "console.log(require('./config/env.js'))"
```

### **Build Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear React build cache
cd react-ui && rm -rf build && npm run build
```

### **Database Issues**
```bash
# Check migration status
npm run migrate:status

# Reset database (development only)
npm run migrate:rollback --all
npm run migrate
```

---

## 📚 Related Documentation

- **Project Overview**: [README.md](../../README.md) - Quick start and project overview
- **Documentation Guidance**: [docs/01_guidance.md](01_guidance.md) - How to navigate and update docs
- **Migration Plan**: [docs/09_nextjs_migration_plan.md](09_nextjs_migration_plan.md) - Next.js migration progress
- **Database Guide**: [docs/05_database.md](05_database.md) - Database setup and migrations
- **API Documentation**: [server/routes/README.md](../../server/routes/README.md) - API endpoint documentation
- **MIME Type Issues**: [docs/12_mime_type_issue_resolution.md](12_mime_type_issue_resolution.md) - Asset loading error resolution

---

## 🎯 Quick Start Recommendations

**For most development work:**
```bash
npm run dev
```

**For Next.js migration testing:**
```bash
npm run dev-next
```

**For backend-only work:**
```bash
npm run server
```

**For frontend component development:**
```bash
npm run client
```

This setup gives you maximum flexibility to work on different parts of your application while maintaining the dual-app architecture for seamless migration! 🚀 