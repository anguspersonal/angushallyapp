const express = require('express');
const getStravaActivitiesFromDB = require('../strava-api/getActivitesFromDB');
const router = express.Router();
const config = require('../../config/env');

router.get('/', async (req, res) => {
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