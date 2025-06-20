import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import BookmarkCard from './BookmarkCard';

// Mock the theme assets
jest.mock('../../../../../theme', () => ({
  assets: {
    placeholderImage: {
      landscape: '/test-placeholder.jpg'
    }
  }
}));

// Mock notifications
jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn()
  }
}));

const renderWithProvider = (component) => {
  return render(
    <MantineProvider>
      {component}
    </MantineProvider>
  );
};

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
    renderWithProvider(<BookmarkCard bookmark={mockBookmark} />);
    
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

    renderWithProvider(<BookmarkCard bookmark={bookmarkWithImage} />);
    
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('does not render image section when image_url is not provided', () => {
    renderWithProvider(<BookmarkCard bookmark={mockBookmark} />);
    
    // Should not find any image elements
    const images = screen.queryAllByRole('img');
    expect(images).toHaveLength(0);
  });

  it('handles bookmark without description', () => {
    const bookmarkWithoutDescription = {
      ...mockBookmark,
      description: null
    };

    renderWithProvider(<BookmarkCard bookmark={bookmarkWithoutDescription} />);
    
    expect(screen.getByText('Test Bookmark')).toBeInTheDocument();
    expect(screen.queryByText('A test bookmark description')).not.toBeInTheDocument();
  });

  it('handles bookmark without tags', () => {
    const bookmarkWithoutTags = {
      ...mockBookmark,
      tags: []
    };

    renderWithProvider(<BookmarkCard bookmark={bookmarkWithoutTags} />);
    
    expect(screen.getByText('No tags')).toBeInTheDocument();
    expect(screen.queryByText('test')).not.toBeInTheDocument();
    expect(screen.queryByText('example')).not.toBeInTheDocument();
  });

  it('handles bookmark without site_name', () => {
    const bookmarkWithoutSiteName = {
      ...mockBookmark,
      site_name: null
    };

    renderWithProvider(<BookmarkCard bookmark={bookmarkWithoutSiteName} />);
    
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

      const { unmount } = renderWithProvider(<BookmarkCard bookmark={bookmarkWithSource} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders link with correct URL', () => {
    renderWithProvider(<BookmarkCard bookmark={mockBookmark} />);
    
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

    renderWithProvider(<BookmarkCard bookmark={raindropBookmark} />);
    
    const link = screen.getByText('Test Bookmark').closest('a');
    expect(link).toHaveAttribute('href', 'https://raindrop.example.com');
  });
}); 