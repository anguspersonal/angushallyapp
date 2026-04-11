#!/usr/bin/env node

/**
 * Next.js Build Error Resolution Script
 * 
 * This script addresses common Next.js development issues including:
 * - CSS module import failures
 * - Build manifest errors
 * - Port conflicts
 * - Cache issues
 * - Development environment cleanup
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${colors.bright}${colors.cyan}=== ${title} ===${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Parse command line arguments
const args = process.argv.slice(2);
const cleanDeps = args.includes('--clean-deps');
const forceClean = args.includes('--force-clean');

logSection('Next.js Build Error Resolution Script');
logInfo('Starting comprehensive error resolution...');

// 1. Clean up development processes
logSection('1. Cleaning Development Processes');

try {
  // Kill any running Next.js processes
  logInfo('Stopping any running Next.js development servers...');
  execSync('pkill -f "next dev"', { stdio: 'ignore' });
  logSuccess('Next.js processes stopped');
} catch (error) {
  logWarning('No running Next.js processes found');
}

try {
  // Kill processes on common development ports
  const ports = [3000, 3001, 3002, 5000];
  ports.forEach(port => {
    try {
      execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' });
      logSuccess(`Port ${port} cleared`);
    } catch (error) {
      // Port might not be in use
    }
  });
} catch (error) {
  logWarning('Port cleanup completed');
}

// 2. Clean Next.js cache and build artifacts
logSection('2. Cleaning Next.js Cache');

const nextUiPath = path.join(__dirname, '..', 'next-ui');
const nextCachePath = path.join(nextUiPath, '.next');
const nodeModulesPath = path.join(nextUiPath, 'node_modules');

if (fs.existsSync(nextCachePath)) {
  try {
    execSync(`rm -rf "${nextCachePath}"`, { cwd: nextUiPath });
    logSuccess('Next.js cache cleared');
  } catch (error) {
    logError(`Failed to clear Next.js cache: ${error.message}`);
  }
}

// 3. Clean dependencies if requested
if (cleanDeps || forceClean) {
  logSection('3. Cleaning Dependencies');
  
  if (fs.existsSync(nodeModulesPath)) {
    try {
      execSync(`rm -rf "${nodeModulesPath}"`, { cwd: nextUiPath });
      logSuccess('node_modules cleared');
    } catch (error) {
      logError(`Failed to clear node_modules: ${error.message}`);
    }
  }
  
  try {
    execSync('npm install', { cwd: nextUiPath, stdio: 'inherit' });
    logSuccess('Dependencies reinstalled');
  } catch (error) {
    logError(`Failed to reinstall dependencies: ${error.message}`);
  }
}

// 4. Verify CSS module files
logSection('4. Verifying CSS Module Files');

const cssModulePath = path.join(nextUiPath, 'src', 'app', 'projects', 'strava', 'strava.module.css');
if (fs.existsSync(cssModulePath)) {
  logSuccess('Strava CSS module file exists');
  
  // Check file content
  const cssContent = fs.readFileSync(cssModulePath, 'utf8');
  if (cssContent.includes('.strava-dashboard')) {
    logSuccess('CSS module contains expected classes');
  } else {
    logWarning('CSS module may be missing expected classes');
  }
} else {
  logError('Strava CSS module file missing!');
}

// 5. Verify TypeScript declarations
logSection('5. Verifying TypeScript Declarations');

const typeDeclarationsPath = path.join(nextUiPath, 'src', 'types', 'css-modules.d.ts');
if (fs.existsSync(typeDeclarationsPath)) {
  logSuccess('CSS module type declarations exist');
} else {
  logWarning('CSS module type declarations missing');
}

// 6. Test build process
logSection('6. Testing Build Process');

try {
  logInfo('Running Next.js build test...');
  execSync('npm run build', { cwd: nextUiPath, stdio: 'inherit' });
  logSuccess('Build test completed successfully');
} catch (error) {
  logError('Build test failed - check for TypeScript/ESLint errors');
  logInfo('You may need to fix TypeScript errors before proceeding');
}

// 7. Start development server
logSection('7. Starting Development Server');

logInfo('Starting Next.js development server...');
logInfo('The server will be available at http://localhost:3001');

try {
  const devProcess = spawn('npm', ['run', 'dev'], {
    cwd: nextUiPath,
    stdio: 'inherit',
    shell: true
  });

  devProcess.on('error', (error) => {
    logError(`Failed to start development server: ${error.message}`);
  });

  // Give the server time to start
  setTimeout(() => {
    logInfo('Development server should now be running');
    logInfo('Test the Strava page at: http://localhost:3001/projects/strava');
  }, 3000);

} catch (error) {
  logError(`Failed to start development server: ${error.message}`);
}

// 8. Summary and next steps
logSection('8. Resolution Summary');

logSuccess('Development environment cleanup completed');
logInfo('If issues persist, try the following:');
logInfo('1. Check browser console for specific error messages');
logInfo('2. Verify all TypeScript errors are resolved');
logInfo('3. Clear browser cache and hard refresh');
logInfo('4. Check network tab for failed requests');

if (cleanDeps) {
  logInfo('5. Dependencies were reinstalled - restart your IDE if needed');
}

logSection('Script Complete');
logSuccess('Next.js error resolution script completed successfully!'); 