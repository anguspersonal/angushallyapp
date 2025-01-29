const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const router = express.Router();


// POST /api/contact
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

    // Step 4: Set up Nodemailer (assuming email sending is already working)
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email to app owner
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: `Contact Form: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    // Send acknowledgment email to user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `We’ve received your message!`,
      text: `Hi ${name},\n\nThank you for reaching out! We’ve received your message:\n\n"${message}"\n\nWe’ll get back to you shortly.\n\nBest regards,\nAngus`,
    });

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

module.exports = router;
