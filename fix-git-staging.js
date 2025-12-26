#!/usr/bin/env node
/**
 * Fix staged deletions for config and docs files
 * These files should not be deleted - they're still needed
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Use process.cwd() for WSL compatibility - assumes script is run from repo root
const repoRoot = process.cwd();

function runGitCommand(cmd, description) {
  try {
    console.log(`\n${description}...`);
    const result = execSync(cmd, { 
      cwd: repoRoot, 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    return result;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  }
}

console.log('Fixing staged deletions for config and docs files...\n');

// Step 1: Show current status
runGitCommand('git status --short', 'Current git status');

// Step 2: Unstage the deletions
const filesToFix = [
  'config/README.md',
  'config/env.example', 
  'config/env.js',
  'docs/01_guidance.md',
  'docs/02_roadmap.md',
  'docs/03_updates.md',
  'docs/04_schema.md',
  'docs/05_database.md',
  'docs/06_tech_debt.md',
  'docs/07_backlog.md',
  'docs/08_module_development_flow.md'
];

console.log('\nUnstaging deletions...');
runGitCommand(`git reset HEAD ${filesToFix.join(' ')}`, 'Unstaging deletions');

// Step 3: Get parent commit and restore files from there
console.log('\nFinding parent commit...');
try {
  const parentCommit = execSync('git rev-parse 1fcbf69^', { 
    cwd: repoRoot, 
    encoding: 'utf8' 
  }).trim();
  
  console.log(`Parent commit: ${parentCommit}`);
  
  // Check if files exist in parent before restoring
  let filesToRestore = [];
  for (const file of filesToFix) {
    try {
      execSync(`git cat-file -e "${parentCommit}:${file}"`, { 
        cwd: repoRoot,
        stdio: 'ignore'
      });
      filesToRestore.push(file);
    } catch (e) {
      console.log(`  ${file} not found in parent commit, will add from working directory`);
    }
  }
  
  // Restore files that exist in parent commit
  if (filesToRestore.length > 0) {
    console.log(`\nRestoring ${filesToRestore.length} files from parent commit...`);
    runGitCommand(`git restore --source="${parentCommit}" --staged -- ${filesToRestore.join(' ')}`, 'Restore from parent');
  }
  
  // Add any remaining files from working directory
  const filesToAdd = filesToFix.filter(f => !filesToRestore.includes(f));
  if (filesToAdd.length > 0) {
    console.log(`\nAdding ${filesToAdd.length} files from working directory...`);
    runGitCommand(`git add -f ${filesToAdd.join(' ')}`, 'Adding from working directory');
  }
} catch (error) {
  console.log('Could not get parent commit, adding files from working directory...');
  runGitCommand(`git add -f ${filesToFix.join(' ')}`, 'Adding files back');
}

// Step 5: Final status
console.log('\n' + '='.repeat(50));
console.log('Final git status:');
runGitCommand('git status --short', 'Final status');

console.log('\nDone! If files still show as deleted, they may need to be committed.');

