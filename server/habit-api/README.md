# Habit Tracking API

The Habit Tracking API provides endpoints for logging, retrieving, and analyzing user habits. It supports multiple habit types and includes features for data aggregation and visualization.

## Features

- Log habits with custom metrics and metadata
- Retrieve habit logs with filtering and pagination
- Calculate aggregate statistics
- Support for multiple habit types (alcohol, exercise, etc.)
- User-specific data isolation
- Real-time data updates

## API Endpoints

### Habit Logging

```http
POST /api/habit/:habitType
```

Logs a new habit entry. The `habitType` parameter determines the specific handling of the data.

**Request Body:**
```json
{
  "value": number,
  "metric": string,
  "extraData": object
}
```

### Retrieving Habit Logs

```http
GET /api/habit
```

Retrieves all habit logs for the authenticated user.

**Query Parameters:**
- `period`: Filter by time period (day, week, month, year, all)
- `habitType`: Filter by specific habit type
- `limit`: Number of records to return
- `offset`: Pagination offset

### Aggregate Statistics

```http
GET /api/habit/stats/:period
```

Retrieves aggregate statistics for the specified period.

**Parameters:**
- `period`: Time period for aggregation (day, week, month, year, all)

## Database Schema

### habit_log Table
```sql
CREATE TABLE habit.habit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    habit_type VARCHAR(50) NOT NULL,
    value NUMERIC,
    metric VARCHAR(50),
    extra_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Habit-Specific Tables
Each habit type may have its own table for specific data:

#### alcohol Table
```sql
CREATE TABLE habit.alcohol (
    id SERIAL PRIMARY KEY,
    habit_log_id INTEGER REFERENCES habit.habit_log(id),
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    drink_id INTEGER,
    volume_ml NUMERIC,
    abv_percent NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### exercise Table
```sql
CREATE TABLE habit.exercise (
    id SERIAL PRIMARY KEY,
    habit_log_id INTEGER REFERENCES habit.habit_log(id),
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    activity_type VARCHAR(50),
    duration_minutes INTEGER,
    distance_km NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Details

### Authentication
All endpoints require authentication via JWT token. The token must be included in the Authorization header:
```http
Authorization: Bearer <token>
```

### Data Validation
- Input validation for all endpoints
- Type checking for numeric values
- Required field validation
- Custom validation for habit-specific data

### Error Handling
Standard error responses:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `INVALID_INPUT`: Invalid request data
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error

## Usage Examples

### Logging an Alcohol Habit
```javascript
const response = await fetch('/api/habit/alcohol', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    value: 500,
    metric: 'ml',
    extraData: {
      drink_id: 1,
      volume_ml: 500,
      abv_percent: 5.0
    }
  })
});
```

### Getting Weekly Statistics
```javascript
const response = await fetch('/api/habit/stats/week', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Development

### Adding New Habit Types
1. Create a new table for the habit-specific data
2. Add the habit type to the `habitType` enum
3. Implement the specific logging logic
4. Add any necessary validation rules

### Testing
Run the test suite:
```bash
npm test
```

## Dependencies
- Express.js
- PostgreSQL
- JWT for authentication
- Moment.js for date handling

## Contributing
1. Follow the established code style
2. Add tests for new features
3. Update documentation
4. Submit a pull request 