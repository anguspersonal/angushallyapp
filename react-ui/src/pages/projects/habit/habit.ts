// @ts-nocheck
import { api } from '../../../utils/apiClient';
// ✅ Function that calls the API to log habit data
export const addHabitLog = async (logData, habitType) => {
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
export const getHabitLogs = async () => {
    console.log('Fetching habit logs...');
    try {
        return await api.get('/habit');
    } catch (error) {
        console.error('Error fetching habit logs:', error);
        throw error;
    }
};

// ✅ Get Logs for a Specific Habit
export const getLogsByHabit = async (habitType) => {
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
export const getHabitSpecificData = async (habitName) => {
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
export const getDrinkCatalog = async () => {
    console.log('Fetching drink catalog...');
    try {
        const response = await api.get("/habit/alcohol/drinkCatalog");
        return response.data;
    } catch (error) {
        console.error('Error fetching drink catalog:', error);
        throw error;
    }
};

export const getAggregateStats = async (period) => {
    try {
        return await api.get(`/habit/stats/${period}`);
    } catch (error) {
        console.error('Error fetching aggregate stats:', error);
        throw error;
    }
};
