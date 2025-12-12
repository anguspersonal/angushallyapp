#!/usr/bin/env node
const { spawnSync } = require('child_process');

function main() {
  let jestBin;
  try {
    jestBin = require.resolve('jest/bin/jest');
  } catch (error) {
    console.error('Jest is not installed. Run `npm install` (with registry access) to fetch dev dependencies.');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const result = spawnSync('node', [jestBin, ...args], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}

main();
