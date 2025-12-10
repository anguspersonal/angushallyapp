const express = require('express');
const { validateEmail, validatePassword } = require('../utils/validators');
const router = express.Router();

router.post('/register', (req, res) => {
  const { email, password } = req.body;
  
  // Validate email format
  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email format'
    });
  }
  
  // Validate password requirements
  if (!password || !validatePassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and contain at least 1 number and 1 special character'
    });
  }
  
  // TODO: Add user registration logic here
  
  res.status(201).json({
    message: 'User registered successfully'
  });
});

module.exports = router;