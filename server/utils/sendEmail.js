const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

function buildAuthConfig(emailConfig = config.email.transport) {
    const { oauth = {}, user, password } = emailConfig;

    const oauthUser = oauth.user || user;
    const oauthIntended = Boolean(
        oauth.clientId ||
        oauth.clientSecret ||
        oauth.refreshToken ||
        oauth.accessToken ||
        oauth.accessTokenExpires ||
        oauth.user
    );

    if (oauthIntended) {
        const missing = [];
        if (!oauthUser) missing.push('user');
        if (!oauth.clientId) missing.push('clientId');
        if (!oauth.clientSecret) missing.push('clientSecret');
        if (!oauth.refreshToken) missing.push('refreshToken');

        if (missing.length) {
            throw new Error(`Email OAuth2 configuration incomplete; missing ${missing.join(', ')}.`);
        }

        return {
            type: 'OAuth2',
            user: oauthUser,
            clientId: oauth.clientId,
            clientSecret: oauth.clientSecret,
            refreshToken: oauth.refreshToken,
            accessToken: oauth.accessToken,
            expires: oauth.accessTokenExpires,
        };
    }

    if (password && user) {
        return {
            user,
            pass: password,
        };
    }

    throw new Error('Email authentication is not configured; please provide OAuth2 or password credentials.');
}

function buildTransportOptions(overrides = {}) {
    const emailConfig = config.email.transport;
    const mergedEmailConfig = {
        ...emailConfig,
        ...overrides,
        oauth: { ...emailConfig.oauth, ...(overrides.oauth || {}) },
    };
    const {
        host = mergedEmailConfig.host,
        port = mergedEmailConfig.port,
        secure = mergedEmailConfig.secure,
        pool = true,
        maxConnections = mergedEmailConfig.maxConnections,
        maxMessages = mergedEmailConfig.maxMessages,
        rateLimit = mergedEmailConfig.rateLimit,
        rateDelta = mergedEmailConfig.rateDelta,
    } = overrides;

    return {
        host,
        port,
        secure,
        pool,
        maxConnections,
        maxMessages,
        rateLimit,
        rateDelta,
        auth: buildAuthConfig(mergedEmailConfig),
    };
}

function initTransporter({ createTransport = nodemailer.createTransport, transportOverrides } = {}) {
    if (transporter) {
        throw new Error('Transporter already initialised; use resetTransporter or setTransporter to override.');
    }
    const transportOptions = buildTransportOptions(transportOverrides);
    transporter = createTransport(transportOptions);
    return transporter;
}

function getTransporter() {
    return transporter || initTransporter();
}

function setTransporter(customTransporter) {
    transporter = customTransporter;
    return transporter;
}

function resetTransporter() {
    transporter = null;
}

/**
 * Sends an email using the configured transporter
 * @param {Object} options Email options
 * @param {string} options.subject Email subject
 * @param {string} options.text Plain text content
 * @param {string} [options.html] HTML content (optional)
 * @param {string} [options.to] Recipient email (defaults to configured recipient)
 * @param {string} [options.replyTo] Reply-to email address
 * @returns {Promise<Object>} Nodemailer send result
 */
async function sendEmail({ subject, text, html, to, replyTo }) {
    const activeTransporter = getTransporter();

    const mailOptions = {
        from: config.email.transport.user,
        to: to || config.email.recipients.owner,
        replyTo,
        subject,
        text,
        html
    };

    try {
        const info = await activeTransporter.sendMail(mailOptions);
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
async function sendInquiryToOwner({ name, email, message }) {
    const ownerEmail = config.email.recipient;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const subject = `New Inquiry from ${name}`;
    await sendEmail({ subject, text: body, to: ownerEmail });
}

/**
 * Sends an acknowledgment email to the user who submitted the inquiry
 */
async function sendAcknowledgmentToUser(name, email, message) {
    const body = `Hi ${name},\n\nThank you for reaching out! We've received your message:\n\n"${message}"\n\nWe'll get back to you shortly.\n\nBest regards,\nAngus`;
    await sendEmail({ subject: "We've received your message!", text: body, to: email });
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

    return sendEmail({ subject, text, html, replyTo: formData.email });
}

module.exports = {
    buildAuthConfig,
    initTransporter,
    resetTransporter,
    getTransporter,
    setTransporter,
    buildTransportOptions,
    sendEmail,
    sendInquiryToOwner,
    sendAcknowledgmentToUser,
    sendContactFormEmail
};
