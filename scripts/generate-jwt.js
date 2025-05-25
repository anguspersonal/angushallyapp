require('../config/env');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Generate a JWT token for a specific user
function generateToken(userId, email) {
    const token = jwt.sign(
        { 
            userId: userId,
            email: email
        },
        config.auth.jwtSecret,
        { expiresIn: '24h' }
    );
    
    return token;
}

// Get user details from command line or use default
const userId = process.argv[2] || '569fcc48-8e43-4723-908f-e3b153778a0c';
const email = process.argv[3] || 'angus.hally@gmail.com';

const token = generateToken(userId, email);

console.log('Generated JWT Token for testing:\n');
console.log('User ID:', userId);
console.log('Email:', email);
console.log('\nToken:');
console.log(token);
console.log('\nUse this token in the Authorization header:');
console.log(`Authorization: Bearer ${token}`);
console.log('\nExample curl command:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/raindrop/verify`); 