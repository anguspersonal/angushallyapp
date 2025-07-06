import React from 'react';
import { renderWithMantine, screen } from '../../../../__tests__/utils/testUtils';
import BookmarkCard from './BookmarkCard';

// Import centralized mocks
import '../../../../__tests__/mocks/componentMocks';

describe('BookmarkCard', () => {
  const mockBookmark = {
    id: 'test-id',
    title: 'Test Bookmark',
    url: 'https://example.com',
    description: 'A test bookmark description',
    site_name: 'Example Site',
    tags: ['test', 'example'],
    source_type: 'raindrop',
    created_at: '2025-01-01T00:00:00Z'
  };

  it('renders bookmark with basic information', () => {
    renderWithMantine(<BookmarkCard bookmark={mockBookmark} />);
    
    expect(screen.getByText('Test Bookmark')).toBeInTheDocument();
    expect(screen.getByText('A test bookmark description')).toBeInTheDocument();
    expect(screen.getByText('Example Site')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();
    expect(screen.getByText('Raindrop')).toBeInTheDocument();
  });

  it('renders bookmark with preview image when image_url is provided', () => {
    const bookmarkWithImage = {
      ...mockBookmark,
      image_url: 'https://example.com/image.jpg',
      image_alt: 'Test image'
    };

    renderWithMantine(<BookmarkCard bookmark={bookmarkWithImage} />);
    
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('does not render image section when image_url is not provided', () => {
    renderWithMantine(<BookmarkCard bookmark={mockBookmark} />);
    
    // Should not find any image elements
    const images = screen.queryAllByRole('img');
    expect(images).toHaveLength(0);
  });

  it('handles bookmark without description', () => {
    const bookmarkWithoutDescription = {
      ...mockBookmark,
      description: null
    };

    renderWithMantine(<BookmarkCard bookmark={bookmarkWithoutDescription} />);
    
    expect(screen.getByText('Test Bookmark')).toBeInTheDocument();
    expect(screen.queryByText('A test bookmark description')).not.toBeInTheDocument();
  });

  it('handles bookmark without tags', () => {
    const bookmarkWithoutTags = {
      ...mockBookmark,
      tags: []
    };

    renderWithMantine(<BookmarkCard bookmark={bookmarkWithoutTags} />);
    
    expect(screen.getByText('No tags')).toBeInTheDocument();
    expect(screen.queryByText('test')).not.toBeInTheDocument();
    expect(screen.queryByText('example')).not.toBeInTheDocument();
  });

  it('handles bookmark without site_name', () => {
    const bookmarkWithoutSiteName = {
      ...mockBookmark,
      site_name: null
    };

    renderWithMantine(<BookmarkCard bookmark={bookmarkWithoutSiteName} />);
    
    expect(screen.getByText('Test Bookmark')).toBeInTheDocument();
    expect(screen.queryByText('Example Site')).not.toBeInTheDocument();
  });

  it('displays correct source type labels', () => {
    const sourceTypes = [
      { type: 'raindrop', expected: 'Raindrop' },
      { type: 'manual', expected: 'Manual' },
      { type: 'instapaper', expected: 'Instapaper' },
      { type: 'readwise', expected: 'Readwise' },
      { type: 'unknown', expected: 'unknown' }
    ];

    sourceTypes.forEach(({ type, expected }) => {
      const bookmarkWithSource = {
        ...mockBookmark,
        source_type: type
      };

      const { unmount } = renderWithMantine(<BookmarkCard bookmark={bookmarkWithSource} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders link with correct URL', () => {
    renderWithMantine(<BookmarkCard bookmark={mockBookmark} />);
    
    const link = screen.getByText('Test Bookmark').closest('a');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('handles Raindrop bookmarks with link field', () => {
    const raindropBookmark = {
      ...mockBookmark,
      link: 'https://raindrop.example.com' // Raindrop uses 'link' instead of 'url'
    };

    renderWithMantine(<BookmarkCard bookmark={raindropBookmark} />);
    
    const link = screen.getByText('Test Bookmark').closest('a');
    expect(link).toHaveAttribute('href', 'https://raindrop.example.com');
  });

  describe('Instagram Intelligence Features', () => {
    const mockOnInstagramAnalysisClick = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('detects Instagram URLs correctly', () => {
      const instagramBookmark = {
        ...mockBookmark,
        url: 'https://www.instagram.com/reel/ABC123/',
        title: 'Instagram Reel'
      };

      renderWithMantine(
        <BookmarkCard 
          bookmark={instagramBookmark} 
          onInstagramAnalysisClick={mockOnInstagramAnalysisClick}
        />
      );
      
      expect(screen.getByText('Reel')).toBeInTheDocument();
    });

    it('shows correct media type for different Instagram URLs', () => {
      const testCases = [
        { url: 'https://www.instagram.com/reel/ABC123/', expectedType: 'Reel' },
        { url: 'https://instagram.com/p/DEF456/', expectedType: 'Post' },
        { url: 'https://www.instagram.com/tv/GHI789/', expectedType: 'IGTV' }
      ];

      testCases.forEach(({ url, expectedType }) => {
        const instagramBookmark = {
          ...mockBookmark,
          url: url,
          title: `Instagram ${expectedType}`
        };

        const { unmount } = renderWithMantine(
          <BookmarkCard 
            bookmark={instagramBookmark} 
            onInstagramAnalysisClick={mockOnInstagramAnalysisClick}
          />
        );
        
        expect(screen.getByText(expectedType)).toBeInTheDocument();
        unmount();
      });
    });

    it('shows AI Enhanced badge for analyzed bookmarks', () => {
      const analyzedBookmark = {
        ...mockBookmark,
        url: 'https://www.instagram.com/reel/ABC123/',
        source_metadata: {
          instagram_analysis: true
        }
      };

      renderWithMantine(
        <BookmarkCard 
          bookmark={analyzedBookmark} 
          onInstagramAnalysisClick={mockOnInstagramAnalysisClick}
        />
      );
      
      expect(screen.getByText('AI Enhanced')).toBeInTheDocument();
    });

    it('calls onInstagramAnalysisClick when AI Enhanced badge is clicked', () => {
      const analyzedBookmark = {
        ...mockBookmark,
        url: 'https://www.instagram.com/reel/ABC123/',
        source_metadata: {
          instagram_analysis: true
        }
      };

      renderWithMantine(
        <BookmarkCard 
          bookmark={analyzedBookmark} 
          onInstagramAnalysisClick={mockOnInstagramAnalysisClick}
        />
      );
      
      const aiEnhancedBadge = screen.getByText('AI Enhanced');
      fireEvent.click(aiEnhancedBadge);
      
      expect(mockOnInstagramAnalysisClick).toHaveBeenCalledWith(analyzedBookmark);
    });

    it('shows AI Enhanced badge for bookmarks with intelligence_level > 1', () => {
      const intelligentBookmark = {
        ...mockBookmark,
        url: 'https://www.instagram.com/reel/ABC123/',
        intelligence_level: 2
      };

      renderWithMantine(
        <BookmarkCard 
          bookmark={intelligentBookmark} 
          onInstagramAnalysisClick={mockOnInstagramAnalysisClick}
        />
      );
      
      expect(screen.getByText('AI Enhanced')).toBeInTheDocument();
    });

    it('shows AI Enhanced badge for bookmarks with metadata_enriched', () => {
      const enrichedBookmark = {
        ...mockBookmark,
        url: 'https://www.instagram.com/reel/ABC123/',
        source_metadata: {
          metadata_enriched: true
        }
      };

      renderWithMantine(
        <BookmarkCard 
          bookmark={enrichedBookmark} 
          onInstagramAnalysisClick={mockOnInstagramAnalysisClick}
        />
      );
      
      expect(screen.getByText('AI Enhanced')).toBeInTheDocument();
    });

    it('does not show Instagram features for non-Instagram URLs', () => {
      renderWithMantine(
        <BookmarkCard 
          bookmark={mockBookmark} 
          onInstagramAnalysisClick={mockOnInstagramAnalysisClick}
        />
      );
      
      expect(screen.queryByText('Reel')).not.toBeInTheDocument();
      expect(screen.queryByText('Post')).not.toBeInTheDocument();
      expect(screen.queryByText('IGTV')).not.toBeInTheDocument();
      expect(screen.queryByText('AI Enhanced')).not.toBeInTheDocument();
    });

    it('prevents event bubbling when AI Enhanced badge is clicked', () => {
      const analyzedBookmark = {
        ...mockBookmark,
        url: 'https://www.instagram.com/reel/ABC123/',
        source_metadata: {
          instagram_analysis: true
        }
      };

      const mockCardClick = jest.fn();
      
      const { container } = renderWithMantine(
        <div onClick={mockCardClick}>
          <BookmarkCard 
            bookmark={analyzedBookmark} 
            onInstagramAnalysisClick={mockOnInstagramAnalysisClick}
          />
        </div>
      );
      
      const aiEnhancedBadge = screen.getByText('AI Enhanced');
      fireEvent.click(aiEnhancedBadge);
      
      expect(mockOnInstagramAnalysisClick).toHaveBeenCalledWith(analyzedBookmark);
      expect(mockCardClick).not.toHaveBeenCalled();
    });

    it('shows tooltip for AI Enhanced badge', () => {
      const analyzedBookmark = {
        ...mockBookmark,
        url: 'https://www.instagram.com/reel/ABC123/',
        source_metadata: {
          instagram_analysis: true
        }
      };

      renderWithMantine(
        <BookmarkCard 
          bookmark={analyzedBookmark} 
          onInstagramAnalysisClick={mockOnInstagramAnalysisClick}
        />
      );
      
      const aiEnhancedBadge = screen.getByText('AI Enhanced').closest('[role="tooltip"]');
      expect(aiEnhancedBadge).toBeInTheDocument();
    });

    it('handles missing onInstagramAnalysisClick gracefully', () => {
      const analyzedBookmark = {
        ...mockBookmark,
        url: 'https://www.instagram.com/reel/ABC123/',
        source_metadata: {
          instagram_analysis: true
        }
      };

      // Should not crash when onInstagramAnalysisClick is not provided
      renderWithMantine(<BookmarkCard bookmark={analyzedBookmark} />);
      
      const aiEnhancedBadge = screen.getByText('AI Enhanced');
      fireEvent.click(aiEnhancedBadge);
      
      // Should not throw an error
    });
  });
}); 