const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const config = require('../../config/env');

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
    const existingUser = await db.query(
      'SELECT id FROM identity.users WHERE email = $1 AND auth_provider = $2',
      [email, 'local']
    );

    if (existingUser.rows.length > 0) {
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

    // Assign default role (assuming 'user' role exists)
    await db.query(
      `INSERT INTO identity.user_roles (user_id, role_id)
       SELECT $1, id FROM identity.roles WHERE name = 'user'`,
      [result.rows[0].id]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name
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

    const user = result.rows[0];

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
      { expiresIn: '24h' }
    );

    res.json({
      token,
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
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: config.auth.google.clientId
    });

    const payload = ticket.getPayload();
    const { sub: googleSub, email, given_name: firstName, family_name: lastName } = payload;

    // Check if user exists
    let result = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
              ARRAY_AGG(r.name) as roles
       FROM identity.users u
       LEFT JOIN identity.user_roles ur ON u.id = ur.user_id
       LEFT JOIN identity.roles r ON ur.role_id = r.id
       WHERE u.google_sub = $1 OR (u.email = $2 AND u.auth_provider = 'google')
       GROUP BY u.id`,
      [googleSub, email]
    );

    let user = result.rows[0];

    if (!user) {
      // Create new user
      result = await db.query(
        `INSERT INTO identity.users 
         (email, auth_provider, google_sub, first_name, last_name, is_active, email_verified_at)
         VALUES ($1, 'google', $2, $3, $4, true, CURRENT_TIMESTAMP)
         RETURNING id, email, first_name, last_name`,
        [email, googleSub, firstName, lastName]
      );

      // Assign default role
      await db.query(
        `INSERT INTO identity.user_roles (user_id, role_id)
         SELECT $1, id FROM identity.roles WHERE name = 'user'`,
        [result.rows[0].id]
      );

      // Get user with roles
      result = await db.query(
        `SELECT u.id, u.email, u.first_name, u.last_name, ARRAY_AGG(r.name) as roles
         FROM identity.users u
         LEFT JOIN identity.user_roles ur ON u.id = ur.user_id
         LEFT JOIN identity.roles r ON ur.role_id = r.id
         WHERE u.id = $1
         GROUP BY u.id`,
        [result.rows[0].id]
      );

      user = result.rows[0];
    } else if (!user.is_active) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Update last login timestamp
    await db.query(
      'UPDATE identity.users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roles: user.roles
      },
      config.auth.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 