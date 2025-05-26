const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db');
const config = require('../../config/env');

const client = new OAuth2Client(config.auth.google.clientId);

// Test user for development/testing
const TEST_USER = {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['member'],
    is_active: true
};

/**
 * Verify Google OAuth token and return user data
 */
async function verifyGoogleToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: config.auth.google.clientId
        });
        const payload = ticket.getPayload();
        return {
            googleSub: payload.sub,
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
            picture: payload.picture
        };
    } catch (error) {
        console.error('Error verifying Google token:', error);
        throw new Error('Invalid token');
    }
}

/**
 * Middleware to authenticate requests using JWT
 * Supports both JWT tokens and Google OAuth tokens
 * Checks Authorization header first, then falls back to cookies
 * In test mode (NODE_ENV=test), accepts a test token
 */
function authMiddleware(options = {}) {
    return async (req, res, next) => {
        try {
            let token = null;
            
            // First, try to get token from Authorization header
            const authHeader = req.headers.authorization;
            if (authHeader) {
                const [bearer, headerToken] = authHeader.split(' ');
                if (bearer === 'Bearer' && headerToken) {
                    token = headerToken;
                }
            }
            
            // If no token in header, try cookies
            if (!token && req.cookies) {
                // Check for 'Authorization' cookie (format: "Bearer <token>")
                if (req.cookies.Authorization) {
                    const [bearer, cookieToken] = req.cookies.Authorization.split(' ');
                    if (bearer === 'Bearer' && cookieToken) {
                        token = cookieToken;
                    }
                }
                // Also check for 'auth_token' cookie (direct token)
                else if (req.cookies.auth_token) {
                    token = req.cookies.auth_token;
                }
            }
            
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }

            // Special handling for test mode
            if (process.env.NODE_ENV === 'test' && token === 'test-token') {
                req.user = TEST_USER;
                return next();
            }

            try {
                // First try to verify as JWT
                const decoded = jwt.verify(token, config.auth.jwtSecret);
                
                // Get fresh user data from database
                const result = await db.query(
                    `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
                            ARRAY_AGG(r.name) as roles
                     FROM identity.users u
                     LEFT JOIN identity.user_roles ur ON u.id = ur.user_id
                     LEFT JOIN identity.roles r ON ur.role_id = r.id
                     WHERE u.id = $1
                     GROUP BY u.id`,
                    [decoded.userId]
                );

                const user = result[0];
                if (!user) {
                    return res.status(401).json({ error: 'User not found' });
                }

                if (!user.is_active) {
                    return res.status(403).json({ error: 'Account is inactive' });
                }

                // Attach user data to request
                req.user = {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    roles: user.roles
                };

                return next();
            } catch (jwtError) {
                // If JWT verification fails, try Google token
                if (options.allowGoogleAuth !== false) {
                    try {
                        const userData = await verifyGoogleToken(token);
                        
                        // Get user from database
                        const result = await db.query(
                            `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
                                    ARRAY_AGG(r.name) as roles
                             FROM identity.users u
                             LEFT JOIN identity.user_roles ur ON u.id = ur.user_id
                             LEFT JOIN identity.roles r ON ur.role_id = r.id
                             WHERE u.google_sub = $1
                             GROUP BY u.id`,
                            [userData.googleSub]
                        );

                        const user = result[0];
                        if (!user) {
                            return res.status(401).json({ error: 'User not found' });
                        }

                        if (!user.is_active) {
                            return res.status(403).json({ error: 'Account is inactive' });
                        }

                        // Attach user data to request
                        req.user = {
                            id: user.id,
                            email: user.email,
                            firstName: user.first_name,
                            lastName: user.last_name,
                            roles: user.roles
                        };

                        return next();
                    } catch (googleError) {
                        return res.status(401).json({ error: 'Invalid token' });
                    }
                } else {
                    return res.status(401).json({ error: 'Invalid token' });
                }
            }
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
}

/**
 * Middleware to check if user has required roles
 */
function requireRoles(roles) {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const hasRequiredRole = roles.some(role => req.user.roles.includes(role));
        if (!hasRequiredRole) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
}

module.exports = {
    authMiddleware,
    verifyGoogleToken,
    requireRoles
}; 