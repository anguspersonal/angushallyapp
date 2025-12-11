const nodemailer = require('nodemailer');

jest.mock('nodemailer');
jest.mock('../config', () => ({
  email: {
    user: 'sender@example.com',
    password: 'password',
    recipient: 'owner@example.com',
  },
  nodeEnv: 'test',
}));

describe('sendEmail utilities', () => {
  let sendMailMock;
  let sendInquiryToOwner;
  let sendContactFormEmail;
  let sendAcknowledgmentToUser;

  beforeEach(() => {
    jest.resetModules();
    sendMailMock = jest.fn().mockResolvedValue({ messageId: 'abc123' });
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
    ({ sendInquiryToOwner, sendContactFormEmail, sendAcknowledgmentToUser } = require('../utils/sendEmail'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sends inquiry with a fixed subject and full message body', async () => {
    const inquiry = {
      name: 'Alice',
      email: 'alice@example.com',
      message: 'Hello! I would like to know more.',
    };

    await sendInquiryToOwner(inquiry);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'owner@example.com',
        subject: 'New Inquiry from Alice',
        text: expect.stringContaining(inquiry.message),
      })
    );
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining(`Name: ${inquiry.name}`),
      })
    );
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining(`Email: ${inquiry.email}`),
      })
    );
  });

  it('includes the message content in contact form emails', async () => {
    const formData = {
      name: 'Bob',
      email: 'bob@example.com',
      message: 'Great site! Just saying hi.',
    };

    await sendContactFormEmail(formData);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: `New Contact Form Submission from ${formData.name}`,
        text: expect.stringContaining(formData.message),
        html: expect.stringContaining(formData.message),
      })
    );
  });

  it('sends acknowledgment emails to the user email address with their message', async () => {
    const name = 'Carol';
    const email = 'carol@example.com';
    const message = 'Thanks for your help!';

    await sendAcknowledgmentToUser(name, email, message);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: "We've received your message!",
        text: expect.stringContaining(message),
      })
    );
  });
});
