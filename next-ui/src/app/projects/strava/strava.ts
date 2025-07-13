import { api } from '@/shared/apiClient';
import type { StravaActivity, StravaPR, WeeklyRunData } from '@/types/common';

export const fetchStravaData = async (): Promise<StravaActivity[]> => {
  try {
    const response = await api.get<StravaActivity[]>('/strava');
    return response;
  } catch (error) {
    console.error('Error fetching Strava data:', error);
    throw error;
  }
};

// Utility function to calculate personal records (PRs)
export const getPRs = (data: StravaActivity[]): StravaPR[] => {
  const prs: StravaPR[] = [
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

function getMaxAverageSpeed(activities: StravaActivity[], distanceArg: number): number | null {
  const validSpeeds = activities
    .filter(activity => {
      const speed = activity.average_speed;
      const distance = activity.distance;
      const type = activity.sport_type;

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
}

// Utility function to group and aggregate weekly runs
export const getWeeklyRuns = (data: StravaActivity[]): WeeklyRunData[] => {
  const weeks: Record<string, WeeklyRunData> = {};

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
        runCount: 0,
        avgDistance: 0,
        avgSpeed: 0,
        avgPace: 0
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
    .sort((a, b) => new Date(a.preciseDate).getTime() - new Date(b.preciseDate).getTime());
};

// Helper functions
function getWeekBoundaries(date: Date): { weekStart: Date; weekEnd: Date } {
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

function formatDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Utility function to filter recent runs (e.g., last 10 activities)
export const getRecentRuns = (data: StravaActivity[], count: number = 10): StravaActivity[] => {
  // Filter for runs and sort by date descending.
  const runs = data.filter(activity => activity.sport_type === 'Run');
  runs.sort((a, b) => {
    const dateA = a.activity_date ? new Date(a.activity_date) : new Date(a.start_date);
    const dateB = b.activity_date ? new Date(b.activity_date) : new Date(b.start_date);
    return dateB.getTime() - dateA.getTime();
  });
  return runs.slice(0, count);
};

// Utility function to convert m/s to min/km pace
export function convertMSToMinKm(speedMps: number): string {
  if (speedMps <= 0) return "0:00"; // Handle invalid input

  const secondsPerKm = 1000 / speedMps; // Time in seconds per kilometer
  const minutes = Math.floor(secondsPerKm / 60); // Whole minutes
  const seconds = Math.round(secondsPerKm % 60); // Remaining seconds

  // Format as "mm:ss"
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
} 