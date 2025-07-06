import { getStoredToken, clearAuthData } from './authUtils';
import { ApiError, ApiClientOptions, ApiClientInterface } from '../types/api';

// Get API base URL from environment, with fallback
const isDevelopment = process.env.NODE_ENV === 'development';
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, ''); // strip any trailing slash

// Use the environment-specific API base URL
export const API_BASE = apiBaseUrl || (isDevelopment ? 'http://localhost:5000/api' : '/api');

async function apiClient<T = any>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
    const token = await getStoredToken();
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const config: RequestInit = {
        ...options,
        headers,
        credentials: 'include', // Include cookies if needed
    };

    const fullUrl = `${API_BASE}${endpoint}`;

    try {
        const response = await fetch(fullUrl, config);
        
        // Handle HTML responses (usually error pages)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            await response.text(); // Consume the response but don't use it
            throw new ApiError('Received HTML response instead of JSON', response.status, null);
        }

        // For non-204 responses, try to parse JSON
        let data: T | null = null;
        if (response.status !== 204) {
            try {
                data = await response.json();
            } catch (e) {
                throw new ApiError('Invalid JSON response from server', response.status, null);
            }
        }
        
        if (!response.ok) {
            // Handle authentication errors
            if (response.status === 401) {
                await clearAuthData();
            }

            // Throw error with status and data
            throw new ApiError(
                (data as any)?.error || getErrorMessage(response.status),
                response.status,
                data
            );
        }

        return data as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new ApiError('Network error - please check your connection', 0, null);
        }
        throw new ApiError((error as Error).message, 0, null);
    }
}

// Helper function to get meaningful error messages
function getErrorMessage(status: number): string {
    switch (status) {
        case 400:
            return 'Bad request - please check your input';
        case 401:
            return 'Unauthorized - please log in again';
        case 403:
            return 'Forbidden - you do not have access to this resource';
        case 404:
            return 'Resource not found';
        case 429:
            return 'Too many requests - please try again later';
        case 500:
            return 'Server error - please try again later';
        default:
            return 'An error occurred';
    }
}

export const api: ApiClientInterface = {
    get: <T = any>(endpoint: string, options: Omit<ApiClientOptions, 'method'> = {}) => 
        apiClient<T>(endpoint, { ...options, method: 'GET' }),
    
    post: <T = any>(endpoint: string, data?: any, options: Omit<ApiClientOptions, 'method' | 'body'> = {}) => 
        apiClient<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        }),
    
    put: <T = any>(endpoint: string, data?: any, options: Omit<ApiClientOptions, 'method' | 'body'> = {}) => 
        apiClient<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    
    delete: <T = any>(endpoint: string, options: Omit<ApiClientOptions, 'method'> = {}) => 
        apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
    
    // Helper method to check if user is authenticated
    isAuthenticated: async (): Promise<boolean> => {
        const token = await getStoredToken();
        return !!token;
    },
    
    // Export ApiError class for type checking
    ApiError
};