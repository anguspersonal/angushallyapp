// Set NODE_ENV to test before any modules are loaded
process.env.NODE_ENV = 'test';

// Import jest-dom matchers
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Ensure React is available globally for hooks
if (typeof globalThis !== 'undefined') {
  (globalThis as any).React = React;
}

// Mock Next.js router - use vi.fn() so it can be mocked in tests
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockPrefetch = vi.fn();
const mockBack = vi.fn();
const mockForward = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return React.createElement('img', props);
  },
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => {
    return React.createElement('a', { href, ...props }, children);
  },
}));

// Mock Google OAuth Provider
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock MantineProvider and components that use hooks to avoid React hooks issues
vi.mock('@mantine/core', () => {
  const React = require('react');
  
  // Create Menu component with sub-components
  const MenuComponent = ({ children }: any) => React.createElement('div', { 'data-testid': 'menu' }, children);
  MenuComponent.Target = ({ children }: any) => React.createElement('div', { 'data-testid': 'menu-target' }, children);
  MenuComponent.Dropdown = ({ children }: any) => React.createElement('div', { 'data-testid': 'menu-dropdown' }, children);
  MenuComponent.Item = ({ children, onClick }: any) => React.createElement('div', { 'data-testid': 'menu-item', onClick }, children);
  MenuComponent.Divider = () => React.createElement('hr', { 'data-testid': 'menu-divider' });
  
  return {
    MantineProvider: ({ children }: any) => children,
    Container: ({ children }: any) => React.createElement('div', { 'data-testid': 'container' }, children),
    Group: ({ children }: any) => React.createElement('div', { 'data-testid': 'group' }, children),
    Button: ({ children, onClick }: any) => React.createElement('button', { 'data-testid': 'button', type: 'button', onClick }, children),
    Menu: MenuComponent,
    Burger: ({ onClick }: any) => React.createElement('button', { 'data-testid': 'burger', type: 'button', onClick }),
  };
});

// Mock @mantine/hooks to avoid React hooks issues
vi.mock('@mantine/hooks', () => ({
  useDisclosure: () => [false, { toggle: vi.fn(), open: vi.fn(), close: vi.fn() }],
}));

// Mock Tabler icons
vi.mock('@tabler/icons-react', () => {
  const React = require('react');
  const createIcon = (name: string) => ({ size, ...props }: any) => 
    React.createElement('span', { 'data-testid': `icon-${name}`, ...props });
  
  return {
    IconUser: createIcon('user'),
    IconArticle: createIcon('article'),
    IconRocket: createIcon('rocket'),
    IconFolder: createIcon('folder'),
    IconLogout: createIcon('logout'),
  };
});

// Set test environment variables
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'test-google-client-id';

// Suppress console.log during tests unless debugging
if (!process.env.DEBUG_TESTS) {
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    // Only log important messages during tests
    if (args[0] && (
      typeof args[0] === 'string' && (
        args[0].includes('Error') ||
        args[0].includes('Loading environment') ||
        args[0].includes('✅') ||
        args[0].includes('❌') ||
        args[0].includes('Warning')
      )
    )) {
      originalLog(...args);
    }
  };
}

// Global test timeout
vi.setConfig({ testTimeout: 10000 });

