const request = require('supertest');
const bcrypt = require('bcrypt');
const { createApp } = require('../bootstrap/createApp');
const config = require('../config');
const db = require('../db');

function buildApp() {
  const logger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  return createApp({ config, db, logger });
}

describe('/api/auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('register rejects invalid email and password with shared validators', async () => {
    db.query.mockResolvedValue([]);
    const app = buildApp();

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'short',
        firstName: '',
        lastName: '',
      });

    expect(response.status).toBe(400);
    const messages = response.body.errors.map((error) => error.msg);
    expect(messages).toEqual(
      expect.arrayContaining([
        'Invalid email format',
        'Password must be at least 8 characters long and include a number and special character',
        'First name is required',
        'Last name is required',
      ])
    );
  });

  test('register stores hashed passwords', async () => {
    db.query.mockResolvedValueOnce([]);
    let insertedHash = null;
    db.query.mockImplementationOnce((_sql, params) => {
      insertedHash = params[1];
      return Promise.resolve([
        {
          id: 1,
          email: params[0],
          first_name: 'Alice',
          last_name: 'User',
        },
      ]);
    });
    db.query.mockResolvedValueOnce([]);

    const app = buildApp();
    const password = 'Password1!';

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@example.com',
        password,
        firstName: 'Alice',
        lastName: 'User',
      });

    expect(response.status).toBe(201);
    expect(insertedHash).toBeTruthy();
    expect(insertedHash).not.toEqual(password);
    const matches = await bcrypt.compare(password, insertedHash);
    expect(matches).toBe(true);
  });

  test('login verifies credentials with timing-safe compare', async () => {
    const compareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    db.query.mockResolvedValue([
      {
        id: 10,
        email: 'user@example.com',
        password_hash: 'stored-hash',
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        roles: ['user'],
      },
    ]);

    const app = buildApp();
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'Password1!' });

    expect(response.status).toBe(200);
    expect(compareSpy).toHaveBeenCalledWith('Password1!', 'stored-hash');
  });

  test('auth rate limiter returns generic 429 message', async () => {
    db.query.mockResolvedValue([]);
    const app = buildApp();
    const attempts = 21;
    let lastResponse;

    for (let i = 0; i < attempts; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      lastResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'Password1!' });
    }

    expect(lastResponse.status).toBe(429);
    expect(lastResponse.body).toEqual({ error: 'Too many attempts, try again later.' });
  });
});
