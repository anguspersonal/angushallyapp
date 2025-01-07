const fs = require('fs');
const path = require('path');

const PROCESSED_FILES_PATH = path.join(__dirname, 'processedFiles.json');

// Load processed files from JSON file
function loadProcessedFiles() {
  if (fs.existsSync(PROCESSED_FILES_PATH)) {
    const data = fs.readFileSync(PROCESSED_FILES_PATH, 'utf8');
    return new Set(JSON.parse(data));
  }
  return new Set();
}

// Save processed files to JSON file
function saveProcessedFiles(processedFiles) {
  fs.writeFileSync(PROCESSED_FILES_PATH, JSON.stringify(Array.from(processedFiles), null, 2));
}

// Batch JSON files from fsa-establishment-data directory into groups of 20.
function batchFilesToInsert(batchSize = 20) {
  const directoryPath = path.join(__dirname, '../fsa-establishment-data');
  const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.json'));
  const batches = [];
  const processedFiles = loadProcessedFiles();

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize).filter(file => !processedFiles.has(file));
    batch.forEach(file => processedFiles.add(file));
    batches.push(batch);
  }

  saveProcessedFiles(processedFiles);
  return batches;
}

module.exports = batchFilesToInsert;