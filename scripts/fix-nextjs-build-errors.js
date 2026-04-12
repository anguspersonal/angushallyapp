#!/usr/bin/env node

/**
 * Next.js build / cache troubleshooting for the root app (src/, .next at repo root).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const nextCachePath = path.join(projectRoot, '.next');
const nodeModulesPath = path.join(projectRoot, 'node_modules');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
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

function rmDirSafe(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

const args = process.argv.slice(2);
const cleanDeps = args.includes('--clean-deps');
const forceClean = args.includes('--force-clean');

logSection('Next.js build error resolution');
logInfo('Repo root: ' + projectRoot);

logSection('1. Free common dev ports (optional)');
try {
  execSync('npx kill-port 3000 3001 3002 5000', {
    cwd: projectRoot,
    stdio: 'ignore',
  });
  logSuccess('kill-port finished (ports may already have been free)');
} catch {
  logWarning('kill-port skipped or no processes found');
}

logSection('2. Clear .next cache');
try {
  rmDirSafe(nextCachePath);
  logSuccess('.next removed');
} catch (e) {
  logError(`Failed to remove .next: ${e.message}`);
}

if (cleanDeps || forceClean) {
  logSection('3. Reinstall dependencies');
  try {
    rmDirSafe(nodeModulesPath);
    logSuccess('node_modules removed');
  } catch (e) {
    logError(`Failed to remove node_modules: ${e.message}`);
  }
  try {
    execSync('npm ci', { cwd: projectRoot, stdio: 'inherit' });
    logSuccess('npm ci completed');
  } catch {
    logError('npm ci failed');
    process.exit(1);
  }
}

logSection('4. Verify Strava CSS module');
const cssModulePath = path.join(
  projectRoot,
  'src',
  'app',
  'projects',
  'strava',
  'strava.module.css',
);
if (fs.existsSync(cssModulePath)) {
  const cssContent = fs.readFileSync(cssModulePath, 'utf8');
  logSuccess('strava.module.css exists');
  if (!cssContent.includes('.strava-dashboard')) {
    logWarning('strava.module.css may be missing .strava-dashboard');
  }
} else {
  logError('strava.module.css missing');
}

logSection('5. Verify CSS module types');
const typeDeclarationsPath = path.join(projectRoot, 'src', 'types', 'css-modules.d.ts');
if (fs.existsSync(typeDeclarationsPath)) {
  logSuccess('src/types/css-modules.d.ts exists');
} else {
  logWarning('src/types/css-modules.d.ts missing');
}

logSection('6. Production build check');
try {
  execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
  logSuccess('Build succeeded');
} catch {
  logError('Build failed — fix errors above, then re-run');
  process.exit(1);
}

logSection('7. Next step');
logInfo('Start the app: npm run dev  →  http://localhost:3000');
logInfo('Strava project page: http://localhost:3000/projects/strava');

logSection('Done');
logSuccess('fix-nextjs-build-errors completed');
