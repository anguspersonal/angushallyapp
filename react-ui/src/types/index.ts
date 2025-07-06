// Core application types

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  token: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface GoogleAuthResponse {
  credential: string;
  select_by: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  data?: any;
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

// Authentication Context Types
export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: (redirectTo?: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  isLoading: boolean;
  handleAuthError: (error: any) => Promise<void>;
  token?: string;
}

// Common Form Types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  captcha?: string;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStates {
  [key: string]: LoadingState;
}

// Re-export types from other modules
export * from './api';
export * from './components';
export * from './routes';