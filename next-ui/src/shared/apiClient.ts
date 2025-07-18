import {
  ApiError,
} from './types/api';
import type {
  ApiClientOptions,
  ApiClientInterface,
} from './types/api';

// Determine API base URL (works in both CRA & Next environments)
const isDevelopment = process.env.NODE_ENV === 'development';
const isNextJs = typeof window !== 'undefined' && window.location.pathname.includes('/next');

// In Next.js, use relative URLs for API routes
// In CRA, use the backend URL
const rawEnvUrl =
  (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.REACT_APP_API_BASE_URL)?.replace(/\/$/, '');

export const API_BASE = isNextJs ? '/api' : (rawEnvUrl || (isDevelopment ? 'http://localhost:5000/api' : '/api'));

async function apiClient<T = unknown>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add development bypass token for testing
  if (process.env.NODE_ENV === 'development') {
    headers['Authorization'] = 'Bearer dev-bypass';
  }

  const { body, ...rest } = options;

  const config: RequestInit = {
    ...rest,
    headers,
    credentials: 'include', // Always include credentials for cookie-based auth
    ...(body !== undefined ? { body: body as BodyInit } : {}),
  };

  const fullUrl = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(fullUrl, config);

    // If server returns an HTML error page, flag it
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      throw new ApiError('Received HTML response instead of JSON', response.status, text);
    }

    // Parse JSON unless 204 No-Content
    const data: unknown = response.status === 204 ? null : await response.json().catch(() => {
      throw new ApiError('Invalid JSON response from server', response.status, null);
    });

    if (!response.ok) {
      // Don't clear auth data on 401 since we're using cookies now
      // The backend will handle cookie clearing
      throw new ApiError(
        // Attempt to extract error field from payload
        (typeof data === 'object' && data !== null && 'error' in data
          ? (data as { error?: string }).error
          : undefined) || getErrorMessage(response.status),
        response.status,
        data,
      );
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new ApiError('Network error – please check your connection', 0, null);
    }
    throw new ApiError((err as Error).message, 0, null);
  }
}

function getErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Bad request – please check your input';
    case 401:
      return 'Unauthorized – please log in again';
    case 403:
      return 'Forbidden – you do not have access to this resource';
    case 404:
      return 'Resource not found';
    case 429:
      return 'Too many requests – please try again later';
    case 500:
      return 'Server error – please try again later';
    default:
      return 'An error occurred';
  }
}

export const api: ApiClientInterface = {
  get: <T = unknown>(endpoint: string, options = {}) => apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, data?: unknown, options = {}) =>
    apiClient<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),

  put: <T = unknown>(endpoint: string, data?: unknown, options = {}) =>
    apiClient<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),

  delete: <T = unknown>(endpoint: string, options = {}) => apiClient<T>(endpoint, { ...options, method: 'DELETE' }),

  isAuthenticated: async (): Promise<boolean> => {
    // With cookie-based auth, we can't check authentication status client-side
    // The backend will handle this via the /auth/verify endpoint
    return false; // This will be determined by the backend
  },

  ApiError,
};