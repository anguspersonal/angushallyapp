// Habit Api


/**
 * Logs a habit entry into `habit_log` before specific service processing.
 */

const dotenv = require('dotenv');
// Load environment variables before importing the database module
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('../db.js'); // Database connection module
const { testDatabaseConnection } = require('../tests/testDatabaseConnection.js');

// Check the value type of the input.
const checkValueType = require('../utils/checkValueType');


const logHabitLog = async (userId, habitType, value = null, metric = null, extraData = {}) => {
    await testDatabaseConnection(); // Ensure DB connection works

    const query = `
        INSERT INTO habit.habit_log (user_id, habit_type, value, metric, extra_data, created_at)
        VALUES ($1, $2, $3, $4, $5::jsonb, NOW()) RETURNING id;
    `;
    const values = [userId, habitType, value, metric, JSON.stringify(extraData)];
    
    try {
        const response = await db.query(query, values);
        return response[0].id;
    } catch (error) {
        console.error("Error logging habit:", error);
        throw error;
    }
};


const getHabitLogsFromDB = async () => {
    // test the database connection
    await testDatabaseConnection();

    console.log('Fetching habit logs from database...');

    const query = `SELECT * FROM habit.habit_log ORDER BY created_at DESC;`;
    // console.log(`Executing query: ${query}`);
    try {
        const response = await db.query(query);
        checkValueType(response);
        console.log('Response Length:', response.length);
        return response;
    } catch (error) {
        console.error("Error in fetching habit logs from database:", error);
        return [];
    }
};

// Export multiple modules using named exports
module.exports = {
    logHabitLog,
    getHabitLogsFromDB
};

// test module by calling it
// (async () => {
//     try {
//         const result = await logHabitLog(1, "alcohol", 1, "ml", {
//             drink_id: 3,
//             volume_ml: 500,
//             abv_percent: 5.1
//         });
//         console.log("✅ Habit log created:", result);
//     } catch (error) {
//         console.error("❌ Error:", error);
//     }
// })();

// getHabitLogsFromDB();

if (process.argv[2] === "test-habit") {
    (async () => {
        console.log("🔍 Testing getHabits");
        const habits = await getHabitLogsFromDB();
        // checkValueType(habits);
        if (habits && habits.length > 0) {
            console.log(`✅ Retrieved ${habits.length} activities.`);
            // console.log(habits);
        } else {
            console.log("❌ No habits fetched.");
        }
        process.exit();
    })();
}