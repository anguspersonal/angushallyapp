// Description: Get all activities from the database
const config = require('../../config/env');
const db = require('../db'); // Database connection module
const checkValueType = require('../utils/checkValueType');



const getStravaActivitiesFromDB = async () => {
    const query = `SELECT * FROM habit.strava_activities ORDER BY start_date_local DESC;`;
    try {
        const response = await db.query(query);
        const valueType = checkValueType(response);
        // console.log(`Value type of rows: ${valueType}`);
        // console.log(`Fetched ${response.length} activities from database`);
        // console.log(`first row:`, response[0]);


        return response;
    } catch (error) {
        console.error("Error in fetching activities from database:", error);
        return [];
    }
};

module.exports = getStravaActivitiesFromDB;

// ✅ Test the function
// getStravaActivitiesFromDB();