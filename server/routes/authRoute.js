const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const config = require('../../config/env');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const googleClient = new OAuth2Client(config.auth.google.clientId);

// Validation middleware for registration
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
];

// Validation middleware for login
const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

/**
 * Register a new user with email/password
 */
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUsers = await db.query(
      'SELECT id FROM identity.users WHERE email = $1 AND auth_provider = $2',
      [email, 'local']
    );

    const existingUser = existingUsers[0];

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const result = await db.query(
      `INSERT INTO identity.users
       (email, password_hash, auth_provider, first_name, last_name, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, email, first_name, last_name`,
      [email, passwordHash, 'local', firstName, lastName]
    );

    if (!Array.isArray(result) || result.length === 0) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    const createdUser = result[0];

    // Assign default role (assuming 'user' role exists)
    await db.query(
      `INSERT INTO identity.user_roles (user_id, role_id)
       SELECT $1, id FROM identity.roles WHERE name = 'user'`,
      [createdUser.id]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: createdUser.id,
        email: createdUser.email,
        firstName: createdUser.first_name,
        lastName: createdUser.last_name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Login with email/password
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Get user with their roles
    const result = await db.query(
      `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.is_active,
              ARRAY_AGG(r.name) as roles
       FROM identity.users u
       LEFT JOIN identity.user_roles ur ON u.id = ur.user_id
       LEFT JOIN identity.roles r ON ur.role_id = r.id
       WHERE u.email = $1 AND u.auth_provider = $2
       GROUP BY u.id`,
      [email, 'local']
    );

    const user = Array.isArray(result) && result.length > 0 ? result[0] : null;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login timestamp
    await db.query(
      'UPDATE identity.users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roles: user.roles
      },
      config.auth.jwtSecret,
      { expiresIn: '7d' }
    );

    // Set JWT as secure HttpOnly cookie
    res.cookie('jwt_token', token, {
      httpOnly: true,
      secure: config.server.isProduction,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Google OAuth callback
 */
router.post('/google', async (req, res) => {
  try {
    const { token, credential } = req.body;
    const idToken = token || credential; // Support both 'token' and 'credential' field names
    
    if (!idToken) {
      console.error('No token provided in request body');
      return res.status(400).json({ error: 'No authentication token provided' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: config.auth.google.clientId
    }).catch(error => {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    });

    const payload = ticket.getPayload();
    if (!payload) {
      console.error('No payload in Google token');
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const { sub: googleSub, email, given_name: firstName, family_name: lastName } = payload;
    console.log('Google auth payload:', { googleSub, email, firstName, lastName });

    let client;
    let user = null;

    try {
      client = await db.pool.connect();
      await client.query('BEGIN');

      // First, check if a user exists with this Google sub
      const googleUserResult = await client.query(
        `SELECT id, email, auth_provider, google_sub, first_name, last_name, is_active
         FROM identity.users
         WHERE google_sub = $1`,
        [googleSub]
      );

      const googleUser = googleUserResult.rows?.[0];

      if (googleUser) {
        // User exists with this Google account
        user = googleUser;
      } else {
        // Check if user exists with this email
        const emailUserResult = await client.query(
          `SELECT id, email, auth_provider, google_sub, first_name, last_name, is_active
           FROM identity.users
           WHERE email = $1
           ORDER BY created_at ASC
           LIMIT 1`,
          [email]
        );

        const existingUser = emailUserResult.rows?.[0];

        if (existingUser) {

          // If the existing user has no Google sub, update it
          if (!existingUser.google_sub) {
            const updateResult = await client.query(
              `UPDATE identity.users
               SET google_sub = $1,
                   auth_provider = 'google',
                   first_name = COALESCE($2, first_name),
                   last_name = COALESCE($3, last_name),
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = $4
               RETURNING id, email, first_name, last_name, google_sub, is_active`,
              [googleSub, firstName, lastName, existingUser.id]
            );

            if (!updateResult.rows?.[0]) {
              throw new Error('Failed to update existing user');
            }

            user = updateResult.rows[0];
          } else {
            // User exists with a different auth provider and already has a Google sub
            await client.query('ROLLBACK');
            return res.status(409).json({
              error: 'Account exists with different auth provider',
              details: `This email is already registered using ${existingUser.auth_provider} authentication`
            });
          }
        } else {
          // Create new user
          const userResult = await client.query(
            `INSERT INTO identity.users
             (email, auth_provider, google_sub, first_name, last_name, is_active, email_verified_at)
             VALUES ($1, 'google', $2, $3, $4, true, CURRENT_TIMESTAMP)
             RETURNING id, email, first_name, last_name, google_sub, is_active`,
            [email, googleSub, firstName, lastName]
          );

          if (!userResult.rows?.[0]) {
            throw new Error('Failed to create new user record');
          }

          user = userResult.rows[0];

          // Assign default role
          await client.query(
            `INSERT INTO identity.user_roles (user_id, role_id)
             SELECT $1, id FROM identity.roles WHERE name = 'user'`,
            [user.id]
          );
        }
      }

      if (!user.is_active) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Account is inactive' });
      }

      // Get user roles
      const userWithRoles = await client.query(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.google_sub,
                ARRAY_REMOVE(ARRAY_AGG(r.name), NULL) as roles
         FROM identity.users u
         LEFT JOIN identity.user_roles ur ON u.id = ur.user_id
         LEFT JOIN identity.roles r ON ur.role_id = r.id
         WHERE u.id = $1
         GROUP BY u.id, u.email, u.first_name, u.last_name, u.google_sub`,
        [user.id]
      );

      if (!userWithRoles.rows?.[0]) {
        throw new Error('Failed to retrieve user data');
      }

      user = userWithRoles.rows[0];
      user.roles = user.roles || [];

      // Update last login timestamp
      await client.query(
        'UPDATE identity.users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      await client.query('COMMIT');

      // Generate JWT token
      const jwtToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          roles: user.roles
        },
        config.auth.jwtSecret,
        { expiresIn: '7d' }
      );

      // Set JWT as secure HttpOnly cookie
      res.cookie('jwt_token', jwtToken, {
        httpOnly: true,
        secure: config.server.isProduction,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });

      // Prepare response
      const response = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          roles: user.roles
        }
      };

      console.log('Successful authentication for:', email);
      res.json(response);
    } catch (dbError) {
      if (client) {
        await client.query('ROLLBACK');
      }
      console.error('Database operation failed:', dbError);
      throw dbError;
    } finally {
      if (client) {
        client.release();
      }
    }
  } catch (error) {
    console.error('Google auth error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    if (error.message === 'Invalid Google token') {
      res.status(401).json({ error: 'Invalid authentication token' });
    } else if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Authentication token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid authentication token' });
    } else if (error.code === '23505') {
      res.status(409).json({ 
        error: 'User already exists with this email',
        details: error.detail
      });
    } else {
      res.status(500).json({ 
        error: 'Authentication failed. Please try again.',
        details: error.message
      });
    }
  }
});

/**
 * Logout - clear authentication cookie
 */
router.post('/logout', async (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie('jwt_token', {
      httpOnly: true,
      secure: config.server.isProduction,
      sameSite: 'Strict',
      path: '/'
    });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Verify authentication status
 */
router.get('/verify', authMiddleware(), async (req, res) => {
  try {
    // Since we're using authMiddleware, if we get here, the user is authenticated
    // and req.user is populated
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      roles: req.user.roles
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
