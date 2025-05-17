# Strava API Integration

This module handles integration with the Strava API for tracking exercise activities and syncing them with the habit tracking system.

## Features

- OAuth 2.0 authentication with Strava
- Activity synchronization
- Real-time activity updates
- Webhook support for activity updates
- Exercise data mapping to habit system

## Setup

### Prerequisites
- Strava API access
- Strava API credentials
- Webhook endpoint (for real-time updates)

### Environment Variables
```env
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_WEBHOOK_SECRET=your_webhook_secret
STRAVA_REDIRECT_URI=http://your-domain/api/strava/callback
```

## API Endpoints

### Authentication

```http
GET /api/strava/auth
```
Initiates the Strava OAuth flow.

### Callback

```http
GET /api/strava/callback
```
Handles the OAuth callback from Strava.

### Webhook

```http
POST /api/strava/webhook
```
Receives real-time activity updates from Strava.

## Implementation

### OAuth Flow

1. **Authorization Request**
```javascript
const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=activity:read_all`;
```

2. **Token Exchange**
```javascript
const response = await axios.post('https://www.strava.com/oauth/token', {
  client_id: process.env.STRAVA_CLIENT_ID,
  client_secret: process.env.STRAVA_CLIENT_SECRET,
  code: authorizationCode,
  grant_type: 'authorization_code'
});
```

3. **Token Storage**
```javascript
await db.query(
  'UPDATE users SET strava_token = $1, strava_refresh_token = $2 WHERE user_id = $3',
  [accessToken, refreshToken, userId]
);
```

### Activity Synchronization

1. **Fetch Activities**
```javascript
const activities = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

2. **Map to Habit System**
```javascript
const habitLog = {
  habit_type: 'exercise',
  value: activity.distance,
  metric: 'km',
  extra_data: {
    activity_type: activity.type,
    duration_minutes: activity.moving_time / 60,
    strava_activity_id: activity.id
  }
};
```

## Webhook Implementation

### Webhook Setup
1. Register webhook with Strava
2. Verify webhook signature
3. Process activity updates

### Webhook Handler
```javascript
router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-strava-signature'];
  if (!verifyWebhookSignature(signature, req.body)) {
    return res.status(401).send('Invalid signature');
  }

  const { object_type, object_id, aspect_type } = req.body;
  if (object_type === 'activity' && aspect_type === 'create') {
    await syncActivity(object_id);
  }

  res.status(200).send('OK');
});
```

## Data Mapping

### Activity Types
- Run → Running
- Ride → Cycling
- Swim → Swimming
- Walk → Walking
- Hike → Hiking

### Metrics
- Distance (km)
- Duration (minutes)
- Elevation (m)
- Calories (kcal)

## Error Handling

### Common Errors
- Token expiration
- Rate limiting
- Network issues
- Invalid data

### Error Recovery
1. Refresh token if expired
2. Implement retry logic
3. Log errors for monitoring
4. Notify user of sync issues

## Security

### Token Management
- Secure token storage
- Regular token refresh
- Token revocation on disconnect

### Webhook Security
- Signature verification
- IP whitelisting
- Rate limiting

## Development

### Testing
```bash
# Run Strava integration tests
npm test strava-api
```

### Local Development
1. Set up ngrok for webhook testing
2. Use Strava API sandbox
3. Mock API responses for testing

## Monitoring

### Key Metrics
- Sync success rate
- API response times
- Error rates
- Token refresh success

### Logging
- Activity sync events
- API errors
- Webhook events
- Token refresh attempts

## Contributing

1. Follow the established code style
2. Add tests for new features
3. Update documentation
4. Submit pull requests

## Dependencies
- axios: HTTP client
- jsonwebtoken: JWT handling
- pg: Database interactions
- express: Web server 