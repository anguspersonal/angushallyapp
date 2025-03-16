const { response } = require("express");
const db = require("../db");
const checkValueType = require("../utils/checkValueType");

/**
 * Logs an alcohol drink entry into the database.
 * If the drink does not exist in `drink_catalog`, it is created first.
 *
 * @param {number} logId - The log ID.
 * @param {object} extraData - Extra data containing drink information.
 * @returns {object} - The logged drink details.
 */
async function logAlcohol(logId, extraData) {
    console.log(`habit id: ${logId}`);
    let { optionId: drinkId, optionName: drinkName, volumeML, abvPerc } = extraData;

    console.log(`drink id: ${drinkId}`,
        `drinkName: ${drinkName}`,
        `volumeML: ${volumeML}`,
        `abvPerc: ${abvPerc}`);

    try {
        let drinkResult;

        // ✅ Check if the drink exists
        if (drinkId) {
            const drinkQuery = `SELECT * FROM habit.drink_catalog WHERE id = $1`;
            drinkResult = await db.query(drinkQuery, [drinkId]);

            if (!drinkResult) {
                drinkId = null; // Reset drinkId to indicate a new drink 
                // needs to be created
            }
        }

        // ✅ If drink does not exist, create it
        if (!drinkId) {
            console.log(`🚀 Creating new drink: ${drinkName}`);
            const insertDrinkQuery = `
                INSERT INTO habit.drink_catalog (name, default_volume_ml, 
                default_abv_percent, created_at)
                VALUES ($1, $2, $3, now())
                RETURNING id, name, default_volume_ml, default_abv_percent;
            `;
            const insertDrinkResult = await db.query(insertDrinkQuery, [
                drinkName,
                volumeML,
                abvPerc
            ]);

            drinkResult = insertDrinkResult; // Assign newly created drink details
        }
        checkValueType(drinkResult);
        console.log(`Drink Result: ${drinkResult[0]}`);

        // ✅ Ensure drinkResult.rows is not empty
        if (!drinkResult) {
            throw new Error("Failed to create or retrieve drink");
        }

        const { id: finalDrinkId, name: drink_name,
            default_volume_ml, default_abv_percent } = drinkResult[0];

        // ✅ Insert into `alcohol` log
        const alcoholQuery = `
            INSERT INTO habit.alcohol (log_id, drink_id, drink_name, 
            volume_ml, abv_percent, assigned_time, created_at)
            VALUES ($1, $2, $3, $4, $5, now(), now())
            RETURNING *;  -- ✅ Return full inserted row
        `;
        const alcoholResult = await db.query(alcoholQuery, [
            logId,
            finalDrinkId,
            drink_name,
            default_volume_ml,
            default_abv_percent
        ]);

        // If successful, console log resulting alchoholResult
        console.log(`Alcohol Result: ${JSON.stringify(alcoholResult[0])}`);

        return alcoholResult[0]; // ✅ Return full log entry

    } catch (error) {
        console.error("❌ Error in logAlcohol:", error);
        throw error;
    }
}


async function getAlcoholLogs(requestType) {
    try {
        let response;
        switch (requestType) {
            case "thisWeek":
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
                // ✅ Fetch the drink catalog
                response = await db.query(`
                    SELECT * FROM habit.drink_catalog ORDER BY count DESC;
                `);
                break;
            default:
                // ✅ Fetch all alcohol logs
                response = await db.query(`
                    SELECT a.*, hl.user_id, hl.habit_type 
                    FROM habit.alcohol a
                    JOIN habit.habit_log hl ON a.log_id = hl.id
                    ORDER BY a.created_at DESC;
                `);
                break;
        }

        console.log("Response from getAlcoholLogs:", response);
        return response; // ✅ Return rows instead of raw response

    } catch (error) {
        console.error("❌ Error in getAlcoholLogs:", error);
        throw error;
    }
}


module.exports = { logAlcohol, getAlcoholLogs };
