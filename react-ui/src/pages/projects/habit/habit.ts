
import { api } from '../../../utils/apiClient';
import { HabitLog, HabitType, DrinkCatalogItem, HabitStats } from '../../../types/common';

interface HabitLogResponse {
    data: HabitLog;
    habit_type: HabitType;
}

interface HabitLogsResponse {
    data: HabitLog[];
}

type StatsPeriod = 'day' | 'week' | 'month' | 'year';

// ✅ Function that calls the API to log habit data
export const addHabitLog = async (logData: Partial<HabitLog>, habitType: HabitType): Promise<HabitLogResponse> => {
    console.log('Habit Log:', logData);
    try {
        const response = await api.post(`/habit/${habitType}`, logData);
        
        // ✅ Append the habit type to response data so that we can use it in the frontend
        response.data.habit_type = habitType;
        console.log('Response:', response.data);

        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// ✅ Get All Habit Logs
export const getHabitLogs = async (): Promise<HabitLog[]> => {
    console.log('Fetching habit logs...');
    try {
        const response = await api.get('/habit');
        return response.data || response;
    } catch (error) {
        console.error('Error fetching habit logs:', error);
        throw error;
    }
};

// ✅ Get Logs for a Specific Habit
export const getLogsByHabit = async (habitType: HabitType): Promise<HabitLog[]> => {
    console.log(`Fetching logs for habit: ${habitType}`);
    try {
        const response = await api.get(`/habit/${habitType}/logs`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching logs for habit: ${habitType}`, error);
        throw error;
    }
};

// ✅ Fetch Habit-Specific Data (e.g., Drink Catalog for Alcohol)
export const getHabitSpecificData = async (habitName: string): Promise<any> => {
    try { 
        let data = null;
        switch (habitName) {
            case "alcohol":
                data = await api.get('/habit/alcohol/data');
                break;
            default:
                data = [];
                break;
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// ✅ Get Drinks Catalog (for alcohol tracking)
export const getDrinkCatalog = async (): Promise<DrinkCatalogItem[]> => {
    console.log('Fetching drink catalog...');
    try {
        const response = await api.get("/habit/alcohol/drinkCatalog");
        return response.data;
    } catch (error) {
        console.error('Error fetching drink catalog:', error);
        throw error;
    }
};

export const getAggregateStats = async (period: StatsPeriod): Promise<HabitStats> => {
    try {
        const response = await api.get(`/habit/stats/${period}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching aggregate stats:', error);
        throw error;
    }
};
