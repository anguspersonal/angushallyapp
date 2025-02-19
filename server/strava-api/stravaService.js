const axios = require("axios");
const db = require("../db");
const { getValidAccessToken } = require("./stravaAuth");

/**
 * 🔹 Fetch all historical Strava activities (ONE-TIME RUN)
 * ✅ Paginated if more than 200 activities exist.
 */
const getAllActivities = async () => {
    try {
        const accessToken = await getValidAccessToken();
        if (!accessToken) {
            throw new Error("❌ No valid access token available.");
        }

        console.log("🔍 Fetching all historical activities...");

        let allActivities = [];
        let hasMoreData = true;
        let page = 1;

        while (hasMoreData) {
            const response = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    before: Math.floor(Date.now() / 1000),
                    after: Math.floor(new Date("2020-01-01").getTime() / 1000),
                    page: page,
                    per_page: 200,
                },
            });

            if (response.data.length > 0) {
                allActivities.push(...response.data);
                page += 1; // Move to the next page
            } else {
                hasMoreData = false;
            }
        }

        console.log(`✅ Retrieved ${allActivities.length} historical activities.`);

        // ✅ Store in the database
        await saveStravaActivities(allActivities);

        return allActivities;
    } catch (error) {
        console.error("❌ Error fetching historical activities:", error.response?.data || error.message);
    }
};

/**
 * 🔹 Fetches only new Strava activities since the last fetch.
 * ✅ Updates `last_updated` after successful fetch.
 */
const getNewActivities = async () => {
    try {
        const accessToken = await getValidAccessToken();
        if (!accessToken) {
            throw new Error("❌ No valid access token available.");
        }

        // ✅ Get last updated timestamp from DB
        const lastUpdatedResult = await db.query(
            "SELECT last_updated FROM habit.strava_sync_log ORDER BY id DESC LIMIT 1"
        );
        const lastUpdated = lastUpdatedResult.length > 0
            ? Math.floor(new Date(lastUpdatedResult[0].last_updated).getTime() / 1000)
            : Math.floor(new Date("2000-01-01").getTime() / 1000); // Default if first run

        console.log(`🔍 Fetching new activities after: ${new Date(lastUpdated * 1000).toISOString()}`);

        const response = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
                after: lastUpdated, // ✅ Fetch only new activities
                page: 1,
                per_page: 200,
            },
        });

        if (response.data.length === 0) {
            console.log("✅ No new activities found.");
            return [];
        }

        console.log(`✅ Fetched ${response.data.length} new activities from Strava.`);

        // ✅ Update `last_updated` timestamp in DB
        await db.query(
            "INSERT INTO habit.strava_sync_log (last_updated) VALUES (now())"
        );

        // ✅ Store in the database
        await saveStravaActivities(response.data);

        return response.data;
    } catch (error) {
        console.error("❌ Error fetching new activities:", error.response?.data || error.message);
    }
};

