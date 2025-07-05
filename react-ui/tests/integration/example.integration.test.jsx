import React from 'react';
import { renderWithProviders, screen, waitFor, userEvent } from '../utils/testUtils';
import { mockApiSuccess, mockApiResponses, resetApiMocks } from '../mocks/apiMocks';
import { resetComponentMocks } from '../mocks/componentMocks';

// This is an example integration test to demonstrate the centralized test infrastructure
// In a real scenario, you would import your actual components
const MockBookmarksPage = () => {
  const [bookmarks, setBookmarks] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const response = await fetch('/api/bookmarks');
      const data = await response.json();
      setBookmarks(data.bookmarks || []);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBookmarks();
  }, []);

  if (loading) {
    return <div>Loading bookmarks...</div>;
  }

  return (
    <div>
      <h1>My Bookmarks</h1>
      <button onClick={fetchBookmarks}>Refresh</button>
      {bookmarks.length === 0 ? (
        <p>No bookmarks found</p>
      ) : (
        <ul>
          {bookmarks.map(bookmark => (
            <li key={bookmark.id}>
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                {bookmark.title}
              </a>
              <p>{bookmark.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

describe('Integration Test Example', () => {
  beforeEach(() => {
    resetApiMocks();
    resetComponentMocks();
  });

  it('should demonstrate centralized test setup with API integration', async () => {
    // Arrange - Setup API mock
    mockApiSuccess('/api/bookmarks', mockApiResponses.bookmarks);
    
    // Act - Render component with all providers
    renderWithProviders(<MockBookmarksPage />);
    
    // Assert - Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('My Bookmarks')).toBeInTheDocument();
      expect(screen.getByText('Test Bookmark 1')).toBeInTheDocument();
      expect(screen.getByText('Test Bookmark 2')).toBeInTheDocument();
    });
    
    // Verify the bookmarks are rendered correctly
    expect(screen.getByText('A test bookmark')).toBeInTheDocument();
    expect(screen.getByText('Another test bookmark')).toBeInTheDocument();
  });

  it('should handle user interactions correctly', async () => {
    // Arrange
    const user = userEvent.setup();
    mockApiSuccess('/api/bookmarks', mockApiResponses.bookmarks);
    
    renderWithProviders(<MockBookmarksPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Bookmark 1')).toBeInTheDocument();
    });
    
    // Act - Click refresh button
    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);
    
    // Assert - Data should still be visible (since we're mocking the same response)
    await waitFor(() => {
      expect(screen.getByText('Test Bookmark 1')).toBeInTheDocument();
    });
  });

  it('should work with different auth states', async () => {
    // Arrange - Mock authenticated user
    const authValue = {
      user: { id: 'test-user', email: 'test@example.com', name: 'Test User' },
      token: 'mock-token',
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    };
    
    mockApiSuccess('/api/bookmarks', mockApiResponses.bookmarks);
    
    // Act - Render with authenticated context
    renderWithProviders(<MockBookmarksPage />, { authValue });
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('My Bookmarks')).toBeInTheDocument();
    });
  });
}); 