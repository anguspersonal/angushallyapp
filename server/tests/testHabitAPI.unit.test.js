// Mock the database and services before requiring any modules
jest.mock('../db', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

jest.mock('../habit-api/habitService', () => ({
    logHabitLog: jest.fn(),
    getHabitLogsFromDB: jest.fn()
}));

jest.mock('../habit-api/alcoholService', () => ({
    logAlcohol: jest.fn(),
    getAlcoholLogs: jest.fn(),
    getDrinkCatalog: jest.fn(),
    getAlcoholAggregates: jest.fn()
}));

jest.mock('../habit-api/exerciseService', () => ({
    logExercise: jest.fn(),
    getExerciseLogs: jest.fn()
}));

jest.mock('../utils/checkValueType', () => ({
    checkValueType: (value) => value
}));

jest.mock('../middleware/auth', () => ({
    authMiddleware: () => {
        return (req, res, next) => {
            req.user = {
                id: '95288f22-6049-4651-85ae-4932ededb5ab',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                roles: ['member']
            };
            next();
        };
    }
}));

const request = require('supertest');
const express = require('express');
const db = require('../db');
const habitService = require('../habit-api/habitService');
const alcoholService = require('../habit-api/alcoholService');
const exerciseService = require('../habit-api/exerciseService');
const habitRoute = require('../routes/habitRoute');

describe('Habit API - Unit Tests (Mocked)', () => {
    let app;
    
    const TEST_USER = {
        id: '95288f22-6049-4651-85ae-4932ededb5ab',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        roles: ['member']
    };

    beforeAll(() => {
        // Setup Express app for testing
        app = express();
        app.use(express.json());
        app.use('/api/habit', habitRoute);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Set default successful mock returns
        habitService.logHabitLog.mockResolvedValue(1);
        habitService.getHabitLogsFromDB.mockResolvedValue([]);
        alcoholService.logAlcohol.mockResolvedValue({ drinks: [] });
        exerciseService.logExercise.mockResolvedValue({ exercise: {} });
    });

    describe('POST /api/habit/alcohol', () => {
        it('should log a new alcohol habit successfully', async () => {
            // Mock the service responses
            habitService.logHabitLog.mockResolvedValueOnce(1);
            alcoholService.logAlcohol.mockResolvedValueOnce({ 
                drinks: [{
                    id: 1,
                    log_id: 1,
                    drink_name: "Test Beer",
                    volume_ml: 500,
                    abv_percent: 5.0,
                    count: 1
                }]
            });

            const alcoholData = {
                value: 2,
                metric: "units",
                extraData: {
                    drinks: [{
                        name: "Test Beer",
                        volumeML: 500,
                        abvPerc: 5.0,
                        count: 1
                    }]
                }
            };

            const response = await request(app)
                .post('/api/habit/alcohol')
                .send(alcoholData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Habit logged successfully');
            expect(response.body).toHaveProperty('logId', 1);
            expect(habitService.logHabitLog).toHaveBeenCalledWith(
                TEST_USER.id, 
                'alcohol', 
                2, 
                'units', 
                alcoholData.extraData
            );
            expect(alcoholService.logAlcohol).toHaveBeenCalledWith(
                1, 
                alcoholData.extraData, 
                TEST_USER.id
            );
        });

        it('should handle missing required fields', async () => {
            // Mock a failed service call due to missing required fields
            // The real function should validate inputs before calling database
            habitService.logHabitLog.mockRejectedValueOnce(new Error('null value in column "value" violates not-null constraint'));
            
            const incompleteData = {
                metric: "units"
                // missing value - this should be rejected at the validation level
            };

            const response = await request(app)
                .post('/api/habit/alcohol')
                .send(incompleteData);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal Server Error');
            
            // The service should be called but with undefined value, which causes the DB constraint error
            expect(habitService.logHabitLog).toHaveBeenCalledWith(
                TEST_USER.id, 
                'alcohol', 
                undefined, // This causes the null constraint violation
                'units', 
                undefined
            );
        });

        it('should handle database errors gracefully', async () => {
            habitService.logHabitLog.mockRejectedValueOnce(new Error('Database connection failed'));

            const alcoholData = {
                value: 1,
                metric: "units",
                extraData: { drinks: [{
                    name: "Test Beer",
                    volumeML: 500,
                    abvPerc: 5.0,
                    count: 1
                }] }
            };

            const response = await request(app)
                .post('/api/habit/alcohol')
                .send(alcoholData);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal Server Error');
        });
    });

    describe('POST /api/habit/exercise', () => {
        it('should log a new exercise habit successfully', async () => {
            // Mock the service responses
            habitService.logHabitLog.mockResolvedValueOnce(2);
            exerciseService.logExercise.mockResolvedValueOnce({ 
                exercise: {
                    id: 1,
                    log_id: 2,
                    exercise_type: "Running",
                    duration_minutes: 30
                }
            });

            const exerciseData = {
                value: 30,
                metric: "minutes",
                extraData: {
                    exercise_type: "Running",
                    duration_minutes: 30,
                    distance_km: 5.0,
                    calories_burned: 400,
                    heart_rate_avg: 140,
                    source: "manual"
                }
            };

            const response = await request(app)
                .post('/api/habit/exercise')
                .send(exerciseData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Habit logged successfully');
            expect(response.body).toHaveProperty('logId', 2);
            expect(habitService.logHabitLog).toHaveBeenCalledWith(
                TEST_USER.id, 
                'exercise', 
                30, 
                'minutes', 
                exerciseData.extraData
            );
            expect(exerciseService.logExercise).toHaveBeenCalledWith(
                2, 
                exerciseData.extraData, 
                TEST_USER.id
            );
        });

        it('should reject invalid habit type', async () => {
            const response = await request(app)
                .post('/api/habit/invalid_type')
                .send({
                    value: 30,
                    metric: "minutes",
                    extraData: {}
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid habit type');
            expect(habitService.logHabitLog).not.toHaveBeenCalled();
            expect(alcoholService.logAlcohol).not.toHaveBeenCalled();
            expect(exerciseService.logExercise).not.toHaveBeenCalled();
        });
    });

    describe('GET /api/habit', () => {
        it('should fetch all habit logs for user', async () => {
            const mockHabits = [
                {
                    id: 1,
                    user_id: TEST_USER.id,
                    habit_type: 'alcohol',
                    value: 2,
                    metric: 'units',
                    logged_at: new Date('2023-01-01')
                },
                {
                    id: 2,
                    user_id: TEST_USER.id,
                    habit_type: 'exercise',
                    value: 30,
                    metric: 'minutes',
                    logged_at: new Date('2023-01-02')
                }
            ];

            habitService.getHabitLogsFromDB.mockResolvedValueOnce(mockHabits);

            const response = await request(app)
                .get('/api/habit');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toHaveProperty('habit_type', 'alcohol');
            expect(response.body[1]).toHaveProperty('habit_type', 'exercise');
            expect(habitService.getHabitLogsFromDB).toHaveBeenCalledWith(TEST_USER.id);
        });

        it('should return empty array when no habits exist', async () => {
            habitService.getHabitLogsFromDB.mockResolvedValueOnce([]);

            const response = await request(app)
                .get('/api/habit');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(0);
        });

        it('should handle database errors', async () => {
            habitService.getHabitLogsFromDB.mockRejectedValueOnce(new Error('Database query failed'));

            const response = await request(app)
                .get('/api/habit');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal Server Error');
        });
    });
}); 