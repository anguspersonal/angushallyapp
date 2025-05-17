const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

async function getAuthToken() {
    // Try localStorage first (for "Remember me")
    let token = localStorage.getItem('googleToken');
    if (!token) {
        // Fall back to sessionStorage
        token = sessionStorage.getItem('googleToken');
    }
    return token;
}

async function apiClient(endpoint, options = {}) {
    const token = await getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (response.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('googleToken');
            localStorage.removeItem('tokenExpiration');
            sessionStorage.removeItem('googleToken');
            window.location.href = '/login';
            return;
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
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
}; 