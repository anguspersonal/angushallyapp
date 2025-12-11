const nodemailer = require('nodemailer');

jest.mock('../config', () => ({
  email: {
    user: 'no-reply@example.com',
    password: 'password',
    recipient: 'owner@example.com',
  },
}));

const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'mock-id' });
const createTransportMock = jest.fn(() => ({ sendMail: sendMailMock }));

jest.mock('nodemailer', () => ({
  createTransport: (...args) => createTransportMock(...args),
}));

describe('sendAcknowledgmentToUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('passes the submitter email to sendEmail', async () => {
    const { sendAcknowledgmentToUser } = require('../utils/sendEmail');

    await sendAcknowledgmentToUser('Test User', 'user@example.com', 'Hello!');

    expect(createTransportMock).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com' }),
    );
  });
});

describe('sendInquiryToOwner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('sends the inquiry to the configured recipient with a contextual subject', async () => {
    const { sendInquiryToOwner } = require('../utils/sendEmail');

    await sendInquiryToOwner('Owner Name', 'sender@example.com', 'Message body');

    expect(createTransportMock).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'owner@example.com',
        subject: 'New Inquiry from Owner Name',
        text: expect.stringContaining('Message body'),
      }),
    );
  });
});
