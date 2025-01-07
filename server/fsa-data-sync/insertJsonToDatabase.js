const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const processRatingValue = require('./processRatingValue');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const db = require('../db'); // Database connection module

const DATA_DIR = path.resolve(__dirname, '../fsa-establishment-data');

/**
 * Inserts establishments from a JSON file into the database.
 * 
 * @param {Object} props - The properties object.
 * @param {string} props.fileName - The name of the JSON file to process.
 */

const insertJSONToDatabase = async ({fileName}) => {
    console.log(`Processing file: ${fileName} in directory: ${DATA_DIR}`);
    const startTime = Date.now(); // Start time for performance measurement

    
    //Set counters of successfully processed, skipped and errored establishments
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    try {
        // Read and parse JSON data
        const data = fs.readFileSync(path.join(DATA_DIR, fileName), 'utf8');
        const parsedData = JSON.parse(data);

        const establishments = parsedData.FHRSEstablishment?.EstablishmentCollection?.EstablishmentDetail || [];
        console.log(`Found ${establishments.length} establishments from ${fileName}.`);

        if (!Array.isArray(establishments)) {
            console.error(`Invalid data structure in ${fileName}.`);
            return;
        }

        const query = `
            INSERT INTO fsa.establishments (
                fhrs_id, 
                local_authority_business_id, 
                business_name, 
                business_type, 
                business_type_id,
                address_line_1, 
                address_line_2, 
                address_line_4, 
                post_code, 
                rating_value_str,
                rating_value_num, 
                rating_status_id, 
                rating_key, 
                rating_date, 
                local_authority_code,
                local_authority_name, 
                local_authority_website, 
                local_authority_email_address,
                hygiene_score, 
                structural_score, 
                confidence_in_management, 
                scheme_type,
                new_rating_pending, 
                longitude, 
                latitude
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
            )
            ON CONFLICT (fhrs_id) DO UPDATE SET
                local_authority_business_id = EXCLUDED.local_authority_business_id,
                business_name = EXCLUDED.business_name,
                business_type = EXCLUDED.business_type,
                business_type_id = EXCLUDED.business_type_id,
                address_line_1 = EXCLUDED.address_line_1,
                address_line_2 = EXCLUDED.address_line_2,
                address_line_4 = EXCLUDED.address_line_4,
                post_code = EXCLUDED.post_code,
                rating_value_str = EXCLUDED.rating_value_str,
                rating_value_num = EXCLUDED.rating_value_num,
                rating_status_id = EXCLUDED.rating_status_id,
                rating_key = EXCLUDED.rating_key, 
                rating_date = EXCLUDED.rating_date,
                local_authority_code = EXCLUDED.local_authority_code,
                local_authority_name = EXCLUDED.local_authority_name,
                local_authority_website = EXCLUDED.local_authority_website,
                local_authority_email_address = EXCLUDED.local_authority_email_address,
                hygiene_score = EXCLUDED.hygiene_score,
                structural_score = EXCLUDED.structural_score,
                confidence_in_management = EXCLUDED.confidence_in_management,
                scheme_type = EXCLUDED.scheme_type,
                new_rating_pending = EXCLUDED.new_rating_pending,
                longitude = EXCLUDED.latitude,
                latitude = EXCLUDED.longitude;
        `;

        // Process each establishment in parallel using Promise.all (Global ES6 feature)

        // Define array of promises

        const insertPromises = establishments.map(async (establishment) => {
            // Validate critical fields
            // Skip establishment if critical fields are missing
            if (!establishment?.BusinessName || !establishment?.PostCode || !establishment?.AddressLine1 || !establishment?.FHRSID) {
                skippedCount++;
                console.warn(
                     `Skipping establishment due to missing fields. FHRSID: ${establishment?.FHRSID || "<Missing>"}, File: ${fileName}. Skipped count: ${skippedCount}`
                );
                return;
            }

            // Destrcuture establishment object and default values
            const {
                FHRSID,
                LocalAuthorityBusinessID = null,
                BusinessName= null,
                BusinessType = null,
                BusinessTypeID = null,
                AddressLine1= null,
                AddressLine2 = null,
                AddressLine4 = null,
                PostCode = null,
                RatingValue = null, // RatingValue is a critical field, will be deconstructed and processed
                RatingKey = null,
                RatingDate = null,
                LocalAuthorityCode = null,
                LocalAuthorityName = null,
                LocalAuthorityWebSite = null,
                LocalAuthorityEmailAddress = null,
                Scores = {}, // Scores is an object, will be deconstructed and processed
                SchemeType = null,
                NewRatingPending = null,
                Geocode = {}, // Geocode is an object, will be deconstructed and processed
            } = establishment;

            // Handle RatingDate: Default to null if invalid or empty
            const validRatingDate = RatingDate && RatingDate.trim() !== "" ? RatingDate : null;

            // Process RatingValue
            const { rating_value_str = null, rating_value_num = null, rating_status_id = null } = processRatingValue(RatingValue);


            const values = [
                FHRSID, //$1
                LocalAuthorityBusinessID || null, //$2
                BusinessName || null, //$3
                BusinessType || null, //$4
                BusinessTypeID || null, //$5
                AddressLine1 || null, //$6
                AddressLine2 || null, //$7
                AddressLine4 || null, //$8
                PostCode || null, //$9
                rating_value_str, //$10
                rating_value_num, //$11
                rating_status_id || null, //$12
                RatingKey || null, //$13
                validRatingDate, //$14
                LocalAuthorityCode || null, //$15
                LocalAuthorityName || null, //$16
                LocalAuthorityWebSite || null, //$17
                LocalAuthorityEmailAddress || null, //$18
                Scores.Hygiene || null, //$19
                Scores.Structural || null, //$20
                Scores.ConfidenceInManagement || null, //$21
                SchemeType || null, //$22
                NewRatingPending || null, //$23
                Geocode.Longitude || null, //$24
                Geocode.Latitude || null, //$25
            ];

            
            try {
                await db.query(query, values);
                successCount++;
                console.log(`Successfully inserted FHRSID: ${FHRSID}. Sucessfully processed count: ${successCount}`);
            } catch (error) {
                errorCount++;
                console.error(
                    `Error inserting FHRSID: ${FHRSID}, file: ${fileName}. Error count: ${errorCount}`,
                    error.message
                );
            }
        });

        // Wait for all insertions to complete
        await Promise.all(insertPromises);
        // Process logic here
        const duration = (Date.now() - startTime) / 1000;

        console.log(`Processing of ${fileName} complete.`);
        console.log(`Results: ${successCount} successful, ${skippedCount} skipped, ${errorCount} errors.`);
        console.log(`Processing completed in ${duration.toFixed(2)} seconds.`);

    } catch (error) {
        console.error(
            `Error processing file: ${fileName}, directory: ${DATA_DIR}`,
            error.message
        );
    }
};

module.exports = insertJSONToDatabase;

// Uncomment the next line to run this script for testing
// insertJSONToDatabase({ fileName: '1cambridge-city.json' });