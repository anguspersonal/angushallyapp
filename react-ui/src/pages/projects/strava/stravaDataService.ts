// @ts-nocheck - Complex Strava API service with dynamic data fetching and transformation that TypeScript cannot properly infer
import axios from "axios";

export const fetchStravaData = async () => {
  try {
    const response = await axios.get("/api/strava");
    // console.log(`Fetched ${response.data.length} activities from database`);
    // console.log(`data`, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Strava data:", error.response?.data || error.message);
  }
};


// Utility function to calculate personal records (PRs)
export const getPRs = (data) => {
  const prs = [
    { name: '1km', distanceVal: 1000, maxSpeed: null },
    { name: '5km', distanceVal: 5000, maxSpeed: null },
    { name: '10km', distanceVal: 10000, maxSpeed: null }
  ];

  // Update each PR entry with calculated max speed
  return prs.map(pr => ({
    ...pr,
    maxSpeed: getMaxAverageSpeed(data, pr.distanceVal)
  }));
};

function getMaxAverageSpeed(activities, distanceArg) {
  const validSpeeds = activities
    .filter(activity => {
      const speed = activity.average_speed;
      const distance = activity.distance;
      const type = activity.sport_type; // Fixed typo here

      return (
        typeof speed === 'number' &&
        !isNaN(speed) &&
        typeof distance === 'number' &&
        !isNaN(distance) &&
        type === "Run" &&
        distance >= distanceArg
      );
    })
    .map(activity => activity.average_speed);

  // Return null instead of 0 for no valid records
  return validSpeeds.length ? Math.max(...validSpeeds) : null;
};

// Utility function to group and aggregate weekly runs
export const getWeeklyRuns = (data) => {
  const weeks = {};

  data.forEach((activity) => {
    if (activity.sport_type !== 'Run' || activity.distance === 0 || activity.distance === null) return;

    const date = new Date(activity.start_date);
    const { weekStart, weekEnd } = getWeekBoundaries(date);

    // Create unique key for sorting and grouping
    const preciseDate = weekStart.toISOString(); // For chronological sorting
    const displayDate = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`; // "dd/mm - dd/mm"

    if (!weeks[preciseDate]) { //check that each week is only initialized once
      weeks[preciseDate] = {
        preciseDate,
        displayDate,
        totalDistance: 0,
        maxDistance: 0,
        totalElevation: 0,
        totalMovingTime: 0,
        speedSum: 0,
        maxSpeed: 0,
        runCount: 0
      };
    }

    const week = weeks[preciseDate];
    const distance = activity.distance || 0;
    const speed = activity.average_speed || 0;

    // Update aggregates
    week.totalDistance += distance;
    week.maxDistance = Math.max(week.maxDistance, distance);
    week.totalElevation += activity.total_elevation_gain || 0;
    week.totalMovingTime += activity.moving_time || 0;
    week.speedSum += speed * distance; // Weighted sum for distance-weighted avg
    week.maxSpeed = Math.max(week.maxSpeed, speed);
    week.runCount++;
  });

  // Convert to array and calculate derived metrics
  return Object.values(weeks)
    .map(week => ({
      ...week,
      avgDistance: week.totalDistance / week.runCount,
      avgSpeed: week.speedSum / week.totalDistance, // Distance-weighted average
      avgPace: week.totalMovingTime / week.totalDistance // s/m
    }))
    .sort((a, b) => new Date(a.preciseDate) - new Date(b.preciseDate));
};

// Helper functions
function getWeekBoundaries(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday start
  const weekStart = new Date(d.setDate(diff));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    weekStart: new Date(weekStart.setHours(0, 0, 0, 0)),
    weekEnd: new Date(weekEnd.setHours(23, 59, 59, 999))
  };
}

function formatDate(date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}


// Utility function to filter recent runs (e.g., last 10 activities)
export const getRecentRuns = (data, count = 10) => {
  // Filter for runs and sort by date descending.
  const runs = data.filter(activity => activity.sport_type === 'Run');
  runs.sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date));
  return runs.slice(0, count);
};