const enrichBookmarkMetadata = require('../bookmark-api/bookmarkMetadataEnricher');

// Default user ID - you can change this as needed
const DEFAULT_USER_ID = '95288f22-6049-4651-85ae-4932ededb5ab'; // Using the test user ID from test files

async function main() {
    try {
        console.log('Starting bookmark metadata enrichment...');
        const results = await enrichBookmarkMetadata(DEFAULT_USER_ID);
        console.log('Enrichment completed with results:', results);
    } catch (error) {
        console.error('Error running metadata enrichment:', error);
    }
}

main(); 