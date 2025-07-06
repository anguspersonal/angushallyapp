// @ts-nocheck
import axios from 'axios';

/**
 * Fetches aggregate statistics for a specific habit type and period
 * @param {string} habitType - The type of habit (e.g., 'alcohol', 'exercise')
 * @param {string} period - The time period ('day', 'week', 'month', 'year', 'all')
 * @param {Array<string>} metrics - Optional array of metrics to fetch ('sum', 'avg', 'min', 'max', 'stddev')
 * @returns {Promise<Object>} - The aggregate statistics
 */
export async function getAggregateStats(habitType, period, metrics = ['sum', 'avg', 'min', 'max', 'stddev']) {
    console.log('getAggregateStats called with:', {
        habitType,
        period,
        metrics
    });

    try {
        const response = await axios.get(`/api/habit/aggregate/${habitType}`, {
            params: { period, metrics: metrics.join(',') }
        });
        
        console.log('API response received:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data
        });

        if (!response.data) {
            console.warn('Empty response data received');
            return metrics.reduce((acc, metric) => {
                acc[metric] = 0;
                return acc;
            }, {});
        }

        return response.data;
    } catch (error) {
        console.error('Error in getAggregateStats:', {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config
        });
        
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