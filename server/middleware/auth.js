const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        return {
            googleUserId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture
        };
    } catch (error) {
        console.error('Error verifying Google token:', error);
        throw new Error('Invalid token');
    }
}

function authMiddleware() {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const userData = await verifyGoogleToken(token);
            req.user = userData;
            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            res.status(401).json({ error: 'Invalid token' });
        }
    };
}

module.exports = {
    authMiddleware,
    verifyGoogleToken
}; 