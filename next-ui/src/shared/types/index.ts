// Shared types barrel export
// This file re-exports all types for easier importing

// User and authentication types
export type {
  User,
  LoginCredentials,
  GoogleAuthResponse,
  AuthContextType,
} from './user';

// API client types
export type {
  ApiClientOptions,
  ApiClientInterface,
  ApiResponse,
  PaginationInfo,
  PaginatedResponse,
} from './api';

export { ApiError } from './api';