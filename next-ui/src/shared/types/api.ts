// Shared API client types for Next.js + CRA dual-app

export interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
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