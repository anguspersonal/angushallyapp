import React from 'react';
import { renderWithMantine, screen, fireEvent, waitFor } from '../../__tests__/utils/testUtils';
import { api } from '../../utils/apiClient';
import InstagramEnhancer from './InstagramEnhancer';

// Import centralized mocks
import '../../__tests__/mocks/componentMocks';

// Mock the API client
jest.mock('../../utils/apiClient', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

// Get typed mocks for better TypeScript support
const mockedApi = api as jest.Mocked<typeof api>;

// Mock Instagram Intelligence icons
jest.mock('@tabler/icons-react', () => ({
  ...jest.requireActual('@tabler/icons-react'),
  IconBrain: () => <div data-testid="brain-icon">Brain</div>,
  IconExternalLink: () => <div data-testid="external-link-icon">External Link</div>,
  IconFilter: () => <div data-testid="filter-icon">Filter</div>,
  IconSearch: () => <div data-testid="search-icon">Search</div>,
  IconCheck: () => <div data-testid="check-icon">Check</div>,
  IconAnalyze: () => <div data-testid="analyze-icon">Analyze</div>
}));

describe('InstagramEnhancer', () => {
  const mockOnClose = jest.fn();
  const mockOnEnhancementComplete = jest.fn();

  const mockInstagramBookmarks = [
    {
      id: 'bookmark-1',
      title: 'Instagram Reel Test',
      url: 'https://www.instagram.com/reel/ABC123/',
      description: 'A test Instagram reel',
      tags: ['instagram', 'test'],
      source_metadata: null
    },
    {
      id: 'bookmark-2', 
      title: 'Instagram Post Test',
      url: 'https://www.instagram.com/p/DEF456/',
      description: 'A test Instagram post',
      tags: ['instagram', 'social'],
      source_metadata: {
        instagram_analysis: true
      }
    },
    {
      id: 'bookmark-3',
      title: 'Non-Instagram Bookmark',
      url: 'https://example.com',
      description: 'Not an Instagram URL',
      tags: ['example']
    }
  ];

  const mockAnalysisResponse = {
    success: true,
    data: {
      analysis: {
        rawResponse: 'AI analysis result',
        parsedAt: '2025-01-15T10:00:00Z'
      },
      metadata: {
        url: 'https://www.instagram.com/reel/ABC123/',
        caption: 'Test caption',
        hashtags: ['#test', '#instagram'],
        mentions: ['@testuser'],
        engagement: {
          likes: 1000,
          comments: 50,
          shares: 25,
          views: 5000
        }
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses by default
    mockedApi.get.mockResolvedValue({
      bookmarks: mockInstagramBookmarks
    });
    
    mockedApi.post.mockResolvedValue(mockAnalysisResponse);
  });

  const renderComponent = (props = {}) => {
    return renderWithMantine(
      <InstagramEnhancer
        opened={true}
        onClose={mockOnClose}
        onEnhancementComplete={mockOnEnhancementComplete}
        {...props}
      />
    );
  };

  describe('Modal Behavior', () => {
    it('renders modal when opened is true', () => {
      renderComponent();
      expect(screen.getByText('Instagram Intelligence Enhancer')).toBeInTheDocument();
    });

    it('does not render modal when opened is false', () => {
      renderComponent({ opened: false });
      expect(screen.queryByText('Instagram Intelligence Enhancer')).not.toBeInTheDocument();
    });

    it('calls onClose when Done button is clicked', () => {
      renderComponent();
      const doneButton = screen.getByText('Done');
      fireEvent.click(doneButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Bookmark Fetching and Filtering', () => {
    it('fetches bookmarks when modal opens', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/bookmarks');
      });
    });

    it('filters and displays only Instagram bookmarks', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Instagram Reel Test')).toBeInTheDocument();
        expect(screen.getByText('Instagram Post Test')).toBeInTheDocument();
        expect(screen.queryByText('Non-Instagram Bookmark')).not.toBeInTheDocument();
      });
    });

    it('displays correct bookmark count', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('2 Instagram bookmarks found')).toBeInTheDocument();
      });
    });

    it('handles empty bookmark list', async () => {
      mockedApi.get.mockResolvedValue({ bookmarks: [] });
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('No Instagram bookmarks found. Add some Instagram posts, reels, or IGTV videos to your bookmarks first.')).toBeInTheDocument();
      });
    });

    it('handles API errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedApi.get.mockRejectedValue(new Error('API Error'));
      
      renderComponent();
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });
      
      consoleError.mockRestore();
    });
  });

  describe('Search and Filter Functionality', () => {
    beforeEach(async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Instagram Reel Test')).toBeInTheDocument();
      });
    });

    it('filters bookmarks by search query', async () => {
      const searchInput = screen.getByPlaceholderText('Search bookmarks...');
      fireEvent.change(searchInput, { target: { value: 'reel' } });
      
      await waitFor(() => {
        expect(screen.getByText('Instagram Reel Test')).toBeInTheDocument();
        expect(screen.queryByText('Instagram Post Test')).not.toBeInTheDocument();
      });
    });

    it('filters bookmarks by media type', async () => {
      const filterSelect = screen.getByDisplayValue('All Instagram');
      fireEvent.click(filterSelect);
      
      // Select "Reels" option
      const reelsOption = screen.getByText('Reels');
      fireEvent.click(reelsOption);
      
      await waitFor(() => {
        expect(screen.getByText('Instagram Reel Test')).toBeInTheDocument();
        expect(screen.queryByText('Instagram Post Test')).not.toBeInTheDocument();
      });
    });

    it('filters bookmarks by analysis status', async () => {
      const filterSelect = screen.getByDisplayValue('All Instagram');
      fireEvent.click(filterSelect);
      
      // Select "Analyzed" option
      const analyzedOption = screen.getByText('Analyzed');
      fireEvent.click(analyzedOption);
      
      await waitFor(() => {
        expect(screen.getByText('Instagram Post Test')).toBeInTheDocument();
        expect(screen.queryByText('Instagram Reel Test')).not.toBeInTheDocument();
      });
    });
  });

  describe('Bookmark Analysis', () => {
    beforeEach(async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Instagram Reel Test')).toBeInTheDocument();
      });
    });

    it('triggers analysis when enhance button is clicked', async () => {
      const enhanceButtons = screen.getAllByText('Enhance with AI');
      fireEvent.click(enhanceButtons[0]);
      
      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/instagram-intelligence/analyze', {
          instagramUrl: 'https://www.instagram.com/reel/ABC123/'
        });
      });
    });

    it('shows loading state during analysis', async () => {
      // Make the API call take time
      mockedApi.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const enhanceButtons = screen.getAllByText('Enhance with AI');
      fireEvent.click(enhanceButtons[0]);
      
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });

    it('calls onEnhancementComplete on successful analysis', async () => {
      const enhanceButtons = screen.getAllByText('Enhance with AI');
      fireEvent.click(enhanceButtons[0]);
      
      await waitFor(() => {
        expect(mockOnEnhancementComplete).toHaveBeenCalledWith('bookmark-1', mockAnalysisResponse.data);
      });
    });

    it('handles analysis errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedApi.post.mockRejectedValue(new Error('Analysis failed'));
      
      const enhanceButtons = screen.getAllByText('Enhance with AI');
      fireEvent.click(enhanceButtons[0]);
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });
      
      consoleError.mockRestore();
    });

    it('validates Instagram URLs before analysis', async () => {
      // Mock a bookmark with invalid URL
      mockedApi.get.mockResolvedValue({
        bookmarks: [{
          id: 'invalid-bookmark',
          title: 'Invalid URL',
          url: 'https://example.com',
          description: 'Not Instagram'
        }]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('No Instagram bookmarks found.')).toBeInTheDocument();
      });
    });
  });

  describe('Bookmark Card Display', () => {
    beforeEach(async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Instagram Reel Test')).toBeInTheDocument();
      });
    });

    it('displays correct media type badges', () => {
      expect(screen.getByText('Reel')).toBeInTheDocument();
      expect(screen.getByText('Post')).toBeInTheDocument();
    });

    it('displays analysis status correctly', () => {
      expect(screen.getByText('Not Analyzed')).toBeInTheDocument();
      expect(screen.getByText('Analyzed')).toBeInTheDocument();
    });

    it('shows enhanced status for analyzed bookmarks', () => {
      expect(screen.getByText('Enhanced with Instagram Intelligence')).toBeInTheDocument();
    });

    it('opens Instagram URLs in new tab when external link is clicked', () => {
      const externalLinks = screen.getAllByTestId('external-link-icon');
      const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null);
      
      fireEvent.click(externalLinks[0].parentElement!);
      
      expect(mockOpen).toHaveBeenCalledWith('https://www.instagram.com/reel/ABC123/', '_blank');
      
      mockOpen.mockRestore();
    });
  });

  describe('Instagram URL Detection', () => {
    const testCases = [
      { url: 'https://www.instagram.com/reel/ABC123/', expected: true, type: 'Reel' },
      { url: 'https://instagram.com/p/DEF456/', expected: true, type: 'Post' },
      { url: 'https://www.instagram.com/tv/GHI789/', expected: true, type: 'IGTV' },
      { url: 'https://example.com', expected: false, type: 'Unknown' },
      { url: 'https://twitter.com/status/123', expected: false, type: 'Unknown' }
    ];

    testCases.forEach(({ url, expected, type }) => {
      it(`correctly identifies ${url} as ${expected ? 'Instagram' : 'non-Instagram'}`, async () => {
        mockedApi.get.mockResolvedValue({
          bookmarks: [{
            id: 'test-bookmark',
            title: 'Test Bookmark',
            url: url,
            description: 'Test description'
          }]
        });
        
        renderComponent();
        
        if (expected) {
          await waitFor(() => {
            expect(screen.getByText('Test Bookmark')).toBeInTheDocument();
            expect(screen.getByText(type)).toBeInTheDocument();
          });
        } else {
          await waitFor(() => {
            expect(screen.getByText('No Instagram bookmarks found.')).toBeInTheDocument();
          });
        }
      });
    });
  });

  describe('Pagination', () => {
    const manyBookmarks = Array.from({ length: 20 }, (_, i) => ({
      id: `bookmark-${i}`,
      title: `Instagram Bookmark ${i}`,
      url: `https://www.instagram.com/reel/${i}/`,
      description: `Test bookmark ${i}`,
      tags: ['test']
    }));

    it('displays pagination when there are many bookmarks', async () => {
      mockedApi.get.mockResolvedValue({ bookmarks: manyBookmarks });
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('20 Instagram bookmarks found')).toBeInTheDocument();
        expect(screen.getByText('8 showing')).toBeInTheDocument();
      });
    });

    it('shows correct number of items per page', async () => {
      mockedApi.get.mockResolvedValue({ bookmarks: manyBookmarks });
      renderComponent();
      
      await waitFor(() => {
        const bookmarkCards = screen.getAllByText(/Instagram Bookmark \d+/);
        expect(bookmarkCards).toHaveLength(8); // itemsPerPage
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Instagram Reel Test')).toBeInTheDocument();
      });
    });

    it('has proper modal title', () => {
      expect(screen.getByText('Instagram Intelligence Enhancer')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      expect(screen.getByText('Enhance with AI')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('has proper input labels', () => {
      expect(screen.getByPlaceholderText('Search bookmarks...')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Instagram')).toBeInTheDocument();
    });
  });
}); 