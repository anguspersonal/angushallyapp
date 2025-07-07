import axios from 'axios';
import { HabitType } from '../../../types/common';

// Type definitions for aggregate statistics
type ValidPeriod = 'day' | 'week' | 'month' | 'year' | 'all';
type ValidMetric = 'sum' | 'avg' | 'min' | 'max' | 'stddev';

interface AggregateStats {
    [key: string]: number;
}

/**
 * Fetches aggregate statistics for a specific habit type and period
 * @param habitType - The type of habit (e.g., 'alcohol', 'exercise')
 * @param period - The time period ('day', 'week', 'month', 'year', 'all')
 * @param metrics - Optional array of metrics to fetch ('sum', 'avg', 'min', 'max', 'stddev')
 * @returns The aggregate statistics
 */
export async function getAggregateStats(
    habitType: HabitType, 
    period: ValidPeriod, 
    metrics: ValidMetric[] = ['sum', 'avg', 'min', 'max', 'stddev']
): Promise<AggregateStats> {
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
            return metrics.reduce((acc: AggregateStats, metric) => {
                acc[metric] = 0;
                return acc;
            }, {});
        }

        return response.data;
    } catch (error: any) {
        console.error('Error in getAggregateStats:', {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config
        });
        
        // Return default values in case of error
        return metrics.reduce((acc: AggregateStats, metric) => {
            acc[metric] = 0;
            return acc;
        }, {});
    }
}

// Constants for valid periods and metrics
export const VALID_PERIODS: ValidPeriod[] = ['day', 'week', 'month', 'year', 'all'];
export const VALID_METRICS: ValidMetric[] = ['sum', 'avg', 'min', 'max', 'stddev'];
export const DEFAULT_METRICS: ValidMetric[] = ['sum', 'avg', 'min', 'max', 'stddev']; 