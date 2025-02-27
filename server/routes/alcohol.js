const express = require("express");
const { logAlcohol } = require("../habit-api/alcoholService");
const router = express.Router();

/**
 * POST /api/alcohol
 * Logs a drink entry for the user.
 */
router.post("/", async (req, res) => {
    try {
        const { user_id, drink_id, log_time } = req.body;

        // ✅ Validate input
        if (!user_id || !drink_id) {
            return res.status(400).json({ error: "user_id and drink_id are required" });
        }

        // ✅ Call the alcohol service
        const result = await logAlcohol(user_id, drink_id, log_time);

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
