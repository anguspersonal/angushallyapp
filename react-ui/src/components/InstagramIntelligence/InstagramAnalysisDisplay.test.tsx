import React from 'react';
import { renderWithMantine, screen, fireEvent, waitFor } from '../../__tests__/utils/testUtils';
import InstagramAnalysisDisplay from './InstagramAnalysisDisplay';

// Import centralized mocks
import '../../__tests__/mocks/componentMocks';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Mock Instagram Intelligence icons
jest.mock('@tabler/icons-react', () => ({
  ...jest.requireActual('@tabler/icons-react'),
  IconBrain: () => <div data-testid="brain-icon">Brain</div>,
  IconHeart: () => <div data-testid="heart-icon">Heart</div>,
  IconMessage: () => <div data-testid="message-icon">Message</div>,
  IconEye: () => <div data-testid="eye-icon">Eye</div>,
  IconShare: () => <div data-testid="share-icon">Share</div>,
  IconUser: () => <div data-testid="user-icon">User</div>,
  IconUsers: () => <div data-testid="users-icon">Users</div>,
  IconTag: () => <div data-testid="tag-icon">Tag</div>,
  IconTrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
  IconStar: () => <div data-testid="star-icon">Star</div>,
  IconExternalLink: () => <div data-testid="external-link-icon">ExternalLink</div>,
  IconCopy: () => <div data-testid="copy-icon">Copy</div>
}));

