const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate input
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Change if using another provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email to app owner
    await transporter.sendMail({
      from: `"${name}" <${email}>`, // Sender's email (user's email)
      to: process.env.RECIPIENT_EMAIL, // Your email address
      subject: `Contact Form: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    // Send acknowledgment email to user
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // Your email address
      to: email, // User's email
      subject: `We’ve received your message!`,
      text: `Hi ${name},\n\nThank you for reaching out! We’ve received your message:\n\n"${message}"\n\nWe’ll get back to you shortly.\n\nBest regards,\nAngus`,
    });

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

module.exports = router;
