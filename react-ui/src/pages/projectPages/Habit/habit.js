import axios from "axios";

// Function that calls the API to log habit data
export const addHabitLog = async(habitLog) => {
    console.log('Habit Log:', habitLog);
    try {
        const response = await axios.post("/api/habit", { log: habitLog });
        // console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Get Habit Logs
export const getHabitLogs = async() => {
    console.log('Fetching habit logs...');
    try {
        const response = await axios.get("/api/habit");
        // console.log('Response:', response);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}