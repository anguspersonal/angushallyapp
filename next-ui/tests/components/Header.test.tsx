import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '../fixtures/testUtils';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

// Mock the useAuth hook
vi.mock('@/providers/AuthProvider', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { useAuth } from '@/providers/AuthProvider';

describe('Header', () => {
  const mockPush = vi.fn();
  const mockRouter = {
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset router mock
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
  });

  it('renders logo and navigation links', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      logout: vi.fn(),
    });

    renderWithProviders(<Header />);

    // Check logo is present
    const logo = screen.getByAltText('AH Logo');
    expect(logo).toBeInTheDocument();

    // Check navigation links exist (both desktop and mobile versions)
    expect(screen.getAllByText('Projects').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Blog').length).toBeGreaterThan(0);
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Collab').length).toBeGreaterThan(0);
  });

  it('shows login button when user is not authenticated', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      logout: vi.fn(),
    });

    renderWithProviders(<Header />);

    // Target the button element specifically (desktop nav)
    const loginButton = screen.getByRole('button', { name: 'Login' });
    expect(loginButton).toBeInTheDocument();
  });

  it('shows logout button when user is authenticated', () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    };

    (useAuth as any).mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
    });

    renderWithProviders(<Header />);

    // Target the button element specifically (desktop nav)
    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    expect(logoutButton).toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', () => {
    const mockLogout = vi.fn();

    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    };

    (useAuth as any).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });

    renderWithProviders(<Header />);

    // Target the button element specifically (desktop nav)
    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    logoutButton.click();

    // Verify logout was called
    expect(mockLogout).toHaveBeenCalled();
    // Verify router.push was called with /login
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});

