import React from 'react';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

// Simplified render function with only Mantine provider (most common use case)
export const renderWithMantine = (ui, mantineProps = {}) => {
  const Wrapper = ({ children }) => (
    <MantineProvider {...mantineProps}>
      {children}
    </MantineProvider>
  );

  return render(ui, { wrapper: Wrapper });
};

// Mock authenticated user for tests
export const mockAuthenticatedUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg'
};

// Mock authenticated auth context
export const mockAuthContext = {
  user: mockAuthenticatedUser,
  token: 'mock-jwt-token',
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false
};

// Mock unauthenticated auth context
export const mockUnauthenticatedContext = {
  user: null,
  token: null,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false
};

// Utility to wait for async operations in tests
export const waitForAsyncOperation = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock API responses
export const mockApiResponse = (data, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {}
});

export const mockApiError = (message = 'API Error', status = 500) => {
  const error = new Error(message);
  error.response = {
    data: { error: message },
    status,
    statusText: 'Internal Server Error'
  };
  return error;
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event'; 