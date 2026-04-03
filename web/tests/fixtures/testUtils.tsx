import React, { ReactElement } from 'react';
import { render, RenderOptions, cleanup } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { afterEach } from 'vitest';
import type { User } from '@/shared/types';

// Mock AuthProvider - tests should mock useAuth hook directly
// This is a passthrough provider that doesn't interfere with module-level mocks
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null;
  isLoading?: boolean;
}

/**
 * Custom render function that wraps components with necessary providers
 * 
 * Note: Auth should be mocked at the module level in your test file using:
 * vi.mock('@/providers/AuthProvider', () => ({ useAuth: vi.fn() }))
 * 
 * MantineProvider is mocked in setup.ts to avoid React hooks issues.
 * 
 * @example
 * ```tsx
 * vi.mock('@/providers/AuthProvider', () => ({ useAuth: vi.fn() }));
 * 
 * const { getByText } = renderWithProviders(<MyComponent />);
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { user, isLoading, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    // MantineProvider is mocked in setup.ts, so this is just a passthrough
    // but we keep it here for clarity and in case we need to add real provider later
    return (
      <MantineProvider>
        <MockAuthProvider>
          {children}
        </MockAuthProvider>
      </MantineProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

