# Development Environment Troubleshooting Guide

## Issue Summary

**Original Problems:**
1. Browser error: "Refused to execute script from 'http://localhost:5000/static/js/main.e2e49e66.js' because its MIME type ('text/html') is not executable"
2. Terminal error: "sh: 1: react-scripts: not found"

## Root Cause Analysis

### Problem 1: Missing React Dependencies
- The `react-ui` directory was missing `node_modules` (dependencies weren't installed)
- This caused `react-scripts` to be unavailable, preventing the React development server from starting

### Problem 2: Missing Environment Variables
- The server requires specific environment variables to start properly
- Without a `.env` file, the backend server couldn't initialize, causing proxy issues

### Problem 3: MIME Type Error
- When the React dev server isn't running, requests to React static files fall back to the backend
- The backend returns HTML error pages instead of JavaScript files, causing the MIME type error

## Solution Applied

### 1. Install React Dependencies
```bash
cd react-ui
npm install --legacy-peer-deps
```
*Note: Used `--legacy-peer-deps` to resolve TypeScript version conflicts*

### 2. Create Environment Variables
Created `.env` file in root directory with required variables:
```bash
NODE_ENV=development
JWT_SECRET=your-dev-jwt-secret-key-123
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dev_database
DB_USER=dev_user
DB_PASSWORD=dev_password
```

### 3. Start Development Environment
```bash
# Backend server (port 5000)
npm run server

# Frontend server (port 3000)
cd react-ui && npm start

# Or use the combined command:
npm run dev
```

## Current Status ✅

- **Backend Server**: Running on http://localhost:5000
- **Frontend Server**: Running on http://localhost:3000
- **Proxy Configuration**: Working correctly (React app can communicate with backend)
- **API Endpoint**: http://localhost:3000/api proxies to backend
- **Static Files**: Properly served by React development server

## Prevention Tips

1. **Always check dependencies**: Run `npm install` in both root and `react-ui` directories
2. **Environment variables**: Copy `.env.example` to `.env` if available, or create required variables
3. **Port conflicts**: Ensure no other services are using ports 3000 or 5000
4. **Use project scripts**: Prefer `npm run dev` over manual server starts

## Quick Development Setup

```bash
# 1. Install root dependencies
npm install

# 2. Install React dependencies
cd react-ui
npm install --legacy-peer-deps
cd ..

# 3. Create .env file (if not exists)
cp .env.example .env  # or create manually

# 4. Start development environment
npm run dev
```

## Architecture Notes

This is a fullstack application with:
- **React Frontend**: Served by webpack-dev-server on port 3000
- **Express Backend**: API server on port 5000
- **Proxy Configuration**: React app proxies API requests to backend
- **Production Build**: Backend serves built React app from `/build` directory

## Common Issues

- **"react-scripts not found"**: Install dependencies with `npm install --legacy-peer-deps`
- **"Cannot connect to server"**: Check if backend is running and environment variables are set
- **MIME type errors**: Ensure React dev server is running on port 3000
- **CORS issues**: Backend is configured to allow requests from localhost:3000