jest.mock('../http/client', () => ({
  httpClient: {
    post: jest.fn(),
  },
}));
const { httpClient } = require('../http/client');
const { getAuthUrl, exchangeCodeForTokens, refreshAccessToken } = require('../bookmark-api/raindropAuth.js');
const config = require('../../config/env');

const mockedHttpClient = httpClient;

describe('Raindrop.io Authentication', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getAuthUrl', () => {
    it('should generate correct authorization URL', () => {
      const authUrl = getAuthUrl('test-state');
      
      // Check that the URL contains the required parameters
      expect(authUrl).toContain('https://raindrop.io/oauth/authorize');
      expect(authUrl).toContain(`client_id=${config.raindrop.clientId}`);
      expect(authUrl).toContain(`redirect_uri=${encodeURIComponent(config.raindrop.redirectUri)}`);
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain('state=test-state');
    });
  });

  describe('exchangeCodeForTokens', () => {
    it('should exchange authorization code for access token', async () => {
      const mockResponse = {
        data: {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          expires_in: 3600
        }
      };

      mockedHttpClient.post.mockResolvedValue(mockResponse);

      const result = await exchangeCodeForTokens('mock_auth_code');

      expect(result).toEqual({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 3600
      });
      expect(mockedHttpClient.post).toHaveBeenCalledWith(
        'https://raindrop.io/oauth/access_token',
        expect.any(URLSearchParams),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
    });

    it('should handle errors when exchanging code', async () => {
      const mockError = new Error('Invalid authorization code');
      mockedHttpClient.post.mockRejectedValue(mockError);

      await expect(exchangeCodeForTokens('invalid_code')).rejects.toThrow('Invalid authorization code');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      const mockResponse = {
        data: {
          access_token: 'new_access_token',
          refresh_token: 'new_refresh_token',
          expires_in: 3600
        }
      };

      mockedHttpClient.post.mockResolvedValue(mockResponse);

      const result = await refreshAccessToken('old_refresh_token');

      expect(result).toEqual(mockResponse.data);
      expect(mockedHttpClient.post).toHaveBeenCalledWith(
        'https://raindrop.io/oauth/access_token',
        {
          client_id: config.raindrop.clientId,
          client_secret: config.raindrop.clientSecret,
          refresh_token: 'old_refresh_token',
          grant_type: 'refresh_token'
        }
      );
    });

    it('should handle errors when refreshing token', async () => {
      const mockError = new Error('Invalid refresh token');
      mockedHttpClient.post.mockRejectedValue(mockError);

      await expect(refreshAccessToken('invalid_refresh_token')).rejects.toThrow('Invalid refresh token');
    });
  });
}); 