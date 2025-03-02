const db = require("../db");

/**
 * Logs an alcohol drink entry into the database.
 * @param {number} user_id - The user's ID.
 * @param {number} drink_id - The drink's ID from drink_catalog.
 * @param {string} log_time - Timestamp for when the drink was consumed.
 * @returns {object} - The logged drink details.
 */
async function logAlcohol(log_id, extra_data) {
    console.log(`habit id: ${log_id}`);
    const {drink_id} = extra_data;
    console.log(`drink id: ${drink_id}`);

    try {
        // ✅ Fetch drink details from `drink_catalog`
        const drinkQuery = `SELECT name, default_volume_ml, default_abv_percent FROM habit.drink_catalog WHERE id = $1`;
        const drinkResult = await db.query(drinkQuery, [drink_id]);

        if (drinkResult.length === 0) {
            throw new Error("Drink not found");
        }

        const { name: drink_name, default_volume_ml, default_abv_percent } = drinkResult[0];

        // // ✅ Insert into `habit_log`
        // const habitLogQuery = `
        //     INSERT INTO habit.habit_log (user_id, habit_type, logged_at, created_at)
        //     VALUES ($1, 'alcohol', $2, NOW()) RETURNING id;
        // `;
        // const habitLogResult = await db.query(habitLogQuery, [user_id, log_time]);
        // const log_id = habitLogResult[0].id;

        // ✅ Insert into `alcohol`
        const alcoholQuery = `
            INSERT INTO habit.alcohol (log_id, drink_id, drink_name, volume_ml, abv_percent, assigned_time, created_at)
            VALUES ($1, $2, $3, $4, $5, now(), now()) RETURNING id, units;
        `;
        const alcoholResult = await db.query(alcoholQuery, [
            log_id,
            drink_id,
            drink_name,
            default_volume_ml,
            default_abv_percent
        ]);

        return {
            log_id,
            drink: drink_name,
            volume_ml: default_volume_ml,
            abv_percent: default_abv_percent,
            units: alcoholResult[0].units
        };

    } catch (error) {
        console.error("❌ Error in logAlcohol:", error);
        throw error; // Let the route handler handle errors
    }
}

module.exports = { logAlcohol };