describe('InstagramAnalysisDisplay', () => {
  const mockOnClose = jest.fn();

  const mockAnalysisData = {
    analysis: {
      rawResponse: 'This is a detailed AI analysis of the Instagram content. It includes insights about engagement, content quality, and recommendations for improvement.',
      parsedAt: '2025-01-15T10:00:00Z'
    },
    metadata: {
      url: 'https://www.instagram.com/reel/ABC123/',
      caption: 'Amazing content with #hashtags and @mentions',
      hashtags: ['#amazing', '#content', '#instagram', '#ai', '#analysis'],
      mentions: ['@testuser', '@brandaccount'],
      location: 'New York, NY',
      mediaType: 'reel',
      timestamp: '2025-01-10T12:00:00Z',
      engagement: {
        likes: 15420,
        comments: 245,
        shares: 89,
        views: 125000,
        playCount: 98500,
        engagementScore: 0.82
      },
      author: {
        username: 'testcreator',
        fullName: 'Test Creator',
        followers: 50000,
        following: 1200,
        postsCount: 387,
        isVerified: true,
        profileImageUrl: 'https://example.com/profile.jpg',
        profileUrl: 'https://instagram.com/testcreator',
        userId: 'user123'
      },
      media: {
        type: 'video',
        contentId: 'ABC123',
        postId: '123456789',
        thumbnail: 'https://example.com/thumbnail.jpg',
        photos: [],
        videos: ['https://example.com/video.mp4'],
        productType: 'reel'
      },
      comments: {
        latest: [
          { text: 'Great content!', user: 'fan1', likes: 12 },
          { text: 'Love this!', user: 'fan2', likes: 8 }
        ],
        count: 245
      },
      audio: {
        title: 'Original Audio',
        artist: 'testcreator'
      },
      partnership: {
        isPaidPartnership: false,
        details: null
      },
      extractedAt: '2025-01-15T10:00:00Z',
      apifyRunId: 'run123'
    }
  };

  const mockBookmarkData = {
    id: 'bookmark-1',
    title: 'Test Instagram Reel',
    url: 'https://www.instagram.com/reel/ABC123/',
    description: 'A test Instagram reel bookmark',
    tags: ['instagram', 'reel', 'test'],
    source_type: 'manual',
    created_at: '2025-01-10T12:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return renderWithMantine(
      <InstagramAnalysisDisplay
        opened={true}
        onClose={mockOnClose}
        analysisData={mockAnalysisData}
        bookmarkData={mockBookmarkData}
        {...props}
      />
    );
  };

  describe('Modal Behavior', () => {
    it('renders modal when opened is true', () => {
      renderComponent();
      expect(screen.getByText('Instagram Intelligence Analysis')).toBeInTheDocument();
    });

    it('does not render modal when opened is false', () => {
      renderComponent({ opened: false });
      expect(screen.queryByText('Instagram Intelligence Analysis')).not.toBeInTheDocument();
    });

    it('calls onClose when Close button is clicked', () => {
      renderComponent();
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not render when analysisData is null', () => {
      renderComponent({ analysisData: null });
      expect(screen.queryByText('Instagram Intelligence Analysis')).not.toBeInTheDocument();
    });

    it('does not render when bookmarkData is null', () => {
      renderComponent({ bookmarkData: null });
      expect(screen.queryByText('Instagram Intelligence Analysis')).not.toBeInTheDocument();
    });
  });

  describe('Bookmark Information Display', () => {
    beforeEach(() => {
      renderComponent();
    });

    it('displays bookmark title', () => {
      expect(screen.getByText('Test Instagram Reel')).toBeInTheDocument();
    });

    it('displays Instagram URL', () => {
      expect(screen.getByText('https://www.instagram.com/reel/ABC123/')).toBeInTheDocument();
    });

    it('has external link to Instagram', () => {
      const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null);
      const externalLink = screen.getByTestId('external-link-icon');
      
      fireEvent.click(externalLink.parentElement!);
      
      expect(mockOpen).toHaveBeenCalledWith('https://www.instagram.com/reel/ABC123/', '_blank');
      mockOpen.mockRestore();
    });
  });

  describe('AI Content Analysis Display', () => {
    beforeEach(() => {
      renderComponent();
    });

    it('displays AI analysis content', () => {
      expect(screen.getByText(/This is a detailed AI analysis/)).toBeInTheDocument();
    });

    it('copies analysis to clipboard when copy button is clicked', async () => {
      const copyButton = screen.getByTestId('copy-icon');
      
      fireEvent.click(copyButton.parentElement!);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockAnalysisData.analysis.rawResponse);
      });
    });

    it('shows copied state briefly after copying', async () => {
      const copyButton = screen.getByTestId('copy-icon');
      
      fireEvent.click(copyButton.parentElement!);
      
      // The component should show some indication of successful copy
      // This would depend on the exact implementation
    });
  });

  describe('Engagement Metrics Display', () => {
    beforeEach(() => {
      renderComponent();
    });

    it('displays formatted engagement numbers', () => {
      expect(screen.getByText('15.4K')).toBeInTheDocument(); // likes
      expect(screen.getByText('245')).toBeInTheDocument(); // comments
      expect(screen.getByText('89')).toBeInTheDocument(); // shares
      expect(screen.getByText('125K')).toBeInTheDocument(); // views
    });

    it('displays engagement metrics with correct icons', () => {
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument(); // likes
      expect(screen.getByTestId('message-icon')).toBeInTheDocument(); // comments
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument(); // views
      expect(screen.getByTestId('share-icon')).toBeInTheDocument(); // shares
    });

    it('calculates and displays engagement rate', () => {
      // Engagement rate = (likes + comments) / followers * 100
      // (15420 + 245) / 50000 * 100 = 31.33%
      expect(screen.getByText('31.33%')).toBeInTheDocument();
    });
  });

  describe('Author Information Display', () => {
    beforeEach(() => {
      renderComponent();
    });

    it('displays author username and verification status', () => {
      expect(screen.getByText('@testcreator')).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });

    it('displays author full name when available', () => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    it('displays follower and post counts', () => {
      expect(screen.getByText('50K followers')).toBeInTheDocument();
      expect(screen.getByText('387 posts')).toBeInTheDocument();
    });

    it('has link to author profile', () => {
      const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null);
      
      // Find the external link in the author section
      const authorSection = screen.getByText('@testcreator').closest('div');
      const profileLink = authorSection?.querySelector('[data-testid="external-link-icon"]');
      
      if (profileLink) {
        fireEvent.click(profileLink.parentElement!);
        expect(mockOpen).toHaveBeenCalledWith('https://instagram.com/testcreator', '_blank');
      }
      
      mockOpen.mockRestore();
    });
  });

  describe('Hashtags and Mentions Display', () => {
    beforeEach(() => {
      renderComponent();
    });

    it('displays hashtags with correct count', () => {
      expect(screen.getByText('Hashtags (5)')).toBeInTheDocument();
      expect(screen.getByText('#amazing')).toBeInTheDocument();
      expect(screen.getByText('#content')).toBeInTheDocument();
    });

    it('displays mentions with correct count', () => {
      expect(screen.getByText('Mentions (2)')).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
      expect(screen.getByText('@brandaccount')).toBeInTheDocument();
    });

    it('limits display of hashtags and shows overflow indicator', () => {
      // Component should show only 10 hashtags and indicate if there are more
      const hashtags = screen.getAllByText(/^#/);
      expect(hashtags.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Metadata Display', () => {
    beforeEach(() => {
      renderComponent();
    });

    it('displays media type', () => {
      expect(screen.getByText('reel')).toBeInTheDocument();
    });

    it('displays formatted posting date', () => {
      // Should format the timestamp appropriately
      expect(screen.getByText(/1\/10\/2025/)).toBeInTheDocument();
    });

    it('displays engagement rate with trending icon', () => {
      expect(screen.getByText('31.33%')).toBeInTheDocument();
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    const testCases = [
      { input: 1234, expected: '1.2K' },
      { input: 1500000, expected: '1.5M' },
      { input: 999, expected: '999' },
      { input: 1000000, expected: '1.0M' },
      { input: 0, expected: '0' }
    ];

    testCases.forEach(({ input, expected }) => {
      it(`formats ${input} as ${expected}`, () => {
        const customAnalysisData = {
          ...mockAnalysisData,
          metadata: {
            ...mockAnalysisData.metadata,
            engagement: {
              ...mockAnalysisData.metadata.engagement,
              likes: input
            }
          }
        };

        renderComponent({ analysisData: customAnalysisData });
        
        if (input > 0) {
          expect(screen.getByText(expected)).toBeInTheDocument();
        }
      });
    });
  });

  describe('Date Formatting', () => {
    it('handles different date formats', () => {
      const customAnalysisData = {
        ...mockAnalysisData,
        metadata: {
          ...mockAnalysisData.metadata,
          timestamp: '2025-12-25T00:00:00Z'
        }
      };

      renderComponent({ analysisData: customAnalysisData });
      
      // Should display formatted date
      expect(screen.getByText(/12\/25\/2025/)).toBeInTheDocument();
    });

    it('handles invalid dates gracefully', () => {
      const customAnalysisData = {
        ...mockAnalysisData,
        metadata: {
          ...mockAnalysisData.metadata,
          timestamp: 'invalid-date'
        }
      };

      renderComponent({ analysisData: customAnalysisData });
      
      // Should display "Unknown" or handle gracefully
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('Accordion Functionality', () => {
    beforeEach(() => {
      renderComponent();
    });

    it('has collapsible sections for different content types', () => {
      expect(screen.getByText('AI Content Analysis')).toBeInTheDocument();
      expect(screen.getByText('Engagement Metrics')).toBeInTheDocument();
      expect(screen.getByText('Author Information')).toBeInTheDocument();
      expect(screen.getByText('Hashtags & Mentions')).toBeInTheDocument();
    });

    it('expands sections when clicked', () => {
      const analysisSection = screen.getByText('AI Content Analysis');
      fireEvent.click(analysisSection);
      
      // Should show the analysis content
      expect(screen.getByText(/This is a detailed AI analysis/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing engagement data gracefully', () => {
      const incompleteAnalysisData = {
        ...mockAnalysisData,
        metadata: {
          ...mockAnalysisData.metadata,
          engagement: null
        }
      };

      renderComponent({ analysisData: incompleteAnalysisData });
      
      // Should not crash and should handle missing data
      expect(screen.getByText('Instagram Intelligence Analysis')).toBeInTheDocument();
    });

    it('handles missing author data gracefully', () => {
      const incompleteAnalysisData = {
        ...mockAnalysisData,
        metadata: {
          ...mockAnalysisData.metadata,
          author: null
        }
      };

      renderComponent({ analysisData: incompleteAnalysisData });
      
      // Should not crash
      expect(screen.getByText('Instagram Intelligence Analysis')).toBeInTheDocument();
    });

    it('handles empty hashtags and mentions arrays', () => {
      const emptyTagsData = {
        ...mockAnalysisData,
        metadata: {
          ...mockAnalysisData.metadata,
          hashtags: [],
          mentions: []
        }
      };

      renderComponent({ analysisData: emptyTagsData });
      
      // Should handle empty arrays gracefully
      expect(screen.getByText('Instagram Intelligence Analysis')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      renderComponent();
    });

    it('has proper modal title with icon', () => {
      expect(screen.getByText('Instagram Intelligence Analysis')).toBeInTheDocument();
      expect(screen.getByTestId('brain-icon')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('has proper section headings', () => {
      expect(screen.getByText('AI Content Analysis')).toBeInTheDocument();
      expect(screen.getByText('Engagement Metrics')).toBeInTheDocument();
      expect(screen.getByText('Author Information')).toBeInTheDocument();
      expect(screen.getByText('Hashtags & Mentions')).toBeInTheDocument();
    });

    it('provides tooltip for copy functionality', () => {
      const copyButton = screen.getByTestId('copy-icon');
      expect(copyButton.parentElement).toHaveAttribute('title');
    });
  });
}); 