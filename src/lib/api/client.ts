import { messageForHttpStatus } from '../http/httpStatusMessage';
import { ApiError } from './types';
import type { ApiClientOptions, ApiClientInterface } from './types';

export const API_BASE = '/api';

function errorMessageFromJsonBody(data: unknown, status: number): string {
  if (typeof data === 'object' && data !== null && 'error' in data) {
    const msg = (data as { error?: string }).error;
    if (typeof msg === 'string' && msg.length > 0) {
      return msg;
    }
  }
  return messageForHttpStatus(status);
}

async function apiClient<T = unknown>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const { body, ...rest } = options;

  const config: RequestInit = {
    ...rest,
    headers,
    ...(body !== undefined ? { body: body as BodyInit } : {}),
  };

  const fullUrl = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(fullUrl, config);

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      throw new ApiError('Received HTML response instead of JSON', response.status, text);
    }

    const data: unknown = response.status === 204 ? null : await response.json().catch(() => {
      throw new ApiError('Invalid JSON response from server', response.status, null);
    });

    if (!response.ok) {
      throw new ApiError(errorMessageFromJsonBody(data, response.status), response.status, data);
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

export const api: ApiClientInterface = {
  get: <T = unknown>(endpoint: string, options = {}) => apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, data?: unknown, options = {}) =>
    apiClient<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),

  put: <T = unknown>(endpoint: string, data?: unknown, options = {}) =>
    apiClient<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),

  delete: <T = unknown>(endpoint: string, options = {}) => apiClient<T>(endpoint, { ...options, method: 'DELETE' }),

  isAuthenticated: async (): Promise<boolean> => false,

  ApiError,
};
