import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildAuthConfig(): any {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const oauthIntended = Boolean(clientId || clientSecret || refreshToken);

  if (oauthIntended) {
    const missing: string[] = [];
    if (!user) missing.push('SMTP_USER');
    if (!clientId) missing.push('GOOGLE_OAUTH_CLIENT_ID');
    if (!clientSecret) missing.push('GOOGLE_OAUTH_CLIENT_SECRET');
    if (!refreshToken) missing.push('GOOGLE_OAUTH_REFRESH_TOKEN');

    if (missing.length) {
      throw new Error(`Email OAuth2 configuration incomplete; missing ${missing.join(', ')}.`);
    }

    return {
      type: 'OAuth2',
      user: user!,
      clientId: clientId!,
      clientSecret: clientSecret!,
      refreshToken: refreshToken!,
    };
  }

  if (user && pass) {
    return { user, pass };
  }

  throw new Error(
    'Email authentication is not configured; please provide OAuth2 or password credentials.'
  );
}

function createTransporter(): Transporter {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const auth = buildAuthConfig();

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth,
  });
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

export interface SendEmailOptions {
  subject: string;
  text: string;
  html?: string;
  to?: string;
  replyTo?: string;
}

/**
 * Sends an email using the configured transporter.
 */
export async function sendEmail({ subject, text, html, to, replyTo }: SendEmailOptions) {
  const activeTransporter = getTransporter();
  const from = process.env.SMTP_USER;
  const defaultTo = process.env.RECIPIENT_EMAIL;

  const mailOptions = {
    from,
    to: to || defaultTo,
    replyTo,
    subject,
    text,
    html,
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
 * Sends an email to the app owner with the user's inquiry.
 */
export async function sendInquiryToOwner({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const ownerEmail = process.env.RECIPIENT_EMAIL;
  const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  const subject = `New Inquiry from ${name}`;
  await sendEmail({ subject, text: body, to: ownerEmail });
}

/**
 * Sends an acknowledgment email to the user who submitted the inquiry.
 */
export async function sendAcknowledgmentToUser(name: string, email: string, message: string) {
  const body = `Hi ${name},\n\nThank you for reaching out! We've received your message:\n\n"${message}"\n\nWe'll get back to you shortly.\n\nBest regards,\nAngus`;
  await sendEmail({ subject: "We've received your message!", text: body, to: email });
}

/**
 * Sends a contact form submission notification to the owner.
 */
export async function sendContactFormEmail(formData: {
  name: string;
  email: string;
  message: string;
}) {
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
