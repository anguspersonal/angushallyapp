const path = require('path');

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.DATABASE_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('applies defaults for optional values', () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'secret';
    process.env.GOOGLE_CLIENT_ID = 'google';
    process.env.GOOGLE_CLIENT_SECRET = 'google-secret';
    process.env.OPENAI_API_KEY = 'openai';
    process.env.STRAVA_CLIENT_ID = 'strava-client';
    process.env.STRAVA_CLIENT_SECRET = 'strava-secret';
    process.env.STRAVA_REDIRECT_URI = 'https://example.com/strava/callback';
    process.env.RAINDROP_CLIENT_ID = 'raindrop-client';
    process.env.RAINDROP_CLIENT_SECRET = 'raindrop-secret';
    process.env.RAINDROP_REDIRECT_URI = 'https://example.com/raindrop/callback';
    process.env.RECAPTCHA_SECRET_KEY = 'recaptcha';

    const config = require('../config');
    expect(config.server.port).toBe(5000);
    expect(config.http.timeoutMs).toBeGreaterThan(0);
    expect(config.cors.allowedOrigins.length).toBeGreaterThan(0);
  });

  test('throws when required secrets missing', () => {
    process.env.NODE_ENV = 'production';
    process.env.GOOGLE_CLIENT_ID = 'google';
    process.env.GOOGLE_CLIENT_SECRET = 'google-secret';
    process.env.OPENAI_API_KEY = 'openai';
    process.env.STRAVA_CLIENT_ID = 'strava-client';
    process.env.STRAVA_CLIENT_SECRET = 'strava-secret';
    process.env.STRAVA_REDIRECT_URI = 'https://example.com/strava/callback';
    process.env.RAINDROP_CLIENT_ID = 'raindrop-client';
    process.env.RAINDROP_CLIENT_SECRET = 'raindrop-secret';
    process.env.RAINDROP_REDIRECT_URI = 'https://example.com/raindrop/callback';
    process.env.RECAPTCHA_SECRET_KEY = 'recaptcha';
    jest.isolateModules(() => {
      expect(() => require('../config')).toThrow(/JWT_SECRET is required/);
    });
  });
});
