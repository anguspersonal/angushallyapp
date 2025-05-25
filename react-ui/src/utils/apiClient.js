import { getStoredToken, clearAuthData } from './authUtils.js';

// Get API base URL from environment, with fallback
const isDevelopment = process.env.NODE_ENV === 'development';
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, ''); // strip any trailing slash

// Log environment details for debugging
console.log('Environment details:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  isDevelopment,
  apiBaseUrl,
  fallbackUsed: !apiBaseUrl
});

// Use the environment-specific API base URL
export const API_BASE = apiBaseUrl || (isDevelopment ? 'http://localhost:5000/api' : '/api');

class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

async function apiClient(endpoint, options = {}) {
    const token = await getStoredToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
        credentials: 'include', // Include cookies if needed
    };

    const fullUrl = `${API_BASE}${endpoint}`;
    console.log('Making request to:', {
        method: options.method || 'GET',
        url: fullUrl,
        headers: headers,
        hasToken: !!token
    });

    try {
        const response = await fetch(fullUrl, config);
        
        // Log response details
        console.log('Response received:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            url: response.url
        });
        
        // Handle HTML responses (usually error pages)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            const text = await response.text();
            console.error('Received HTML instead of JSON:', {
                contentType,
                status: response.status,
                text: text.substring(0, 500) // Log first 500 chars of response
            });
            throw new ApiError('Received HTML response instead of JSON', response.status, null);
        }

        // For non-204 responses, try to parse JSON
        let data = null;
        if (response.status !== 204) {
            try {
                data = await response.json();
            } catch (e) {
                console.error('Failed to parse JSON response:', e);
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
                data?.error || getErrorMessage(response.status),
                response.status,
                data
            );
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            console.error('Network error details:', {
                url: fullUrl,
                error: error.message,
                stack: error.stack
            });
            throw new ApiError('Network error - please check your connection', 0, null);
        }
        console.error('API request failed:', error);
        throw new ApiError(error.message, 0, null);
    }
}

// Helper function to get meaningful error messages
function getErrorMessage(status) {
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

export const api = {
    get: (endpoint, options = {}) => apiClient(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, data, options = {}) => apiClient(endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
    }),
    put: (endpoint, data, options = {}) => apiClient(endpoint, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (endpoint, options = {}) => apiClient(endpoint, { ...options, method: 'DELETE' }),
    
    // Helper method to check if user is authenticated
    isAuthenticated: async () => {
        const token = await getStoredToken();
        return !!token;
    },
    
    // Export ApiError class for type checking
    ApiError
}; 