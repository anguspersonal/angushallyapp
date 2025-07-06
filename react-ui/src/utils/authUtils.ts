import { User } from '../types';

/**
 * Check if a token is expired based on its expiration date
 */
export function isTokenExpired(expiration: string | null): boolean {
  return expiration !== null && new Date(expiration) <= new Date();
}

/**
 * Store authentication data with optional "remember me" functionality
 */
export async function storeAuthData(token: string, user: User, rememberMe: boolean = false): Promise<void> {
  const storage = rememberMe ? localStorage : sessionStorage;
  
  if (rememberMe) {
    // Set expiration to 30 days from now
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    localStorage.setItem('tokenExpiration', expirationDate.toISOString());
  }

  storage.setItem('jwt', token);
  storage.setItem('user', JSON.stringify(user));
}

/**
 * Clear all authentication data from both storage types and cookies
 */
export async function clearAuthData(): Promise<void> {
  // Clear localStorage
  localStorage.removeItem('jwt');
  localStorage.removeItem('user');
  localStorage.removeItem('tokenExpiration');
  
  // Clear sessionStorage
  sessionStorage.removeItem('jwt');
  sessionStorage.removeItem('user');

  // Clear cookies
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

/**
 * Get stored authentication token, checking expiration if applicable
 * Returns null if no valid token is found or if token is expired
 */
export async function getStoredToken(): Promise<string | null> {
  try {
    // First check for cookie-based token
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    if (authCookie) {
      const token = authCookie.split('=')[1].trim();
      return token;
    }

    // If no cookie token, check localStorage (for "Remember me")
    let token = localStorage.getItem('jwt');
    const expiration = localStorage.getItem('tokenExpiration');

    // If token exists in localStorage and is expired, clear it
    if (token && isTokenExpired(expiration)) {
      await clearAuthData();
      token = null;
    }

    // If no valid token in localStorage, check sessionStorage
    if (!token) {
      token = sessionStorage.getItem('jwt');
    }

    return token;
  } catch (error) {
    console.error('Error getting stored token:', error);
    await clearAuthData();
    return null;
  }
}

/**
 * Get stored user data
 * Returns null if no valid user data is found
 */
export async function getStoredUser(): Promise<User | null> {
  try {
    const localUser = localStorage.getItem('user');
    const sessionUser = sessionStorage.getItem('user');
    const token = await getStoredToken();
    
    if (localUser) {
      const user: User = JSON.parse(localUser);
      return { ...user, token: token || user.token };
    }
    if (sessionUser) {
      const user: User = JSON.parse(sessionUser);
      return { ...user, token: token || user.token };
    }
    return null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    await clearAuthData(); // Clear potentially corrupted data
    return null;
  }
}

/**
 * Placeholder for future token refresh logic
 * This could be implemented when needed
 */
// async function refreshToken(oldToken: string): Promise<string | null> {
//   try {
//     const response = await fetch('/api/auth/refresh', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${oldToken}`,
//         'Content-Type': 'application/json'
//       }
//     });
//     
//     if (!response.ok) throw new Error('Token refresh failed');
//     
//     const { token }: { token: string } = await response.json();
//     return token;
//   } catch (error) {
//     console.error('Error refreshing token:', error);
//     await clearAuthData();
//     return null;
//   }
// }

/**
 * Check if token should be refreshed
 * This is a placeholder for future implementation
 */
// function shouldRefreshToken(token: string): boolean {
//   try {
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     const expiresIn = payload.exp * 1000 - Date.now();
//     // Refresh if token expires in less than 5 minutes
//     return expiresIn < 5 * 60 * 1000;
//   } catch (error) {
//     return false;
//   }
// }