/**
* 🔹 Stores Strava activities in the database, avoiding duplicates.
*/
const saveStravaActivities = async (activities) => {
    try {
        for (const activity of activities) {
            await db.query(
                `INSERT INTO habit.strava_activities (
                    id, name, distance, moving_time, elapsed_time, total_elevation_gain, 
                    type, sport_type, workout_type, start_date, start_date_local, timezone, 
                    utc_offset, location_city, location_state, location_country, 
                    achievement_count, kudos_count, comment_count, athlete_count, photo_count,
                    trainer, commute, manual, private, visibility, flagged, gear_id,
                    start_lat, start_lng, end_lat, end_lng, average_speed, max_speed, 
                    elev_high, elev_low, upload_id, external_id, from_accepted_tag, 
                    pr_count, total_photo_count, has_kudoed, map_id, summary_polyline
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 
                    $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, 
                    $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44
                )
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    distance = EXCLUDED.distance,
                    moving_time = EXCLUDED.moving_time,
                    elapsed_time = EXCLUDED.elapsed_time,
                    total_elevation_gain = EXCLUDED.total_elevation_gain,
                    type = EXCLUDED.type,
                    sport_type = EXCLUDED.sport_type,
                    workout_type = COALESCE(EXCLUDED.workout_type, habit.strava_activities.workout_type),
                    start_date = EXCLUDED.start_date,
                    start_date_local = EXCLUDED.start_date_local,
                    timezone = EXCLUDED.timezone,
                    utc_offset = EXCLUDED.utc_offset,
                    location_city = COALESCE(EXCLUDED.location_city, habit.strava_activities.location_city),
                    location_state = COALESCE(EXCLUDED.location_state, habit.strava_activities.location_state),
                    location_country = COALESCE(EXCLUDED.location_country, habit.strava_activities.location_country),
                    achievement_count = EXCLUDED.achievement_count,
                    kudos_count = EXCLUDED.kudos_count,
                    comment_count = EXCLUDED.comment_count,
                    athlete_count = EXCLUDED.athlete_count,
                    photo_count = EXCLUDED.photo_count,
                    trainer = EXCLUDED.trainer,
                    commute = EXCLUDED.commute,
                    manual = EXCLUDED.manual,
                    private = EXCLUDED.private,
                    visibility = EXCLUDED.visibility,
                    flagged = EXCLUDED.flagged,
                    gear_id = COALESCE(EXCLUDED.gear_id, habit.strava_activities.gear_id),
                    start_lat = COALESCE(EXCLUDED.start_lat, habit.strava_activities.start_lat),
                    start_lng = COALESCE(EXCLUDED.start_lng, habit.strava_activities.start_lng),
                    end_lat = COALESCE(EXCLUDED.end_lat, habit.strava_activities.end_lat),
                    end_lng = COALESCE(EXCLUDED.end_lng, habit.strava_activities.end_lng),
                    average_speed = EXCLUDED.average_speed,
                    max_speed = EXCLUDED.max_speed,
                    elev_high = COALESCE(EXCLUDED.elev_high, habit.strava_activities.elev_high),
                    elev_low = COALESCE(EXCLUDED.elev_low, habit.strava_activities.elev_low),
                    upload_id = EXCLUDED.upload_id,
                    external_id = COALESCE(EXCLUDED.external_id, habit.strava_activities.external_id),
                    from_accepted_tag = EXCLUDED.from_accepted_tag,
                    pr_count = EXCLUDED.pr_count,
                    total_photo_count = EXCLUDED.total_photo_count,
                    has_kudoed = EXCLUDED.has_kudoed,
                    map_id = COALESCE(EXCLUDED.map_id, habit.strava_activities.map_id),
                    summary_polyline = COALESCE(EXCLUDED.summary_polyline, habit.strava_activities.summary_polyline)`,
                [
                    activity.id,
                    activity.name || "Unknown Activity",
                    activity.distance || 0,
                    activity.moving_time || 0,
                    activity.elapsed_time || 0,
                    activity.total_elevation_gain || 0,
                    activity.type || "Unknown",
                    activity.sport_type || "Unknown",
                    activity.workout_type || null, // Ensure null for missing values
                    activity.start_date || null,
                    activity.start_date_local || null,
                    activity.timezone || "Unknown",
                    activity.utc_offset || 0,
                    activity.location_city || null,
                    activity.location_state || null,
                    activity.location_country || null,
                    activity.achievement_count || 0,
                    activity.kudos_count || 0,
                    activity.comment_count || 0,
                    activity.athlete_count || 1, // Default to 1 (self)
                    activity.photo_count || 0,
                    activity.trainer || false,
                    activity.commute || false,
                    activity.manual || false,
                    activity.private || false,
                    activity.visibility || "everyone",
                    activity.flagged || false,
                    activity.gear_id || null,
                    activity.start_latlng?.[0] || null, // Start latitude
                    activity.start_latlng?.[1] || null, // Start longitude
                    activity.end_latlng?.[0] || null, // End latitude
                    activity.end_latlng?.[1] || null, // End longitude
                    activity.average_speed || 0,
                    activity.max_speed || 0,
                    activity.elev_high || null,
                    activity.elev_low || null,
                    activity.upload_id || null,
                    activity.external_id || null,
                    activity.from_accepted_tag || false,
                    activity.pr_count || 0,
                    activity.total_photo_count || 0,
                    activity.has_kudoed || false,
                    activity.map?.id || null, // Extract map ID safely
                    activity.map?.summary_polyline || null // Extract route polyline safely
                ]
            );
        }
        console.log(`✅ Stored or updated ${activities.length} activities in the database.`);
    } catch (err) {
        console.error("❌ Database query error:", err);
    }
};


if (process.argv[2] === "test-all") {
    (async () => {
        console.log("🔍 Testing Full Historical Activities Fetch...");
        const activities = await getAllActivities();
        console.log(activities ? `✅ Retrieved ${activities.length} activities.` : "❌ Failed to fetch.");
        process.exit();
    })();
}

if (process.argv[2] === "test-new") {
    (async () => {
        console.log("🔍 Testing Incremental Activities Fetch...");
        const activities = await getNewActivities();
        console.log(activities ? `✅ Retrieved ${activities.length} new activities.` : "❌ No new activities found.");
        process.exit();
    })();
}

if (process.argv[2] === "test-save") {
    (async () => {
        console.log("🔍 Testing Save Function...");
        const activities = await getAllActivities();

        if (activities && activities.length > 0) {
            console.log(`✅ Retrieved ${activities.length} activities.`);
            await saveStravaActivities(activities);
            console.log("✅ Successfully saved activities to database.");
        } else {
            console.log("❌ No activities fetched.");
        }

        process.exit();
    })();
}


module.exports = { getAllActivities, getNewActivities, saveStravaActivities };