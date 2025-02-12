import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const stravaToken = process.env.STRAVA_READ_ALL_ACCESS_TOKEN;

const getStravaActivities = async () => {
  try {
    const response = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
      headers: { Authorization: `Bearer ${stravaToken}` },
      params: {
        before: Math.floor(Date.now() / 1000), // Fetch up to now
        after: Math.floor(new Date("2020-01-01").getTime() / 1000), // Fetch from 2020
        page: 1,
        per_page: 30,
      },
    });

    console.log(`Fetched ${response.data.length} activities from Strava`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Strava data:", error.response?.data || error.message);
  }
};

export default getStravaActivities;
