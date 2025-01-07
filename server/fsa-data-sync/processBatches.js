const batchFilesToInsert = require('./batchFilesToInsert');
const insertJSONToDatabase = require('./insertJsonToDatabase');

async function processBatches() {
  const batches = batchFilesToInsert(20);
  console.log(`Total batches: ${batches.length}`);

  for (const [index, batch] of batches.entries()) {
    console.log(`Processing batch ${index + 1} of ${batches.length}`);
    for (const fileName of batch) {
      try {
        await insertJSONToDatabase({ fileName });
      } catch (error) {
        console.error(`Error processing file: ${fileName}`, error.message);
      }
    }
  }

  console.log('All batches processed.');
}

processBatches()
  .then(() => console.log('Batch processing completed successfully.'))
  .catch(error => console.error('Batch processing encountered an error:', error));