import axios from "axios";

// Function that calls the API to log habit data
export const addHabitLog = async(habitLog) => {

    console.log('Habit Log:', habitLog);
    const response = await axios.post('http://localhost:3000/api/habit', { log: habitLog })
        .then((response) => {
            console.log('Response:', response.data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Get Habit Logs

export const getHabitLogs = async() => {
    console.log('Fetching habit logs...');
    const response = await axios.get('http://localhost:3000/api/habit')
        .then((response) => {
            console.log('Response:', response);
            return response.data;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    return response;
        
}