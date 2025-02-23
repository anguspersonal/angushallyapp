const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Load environment variables
const { addHabitToDB, getHabitLogsFromDB } = require('../habit-api/habitService'); // Correctly import named exports

// Get habit logs from database
router.get('/api/habit', async (req, res) => {
    try {
        const habitLogs = await getHabitLogsFromDB();
        console.log('Habit Logs:', habitLogs);
        res.json(habitLogs);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get habit logs' });
    }
});

// Add habit log to database
router.post('/api/habit', async (req, res) => {
    const habitLog = req.body.log; // Directly access the array
    // console.log('Habit Log:', habitLog);

    try {
        const result = await addHabitToDB(habitLog);
        console.log('Result from habit api', result);
        res.json(result); // Correctly send the result as JSON
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to log habit' });
    }
});

module.exports = router;

// Test the Habit API

// Test the Log Habit API
// const habitLog = 
//     {
//         type: 'running',
//         duration: 30,
//         distance: 5,
//         date: '2021-09-01',
//     }
//  ;
// console.log('Habit Log:', habitLog);
// axios.post('http://localhost:5000/api/habit', { log: habitLog })
//     .then((response) => {
//         console.log('Response:', response.data);
//     })
//     .catch((error) => {
//         console.error('Error:', error);
//     });

// Test the Get Habit Logs API
if (process.argv[2] === "test") {
    (async () => {
        const response = await axios.get('http://localhost:5000/api/habit');
        const habitLogs = response.data;
        // console.log('Habit Logs:', habitLogs);
    })();
}