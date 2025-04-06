const dotenv = require('dotenv');
// Load environment variables before importing the database module
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('../db.js'); // Database connection module
const { testDatabaseConnection } = require('../tests/testDatabaseConnection.js');
const { calculateUnits } = require('../utils/calculateUnits'); // Utility function to calculate units

/**
 * Logs multiple alcohol drink entries into the database.
 * If a drink does not exist in `drink_catalog`, it is created first.
 *
 * @param {number} logId - The log ID.
 * @param {Object} extraData - Object containing an array of drink objects under the `drinks` key.
 * @returns {Array} - Array of logged drink details.
 */
async function logAlcohol(logId, extraData) {
    // console.log(`Habit ID: ${logId}`);
    // console.log("Processing extraData:", extraData);

    // ✅ Validate `extraData`
    if (!extraData || !Array.isArray(extraData.drinks)) {
        throw new TypeError("Invalid extraData: Expected an object with a 'drinks' array.");
    }

    const loggedDrinks = [];

    try {
        // ✅ Test the database connection before proceeding
        await testDatabaseConnection();

        for (const drink of extraData.drinks) {
            const { id: drinkId, name: drinkName, volumeML, abvPerc, count } = drink;

            // console.log(`Processing drink: ${drinkName}, Count: ${count}`);

            // ✅ Validate input data
            if (!drinkName || !volumeML || !abvPerc || !count) {
                throw new Error(`Invalid drink data: ${JSON.stringify(drink)}`);
            }

            let drinkResult;

            // ✅ Check if the drink exists in the catalog
            const drinkQuery = `
            SELECT * FROM habit.drink_catalog 
            WHERE LOWER(name) = LOWER($1) AND default_volume_ml = $2 AND default_abv_percent = $3
        `;
            const drinkQueryResult = await db.query(drinkQuery, [drinkName, volumeML, abvPerc]);

            if (drinkQueryResult.length > 0) {
                drinkResult = drinkQueryResult[0];
                // console.log(`✅ Found existing drink in catalog: ${drinkName}`);
            } else {
                // ✅ If the drink does not exist, create it
                // console.log(`🚀 Creating new drink: ${drinkName}`);
                const insertDrinkQuery = `
                INSERT INTO habit.drink_catalog (name, default_volume_ml, default_abv_percent, created_at)
                VALUES ($1, $2, $3, now())
                ON CONFLICT (name) DO UPDATE SET
                    default_volume_ml = EXCLUDED.default_volume_ml,
                    default_abv_percent = EXCLUDED.default_abv_percent
                RETURNING id, name, default_volume_ml, default_abv_percent;
            `;
                const insertDrinkResult = await db.query(insertDrinkQuery, [drinkName, volumeML, abvPerc]);
                drinkResult = insertDrinkResult[0];
                // console.log(`✅ Created new drink in catalog: ${drinkName}`);
            }

            if (!drinkResult) {
                throw new Error("Failed to create or retrieve drink");
            }

            const { id: finalDrinkId, name: finalDrinkName } = drinkResult;

            // ✅ Calculate units for the drink
            const drinkUnits = calculateUnits(volumeML, abvPerc, count);
            // console.log(`Calculated units for ${drinkName}: ${drinkUnits}`);

            // ✅ Insert the drink log with the count and units
            const alcoholQuery = `
                INSERT INTO habit.alcohol (log_id, drink_id, drink_name, volume_ml, abv_percent, count, assigned_time, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, now(), now())
                RETURNING *;
            `;
            const alcoholResult = await db.query(alcoholQuery, [
                logId,
                finalDrinkId,
                finalDrinkName,
                volumeML,
                abvPerc,
                count,
            ]);

            // console.log(`Logged drink: ${JSON.stringify(alcoholResult[0])}`);
            loggedDrinks.push(alcoholResult[0]); // Add the logged drink to the results array
        }

        return loggedDrinks; // Return all logged drinks
    } catch (error) {
        console.error("❌ Error in logAlcohol:", error);
        throw error;
    }
}

