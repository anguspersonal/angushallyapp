const nodemailer = require('nodemailer');
const config = require('../config');

/**
 * Creates a configured email transporter
 * @returns {nodemailer.Transporter} Configured nodemailer transporter
 */
function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email.user,
            pass: config.email.password
        }
    });
}

/**
 * Sends an email using the configured transporter
 * @param {Object} options Email options
 * @param {string} options.subject Email subject
 * @param {string} options.text Plain text content
 * @param {string} [options.html] HTML content (optional)
 * @param {string} [options.to] Recipient email (defaults to configured recipient)
 * @returns {Promise<Object>} Nodemailer send result
 */
async function sendEmail({ subject, text, html, to }) {
    const transporter = createTransporter();
    
    const mailOptions = {
        from: config.email.user,
        to: to || config.email.recipient,
        subject,
        text,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

/**
 * Sends an email to the app owner with the user's inquiry
 */
async function sendInquiryToOwner(name, email, subject, message) {
    const ownerEmail = config.email.recipient;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    await sendEmail({ subject: `New Inquiry: ${subject}`, text: body });
}

/**
 * Sends an acknowledgment email to the user who submitted the inquiry
 */
async function sendAcknowledgmentToUser(name, email, message) {
    const body = `Hi ${name},\n\nThank you for reaching out! We've received your message:\n\n"${message}"\n\nWe'll get back to you shortly.\n\nBest regards,\nAngus`;
    await sendEmail({ subject: "We've received your message!", text: body });
}

/**
 * Sends a contact form submission notification
 * @param {Object} formData Form submission data
 * @param {string} formData.name Sender's name
 * @param {string} formData.email Sender's email
 * @param {string} formData.message Message content
 * @returns {Promise<Object>} Email send result
 */
async function sendContactFormEmail(formData) {
    const subject = `New Contact Form Submission from ${formData.name}`;
    const text = `
        Name: ${formData.name}
        Email: ${formData.email}
        
        Message:
        ${formData.message}
    `;
    const html = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <h3>Message:</h3>
        <p>${formData.message.replace(/\n/g, '<br>')}</p>
    `;

    return sendEmail({ subject, text, html });
}

module.exports = {
    sendInquiryToOwner,
    sendAcknowledgmentToUser,
    sendContactFormEmail
};
