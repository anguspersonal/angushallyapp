const express = require('express');
const request = require('supertest');

jest.mock('../utils/sendEmail', () => ({
  sendInquiryToOwner: jest.fn().mockResolvedValue(),
  sendAcknowledgmentToUser: jest.fn().mockResolvedValue(),
  sendContactFormEmail: jest.fn().mockResolvedValue(),
}));

describe('contact route', () => {
  let buildContactRouter;
  let sendEmailUtils;
  let httpClient;
  let appConfig;
  let logger;

  beforeEach(() => {
    jest.resetModules();
    sendEmailUtils = require('../utils/sendEmail');
    buildContactRouter = require('../routes/contact');

    httpClient = {
      post: jest.fn().mockResolvedValue({ data: { success: true, 'error-codes': [] } }),
    };

    appConfig = {
      security: { verifyUrl: 'https://example.com/verify', recaptchaSecret: 'secret' },
      nodeEnv: 'test',
    };

    logger = {
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    };
  });

  test('passes the submitter email to the acknowledgment sender', async () => {
    const router = buildContactRouter({ httpClient, config: appConfig, logger });
    const app = express();
    app.use(express.json());
    app.use('/', router);

    const formPayload = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hello there',
      recaptchaToken: 'valid-token',
    };

    const response = await request(app).post('/').send(formPayload);

    expect(response.status).toBe(200);
    expect(sendEmailUtils.sendInquiryToOwner).toHaveBeenCalledWith(
      formPayload.name,
      formPayload.email,
      formPayload.message,
    );
    expect(sendEmailUtils.sendAcknowledgmentToUser).toHaveBeenCalledWith(
      formPayload.name,
      formPayload.email,
      formPayload.message,
    );
  });
});
