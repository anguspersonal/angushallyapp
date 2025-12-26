const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendInquiryToOwner, sendAcknowledgmentToUser, sendContactFormEmail } = require('../utils/sendEmail');
const config = require('../config');
const { httpClient } = require('../http/client');
const db = require('../db');
const { createLogger } = require('../observability/logger');
// const createOrRetrieveCustomer = require('../utils/createCustomer'); // Removed: No longer creating/retrieving customer for basic inquiry

const router = express.Router();

// Validation middleware
const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('recaptchaToken').notEmpty().withMessage('reCAPTCHA verification required')
];

function buildContactRouter(deps = {}) {
  const router = express.Router();
  const client = deps.httpClient || httpClient;
  const appConfig = deps.config || config;
  const logger = deps.logger || createLogger({ service: 'contact-router', environment: appConfig.nodeEnv });

  // Verify reCAPTCHA token
  async function verifyRecaptcha(token, remoteip, log, correlationId) {
    try {
      const response = await client.post(
        appConfig.security.verifyUrl,
        new URLSearchParams({ secret: appConfig.security.recaptchaSecret, response: token, remoteip }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      return response.data;
    } catch (error) {
      log.error('reCAPTCHA verification error', { correlationId, error });
      throw new Error('recaptcha_verification_error');
    }
  }

  function isTokenValidationError(errorCodes = []) {
    const tokenErrors = new Set(['invalid-input-response', 'missing-input-response', 'timeout-or-duplicate']);

    if (errorCodes.length === 0) {
      return true;
    }

    return errorCodes.every((code) => tokenErrors.has(code));
  }

  // POST /api/contact (Handles form submissions)
  // Note that /api/contact is already defined in index.js so the route here can be just '/'
  router.post('/', validateContact, async (req, res) => {
    const correlationId = req.context?.correlationId || req.requestId;
    const scopedLogger = req.logger || logger;

    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Verify reCAPTCHA
      const verificationResult = await verifyRecaptcha(
        req.body.recaptchaToken,
        req.ip,
        scopedLogger,
        correlationId
      );

      const errorCodes = verificationResult?.['error-codes'] || [];

      if (!verificationResult?.success) {
        if (isTokenValidationError(errorCodes)) {
          scopedLogger.warn('Invalid reCAPTCHA token', { correlationId, errorCodes });
          return res.status(400).json({ error: 'reCAPTCHA verification failed' });
        }

        scopedLogger.error('reCAPTCHA upstream verification error', { correlationId, errorCodes });
        return res.status(502).json({ error: 'Failed to verify reCAPTCHA token' });
      }

      if (errorCodes.length > 0) {
        scopedLogger.warn('reCAPTCHA returned warnings', { correlationId, errorCodes });
        return res.status(400).json({ error: 'reCAPTCHA verification failed' });
      }

      const { name, email, message } = req.body;

      // Send notification to owner
      await sendInquiryToOwner({ name, email, message });

      // Send acknowledgment to user
      await sendAcknowledgmentToUser(name, email, message);

      // Send detailed form submission
      await sendContactFormEmail({ name, email, message });

      res.json({ message: 'Contact form submitted successfully' });
    } catch (error) {
      scopedLogger.error('Contact form submission error', { correlationId, error });

      const status = error.message === 'recaptcha_verification_error' ? 502 : 500;
      res.status(status).json({ error: 'Failed to process contact form submission' });
    }
  });

  return router;
}

module.exports = buildContactRouter;
