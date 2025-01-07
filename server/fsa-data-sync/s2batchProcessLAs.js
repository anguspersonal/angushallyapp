const dotenv = require('dotenv');
const path = require('path');
const testDatabaseConnection = require('../testDatabaseConnection.js');
const processSingleAuthority = require('./processSingleAuthority.js');

// Load environment variables before importing the database module
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Don't import the database module until the environment variables are loaded
const db = require('../db');


/**
 * Batch process local authorities.
 * 
 * This function checks the database connection, fetches the first 10 local authorities marked as pending,
 * processes each local authority by downloading and parsing XML data, and updates the processing status
 * in the database accordingly.
 */
const batchProcessLAs = async () => {

    //1 Check database connection, If connected to database then proceed else return
    console.log('Checking database connection...');
    if (!await testDatabaseConnection()) {
        return;
    }

    //2 Fetch the first 10 local authorities from the database that are marked as pending
    let localAuthorities = [];
    try {
        console.log('Fetching local authorities from the database...');
        const query = `
            SELECT local_authority_id, name, url
            FROM fsa.local_authorities
            WHERE processing_status = 'Pending'
            LIMIT 10;
        `;
        localAuthorities = await db.query(query);
        console.log(`Loaded ${localAuthorities.length} local authorities.`);
    } catch (error) {
        console.error('Error fetching local authorities:', error.message);
        return;
    }

    //3 For each local authority, pass the url to get xml file and run the 'processSingleAuthority.js' script

    for (const authority of localAuthorities) {
        try {
            // const downloadResult = await downloadAndSaveXML(authority);
            const parseInsertResult = await processSingleAuthority(authority);

            //4 If the script runs successfully (i.e., XML data is downloaded, parsed, and establishments are inserted into the database without errors), update the local authority status to 'Processed'. Else, update the status to 'Failed'.
            if (parseInsertResult) {
                //Update the local authority status to 'Processed'
                const updateQuery = `
                    UPDATE fsa.local_authorities
                    SET processing_status = 'Processed'
                    WHERE local_authority_id = $1;
                `;
                try {
                    await db.query(updateQuery, [authority.local_authority_id]);
                    console.log(`Updated local authority ${authority.name} status to 'Processed'.`);
                } catch (error) {
                    console.error(`Error updating local authority ${authority.name} status:`, error.message);
                }
            } else {
                //Update the status to 'Failed'
                const updateQuery = `
                    UPDATE fsa.local_authorities
                    SET processing_status = 'Failed'
                    WHERE local_authority_id = $1;
                `;
                try {
                    await db.query(updateQuery, [authority.local_authority_id]);
                    console.log(`Updated local authority ${authority.name} status to 'Failed'.`);
                } catch (error) {
                    console.error(`Error updating local authority ${authority.name} status:`, error.message);
                }
            }
        } catch (error) {
            console.error(`Error processing local authority ${authority.name}:`, error.message);
            //7 Repeat the process until all 10 local authorities are processed.
        }
    };
};
// Export the batch process function
module.exports = batchProcessLAs;

// Run the batch process
(async () => {
    await batchProcessLAs();
})();