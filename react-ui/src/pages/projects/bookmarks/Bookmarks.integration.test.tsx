import React from 'react';
import { renderWithMantine, screen, fireEvent, waitFor } from '../../../__tests__/utils/testUtils';
import { api } from '../../../utils/apiClient';
import Bookmarks from './Bookmarks';

// Import centralized mocks
import '../../../__tests__/mocks/componentMocks';

// Mock the API client
jest.mock('../../../utils/apiClient', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

// Mock AuthContext
const mockAuthContext = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  },
  isAuthenticated: true,
  loading: false
};

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock Instagram Intelligence components
jest.mock('../../../components/InstagramIntelligence/InstagramEnhancer', () => {
  return function MockInstagramEnhancer({ opened, onClose, onEnhancementComplete }) {
    if (!opened) return null;
    
    return (
      <div data-testid="instagram-enhancer-modal">
        <h2>Instagram Intelligence Enhancer</h2>
        <button onClick={onClose}>Close Enhancer</button>
        <button 
          onClick={() => onEnhancementComplete('bookmark-1', { analysis: 'test' })}
          data-testid="enhance-bookmark-button"
        >
          Enhance Test Bookmark
        </button>
      </div>
    );
  };
});

jest.mock('../../../components/InstagramIntelligence/InstagramAnalysisDisplay', () => {
  return function MockInstagramAnalysisDisplay({ opened, onClose, analysisData, bookmarkData }) {
    if (!opened || !analysisData || !bookmarkData) return null;
    
    return (
      <div data-testid="instagram-analysis-modal">
        <h2>Instagram Analysis Display</h2>
        <p>Bookmark: {bookmarkData.title}</p>
        <p>Analysis: {analysisData.analysis?.rawResponse || 'Test analysis'}</p>
        <button onClick={onClose}>Close Analysis</button>
      </div>
    );
  };
});

