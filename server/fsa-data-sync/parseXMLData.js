const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser'); // Ensure this is installed

// Directory for the downloaded XML files
const DATA_DIR = path.resolve(__dirname, '../fsa-establishment-data');

const parseXMLfiles = () => {
    console.log('Parsing XML files...');

    // Fetch all local authority XML files from the directory
    const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.xml'));

    // Log the number of files found
    const filesFound = files.length;
    console.log(`Found ${filesFound} XML files.`);
    let filesProcessed = 0;
    let filesProcessedCorrectly = 0;

    for (const file of files) {
        const filePath = path.join(DATA_DIR, file);
        console.log(`Processing file: ${filePath}`);

        // Read the XML file
        const xmlData = fs.readFileSync(filePath, 'utf8');

        // Skip empty files
        if (!xmlData.trim()) {
            console.warn(`Skipping empty file: ${file}`);
            filesProcessed++;
            continue; // Skip to the next file
        }

        // Parse the XML to JSON
        const parser = new XMLParser();
        const parsedData = parser.parse(xmlData);

        // Validate the structure
        if (!parsedData.FHRSEstablishment?.EstablishmentCollection?.EstablishmentDetail) {
            console.warn(`Skipping file: ${file}. Missing expected fields.`);
            filesProcessed++;
            continue; // Skip to the next file
        }

        // Increase the number of files processed correctly
        filesProcessedCorrectly++;

        // Write JSON to a new file
        const jsonFileName = file.replace('.xml', '.json');
        const jsonFilePath = path.join(DATA_DIR, jsonFileName);
        fs.writeFileSync(jsonFilePath, JSON.stringify(parsedData, null, 2));
        console.log(`Successfully processed and saved JSON file: ${jsonFilePath}`);

        // Increase the number of files processed
        filesProcessed++;
    }

    const result = {
        filesFound,
        filesProcessed,
        filesProcessedCorrectly
    };

    console.log(`Processed ${filesProcessed} out of ${filesFound} XML files.`);
    console.log(`Successfully processed ${filesProcessedCorrectly} XML files.`);

    return result;
};

// Export the function
module.exports = parseXMLfiles;

// Run the function in development
if (require.main === module) {
    parseXMLfiles();
}