/**
 * Fetches alcohol logs based on the request type.
 *
 * @param {string} requestType - The type of logs to fetch (e.g., "thisWeek", "today", "drinkCatalog", "logs").
 * @returns {Array} - Array of alcohol logs or drink catalog entries.
 */
async function getAlcoholLogs(requestType) {
    try {
        // ✅ Test the database connection before proceeding
        await testDatabaseConnection();

        let response;

        switch (requestType) {
            case "thisWeek":
                // console.log("Fetching alcohol logs for this week...");
                // ✅ Fetch alcohol logs for this week
                response = await db.query(`
                    SELECT a.*, hl.user_id, hl.habit_type 
                    FROM habit.alcohol a
                    JOIN habit.habit_log hl ON a.log_id = hl.id
                    WHERE a.created_at >= DATE_TRUNC('week', CURRENT_DATE)
                    ORDER BY a.created_at DESC; -- ✅ Ensure latest logs appear first
                `);
                break;

            case "today":
                // console.log("Fetching alcohol logs for today...");
                // ✅ Fetch alcohol logs for today
                response = await db.query(`
                    SELECT a.*, hl.user_id, hl.habit_type 
                    FROM habit.alcohol a
                    JOIN habit.habit_log hl ON a.log_id = hl.id
                    WHERE a.created_at >= CURRENT_DATE
                    ORDER BY a.created_at DESC;
                `);
                break;

            case "drinkCatalog":
                // console.log("Fetching drink catalog...");
                response = await db.query(`
                    SELECT * FROM habit.drink_catalog ORDER BY count DESC;
                `);
                // console.log("Drink catalog response:", response);
                break;

            case "logs":
                // console.log("Fetching all alcohol logs...");
                // ✅ Fetch all alcohol logs
                response = await db.query(`
                    SELECT a.*, hl.user_id, hl.habit_type 
                    FROM habit.alcohol a
                    JOIN habit.habit_log hl ON a.log_id = hl.id
                    ORDER BY a.created_at DESC; -- ✅ Ensure latest logs appear first
                `);
                break;

            default:
                // ❌ Handle invalid requestType explicitly
                throw new Error(`Invalid requestType: ${requestType}`);
        }

        // ✅ Log the response for debugging
        // if (response) {
        //     console.log(`Fetched ${response.length} rows for requestType: ${requestType}`);
        // } else {
        //     console.log(`No rows found for requestType: ${requestType}`);
        // }

        return response || []; // ✅ Return rows or an empty array if no rows are found

    } catch (error) {
        console.error("❌ Error in getAlcoholLogs:", error);
        throw error;
    }
}

async function getAlcoholAggregates(period, metrics) {
    const periodCondition = getPeriodCondition(period);
    
    const query = `
        SELECT 
            ${buildMetricSelect(metrics)}
        FROM habit.alcohol a
        JOIN habit.habit_log hl ON a.log_id = hl.id
        WHERE ${periodCondition}
    `;

    const result = await db.query(query);
    return formatAggregateResult(result[0], metrics);
}

function getPeriodCondition(period) {
    switch (period) {
        case 'day':
            return "a.created_at >= CURRENT_DATE";
        case 'week':
            return "a.created_at >= DATE_TRUNC('week', CURRENT_DATE)";
        case 'month':
            return "a.created_at >= DATE_TRUNC('month', CURRENT_DATE)";
        case 'year':
            return "a.created_at >= DATE_TRUNC('year', CURRENT_DATE)";
        case 'all':
            return "1=1";
        default:
            throw new Error(`Invalid period: ${period}`);
    }
}

function buildMetricSelect(metrics) {
    const metricFunctions = {
        sum: 'SUM(a.units)',
        avg: 'AVG(a.units)',
        min: 'MIN(a.units)',
        max: 'MAX(a.units)',
        stddev: 'STDDEV(a.units)'
    };

    return metrics.map(metric => `${metricFunctions[metric]} as ${metric}`).join(', ');
}

function formatAggregateResult(result, metrics) {
    return metrics.reduce((acc, metric) => {
        acc[metric] = parseFloat(result[metric]) || 0;
        return acc;
    }, {});
}

module.exports = { 
    logAlcohol, 
    getAlcoholLogs,
    getAlcoholAggregates 
};
