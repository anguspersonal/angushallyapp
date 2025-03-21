import axios from "axios";

// ✅ Function that calls the API to log habit data
export const addHabitLog = async (habitLog, habitType) => {
    console.log('Habit Log:', habitLog);
    try {
        const response = await axios.post(`/api/habit/${habitType}`, habitLog);
        
        // ✅ Append the habit type to response data so that we can use it in the frontend
        response.data.habit_type = habitType;
        console.log('Respons:', response.data);

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
        const response = await axios.get("/api/habit");
        return response.data;
    } catch (error) {
        console.error('Error fetching habit logs:', error);
        throw error;
    }
};

// ✅ Get Logs for a Specific Habit
export const getLogsByHabit = async (habitType) => {
    console.log(`Fetching logs for habit: ${habitType}`);
    try {
        const response = await axios.get(`/api/habit/${habitType}/logs`);
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
                data = await getDrinkCatalog();
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
        const response = await axios.get("/api/habit/alcohol/drinkCatalog");
        return response.data;
    } catch (error) {
        console.error('Error fetching drink catalog:', error);
        throw error;
    }
};
