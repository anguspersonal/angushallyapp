/**
 * API client types and interfaces for shared use
 */
export interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
}

export class ApiError extends Error {
  public readonly name = 'ApiError';

  constructor(
    message: string,
    public readonly status: number,
    public readonly data: unknown = null
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export interface ApiClientInterface {
  get: <T = unknown>(endpoint: string, options?: Omit<ApiClientOptions, 'method'>) => Promise<T>;
  post: <T = unknown>(endpoint: string, data?: unknown, options?: Omit<ApiClientOptions, 'method' | 'body'>) => Promise<T>;
  put: <T = unknown>(endpoint: string, data?: unknown, options?: Omit<ApiClientOptions, 'method' | 'body'>) => Promise<T>;
  delete: <T = unknown>(endpoint: string, options?: Omit<ApiClientOptions, 'method'>) => Promise<T>;
  isAuthenticated: () => Promise<boolean>;
  ApiError: typeof ApiError;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface PaginationInfo {
  total_items: number;
  limit: number;
  offset: number;
  total_pages: number;
  current_page: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: PaginationInfo;
}

// Auth Response Types
export interface AuthVerifyResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}