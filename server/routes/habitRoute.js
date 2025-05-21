/**
 * habitRoute.js - Express Router for Habit Logging API
 *
 * This module defines API endpoints for logging and retrieving habits.
 * It supports multiple habit types (e.g., alcohol, exercise) and dynamically
 * routes requests to the appropriate habit service.
 *
 * Endpoints:
 * - GET  /api/habit          → Fetch all habit logs from the database.
 * - POST /api/habit/:habitType → Log a habit entry based on habit type.
 *
 * How It Works:
 * 1. The frontend sends a request to `/api/habit/:habitType` with habit data.
 * 2. The router logs the habit entry in `habit_log`.
 * 3. The correct habit service (`logAlcohol`, `logExercise`, etc.) is called
 *    to handle additional habit-specific logic.
 *
 * Dependencies:
 * - habitService.js    → Handles general habit logging.
 * - alcoholService.js  → Handles alcohol-specific logging.
 * - exerciseService.js → Handles exercise-specific logging.
 *
 * Author: Angus Hally
 * Date: [2025-02-28]
 */


const express = require("express");
const { getHabitLogsFromDB, logHabitLog } = require("../habit-api/habitService");
const { logAlcohol, getAlcoholLogs, getDrinkCatalog, getAlcoholAggregates } = require("../habit-api/alcoholService");
const { logExercise, getExerciseLogs } = require("../habit-api/exerciseService");
const { getAggregateStats } = require("../habit-api/aggregateService");
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();
const config = require('../../config/env');


// Apply authentication middleware to all routes
router.use(authMiddleware());

// Get all habit logs for the authenticated user
router.get('/', async (req, res) => {
    try {
        const logs = await getHabitLogsFromDB(req.user.id);
        res.json(logs);
    } catch (error) {
        console.error("Error fetching habit logs:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Add Habit Log
router.post('/:habitType', async (req, res) => {
    console.log("Habit route POST hit to log habit!");
    const { value, metric, extraData } = req.body;
    const { habitType } = req.params;
    
    try {
        // Log the habit in `habit_log` with the user's ID
        const logId = await logHabitLog(req.user.id, habitType, value, metric, extraData);
        console.log(`✅ Habit log created for user ${req.user.id} with ID: ${logId}`);

        let result;

        // Call the correct habit service based on habit type
        switch (habitType) {
            case "alcohol":
                result = await logAlcohol(logId, extraData, req.user.id);
                break;
            case "exercise":
                result = await logExercise(logId, extraData, req.user.id);
                break;
            default:
                return res.status(400).json({ error: "Invalid habit type" });
        }

        res.json({ message: "Habit logged successfully", logId, ...result });

    } catch (error) {
        console.error("❌ Error logging habit:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get habit-specific data (e.g., drink catalog)
router.get('/:habitType/data', async (req, res) => {
    const { habitType } = req.params;
    try {
        let data;
        switch (habitType) {
            case "alcohol":
                data = await getDrinkCatalog();
                break;
            default:
                return res.status(400).json({ error: "Invalid habit type" });
        }
        res.json(data);
    } catch (error) {
        console.error("Error fetching habit data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get aggregate stats for the authenticated user
router.get('/stats/:period', async (req, res) => {
    const { period } = req.params;
    try {
        const stats = await getAggregateStats(period, req.user.id);
        res.json(stats);
    } catch (error) {
        console.error("Error fetching aggregate stats:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;


/*
Request Params { habitType: 'alcohol' } Request Body {
    user_id: 1,
    habitType: 'Alcohol',
    value: 170,
    metric: 'units',
    extra_data: { drink_id: 2, volume_ml: 34, abv: 5 }
  }

drink id: 2 drinkName: undefined volumeML: undefined abvPerc: undefined

*/