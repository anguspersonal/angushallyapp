// Habit Api

/**
 * Logs a habit entry into `habit_log` before specific service processing.
 */

const db = require('../db.js'); // Database connection module

// Check the value type of the input.
const { checkValueType } = require('../utils/checkValueType');

const logHabitLog = async (userId, habitType, value = null, metric = null, extraData = {}) => {
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

const getHabitLogsFromDB = async (userId) => {
    console.log('Fetching habit logs from database...');

    const query = `
        SELECT * FROM habit.habit_log 
        WHERE user_id = $1 
        ORDER BY created_at DESC;
    `;
    // console.log(`Executing query: ${query}`);
    try {
        const response = await db.query(query, [userId]);
        checkValueType(response);
        console.log('Response Length:', response.length);
        return response;
    } catch (error) {
        console.error("Error in fetching habit logs from database:", error);
        return [];
    }
};

/**
 * Fetches a single habit log by ID from the database.
 * This is more efficient than fetching all logs and filtering in memory.
 * @param {string|number} id - The habit log ID to fetch
 * @returns {Promise<Object|null>} The habit log or null if not found
 */
const getHabitLogById = async (id) => {
    const query = `
        SELECT * FROM habit.habit_log 
        WHERE id = $1;
    `;
    try {
        const response = await db.query(query, [id]);
        return response.length > 0 ? response[0] : null;
    } catch (error) {
        console.error("Error fetching habit log by ID:", error);
        return null;
    }
};

async function getHabitAggregates(period, metrics, userId) {
    const periodCondition = getPeriodCondition(period);
    
    const query = `
        SELECT 
            ${buildMetricSelect(metrics)}
        FROM habit.habit_log
        WHERE ${periodCondition}
        AND user_id = $1
    `;

    const result = await db.query(query, [userId]);
    return formatAggregateResult(result[0], metrics);
}

function getPeriodCondition(period) {
    switch (period) {
        case 'day':
            return "created_at >= CURRENT_DATE";
        case 'week':
            return "created_at >= DATE_TRUNC('week', CURRENT_DATE)";
        case 'month':
            return "created_at >= DATE_TRUNC('month', CURRENT_DATE)";
        case 'year':
            return "created_at >= DATE_TRUNC('year', CURRENT_DATE)";
        case 'all':
            return "1=1";
        default:
            throw new Error(`Invalid period: ${period}`);
    }
}

function buildMetricSelect(metrics) {
    const metricFunctions = {
        sum: 'SUM(value)',
        avg: 'AVG(value)',
        min: 'MIN(value)',
        max: 'MAX(value)',
        stddev: 'STDDEV(value)'
    };

    return metrics.map(metric => `${metricFunctions[metric]} as ${metric}`).join(', ');
}

function formatAggregateResult(result, metrics) {
    return metrics.reduce((acc, metric) => {
        acc[metric] = parseFloat(result[metric]) || 0;
        return acc;
    }, {});
}

// Export multiple modules using named exports
module.exports = {
    logHabitLog,
    getHabitLogsFromDB,
    getHabitLogById,
    getHabitAggregates
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
