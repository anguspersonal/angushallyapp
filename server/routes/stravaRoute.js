const express = require('express');
const getStravaActivitiesFromDB = require('../strava-api/getActivitesFromDB');
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Require authentication for all Strava routes
router.use(authMiddleware());

router.get('/', async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const stravaProfile = await db.query(
            'SELECT id FROM habit.strava_tokens WHERE user_id = $1 LIMIT 1',
            [userId]
        );

        if (!stravaProfile[0]) {
            return res.status(403).json({ error: 'Strava account not connected' });
        }

        const activities = await getStravaActivitiesFromDB(userId);
        res.status(200).json(activities);
    } catch (error) {
        console.error("Error in fetching route for Strava data:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch Strava data' });
    }
});

module.exports = router;
