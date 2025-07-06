const config = require('../../config/env');
const path = require('path');
 const axios = require('axios');
const { XMLParser } = require('fast-xml-parser'); // Library for parsing XML
const db = require('../db'); // Database connection module
const fs = require('fs');
const query = fs.readFileSync(path.join(__dirname, 'updateEstablishment.sql'), 'utf-8');
const processRatingValue = require('./processRatingValue');
const {testDatabaseConnection} = require('../tests/testDatabaseConnection');

const processSingleAuthority = async (props) => {
    const startTime = Date.now(); // Start time for performance measurement
    const { localAuthorityID, laName, url } = props;

    // 1 Get the XML data from the FSA API for the given url
    // console.log(`Processing: ${laName}, ID:${localAuthorityID}, fetching data from: ${url}`);
    const response = await axios.get(url, { responseType: 'text' });
    const xmldata = response.data;
    if (!xmldata) {
        // console.log(`No data returned for local authority id ${localAuthorityID}, ${laName}`);
        return { success: false, message: `No data returned for ${localAuthorityID}, ${laName}` };
    }
    // console.log(`Successfully fetched data for local authority id ${localAuthorityID}, ${laName}`);

    // 2 Parse the XML data to JSON
    const parser = new XMLParser();
    const parsedData = parser.parse(xmldata);
    if (!parsedData) {
        console.log(`Failed to parse data for local authority id ${localAuthorityID}, ${laName}`);
        return { success: false, message: `Failed to parse data for local authority id ${localAuthorityID}, ${laName}` };
    }
    // console.log(`Successfully parsed data for ${localAuthorityID}, ${laName}`);

    // 3 Extract establishments from the parsed data
    const establishments = parsedData.FHRSEstablishment.EstablishmentCollection.EstablishmentDetail || [];

    // 4 Deconstruct, Validate, Process and Insert the data for each establishment into database

    //Set counters of successfully processed, skipped and errored establishments
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    console.log(`Processing ${establishments.length} establishments for local authority id ${localAuthorityID}, ${laName}...`);
    //check database connection
    testDatabaseConnection();

    try {
        // Process each establishment in parallel using Promise.all (Global ES6 feature)

        // Define array of promises

        const insertPromises = establishments.map(async (establishment) => {
            // Validate critical fields
            // Skip establishment if critical fields are missing
            if (!establishment?.BusinessName || !establishment?.FHRSID) {
                skippedCount++;
                console.warn(
                    `Skipping establishment due to missing fields. FHRSID: ${establishment?.FHRSID || "<Missing>"}, Name:${establishment?.BusinessName || "<Missing>"} Postcode:${establishment?.PostCode || "<Missing>"} File: ${localAuthorityID}, ${laName}. Skipped count: ${skippedCount}`
                );
                return;
            }

            // Destrcuture establishment object and default values
            const {
                FHRSID,
                LocalAuthorityBusinessID = null,
                BusinessName = null,
                BusinessType = null,
                BusinessTypeID = null,
                AddressLine1 = null,
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
            const validRatingDate = RatingDate && RatingDate.trim() !== "" ? RatingDate.trim() : null;

            // Process RatingValue
            const { rating_value_str = null, rating_value_num = null, rating_status_id = null } = processRatingValue(RatingValue);

            // Ensure BusinessName is a string
            const businessNameStr = BusinessName ? BusinessName.toString() : null;

            // Creat composite string of address
            const addressStr = [AddressLine1, AddressLine2, AddressLine4, PostCode].filter(Boolean).join(", ");

            const values = [
                FHRSID, //$1
                LocalAuthorityBusinessID || null, //$2
                businessNameStr, //$3
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
                addressStr, //$26
            ];

            // 5 Save the data to the database
            try {
                await db.query(query, values);
                successCount++;
                // console.log(`Successfully inserted FHRSID: ${FHRSID}. Sucessfully processed count: ${successCount}`);
            } catch (error) {
                errorCount++;
                console.error(
                    `Error inserting FHRSID: ${FHRSID}, LA: ${localAuthorityID}, ${laName}. Error count: ${errorCount}`,
                    error.message
                );
            }
        });

        // Wait for all insertions to complete
        await Promise.all(insertPromises);
        // Process logic here
        const duration = (Date.now() - startTime) / 1000;

        console.log(`Processing of local authority id ${localAuthorityID}, ${laName} complete.`);
        console.log(`Results: ${successCount} successful, ${skippedCount} skipped, ${errorCount} errors.`);
        console.log(`Processing completed in ${duration.toFixed(2)} seconds.`);
        // 6 if all is successful return true

        return { success: true, successCount, skippedCount, errorCount, duration };

    } catch (error) {
        console.error(
            `Error processing file: ${localAuthorityID}, ${laName}, directory: ${DATA_DIR}`,
            error.message
        );
    }
};

// Export the function
module.exports = processSingleAuthority;