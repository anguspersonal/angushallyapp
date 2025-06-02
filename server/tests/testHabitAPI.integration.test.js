// Mock the database before any imports
jest.mock('../db', () => ({
    query: jest.fn(),
    end: jest.fn(),
    pool: {
        connect: jest.fn()
    }
}));

// Mock auth middleware
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

jest.mock('../utils/checkValueType', () => ({
    checkValueType: (value) => value
}));

const config = require('../../config/env');
const path = require('path');
const request = require('supertest');
const db = require("../db");
const express = require('express');
const habitRoute = require('../routes/habitRoute');

// Set test environment
process.env.NODE_ENV = 'test';

// Mock user for testing
const TEST_USER = {
    id: '95288f22-6049-4651-85ae-4932ededb5ab',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['member']
};

/* 
 * ────────────────────────────────────────────────────────────────────────────
 * Test Setup and Teardown
 * ────────────────────────────────────────────────────────────────────────────
 */
let app;

beforeAll(async () => {
    // Setup Express app for testing
    app = express();
    app.use(express.json());
    
    // Mock auth middleware - inject user into request
    app.use((req, res, next) => {
        req.user = TEST_USER;
        next();
    });
    
    app.use('/api/habit', habitRoute);
});

beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Set default successful mock behavior
    db.query.mockResolvedValue([]);
});

afterEach(async () => {
    // Clear mocks after each test
    jest.clearAllMocks();
});

afterAll(async () => {
    // No cleanup needed for mocked tests
});

/*
 * ────────────────────────────────────────────────────────────────────────────
 * Habit API Integration Tests
 * ────────────────────────────────────────────────────────────────────────────
 */

describe("Habit API Integration Tests - Alcohol", () => {
    test("✅ Should log a new alcohol habit (Integration)", async () => {
        // Mock database responses for alcohol habit creation
        // 1. habitService.logHabitLog - inserts into habit_log table
        db.query.mockResolvedValueOnce([{ id: 1 }]);
        // 2. alcoholService.logAlcohol - checks for existing drink
        db.query.mockResolvedValueOnce([]);
        // 3. alcoholService.logAlcohol - creates new drink in catalog
        db.query.mockResolvedValueOnce([{ 
            id: 1, 
            name: "Test Beer", 
            default_volume_ml: 500, 
            default_abv_percent: 5.0 
        }]);
        // 4. alcoholService.logAlcohol - inserts alcohol log
        db.query.mockResolvedValueOnce([{ 
            id: 1,
            log_id: 1,
            drink_id: 1,
            drink_name: "Test Beer",
            volume_ml: 500,
            abv_percent: 5.0,
            count: 1
        }]);

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
        expect(db.query).toHaveBeenCalledTimes(4);
    });

    test("✅ Should fetch habit logs including alcohol (Integration)", async () => {
        const mockHabits = [
            {
                id: 1,
                user_id: TEST_USER.id,
                habit_type: 'alcohol',
                value: 2,
                metric: 'units',
                extra_data: {
                    drinks: [{
                        name: "Test Beer",
                        volumeML: 500,
                        abvPerc: 5.0,
                        count: 1
                    }]
                },
                created_at: new Date('2023-01-01')
            }
        ];

        // Mock database response for fetching habits
        db.query.mockResolvedValueOnce(mockHabits);

        const response = await request(app)
            .get('/api/habit');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toHaveProperty('habit_type', 'alcohol');
        expect(response.body[0]).toHaveProperty('value', 2);
        expect(response.body[0]).toHaveProperty('metric', 'units');
    });
});

describe("Habit API Integration Tests - Exercise", () => {
    test("✅ Should log a new exercise habit (Integration)", async () => {
        // Mock database responses for exercise habit creation
        // 1. habitService.logHabitLog - inserts into habit_log table
        db.query.mockResolvedValueOnce([{ id: 2 }]);
        // 2. Additional calls if needed by exercise service
        db.query.mockResolvedValueOnce([{ id: 1 }]);

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
    });

    test("✅ Should fetch habit logs including exercise (Integration)", async () => {
        const mockHabits = [
            {
                id: 2,
                user_id: TEST_USER.id,
                habit_type: 'exercise',
                value: 30,
                metric: 'minutes',
                extra_data: {
                    exercise_type: "Running",
                    duration_minutes: 30,
                    distance_km: 5.0,
                    calories_burned: 400,
                    heart_rate_avg: 140,
                    source: "manual"
                },
                created_at: new Date('2023-01-02')
            }
        ];

        // Mock database response for fetching habits
        db.query.mockResolvedValueOnce(mockHabits);

        const response = await request(app)
            .get('/api/habit');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toHaveProperty('habit_type', 'exercise');
        expect(response.body[0]).toHaveProperty('value', 30);
        expect(response.body[0]).toHaveProperty('metric', 'minutes');
    });
}); 