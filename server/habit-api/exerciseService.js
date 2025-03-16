const db = require("../db");
require("../routes/habitRoute");

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

async function getExerciseLogs(requestType) {
    try {
        let response;
        switch (requestType) {
            case "thisWeek":
                // ✅ Fetch exercise logs for this week
                response = await db.query(`SELECT * FROM habit.exercises WHERE date >= date_trunc('week', current_date)`);
                break;
            case "today":
                // ✅ Fetch exercise logs for today
                response = await db.query(`SELECT * FROM habit.exercises WHERE date = current_date`);
                break;
            default:
                // ✅ Fetch all exercise logs
                response = await db.query(`SELECT * FROM habit.exercises`);
                break;
        }
        console.log("Response from getExerciseLogs:", response);
        return response;
    } catch (error) {
        console.error("❌ Error in getExerciseLogs:", error);
        throw error;
    }
}

module.exports = { logExercise, getExerciseLogs };
