const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Patterns to remove
const patterns = [
  /const\s+dotenv\s*=\s*require\(['"]dotenv['"]\);?\n?/g,
  /require\(['"]dotenv['"]\)\.config\(\);?\n?/g,
  /dotenv\.config\(\s*\{[^}]*\}\s*\);?\n?/g,
  /require\(['"]dotenv['"]\)\.config\(\s*\{[^}]*\}\s*\);?\n?/g,
  /\/\/\s*Load environment variables[^\n]*\n?/g,
  /\/\/\s*DOTENV MUST BE BEFORE DB[^\n]*\n?/g
];

// Files to skip
const skipFiles = [
  'config/env.js',  // Our centralized config
  'node_modules',
  '.git',
  'dist',
  'build'
];

// Function to check if a file should be processed
const shouldProcessFile = (filePath) => {
  return filePath.endsWith('.js') && 
         !skipFiles.some(skip => filePath.includes(skip));
};

// Function to process a single file
async function processFile(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8');
    let newContent = content;
    let changed = false;

    // Apply each pattern
    for (const pattern of patterns) {
      const beforeLength = newContent.length;
      newContent = newContent.replace(pattern, '');
      if (newContent.length !== beforeLength) {
        changed = true;
      }
    }

    // If the file doesn't import config but uses process.env, add the import
    if (changed && !newContent.includes("require('../../config/env')") && 
        !newContent.includes('require("../../config/env")')) {
      const configImport = "const config = require('../../config/env');\n";
      newContent = configImport + newContent;
    }

    // Remove extra newlines
    newContent = newContent.replace(/\n{3,}/g, '\n\n');

    if (changed) {
      await writeFileAsync(filePath, newContent);
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

// Function to walk through directory
async function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let changedFiles = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !skipFiles.includes(file)) {
      changedFiles += await walkDir(filePath);
    } else if (stat.isFile() && shouldProcessFile(filePath)) {
      const changed = await processFile(filePath);
      if (changed) changedFiles++;
    }
  }

  return changedFiles;
}

// Main execution
(async () => {
  console.log('🔍 Scanning for direct dotenv usage...');
  const serverDir = path.resolve(__dirname, '../server');
  const changedFiles = await walkDir(serverDir);
  console.log(`\n✨ Done! Updated ${changedFiles} files.`);
})(); 