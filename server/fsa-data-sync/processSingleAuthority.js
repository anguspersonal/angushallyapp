require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Load environment variables
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser'); // Library for parsing XML
const db = require('../db'); // Database connection module


const processSingleAuthority = async (props) => {
    try {
        console.log(`Fetching data from URL: ${props.url}...`);

        
        // Fetch the XML data
        const response = await axios.get(props.url, { responseType: 'text' });
        const xmlData = response.data;

        console.log('Successfully fetched XML data.');

        // Parse the XML to JSON
        const parser = new XMLParser();
        const parsedData = parser.parse(xmlData);

        console.log('Successfully parsed XML data.');

        // Extract establishments
        const establishments = parsedData.FHRSEstablishment.EstablishmentCollection.EstablishmentDetail || [];
        console.log(`Found ${establishments.length} establishments.`);

        // Prepare SQL query
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
                rating_value,
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
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
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
                rating_value = EXCLUDED.rating_value,
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
                longitude = EXCLUDED.longitude,
                latitude = EXCLUDED.latitude;
        `;

        // Iterate over establishments and insert into the database
        for (const establishment of establishments) {
            const values = [
                establishment.FHRSID,
                establishment.LocalAuthorityBusinessID || null,
                establishment.BusinessName || null,
                establishment.BusinessType || null,
                establishment.BusinessTypeID || null,
                establishment.AddressLine1 || null,
                establishment.AddressLine2 || null,
                establishment.AddressLine4 || null,
                establishment.PostCode || null,
                establishment.RatingValue || null,
                establishment.RatingKey || null,
                establishment.RatingDate || null,
                establishment.LocalAuthorityCode || null,
                establishment.LocalAuthorityName || null,
                establishment.LocalAuthorityWebSite || null,
                establishment.LocalAuthorityEmailAddress || null,
                establishment.Scores?.Hygiene || null,
                establishment.Scores?.Structural || null,
                establishment.Scores?.ConfidenceInManagement || null,
                establishment.SchemeType || null,
                establishment.NewRatingPending === 'True',
                establishment.Geocode?.Longitude || null,
                establishment.Geocode?.Latitude || null,
            ];

            try {
                await db.query(query, values);
            } catch (error) {
                console.error(`Error inserting data for FHRSID ${establishment.FHRSID}:`, error.message);
            }
        }

        console.log('All establishments processed and inserted into the database.');
    } catch (error) {
        console.error('Error processing data:', error.message);
    }
};

// Export the function
module.exports = processSingleAuthority;


// // Run the script
// processSingleAuthority();
