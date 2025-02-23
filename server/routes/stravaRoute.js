const express = require('express');
const axios = require('axios');
const getStravaActivitiesFromDB = require('../strava-api/getActivitesFromDB');
const router = express.Router();

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Load environment variables

router.get('/api/strava', async (req, res) => {
    try {
        // console.log("Starting to fetch new Strava activities...");
        const activities = await getStravaActivitiesFromDB();
        // console.log(`Fetched ${activities.length} activities from Strava and saved to database`);
        res.status(200).json(activities);
    } catch (error) {
        console.error("Error in fetching route for Strava data:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch Strava data' });
    }
   
});

module.exports = router;