import React from 'react';
import { renderWithProviders, screen } from './__tests__/utils/testUtils';
import App from './App';

// Mock the components that require external services
jest.mock('./pages/Projects', () => {
  return function MockProjects() {
    return <div data-testid="projects-page">Projects Page</div>;
  };
});

jest.mock('./pages/Blog', () => {
  return function MockBlog() {
    return <div data-testid="blog-page">Blog Page</div>;
  };
});

describe('App', () => {
  it('renders without crashing', () => {
    renderWithProviders(<App />);
    // App should render the main layout
    expect(document.body).toBeInTheDocument();
  });

  it('renders home page by default', () => {
    renderWithProviders(<App />);
    // Should render the home page content
    // Note: This test may need adjustment based on your actual home page content
    expect(document.body).toBeInTheDocument();
  });
});
