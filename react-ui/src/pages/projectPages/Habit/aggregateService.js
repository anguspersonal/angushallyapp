import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Fetches aggregate statistics for a specific habit type and period
 * @param {string} habitType - The type of habit (e.g., 'alcohol', 'exercise')
 * @param {string} period - The time period ('day', 'week', 'month', 'year', 'all')
 * @param {Array<string>} metrics - Optional array of metrics to fetch ('sum', 'avg', 'min', 'max', 'stddev')
 * @returns {Promise<Object>} - The aggregate statistics
 */
export async function getAggregateStats(habitType, period, metrics = ['sum', 'avg', 'min', 'max', 'stddev']) {
    console.log('Fetching stats:', { habitType, period, metrics });
    try {
        const url = `${API_BASE_URL}/api/habits/aggregate`;
        const params = {
            habitType,
            period,
            metrics: metrics.join(',')
        };
        console.log('Making request to:', url, 'with params:', params);
        
        const response = await axios.get(url, { params });
        console.log('Response data:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${period} stats for ${habitType}:`, error);
        // Return default values in case of error
        return metrics.reduce((acc, metric) => {
            acc[metric] = 0;
            return acc;
        }, {});
    }
}

// Constants for valid periods and metrics
export const VALID_PERIODS = ['day', 'week', 'month', 'year', 'all'];
export const VALID_METRICS = ['sum', 'avg', 'min', 'max', 'stddev'];
export const DEFAULT_METRICS = ['sum', 'avg', 'min', 'max', 'stddev']; 