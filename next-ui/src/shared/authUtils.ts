// Authentication utility helpers (browser-only)
// These functions rely on Web APIs (localStorage, cookies) and should be
// used in client components or on the browser side.

import type { User } from './types/user';

/**
 * Check if a token is expired based on its expiration date
 */
export function isTokenExpired(expiration: string | null): boolean {
  return expiration !== null && new Date(expiration) <= new Date();
}

/**
 * Store authentication data with optional "remember me" functionality
 */
export async function storeAuthData(
  token: string,
  user: User,
  rememberMe = false,
): Promise<void> {
  const storage = rememberMe ? localStorage : sessionStorage;

  if (rememberMe) {
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
  localStorage.removeItem('jwt');
  localStorage.removeItem('user');
  localStorage.removeItem('tokenExpiration');

  sessionStorage.removeItem('jwt');
  sessionStorage.removeItem('user');

  // Clear cookies
  document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

/**
 * Get stored authentication token, checking expiration if applicable
 * Returns null if no valid token is found or if token is expired
 */
export async function getStoredToken(): Promise<string | null> {
  try {
    // Prefer cookie token
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find((c) => c.trim().startsWith('jwt_token='));
    if (authCookie) return authCookie.split('=')[1].trim();

    // Check localStorage token (Remember Me)
    let token = localStorage.getItem('jwt');
    const expiration = localStorage.getItem('tokenExpiration');
    if (token && isTokenExpired(expiration)) {
      await clearAuthData();
      token = null;
    }

    if (!token) token = sessionStorage.getItem('jwt');
    return token;
  } catch (err) {
    console.error('Error accessing stored token', err);
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
      return { ...user, ...(token || user.token ? { token: token || user.token } : {}) };
    }
    if (sessionUser) {
      const user: User = JSON.parse(sessionUser);
      return { ...user, ...(token || user.token ? { token: token || user.token } : {}) };
    }
    return null;
  } catch (err) {
    console.error('Error parsing stored user', err);
    await clearAuthData();
    return null;
  }
}