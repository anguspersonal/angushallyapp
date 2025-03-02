const db = require("../db");

/**
 * Logs a workout session after it has been recorded in `habit_log`.
 * @param {number} log_id - The ID of the corresponding habit log entry.
 * @param {object} exerciseData - Additional workout details.
 * @returns {object} - The logged workout entry.
 */
async function logExercise(log_id, exerciseData) {
    try {
        const { exercise_type, duration_sec, distance_km, calories_burned, heart_rate_avg, source_specific_id, user_id } = exerciseData;

        // ✅ Insert workout details into `habit.exercises`
        const query = `
            INSERT INTO habit.exercises
            (
            log_id,
            exercise_type,
            duration_sec,
            distance_km,
            calories_burned,
            heart_rate_avg,
            source_specific_id,
            user_id
            )            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [log_id, exercise_type, duration_sec, distance_km, calories_burned, heart_rate_avg, source_specific_id, user_id];

        const result = await db.query(query, values);
        return result[0]; // Return the newly created workout log

    } catch (error) {
        console.error("❌ Error logging exercise:", error.message);
        console.error(error.stack);
        throw error;
    }
}

module.exports = { logExercise };
