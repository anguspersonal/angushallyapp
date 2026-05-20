import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { buildSmtpAuthConfig } from '@/lib/email/authConfig';

let transporter: Transporter | null = null;

function createTransporter(): Transporter {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const auth = buildSmtpAuthConfig();

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
 * Escapes the five HTML-significant characters so user-submitted text
 * can be safely interpolated into an HTML email body.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  if (!ownerEmail) {
    throw new Error('RECIPIENT_EMAIL is not configured');
  }
  const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  const subject = `New Inquiry from ${name}`;
  await sendEmail({ subject, text: body, to: ownerEmail, replyTo: email });
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
 *
 * @remarks
 * Kept for backwards compatibility with older callers; the contact route
 * itself uses `sendInquiryToOwner` (plain-text, single email per submission).
 * The HTML body escapes all user-submitted fields to defend against
 * HTML/script injection into the owner's inbox.
 */
export async function sendContactFormEmail(formData: {
  name: string;
  email: string;
  message: string;
}) {
  const safeName = escapeHtml(formData.name);
  const safeEmail = escapeHtml(formData.email);
  const safeMessage = escapeHtml(formData.message).replace(/\n/g, '<br>');
  const subject = `New Contact Form Submission from ${formData.name}`;
  const text = `
        Name: ${formData.name}
        Email: ${formData.email}

        Message:
        ${formData.message}
    `;
  const html = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <h3>Message:</h3>
        <p>${safeMessage}</p>
    `;

  return sendEmail({ subject, text, html, replyTo: formData.email });
}
