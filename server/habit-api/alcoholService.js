console.log('Executing alcoholService.js - V001 - Fixed testDatabaseConnection');
const config = require('../../config/env');
const db = require('../db.js'); // Database connection module
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
        // Database connection test removed

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
 * Fetches alcohol logs for a given time period.
 * Default period is 'week' if not specified.
 *
 * @param {string} [period='week'] - The time period to fetch logs for:
 *   - "day": Today's logs
 *   - "week": This week's logs
 *   - "month": This month's logs
 *   - "year": This year's logs
 *   - "all": All logs
 * @returns {Array} - Array of alcohol log entries
 */
async function getAlcoholLogs(period = 'week') {
    try {
        // Database connection test removed

        const periodCondition = getPeriodCondition(period);
        
        const query = `
            SELECT 
                id,
                drink_name,
                volume_ml,
                abv_percent,
                count,
                units,
                created_at
            FROM habit.alcohol
            WHERE ${periodCondition}
            ORDER BY created_at DESC;
        `;

        const response = await db.query(query);
        return response || [];
    } catch (error) {
        console.error("❌ Error in getAlcoholLogs:", error);
        throw error;
    }
}

/**
 * Fetches the drink catalog with available drinks.
 *
 * @returns {Array} - Array of drink catalog entries with all required fields for the combobox
 */
async function getDrinkCatalog() {
    try {
        console.log('Starting getDrinkCatalog...');
        // Database connection test removed
        
        const query = `
            SELECT 
                id,
                name,
                default_volume_ml as default_volume_ml,
                default_abv_percent as default_abv,
                COALESCE(icon, '🍺') as icon,
                COALESCE(drink_type, 'Other') as drink_type,
                COALESCE(catalog_type, 'generic') as catalog_type,
                COALESCE(archived, false) as archived
            FROM habit.drink_catalog
            ORDER BY name
        `;
        
        console.log('Executing query:', query);
        const response = await db.query(query);
        console.log('Query response:', response);
        
        return response || [];
    } catch (error) {
        console.error("❌ Error in getDrinkCatalog:", error);
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            query: error.query
        });
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
    getDrinkCatalog,
    getAlcoholAggregates
};
