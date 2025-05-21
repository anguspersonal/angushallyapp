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
  id: '00000000-0000-0000-0000-000000000000', // Use the same UUID as auth middleware
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  roles: ['member'],
  googleUserId: '00000000-0000-0000-0000-000000000000' // Add this for backward compatibility
};

// Mock checkValueType function
jest.mock('../utils/checkValueType', () => ({
  checkValueType: (value) => value
}));

/* 
 * ────────────────────────────────────────────────────────────────────────────
 * Test Setup and Teardown
 * ────────────────────────────────────────────────────────────────────────────
 */
let app;
let server;

beforeAll(async () => {
  // Create test user
  await db.query(`
    INSERT INTO identity.users (id, email, first_name, last_name, is_active)
    VALUES ($1, $2, $3, $4, true)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      is_active = EXCLUDED.is_active
  `, [TEST_USER.id, TEST_USER.email, TEST_USER.firstName, TEST_USER.lastName]);

  // Create member role if it doesn't exist
  await db.query(`
    INSERT INTO identity.roles (name)
    VALUES ('member')
    ON CONFLICT (name) DO NOTHING
    RETURNING id
  `);

  // Get role ID
  const roleResult = await db.query('SELECT id FROM identity.roles WHERE name = $1', ['member']);
  const roleId = roleResult[0].id;

  // Link user to role
  await db.query(`
    INSERT INTO identity.user_roles (user_id, role_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, role_id) DO NOTHING
  `, [TEST_USER.id, roleId]);

  // Setup Express app for testing
  app = express();
  app.use(express.json());
  
  // Mock auth middleware to set both id and googleUserId
  app.use((req, res, next) => {
    req.user = TEST_USER;
    next();
  });
  
  app.use('/api/habit', habitRoute);

  // Start server on a random port
  server = app.listen(0);
});

afterAll(async () => {
  // Clean up test data
  await db.query('DELETE FROM habit.alcohol WHERE user_id = $1', [TEST_USER.id]);
  await db.query('DELETE FROM habit.exercise WHERE user_id = $1', [TEST_USER.id]);
  await db.query('DELETE FROM habit.habit_log WHERE user_id = $1', [TEST_USER.id]);
  
  // Close server and database connections
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await db.end();
});

/*
 * ────────────────────────────────────────────────────────────────────────────
 * ALCOHOL HABIT TESTS
 * ────────────────────────────────────────────────────────────────────────────
 */
describe("Habit API - Alcohol", () => {
  // Clean up test data before each test
  beforeEach(async () => {
    await db.query('DELETE FROM habit.alcohol WHERE user_id = $1', [TEST_USER.id]);
    await db.query('DELETE FROM habit.habit_log WHERE user_id = $1', [TEST_USER.id]);
  });

  test("✅ Should log a new alcohol habit", async () => {
    const response = await request(app)
      .post('/api/habit/alcohol')
      .set('Authorization', 'Bearer test-token')
      .send({
        value: 1,
        metric: "units",
        extraData: {
          drinks: [{
            name: "Test Beer",
            volumeML: 500,
            abvPerc: 5.0,
            count: 1
          }]
        }
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Habit logged successfully");
    expect(response.body).toHaveProperty("logId");
  });

  test("✅ Should fetch habit logs (including alcohol logs)", async () => {
    const response = await request(app)
      .get('/api/habit')
      .set('Authorization', 'Bearer test-token');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

/*
 * ────────────────────────────────────────────────────────────────────────────
 * EXERCISE HABIT TESTS
 * ────────────────────────────────────────────────────────────────────────────
 */
describe("Habit API - Exercise", () => {
  // Clean up test data before each test
  beforeEach(async () => {
    await db.query('DELETE FROM habit.exercise WHERE user_id = $1', [TEST_USER.id]);
    await db.query('DELETE FROM habit.habit_log WHERE user_id = $1', [TEST_USER.id]);
  });

  test("✅ Should log a new exercise habit", async () => {
    const response = await request(app)
      .post('/api/habit/exercise')
      .set('Authorization', 'Bearer test-token')
      .send({
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
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Habit logged successfully");
    expect(response.body).toHaveProperty("logId");
  });

  test("✅ Should fetch habit logs (including exercise logs)", async () => {
    const response = await request(app)
      .get('/api/habit')
      .set('Authorization', 'Bearer test-token');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
