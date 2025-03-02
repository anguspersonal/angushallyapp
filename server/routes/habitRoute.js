/**
 * habitRoute.js - Express Router for Habit Logging API
 *
 * This module defines API endpoints for logging and retrieving habits.
 * It supports multiple habit types (e.g., alcohol, exercise) and dynamically
 * routes requests to the appropriate habit service.
 *
 * Endpoints:
 * - GET  /api/habit          → Fetch all habit logs from the database.
 * - POST /api/habit/:habit_type → Log a habit entry based on habit type.
 *
 * How It Works:
 * 1. The frontend sends a request to `/api/habit/:habit_type` with habit data.
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
const { logAlcohol } = require("../habit-api/alcoholService");
const { logExercise } = require("../habit-api/exerciseService");
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
router.post('/:habit_type', async (req, res) => {
    console.log("Habit route POST hit to log habit!")
    console.log("Request body:", req.body);
    try {
        const { habit_type } = req.params;
        const { user_id, value, metric, extra_data } = req.body;


        if (!user_id) {
            return res.status(400).json({ error: "user_id is required" });
        }

        // ✅ Log the habit in `habit_log`
        const log_id = await logHabitLog(user_id, habit_type, value, metric, extra_data);
        console.log(`✅ Habit log created for user ${user_id} with ID: ${log_id}`);

        let result;

        // ✅ Call the correct habit service based on habit type
        switch (habit_type) {
            case "alcohol":
                result = await logAlcohol(log_id, extra_data);
                break;
            case "exercise":
                result = await logExercise(log_id, extra_data);
                break;
            default:
                return res.status(400).json({ error: "Invalid habit type" });
        }

        res.json({ message: "Habit logged successfully", log_id, ...result });

    } catch (error) {
        console.error("❌ Error logging habit:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
