// Shared API client types for Next.js + CRA dual-app

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

// Environment Configuration Types
export interface EnvironmentConfig {
  NODE_ENV: string;
  NEXT_PUBLIC_API_BASE_URL?: string;
  REACT_APP_API_BASE_URL?: string;
  NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string;
  REACT_APP_GOOGLE_CLIENT_ID?: string;
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?: string;
  REACT_APP_GOOGLE_MAPS_API_KEY?: string;
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY?: string;
  REACT_APP_RECAPTCHA_SITE_KEY?: string;
}