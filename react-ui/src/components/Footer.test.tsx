import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import Footer from './Footer';

// Mock the CSS module
jest.mock('./Footer.module.css', () => ({
  footer: 'footer',
  inner: 'inner',
  leftSection: 'leftSection',
  links: 'links'
}));

// Wrapper component for Mantine provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('Footer Component', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  test('renders copyright text with current year', () => {
    render(
      <TestWrapper>
        <Footer />
      </TestWrapper>
    );

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Angus Hally. All rights reserved.`)).toBeInTheDocument();
  });

  test('renders development environment text in development', () => {
    process.env.NODE_ENV = 'development';
    
    render(
      <TestWrapper>
        <Footer />
      </TestWrapper>
    );

    expect(screen.getByText('Development Environment')).toBeInTheDocument();
  });

  test('renders build number in production when build number is provided', () => {
    process.env.NODE_ENV = 'production';
    process.env.REACT_APP_BUILD_NUMBER = 'v1.2.3';
    
    render(
      <TestWrapper>
        <Footer />
      </TestWrapper>
    );

    expect(screen.getByText('Build: v1.2.3')).toBeInTheDocument();
  });

  test('renders no build info in production when build number is not set', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.REACT_APP_BUILD_NUMBER;
    
    render(
      <TestWrapper>
        <Footer />
      </TestWrapper>
    );

    // Should not show any build information
    expect(screen.queryByText(/Build:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Development Environment/)).not.toBeInTheDocument();
  });

  test('renders all social media links with correct attributes', () => {
    const { container } = render(
      <TestWrapper>
        <Footer />
      </TestWrapper>
    );

    // LinkedIn link
    const linkedinLink = container.querySelector('a[href="https://www.linkedin.com/in/angus-hally-9ab66a87/"]');
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');

    // GitHub link
    const githubLink = container.querySelector('a[href="https://github.com/anguspersonal"]');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Instagram link
    const instagramLink = container.querySelector('a[href="https://www.instagram.com/hallyangus/"]');
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink).toHaveAttribute('target', '_blank');
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('applies correct CSS classes', () => {
    const { container } = render(
      <TestWrapper>
        <Footer />
      </TestWrapper>
    );

    const footerElement = container.querySelector('.footer');
    expect(footerElement).toBeInTheDocument();

    const innerElement = container.querySelector('.inner');
    expect(innerElement).toBeInTheDocument();

    const leftSectionElement = container.querySelector('.leftSection');
    expect(leftSectionElement).toBeInTheDocument();

    const linksElement = container.querySelector('.links');
    expect(linksElement).toBeInTheDocument();
  });

  test('renders Mantine components correctly', () => {
    render(
      <TestWrapper>
        <Footer />
      </TestWrapper>
    );

    // Check for Mantine Container component
    const container = screen.getByText(/© \d{4} Angus Hally/).closest('.mantine-Container-root');
    expect(container).toBeInTheDocument();

    // Check for ActionIcon components (social media links)
    const actionIcons = screen.getAllByRole('link');
    expect(actionIcons).toHaveLength(3); // LinkedIn, GitHub, Instagram
    
    actionIcons.forEach(icon => {
      expect(icon.closest('.mantine-ActionIcon-root')).toBeInTheDocument();
    });
  });

  test('has accessible social media icons', () => {
    render(
      <TestWrapper>
        <Footer />
      </TestWrapper>
    );

    // Verify that each social media link is accessible
    const socialLinks = screen.getAllByRole('link');
    expect(socialLinks).toHaveLength(3);

    // Each link should be keyboard accessible and have proper attributes
    socialLinks.forEach(link => {
      expect(link).toHaveAttribute('href');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
}); 