const config = require('../../config/env');
const path = require('path');
const {testDatabaseConnection} = require('../tests/testDatabaseConnection');
const processSingleAuthority = require('./processSingleAuthority.js');

// Don't import the database module until the environment variables are loaded
const db = require('../db.js');

/**
 * Batch process local authorities.
 * 
 * This function checks the database connection, fetches the first 10 local authorities marked as pending,
 * processes each local authority by downloading and parsing XML data, and updates the processing status
 * in the database accordingly.
 */

const updateQuery = `
    UPDATE fsa.local_authorities
    SET process_successful = $2,
        estab_success_count = $3,
        estab_skipped_count = $4,
        estab_error_count = $5,
        processing_duration = $6,
        process_message = $7,
        processing_status = 'Completed'
    WHERE local_authority_id = $1;
`;

/**
 * Fetches the first 10 pending local authorities from the database.
 * @returns {Promise<Array>} An array of objects with `local_authority_id`, `name`, and `url`.
 */
const fetchPendingLocalAuthorities = async () => {
    let localAuthorities = [];
    try {
        console.log('Fetching pending local authorities from the database...');
        const query = `
            SELECT local_authority_id, name, url
            FROM fsa.local_authorities
            WHERE processing_status = 'Pending'
            LIMIT 45;
        `;
        localAuthorities = await db.query(query);
        // console.log('Query result:', localAuthorities); // Debugging log
        if (!localAuthorities) {
            throw new Error('Invalid query result');
        } else if (localAuthorities.length === 0) {
            console.log('No local authorities found with status "Pending".');
            const queryNumOfCompletedLAs =  `
                SELECT COUNT(*)
                FROM fsa.local_authorities
                WHERE processing_status = 'Completed';
                `;
            const numOfCompleted = await db.query(queryNumOfCompletedLAs);
            console.log(`Number of local authorities with status "Completed": ${numOfCompleted[0].count}`);
            return;
        }
        console.log(`Found ${localAuthorities.length} pending local authorities.`);
        return localAuthorities;
    } catch (error) {
        console.error('Error fetching local authorities:', error.message);
        throw error;
    }
};

/**
 * Main function to batch process local authorities.
 */

const batchProcessLAs = async () => {

    // Check database connection, If connected to database then proceed else return
    console.log('Checking database connection...');
    if (!await testDatabaseConnection()) {
        return;
    }

     // Fetch the first 10 local authorities from the database that are marked as pending
     let localAuthorities = [];
     try {
         localAuthorities = await fetchPendingLocalAuthorities();
     } catch (error) {
         console.error('Error fetching local authorities:', error.message);
         return;
     }

    // For each local authority, pass the url to get xml file and run the 'processSingleAuthority.js' script
    let processedCount = 0;
    for (const authority of localAuthorities) {
        console.log(`Processing local authority: ${authority.name} (ID: ${authority.local_authority_id})`);
        // Rename properties before passing to processSingleAuthority
        try {
            const singleAuthorityResult = await processSingleAuthority({ 
                localAuthorityID: authority.local_authority_id, 
                laName: authority.name, 
                url: authority.url 
            });

            values = [
                authority.local_authority_id,
                singleAuthorityResult.success,
                singleAuthorityResult.successCount,
                singleAuthorityResult.skippedCount,
                singleAuthorityResult.errorCount,
                singleAuthorityResult.duration,
                singleAuthorityResult.message,
            ];
            // If the script runs successfully (i.e., XML data is downloaded, parsed, and establishments are inserted into the database without errors), update the local authority status to 'Processed'. Else, update the status to 'Failed'.
            try {
                await db.query(updateQuery, values);
                console.log(`Updated local authority ${authority.local_authority_id} status to 'Completed'.`);
            } catch (error) {
                console.error(`Error updating local authority ${authority.local_authority_id} status:`, error.message);
            }
        } catch (error) {
            console.error(`Error processing local authority ${authority.local_authority_id}:`, error.message);
            //7 Repeat the process until all 10 local authorities are processed.
        }
    }
    console.log(`Batch process of ${localAuthorities.length} Local councils completed.`);
};
// Export the batch process function
module.exports = batchProcessLAs;

// Run the batch process
(async () => {
    await batchProcessLAs();
})();