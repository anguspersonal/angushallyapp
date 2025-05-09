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
const router = express.Router();

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Load environment variables

// ✅ Get habit logs from database
router.get('/', async (req, res) => {
    console.log("Habit route get hit to get habits!")
    try {
        const habitLogs = await getHabitLogsFromDB();
        // console.log("✅ Habit Logs:", habitLogs);
        res.json(habitLogs);
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Failed to get habit logs" });
    }
});

// ✅ Add Habit Log
router.post('/:habitType', async (req, res) => {
    console.log("Habit route POST hit to log habit!");
    console.log("Request body:", req.body);
    const { userId, value, metric, extraData } = req.body;
    console.log("Request body split:", userId, value, metric, extraData, "Request params", req.params);
    const { habitType } = req.params;
    console.log("Habit type", habitType);
    try {
        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // ✅ Log the habit in `habit_log`
        const logId = await logHabitLog(userId, habitType, value, metric, extraData);
        console.log(`✅ Habit log created for user ${userId} with ID: ${logId}`);

        let result;

        // ✅ Call the correct habit service based on habit type
        switch (habitType) {
            case "alcohol":
                result = await logAlcohol(logId, extraData);
                break;
            case "exercise":
                result = await logExercise(logId, extraData);
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

// Add aggregate stats route
router.get('/aggregate/:habitType', async (req, res) => {
    try {
        const { habitType } = req.params;
        const { period, metrics = 'sum,avg,min,max,stddev' } = req.query;
        const metricsArray = metrics.split(',');

        console.log('Aggregate request received:', {
            habitType,
            period,
            metrics: metricsArray,
            headers: req.headers,
            url: req.url
        });

        // Validate inputs
        if (!habitType || !period) {
            console.error('Missing required parameters:', { habitType, period });
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const validPeriods = ['day', 'week', 'month', 'year', 'all'];
        if (!validPeriods.includes(period)) {
            console.error('Invalid period:', period);
            return res.status(400).json({ error: 'Invalid period' });
        }

        // Get the appropriate service based on habit type
        let aggregateFunction;
        switch (habitType.toLowerCase()) {  // Convert to lowercase for case-insensitive comparison
            case 'alcohol':
                console.log('Using alcohol service for aggregation');
                aggregateFunction = getAlcoholAggregates;
                break;
            case 'exercise':
                console.log('Using exercise service for aggregation');
                aggregateFunction = getExerciseAggregates;
                break;
            default:
                console.log('Using default habit service for aggregation');
                aggregateFunction = getHabitAggregates;
        }

        console.log('Calling aggregate function with:', { period, metrics: metricsArray });
        const stats = await aggregateFunction(period, metricsArray);
        console.log('Aggregate function returned:', stats);

        res.json(stats);
    } catch (error) {
        console.error('Error in aggregate route:', error);
        res.status(500).json({ 
            error: 'Failed to get aggregate stats',
            details: error.message,
            stack: error.stack
        });
    }
});

// Habit-specific get routes
router.get('/:habitType/:requestType', async (req, res) => {
    const { habitType, requestType } = req.params;
    console.log(`GET /api/habit/${habitType}/${requestType} endpoint hit.`);

    try {
        let response;
        switch (habitType) {
            case "alcohol":
                if (requestType === "drinkCatalog") {
                    response = await getDrinkCatalog();
                } else if (requestType === "aggregates") {
                    response = await getAlcoholAggregates(req.query.period, req.query.metrics);
                } else {
                    // Handle log-related requests with period parameter
                    const period = requestType === 'logs' ? 'all' : requestType;
                    response = await getAlcoholLogs(period);
                }
                break;
            case "exercise":
                response = await getExerciseLogs(requestType);
                break;
            default:
                return res.status(400).json({ error: "Invalid habit type" });
        }
        res.json(response);
    } catch (error) {
        console.error("Error fetching habit data:", error);
        res.status(500).json({ error: "Failed to fetch habit data" });
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