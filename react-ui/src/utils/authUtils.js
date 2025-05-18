/**
 * Check if a token is expired based on its expiration date
 */
export function isTokenExpired(expiration) {
  return expiration && new Date(expiration) <= new Date();
}

/**
 * Store authentication data with optional "remember me" functionality
 */
export async function storeAuthData(token, user, rememberMe = false) {
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
 * Clear all authentication data from both storage types
 */
export async function clearAuthData() {
  // Clear localStorage
  localStorage.removeItem('jwt');
  localStorage.removeItem('user');
  localStorage.removeItem('tokenExpiration');
  
  // Clear sessionStorage
  sessionStorage.removeItem('jwt');
  sessionStorage.removeItem('user');
}

/**
 * Get stored authentication token, checking expiration if applicable
 * Returns null if no valid token is found or if token is expired
 */
export async function getStoredToken() {
  try {
    // Check localStorage first (for "Remember me")
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

    // Here you could add token refresh logic if needed
    // if (token && shouldRefreshToken(token)) {
    //   token = await refreshToken(token);
    // }

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
export async function getStoredUser() {
  try {
    const localUser = localStorage.getItem('user');
    const sessionUser = sessionStorage.getItem('user');
    
    if (localUser) return JSON.parse(localUser);
    if (sessionUser) return JSON.parse(sessionUser);
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
// async function refreshToken(oldToken) {
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
//     const { token } = await response.json();
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
// function shouldRefreshToken(token) {
//   try {
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     const expiresIn = payload.exp * 1000 - Date.now();
//     // Refresh if token expires in less than 5 minutes
//     return expiresIn < 5 * 60 * 1000;
//   } catch (error) {
//     return false;
//   }
// } 