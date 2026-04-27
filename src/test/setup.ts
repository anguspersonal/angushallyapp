// Set NODE_ENV to test before any modules are loaded (typed env is read-only)
(process.env as { NODE_ENV?: string }).NODE_ENV = 'test';

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
  default: function NextImageMock(props: Record<string, unknown>) {
    return React.createElement('img', props);
  },
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: function NextLinkMock({
    children,
    href,
    ...props
  }: {
    children?: React.ReactNode;
    href?: string;
    [key: string]: unknown;
  }) {
    return React.createElement('a', { href, ...props }, children);
  },
}));

// Mock Google OAuth Provider
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock MantineProvider and components that use hooks to avoid React hooks issues
vi.mock('@mantine/core', async () => {
  const R = (await import('react')).default;

  function MockMenu({ children }: { children?: React.ReactNode }) {
    return R.createElement('div', { 'data-testid': 'menu' }, children);
  }
  function MockMenuTarget({ children }: { children?: React.ReactNode }) {
    return R.createElement('div', { 'data-testid': 'menu-target' }, children);
  }
  function MockMenuDropdown({ children }: { children?: React.ReactNode }) {
    return R.createElement('div', { 'data-testid': 'menu-dropdown' }, children);
  }
  function MockMenuItem({
    children,
    onClick,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
  }) {
    return R.createElement('div', { 'data-testid': 'menu-item', onClick }, children);
  }
  function MockMenuDivider() {
    return R.createElement('hr', { 'data-testid': 'menu-divider' });
  }
  MockMenu.Target = MockMenuTarget;
  MockMenu.Dropdown = MockMenuDropdown;
  MockMenu.Item = MockMenuItem;
  MockMenu.Divider = MockMenuDivider;

  function MockMantineProvider({ children }: { children?: React.ReactNode }) {
    return children;
  }
  function MockContainer({ children }: { children?: React.ReactNode }) {
    return R.createElement('div', { 'data-testid': 'container' }, children);
  }
  function MockGroup({ children }: { children?: React.ReactNode }) {
    return R.createElement('div', { 'data-testid': 'group' }, children);
  }
  function MockButton({
    children,
    onClick,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
  }) {
    return R.createElement('button', { 'data-testid': 'button', type: 'button', onClick }, children);
  }
  function MockBurger({ onClick }: { onClick?: () => void }) {
    return R.createElement('button', { 'data-testid': 'burger', type: 'button', onClick });
  }
  function makePassthrough(testId: string, tag: string = 'div') {
    return function Passthrough({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) {
      return R.createElement(tag, { 'data-testid': testId, ...rest }, children);
    };
  }

  return {
    MantineProvider: MockMantineProvider,
    Container: MockContainer,
    Group: MockGroup,
    Button: MockButton,
    Menu: MockMenu,
    Burger: MockBurger,
    Paper: makePassthrough('paper'),
    Box: makePassthrough('box'),
    Text: makePassthrough('text', 'span'),
    Title: makePassthrough('title', 'h3'),
    Badge: makePassthrough('badge', 'span'),
    Stack: makePassthrough('stack'),
    SimpleGrid: makePassthrough('simple-grid'),
    Card: makePassthrough('card'),
    ActionIcon: makePassthrough('action-icon', 'button'),
    Image: makePassthrough('image', 'img'),
    Anchor: function MockAnchor({
      children,
      component: _component,
      ...rest
    }: {
      children?: React.ReactNode;
      component?: unknown;
      [key: string]: unknown;
    }) {
      return R.createElement('a', { 'data-testid': 'anchor', ...rest }, children);
    },
    Alert: makePassthrough('alert'),
    Divider: makePassthrough('divider', 'hr'),
    Blockquote: makePassthrough('blockquote', 'blockquote'),
    List: makePassthrough('list', 'ul'),
    AppShell: Object.assign(makePassthrough('app-shell'), {
      Header: makePassthrough('app-shell-header', 'header'),
      Main: makePassthrough('app-shell-main', 'main'),
      Footer: makePassthrough('app-shell-footer', 'footer'),
    }),
    useMantineTheme: () => ({
      colors: {
        primary: ['', '', '', '', '', '', '#384C37', '', '#2A3929', ''],
        secondary: ['', '', '', '', '', '', '#88A5BC', '', '', ''],
        accent: ['', '', '', '', '', '', '#E1C8BC', '', '', ''],
        success: ['', '', '', '', '', '', '#6B9F70', '', '', ''],
        dark: ['', '', '', '', '', '', '', '', '#111', '#000'],
        gray: ['', '', '', '', '', '', '#888', '', '', ''],
      },
    }),
    useComputedColorScheme: () => (globalThis as { __mantineComputedColorScheme?: 'light' | 'dark' }).__mantineComputedColorScheme ?? 'light',
    useMantineColorScheme: () => ({
      colorScheme: 'light',
      setColorScheme: vi.fn(),
      toggleColorScheme: vi.fn(),
      clearColorScheme: vi.fn(),
    }),
  };
});

// Mock @mantine/hooks to avoid React hooks issues
vi.mock('@mantine/hooks', () => ({
  useDisclosure: () => [false, { toggle: vi.fn(), open: vi.fn(), close: vi.fn() }],
}));

// Mock Tabler icons
vi.mock('@tabler/icons-react', async () => {
  const R = (await import('react')).default;

  function createIcon(name: string) {
    function TablerIconMock({ size: _size, ...props }: Record<string, unknown>) {
      return R.createElement('span', { 'data-testid': `icon-${name}`, ...props });
    }
    TablerIconMock.displayName = `TablerIconMock(${name})`;
    return TablerIconMock;
  }

  return {
    IconHome: createIcon('home'),
    IconUser: createIcon('user'),
    IconArticle: createIcon('article'),
    IconRocket: createIcon('rocket'),
    IconFolder: createIcon('folder'),
    IconLogout: createIcon('logout'),
    IconMail: createIcon('mail'),
    IconMessageCircle: createIcon('message-circle'),
    IconChevronDown: createIcon('chevron-down'),
    IconSun: createIcon('sun'),
    IconMoonStars: createIcon('moon-stars'),
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