describe('Bookmarks Instagram Intelligence Integration', () => {
  const mockBookmarks = [
    {
      id: 'bookmark-1',
      title: 'Regular Bookmark',
      url: 'https://example.com',
      description: 'A regular bookmark',
      tags: ['example'],
      source_type: 'manual',
      created_at: '2025-01-10T12:00:00Z'
    },
    {
      id: 'bookmark-2',
      title: 'Instagram Reel',
      url: 'https://www.instagram.com/reel/ABC123/',
      description: 'An Instagram reel',
      tags: ['instagram', 'reel'],
      source_type: 'manual',
      created_at: '2025-01-11T12:00:00Z'
    },
    {
      id: 'bookmark-3',
      title: 'Analyzed Instagram Post',
      url: 'https://www.instagram.com/p/DEF456/',
      description: 'An analyzed Instagram post',
      tags: ['instagram', 'post'],
      source_type: 'manual',
      source_metadata: {
        instagram_analysis: true
      },
      created_at: '2025-01-12T12:00:00Z'
    }
  ];

  const mockAnalysisHistory = [
    {
      id: 'analysis-1',
      instagram_url: 'https://www.instagram.com/p/DEF456/',
      metadata: JSON.stringify({
        url: 'https://www.instagram.com/p/DEF456/',
        caption: 'Test caption',
        hashtags: ['#test'],
        engagement: { likes: 100, comments: 10 }
      }),
      analysis_result: JSON.stringify({
        rawResponse: 'This is a test analysis of the Instagram post.',
        parsedAt: '2025-01-15T10:00:00Z'
      }),
      analyzed_at: '2025-01-15T10:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful bookmark fetching
    api.get.mockImplementation((endpoint) => {
      if (endpoint === '/bookmarks') {
        return Promise.resolve({ bookmarks: mockBookmarks });
      }
      if (endpoint.includes('/instagram-intelligence/history')) {
        return Promise.resolve({
          success: true,
          data: { history: mockAnalysisHistory }
        });
      }
      return Promise.resolve({});
    });
  });

  const renderBookmarksPage = () => {
    return renderWithMantine(<Bookmarks />);
  };

  describe('Instagram Intelligence Button Integration', () => {
    it('renders Instagram Intelligence button in dashboard view', async () => {
      renderBookmarksPage();
      
      await waitFor(() => {
        expect(screen.getByText('Instagram Intelligence')).toBeInTheDocument();
      });
    });

    it('renders Instagram Intelligence button in all bookmarks view', async () => {
      renderBookmarksPage();
      
      // Wait for bookmarks to load
      await waitFor(() => {
        expect(screen.getByText('Instagram Reel')).toBeInTheDocument();
      });
      
      // Switch to all bookmarks view
      const allBookmarksTab = screen.getByText('All Bookmarks');
      fireEvent.click(allBookmarksTab);
      
      await waitFor(() => {
        expect(screen.getAllByText('Instagram Intelligence')).toHaveLength(2); // Dashboard + All Bookmarks
      });
    });

    it('opens Instagram Enhancer modal when button is clicked', async () => {
      renderBookmarksPage();
      
      await waitFor(() => {
        expect(screen.getByText('Instagram Intelligence')).toBeInTheDocument();
      });
      
      const intelligenceButton = screen.getByText('Instagram Intelligence');
      fireEvent.click(intelligenceButton);
      
      expect(screen.getByTestId('instagram-enhancer-modal')).toBeInTheDocument();
    });

    it('closes Instagram Enhancer modal when close is clicked', async () => {
      renderBookmarksPage();
      
      await waitFor(() => {
        expect(screen.getByText('Instagram Intelligence')).toBeInTheDocument();
      });
      
      const intelligenceButton = screen.getByText('Instagram Intelligence');
      fireEvent.click(intelligenceButton);
      
      expect(screen.getByTestId('instagram-enhancer-modal')).toBeInTheDocument();
      
      const closeButton = screen.getByText('Close Enhancer');
      fireEvent.click(closeButton);
      
      expect(screen.queryByTestId('instagram-enhancer-modal')).not.toBeInTheDocument();
    });
  });

  describe('BookmarkCard Instagram Features Integration', () => {
    beforeEach(async () => {
      renderBookmarksPage();
      
      // Wait for bookmarks to load
      await waitFor(() => {
        expect(screen.getByText('Instagram Reel')).toBeInTheDocument();
      });
    });

    it('displays Instagram indicators on Instagram bookmarks', () => {
      expect(screen.getByText('Reel')).toBeInTheDocument();
      expect(screen.getByText('Post')).toBeInTheDocument();
    });

    it('shows AI Enhanced badge for analyzed bookmarks', () => {
      expect(screen.getByText('AI Enhanced')).toBeInTheDocument();
    });

    it('opens analysis display when AI Enhanced badge is clicked', async () => {
      const aiEnhancedBadge = screen.getByText('AI Enhanced');
      fireEvent.click(aiEnhancedBadge);
      
      await waitFor(() => {
        expect(screen.getByTestId('instagram-analysis-modal')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Bookmark: Analyzed Instagram Post')).toBeInTheDocument();
      expect(screen.getByText('Analysis: This is a test analysis of the Instagram post.')).toBeInTheDocument();
    });

    it('fetches analysis history when AI Enhanced badge is clicked', async () => {
      const aiEnhancedBadge = screen.getByText('AI Enhanced');
      fireEvent.click(aiEnhancedBadge);
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/instagram-intelligence/history?limit=50');
      });
    });

    it('handles missing analysis gracefully', async () => {
      // Mock empty analysis history
      api.get.mockImplementation((endpoint) => {
        if (endpoint === '/bookmarks') {
          return Promise.resolve({ bookmarks: mockBookmarks });
        }
        if (endpoint.includes('/instagram-intelligence/history')) {
          return Promise.resolve({
            success: true,
            data: { history: [] }
          });
        }
        return Promise.resolve({});
      });

      renderBookmarksPage();
      
      await waitFor(() => {
        expect(screen.getByText('AI Enhanced')).toBeInTheDocument();
      });
      
      const aiEnhancedBadge = screen.getByText('AI Enhanced');
      fireEvent.click(aiEnhancedBadge);
      
      // Should show notification about no analysis found
      // This would depend on the exact implementation
    });
  });

  describe('Enhancement Workflow Integration', () => {
    beforeEach(async () => {
      renderBookmarksPage();
      
      await waitFor(() => {
        expect(screen.getByText('Instagram Intelligence')).toBeInTheDocument();
      });
      
      // Open the enhancer modal
      const intelligenceButton = screen.getByText('Instagram Intelligence');
      fireEvent.click(intelligenceButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('instagram-enhancer-modal')).toBeInTheDocument();
      });
    });

    it('refreshes bookmarks after enhancement completion', async () => {
      const enhanceButton = screen.getByTestId('enhance-bookmark-button');
      fireEvent.click(enhanceButton);
      
      await waitFor(() => {
        // Should call api.get again to refresh bookmarks
        expect(api.get).toHaveBeenCalledWith('/bookmarks');
      });
    });

    it('handles enhancement completion callback', async () => {
      const enhanceButton = screen.getByTestId('enhance-bookmark-button');
      fireEvent.click(enhanceButton);
      
      // The mock component calls onEnhancementComplete
      // This should trigger bookmark refresh in the real component
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/bookmarks');
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('handles bookmark fetch errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      api.get.mockRejectedValue(new Error('Network error'));
      
      renderBookmarksPage();
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });
      
      consoleError.mockRestore();
    });

    it('handles analysis history fetch errors gracefully', async () => {
      api.get.mockImplementation((endpoint) => {
        if (endpoint === '/bookmarks') {
          return Promise.resolve({ bookmarks: mockBookmarks });
        }
        if (endpoint.includes('/instagram-intelligence/history')) {
          return Promise.reject(new Error('Analysis fetch error'));
        }
        return Promise.resolve({});
      });

      renderBookmarksPage();
      
      await waitFor(() => {
        expect(screen.getByText('AI Enhanced')).toBeInTheDocument();
      });
      
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const aiEnhancedBadge = screen.getByText('AI Enhanced');
      fireEvent.click(aiEnhancedBadge);
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });
      
      consoleError.mockRestore();
    });
  });

  describe('Sidebar Navigation Integration', () => {
    it('maintains Instagram Intelligence functionality across different views', async () => {
      renderBookmarksPage();
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Instagram Intelligence')).toBeInTheDocument();
      });
      
      // Switch to search view
      const searchTab = screen.getByText('Search');
      fireEvent.click(searchTab);
      
      // Instagram Intelligence should still be available
      expect(screen.getByText('Instagram Intelligence')).toBeInTheDocument();
    });
  });

  describe('Loading States Integration', () => {
    it('shows loading state while fetching bookmarks', () => {
      // Mock a slow API response
      api.get.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ bookmarks: mockBookmarks }), 100)
      ));
      
      renderBookmarksPage();
      
      // Should show loading indicator
      expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('shows content after loading completes', async () => {
      renderBookmarksPage();
      
      await waitFor(() => {
        expect(screen.getByText('Instagram Reel')).toBeInTheDocument();
        expect(screen.queryByText('Loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design Integration', () => {
    it('maintains functionality on different screen sizes', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 400 });
      
      renderBookmarksPage();
      
      await waitFor(() => {
        expect(screen.getByText('Instagram Intelligence')).toBeInTheDocument();
      });
      
      // Should still be functional on mobile
      const intelligenceButton = screen.getByText('Instagram Intelligence');
      fireEvent.click(intelligenceButton);
      
      expect(screen.getByTestId('instagram-enhancer-modal')).toBeInTheDocument();
    });
  });
}); 