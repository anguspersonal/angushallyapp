const { getNewActivities } = require('./stravaService');
const dotenv = require('dotenv');
const db = require('../db');

const runGetNewActivities = async () => {
    try {
        console.log("Starting to fetch new Strava activities...");
        const activities = await getNewActivities();
        console.log(`Fetched ${activities.length} activities from Strava and saved to database`);
    } catch (error) {
        // More specific error handling
        if (error.response?.status === 429) {
            console.error("Rate limit exceeded for Strava API");
        } else if (error.response?.status === 401) {
            console.error("Authentication failed with Strava API");
        } else {
            console.error("Error fetching Strava data:", error.response?.data || error.message);
        }
        throw error; // Re-throw to allow caller to handle error
    }
};

// immediatedly call the function
runGetNewActivities();

module.exports = runGetNewActivities;

