# Efficiency Report: angushallyapp

This report documents several efficiency improvements identified in the codebase.

## Summary

After analyzing the codebase, I identified 6 efficiency issues across the server and shared code. These range from inefficient database access patterns to code duplication that increases maintenance burden.

## Issue 1: Inefficient `getHabitById` - Fetches All Records Instead of One (FIXED)

**Location:** `server/services/habitService.js:110-119`

**Problem:** The `getHabitById` function fetches ALL habit logs from the database and then filters in memory using `.find()` to locate a single record. This is extremely inefficient, especially as the habit_log table grows.

```javascript
async function getHabitById(id, options = {}) {
  const logs = await habitApi.getHabitLogsFromDB();  // Fetches ALL logs
  const match = Array.isArray(logs) ? logs.find((log) => log.id === id) : null;
  return match ? { ...mapHabitLog(match), description: match.extra_data?.notes ?? null } : null;
}
```

**Impact:** O(n) database transfer and memory usage when O(1) is possible. For a user with 1000 habit logs, this transfers 1000 records to find 1.

**Fix:** Add a `getHabitLogById` function to the habitApi that queries by ID directly, then use it in the service.

## Issue 2: Sequential Database Inserts in Loops

**Locations:**
- `server/bookmark-api/bookmarkService.js:192-214` (saveRaindropBookmarks)
- `server/strava-api/stravaService.js:107-214` (saveStravaActivities)
- `server/habit-api/alcoholService.js:26-91` (logAlcohol)

**Problem:** These functions execute individual INSERT queries inside loops instead of using batch inserts. Each query incurs network round-trip overhead.

**Example from stravaService.js:**
```javascript
for (const activity of activities) {
  await db.query(`INSERT INTO habit.strava_activities ...`, [...]);
}
```

**Impact:** For 100 activities, this makes 100 separate database round-trips instead of 1 batch insert.

**Fix:** Use PostgreSQL's multi-row INSERT syntax or the `unnest` function for batch operations:
```javascript
const values = activities.map(a => [a.id, a.name, ...]);
await db.query(`INSERT INTO table (...) SELECT * FROM unnest($1::int[], $2::text[], ...)`, values);
```

## Issue 3: Duplicate Author Name Formatting SQL

**Location:** `server/services/contentService.js:105-114, 149-158, 180-189`

**Problem:** The same COALESCE/CASE statement for formatting author names is repeated verbatim in three different queries (`listPosts`, `getPostBySlug`, `getPostById`).

```sql
COALESCE(
  CASE
    WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL
    THEN u.first_name || ' ' || u.last_name
    WHEN u.first_name IS NOT NULL THEN u.first_name
    WHEN u.last_name IS NOT NULL THEN u.last_name
    ELSE 'Unknown Author'
  END
) as author_name
```

**Impact:** Code duplication increases maintenance burden and risk of inconsistency if one instance is updated but others are not.

**Fix:** Create a SQL view or a helper function that encapsulates the author name logic, or create a database view that joins posts with formatted author names.

## Issue 4: Duplicate Utility Functions Across Services

**Locations:**
- `server/habit-api/habitService.js:63-97` (`getPeriodCondition`, `buildMetricSelect`, `formatAggregateResult`)
- `server/habit-api/alcoholService.js:195-229` (same functions)

**Problem:** Identical implementations of `getPeriodCondition`, `buildMetricSelect`, and `formatAggregateResult` exist in both files.

**Impact:** Code duplication leads to maintenance issues and potential bugs if one copy is updated but not the other.

**Fix:** Extract these functions into a shared utility module (e.g., `server/habit-api/utils/aggregateUtils.js`) and import them where needed.

## Issue 5: Unnecessary Search Path Query on Every Database Call

**Location:** `server/db.js:148-150`

**Problem:** Every database query execution runs `SHOW search_path` for debugging purposes, adding unnecessary overhead to every single database operation.

```javascript
const query = async (text, params = [], retries = 3) => {
  const client = await getPool().connect();
  try {
    const searchPathResult = await client.query('SHOW search_path');  // Unnecessary
    // ...
  }
}
```

**Impact:** Doubles the number of database round-trips for every query operation.

**Fix:** Remove or conditionally enable this debugging query (e.g., only in development mode or behind a debug flag).

## Issue 6: N+1 Query Pattern in Bookmark Fetching

**Location:** `server/bookmark-api/bookmarkService.js:89-106`

**Problem:** `getAllRaindropBookmarks` first fetches all collections, then loops through each collection to fetch bookmarks sequentially.

```javascript
const getAllRaindropBookmarks = async (accessToken) => {
  const collections = await getRaindropCollections(accessToken);
  const allBookmarks = [];
  for (const collection of collections) {
    const bookmarks = await getRaindropBookmarksFromCollection(accessToken, collection._id);
    allBookmarks.push(...bookmarks);
  }
  return allBookmarks;
};
```

**Impact:** For 10 collections, this makes 11 API calls (1 for collections + 10 for bookmarks) instead of potentially fewer with parallel fetching.

**Fix:** Use `Promise.all` to fetch bookmarks from all collections in parallel:
```javascript
const bookmarkPromises = collections.map(c => getRaindropBookmarksFromCollection(accessToken, c._id));
const bookmarkArrays = await Promise.all(bookmarkPromises);
return bookmarkArrays.flat();
```

## Recommendations

1. **Immediate Priority:** Fix Issue 1 (getHabitById) - This is a clear performance bug with a simple fix.
2. **Medium Priority:** Fix Issues 2 and 5 - These affect database performance across the application.
3. **Lower Priority:** Fix Issues 3, 4, and 6 - These are code quality improvements that reduce maintenance burden.

## Implementation Note

This PR includes a fix for Issue 1, which adds a dedicated `getHabitLogById` function to query a single habit log by ID directly from the database, rather than fetching all logs and filtering in memory.
