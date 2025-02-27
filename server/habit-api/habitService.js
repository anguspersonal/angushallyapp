// Habit Api


/**
 * Logs a habit entry into `habit_log` before specific service processing.
 */

const dotenv = require('dotenv');
// Load environment variables before importing the database module
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('../db.js'); // Database connection module
const { testDatabaseConnection } = require('../testDatabaseConnection');

// Check the value type of the input.
const checkValueType = require('../utils/checkValueType');


const logHabitLog = async (habitLog) => {
    // test the database connection
    await testDatabaseConnection();

    // If Value is an object, convert it to a json string
    const type = checkValueType(habitLog);
    if (type === 'object') {
        habitLog = JSON.stringify(habitLog);
    }

    const query = `INSERT INTO habit.habit_log (habit_log) VALUES ($1::jsonb) RETURNING *;`;
    const values = [habitLog];
    console.log(`Executing query: ${query} with values: ${values}`);
    try {
        const response = await db.query(query, values);
        //console.log('Response:', response);
        const valueType = checkValueType(response);
        //console.log(`Value type of rows: ${valueType}`);
        return response;
    } catch (error) {
        console.error("Error in fetching activities from database:", error);
        return [];
    }
}

const getHabitLogsFromDB = async () => {
    // test the database connection
    await testDatabaseConnection();

    console.log('Fetching habit logs from database...');

    const query = `SELECT * FROM habit.habit_log ORDER BY created_at DESC;`;
    // console.log(`Executing query: ${query}`);
    try {
        const response = await db.query(query);
        // checkValueType(response);
        // console.log('Response Length:', response.length);
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
// logHabitLog('{"type":"running","duration":30,"distance":5,"date":"2021-09-01"}');
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