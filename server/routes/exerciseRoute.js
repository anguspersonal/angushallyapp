const express = require("express");
const { logexercise } = require("../habit-api/exerciseService");
const router = express.Router();

/**
 * POST /api/wokroutSessions
 * Logs a exercise session entry for the user.
 */

router.post("/", async (req, res) => {
    try {
        const { exercise_type, duration_sec, distance_m, calories_burned, heart_rate_avg, source_specified_id, user_id } = req.body;

        // ✅ Validate input
        if (!user_id || !drink_id) {
            return res.status(400).json({ error: "user_id and drink_id are required" });
        }

        // ✅ Call the alcohol service
        const result = await logExercise(exercise_type, duration_sec, distance_m, calories_burned, heart_rate_avg, source_specified_id, user_id );

        res.json({
            message: "Drink logged successfully",
            ...result
        });

    } catch (error) {
        console.error("❌ Error logging alcohol:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

module.exports = router;
