const config = require('../../config/env');
/**
 * testHabitAPI.test.js
 *
 * This Jest test suite checks multiple Habit API endpoints (e.g., "exercise" and "alcohol").
 * We assume the server is already running on http://localhost:5000/api/habit.
 *
 * Usage:
 * 1. In one terminal: `npm start` (or however you start your server)
 *    so it's listening on http://localhost:5000/api/habit
 * 2. In another terminal:
 *
 *    - `npm test` (or `npx jest`) to run ALL tests (both exercise & alcohol).
 *    - `npm test -- --testNamePattern=exercise` to run ONLY exercise-related tests.
 *    - `npm test -- --testNamePattern=alcohol` to run ONLY alcohol-related tests.
 *
 *    (The `--testNamePattern` flag is a Jest feature that filters tests by name.)
 */

const path = require('path');

const axios = require("axios");
const db = require("../db");

// Point to an already-running server on port 5000
const BASE_URL = "http://localhost:5000/api/habit";

/* 
 * ────────────────────────────────────────────────────────────────────────────
 * SINGLE afterAll: Closes DB pool after all describes finish
 * ────────────────────────────────────────────────────────────────────────────
 */
afterAll(async () => {
  await db.end(); // free up all connections just once
});

/*
 * ────────────────────────────────────────────────────────────────────────────
 * ALCOHOL HABIT TESTS
 * ────────────────────────────────────────────────────────────────────────────
 */
describe("Habit API - Alcohol", () => {
  test("✅ Should log a new alcohol habit", async () => {
    // POST to /api/habit/alcohol
    const response = await axios.post(`${BASE_URL}/alcohol`, {
      user_id: 1,
      value: 1,
      metric: "drink",
      extra_data: {
        drink_id: 1,
        volume_ml: 500,
        abv: 0.05,
      },
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("message", "Habit logged successfully");
    expect(response.data).toHaveProperty("log_id");
  });

  test("✅ Should fetch habit logs (including alcohol logs)", async () => {
    const response = await axios.get(BASE_URL);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });
});

/*
 * ────────────────────────────────────────────────────────────────────────────
 * EXERCISE HABIT TESTS
 * ────────────────────────────────────────────────────────────────────────────
 */
describe("Habit API - Exercise", () => {
  test("✅ Should log a new exercise habit", async () => {
    // POST to /api/habit/exercise
    const response = await axios.post(`${BASE_URL}/exercise`, {
      user_id: 1,
      value: 30,
      metric: "minutes",
      extra_data: {
        exercise_type: "Running",
        duration_sec: 1800,
        distance_km: 5.0,
        calories_burned: 400,
        heart_rate_avg: 140,
        source_specific_id: "strava-activity-123656",
      },
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("message", "Habit logged successfully");
    expect(response.data).toHaveProperty("log_id");
  });

  test("✅ Should fetch habit logs (including exercise logs)", async () => {
    const response = await axios.get(BASE_URL);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });
});
