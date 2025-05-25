const { expect } = require('chai');
const axios = require('axios');
const { getAuthUrl, getAccessToken, refreshAccessToken } = require('../bookmark-api/raindropIo.js');
const config = require('../../config/env');

// Mock axios for testing
jest.mock('axios');

describe('Raindrop.io Authentication', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getAuthUrl', () => {
    it('should generate correct authorization URL', () => {
      const authUrl = getAuthUrl();
      
      // Check that the URL contains the required parameters
      expect(authUrl).to.include('https://raindrop.io/oauth/authorize');
      expect(authUrl).to.include(`client_id=${config.raindrop.clientId}`);
      expect(authUrl).to.include(`redirect_uri=${encodeURIComponent(config.raindrop.redirectUri)}`);
      expect(authUrl).to.include('response_type=code');
    });
  });

  describe('getAccessToken', () => {
    it('should exchange authorization code for access token', async () => {
      const mockResponse = {
        data: {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          expires_in: 3600
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await getAccessToken('mock_auth_code');

      expect(result).to.deep.equal(mockResponse.data);
      expect(axios.post).to.have.been.calledWith(
        'https://raindrop.io/oauth/access_token',
        {
          client_id: config.raindrop.clientId,
          client_secret: config.raindrop.clientSecret,
          code: 'mock_auth_code',
          grant_type: 'authorization_code',
          redirect_uri: config.raindrop.redirectUri
        }
      );
    });

    it('should handle errors when exchanging code', async () => {
      const mockError = new Error('Invalid authorization code');
      axios.post.mockRejectedValue(mockError);

      await expect(getAccessToken('invalid_code')).to.be.rejectedWith('Invalid authorization code');
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

      axios.post.mockResolvedValue(mockResponse);

      const result = await refreshAccessToken('old_refresh_token');

      expect(result).to.deep.equal(mockResponse.data);
      expect(axios.post).to.have.been.calledWith(
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
      axios.post.mockRejectedValue(mockError);

      await expect(refreshAccessToken('invalid_refresh_token')).to.be.rejectedWith('Invalid refresh token');
    });
  });
}); 