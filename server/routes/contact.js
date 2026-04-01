const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendInquiryToOwner, sendAcknowledgmentToUser, sendContactFormEmail } = require('../utils/sendEmail');
const config = require('../config');
const { httpClient } = require('../http/client');
const { createLogger } = require('../observability/logger');
const {
  isRecaptchaTokenValidationError,
  verifyRecaptchaToken,
} = require('../utils/recaptchaSiteVerify');

// Validation middleware
const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('recaptchaToken').notEmpty().withMessage('reCAPTCHA verification required'),
];

function buildContactRouter(deps = {}) {
  const router = express.Router();
  const client = deps.httpClient || httpClient;
  const appConfig = deps.config || config;
  const logger = deps.logger || createLogger({ service: 'contact-router', environment: appConfig.nodeEnv });

  router.post('/', validateContact, async (req, res) => {
    const correlationId = req.context?.correlationId || req.requestId;
    const scopedLogger = req.logger || logger;

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const verificationResult = await verifyRecaptchaToken({
        httpClient: client,
        verifyUrl: appConfig.security.verifyUrl,
        secret: appConfig.security.recaptchaSecret,
        token: req.body.recaptchaToken,
        remoteip: req.ip,
        logger: scopedLogger,
        correlationId,
      });

      const errorCodes = verificationResult?.['error-codes'] || [];

      if (!verificationResult?.success) {
        if (isRecaptchaTokenValidationError(errorCodes)) {
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

      await sendInquiryToOwner({ name, email, message });
      await sendAcknowledgmentToUser(name, email, message);
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
