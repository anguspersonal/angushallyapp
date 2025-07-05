// Mock axios for API calls
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Common API mock responses
export const mockApiResponses = {
  // Auth responses
  login: {
    data: {
      token: 'mock-jwt-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg'
      }
    }
  },
  
  // Bookmark responses
  bookmarks: {
    data: {
      bookmarks: [
        {
          id: 'bookmark-1',
          title: 'Test Bookmark 1',
          url: 'https://example.com/1',
          description: 'A test bookmark',
          tags: ['test', 'example'],
          source_type: 'raindrop',
          created_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 'bookmark-2',
          title: 'Test Bookmark 2',
          url: 'https://example.com/2',
          description: 'Another test bookmark',
          tags: ['test'],
          source_type: 'manual',
          created_at: '2025-01-02T00:00:00Z'
        }
      ],
      _metadata: {
        totalBookmarks: 2,
        source: 'canonical'
      }
    }
  },
  
  // Habit responses
  habits: {
    data: {
      habits: [
        {
          id: 'habit-1',
          type: 'alcohol',
          value: 2.5,
          units: 'units',
          date: '2025-01-01',
          created_at: '2025-01-01T00:00:00Z'
        }
      ]
    }
  },
  
  // Blog responses
  posts: {
    data: {
      posts: [
        {
          id: 'post-1',
          title: 'Test Blog Post',
          content: 'This is a test blog post',
          slug: 'test-blog-post',
          published: true,
          created_at: '2025-01-01T00:00:00Z'
        }
      ]
    }
  },
  
  // Contact form response
  contactSubmission: {
    data: {
      success: true,
      message: 'Contact form submitted successfully'
    }
  }
};

// Helper function to mock successful API responses
export const mockApiSuccess = (endpoint, response) => {
  mockedAxios.get.mockResolvedValue(response);
  mockedAxios.post.mockResolvedValue(response);
  mockedAxios.put.mockResolvedValue(response);
  mockedAxios.delete.mockResolvedValue(response);
};

// Helper function to mock API errors
export const mockApiError = (status = 500, message = 'Internal Server Error') => {
  const error = new Error(message);
  error.response = {
    status,
    data: { error: message }
  };
  
  mockedAxios.get.mockRejectedValue(error);
  mockedAxios.post.mockRejectedValue(error);
  mockedAxios.put.mockRejectedValue(error);
  mockedAxios.delete.mockRejectedValue(error);
};

// Reset all mocks
export const resetApiMocks = () => {
  mockedAxios.get.mockReset();
  mockedAxios.post.mockReset();
  mockedAxios.put.mockReset();
  mockedAxios.delete.mockReset();
};

export { mockedAxios }; 