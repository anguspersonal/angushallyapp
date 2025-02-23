const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} message - Email body
 */
async function sendEmail(to, subject, message) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text: message,
        });

        // console.log(`✅ Email sent successfully to: ${to}`);
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error);
    }
}

/**
 * Sends an email to the app owner with the user's inquiry
 */
async function sendInquiryToOwner(name, email, subject, message) {
    const ownerEmail = process.env.RECIPIENT_EMAIL;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    await sendEmail(ownerEmail, `New Inquiry: ${subject}`, body);
}

/**
 * Sends an acknowledgment email to the user who submitted the inquiry
 */
async function sendAcknowledgmentToUser(name, email, message) {
    const body = `Hi ${name},\n\nThank you for reaching out! We’ve received your message:\n\n"${message}"\n\nWe’ll get back to you shortly.\n\nBest regards,\nAngus`;
    await sendEmail(email, "We’ve received your message!", body);
}

module.exports = { sendInquiryToOwner, sendAcknowledgmentToUser };
