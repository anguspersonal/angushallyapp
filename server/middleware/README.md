# Authentication Middleware

This middleware handles user authentication using Google OAuth 2.0 and JWT tokens. It provides secure user authentication, role-based access control, and data isolation for the application.

## Features

- Google OAuth 2.0 integration
- JWT token generation and validation
- User session management
- "Remember me" functionality
- Secure token storage
- Automatic token refresh
- Role-based access control (RBAC)
- Data isolation by user ID

## Implementation

### Google OAuth Flow

1. **Initial Authentication**
   ```javascript
   // Frontend initiates Google Sign-In
   const response = await google.accounts.oauth2.initTokenClient({
     client_id: process.env.GOOGLE_CLIENT_ID,
     scope: 'email profile',
     callback: (response) => {
       // Handle the response
     }
   });
   ```

2. **Token Verification**
   ```javascript
   // Backend verifies the token
   const ticket = await client.verifyIdToken({
     idToken: token,
     audience: process.env.GOOGLE_CLIENT_ID
   });
   ```

3. **User Creation/Update**
   ```javascript
   // Create or update user in database
   const user = await db.query(
     'INSERT INTO users (email, name, google_id, is_active) VALUES ($1, $2, $3, true) ON CONFLICT (google_id) DO UPDATE SET last_login = CURRENT_TIMESTAMP RETURNING *',
     [email, name, googleId]
   );
   ```

### JWT Token Management

1. **Token Generation**
   ```javascript
   const token = jwt.sign(
     { 
       userId: user.id,
       email: user.email,
       roles: user.roles
     },
     process.env.JWT_SECRET,
     { expiresIn: '24h' }
   );
   ```

2. **Token Validation**
   ```javascript
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   ```

### Role-Based Access Control

1. **Role Definition**
   ```javascript
   const roles = {
     ADMIN: 'admin',
     USER: 'user',
     GUEST: 'guest'
   };
   ```

2. **Route Protection**
   ```javascript
   const requireRole = (role) => {
     return (req, res, next) => {
       if (!req.user.roles.includes(role)) {
         return res.status(403).json({ error: 'Insufficient permissions' });
       }
       next();
     };
   };
   ```

3. **Usage Example**
   ```javascript
   router.post('/admin/users', 
     authMiddleware(),
     requireRole('admin'),
     (req, res) => {
       // Admin-only route
     }
   );
   ```

### Data Isolation

1. **User-Specific Data**
   ```javascript
   // Example: Habit logs query
   const getHabitLogs = async (userId) => {
     return await db.query(
       'SELECT * FROM habit.habit_log WHERE user_id = $1',
       [userId]
     );
   };
   ```

2. **Public Data Access**
   ```javascript
   // Example: Public blog posts
   const getPublicPosts = async () => {
     return await db.query(
       'SELECT * FROM public.posts WHERE is_public = true'
     );
   };
   ```

## Usage

### Protecting Routes

```javascript
const { authMiddleware } = require('./middleware/auth');

// Apply to all routes
router.use(authMiddleware());

// Or apply to specific routes
router.get('/protected', authMiddleware(), (req, res) => {
  // Access user data from req.user
  const userId = req.user.userId;
});
```

### Accessing User Data

The middleware adds user information to the request object:

```javascript
// In your route handler
router.get('/profile', authMiddleware(), (req, res) => {
  const { userId, email, roles } = req.user;
  // Use user data
});
```

## Security Considerations

### Token Storage
- Tokens are stored in:
  - `localStorage` for "Remember me"
  - `sessionStorage` for regular sessions
- Tokens are automatically removed on:
  - Logout
  - Expiration
  - Invalid token

### Error Handling
```javascript
try {
  // Authentication logic
} catch (error) {
  if (error.name === 'TokenExpiredError') {
    // Handle expired token
  } else if (error.name === 'JsonWebTokenError') {
    // Handle invalid token
  }
}
```

## Configuration

### Environment Variables
```env
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
```

### Options
```javascript
const authOptions = {
  tokenExpiration: '24h',
  rememberMeExpiration: '7d',
  refreshTokenExpiration: '30d'
};
```

## Development

### Testing
```bash
# Run authentication tests
npm test middleware/auth.test.js
```

### Adding New Authentication Methods
1. Create a new authentication strategy
2. Implement token generation and validation
3. Add user creation/update logic
4. Update the middleware to handle the new method

## Dependencies
- `google-auth-library`: Google OAuth verification
- `jsonwebtoken`: JWT handling
- `express`: Middleware integration
- `pg`: Database interactions

## Contributing
1. Follow the established code style
2. Add tests for new features
3. Update documentation
4. Submit a pull request 