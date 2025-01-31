const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const db = require('../db');
const createOrRetrieveCustomer = require('../utils/createCustomer'); // Import customer function
const { sendInquiryToOwner, sendAcknowledgmentToUser } = require('../utils/sendEmail'); // Import email utils
const router = express.Router();


// POST /api/contact (Handles form submissions)
// Note that /api/contact is already defined in index.js so the route here can be just '/'
router.post('/', async (req, res) => {
  const { name, email, subject, message, captcha } = req.body;

  // Step 1: Check if all fields are present
  if (!name || !email || !subject || !message || !captcha) {
    return res.status(400).json({ error: 'All fields and CAPTCHA are required.' });
  }

  try {
    // Step 2: Verify CAPTCHA with Google
    const captchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const captchaResponse = await axios.post(captchaVerifyUrl, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY, // Your secret key from Google reCAPTCHA
        response: captcha, // User's CAPTCHA response from frontend
      },
    });

    // Step 3: Check if CAPTCHA verification passed
    if (!captchaResponse.data.success) {
      return res.status(400).json({ error: 'CAPTCHA verification failed.' });
    }

    // Step 4: Create or retrieve customer
    let customerId;
    try {
      customerId = await createOrRetrieveCustomer(name, email);
    } catch (error) {
      console.error("❌ Error creating/retrieving customer:", error);
      return res.status(500).json({ error: 'Failed to process customer information.' });
    }
    // Step 5: Save message to database
    try {
      await db.query(
        'INSERT INTO inquiries (customer_id, subject, message, captcha_token) VALUES ($1, $2, $3, $4)',
        [customerId, subject, message, captcha]
      );
      console.log('✅ Inquiry successfully stored in database');
    } catch (error) {
      console.error("❌ Error inserting inquiry into database:", error);
      return res.status(500).json({ error: 'Failed to store inquiry.' });
    }

    // Step 6: Send emails Asynchronously 
    sendInquiryToOwner(name, email, subject, message);
    sendAcknowledgmentToUser(name, email, message);

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('❌ Unexpected error in contact route:', error);
    res.status(500).json({ error: 'Unexpected server error.' });
  }
});

module.exports = router;
