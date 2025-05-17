const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendInquiryToOwner, sendAcknowledgmentToUser, sendContactFormEmail } = require('../utils/sendEmail');
const config = require('../../config/env');
const db = require('../db');
// const createOrRetrieveCustomer = require('../utils/createCustomer'); // Removed: No longer creating/retrieving customer for basic inquiry

const router = express.Router();

// Validation middleware
const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('recaptchaToken').notEmpty().withMessage('reCAPTCHA verification required')
];

// Verify reCAPTCHA token
async function verifyRecaptcha(token) {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${config.security.recaptchaSecret}&response=${token}`,
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// POST /api/contact (Handles form submissions)
// Note that /api/contact is already defined in index.js so the route here can be just '/'
router.post('/', validateContact, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify reCAPTCHA
    const recaptchaValid = await verifyRecaptcha(req.body.recaptchaToken);
    if (!recaptchaValid) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }

    const { name, email, message } = req.body;

    // Send notification to owner
    await sendInquiryToOwner(name, email, message);
    
    // Send acknowledgment to user
    await sendAcknowledgmentToUser(name, email, message);

    // Send detailed form submission
    await sendContactFormEmail({ name, email, message });

    res.json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ error: 'Failed to process contact form submission' });
  }
});

module.exports = router;
