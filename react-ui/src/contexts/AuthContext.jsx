import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/apiClient.js';
import { clearAuthData, getStoredUser } from '../utils/authUtils.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const logout = async (redirectTo = '/login') => {
    await clearAuthData();
    setUser(null);
    if (redirectTo) {
      navigate(redirectTo);
    }
  };

  const handleAuthError = async (error) => {
    if (error instanceof api.ApiError) {
      switch (error.status) {
        case 401:
          // Only redirect to login if we're not already there
          if (!window.location.pathname.includes('/login')) {
            await logout('/login');
          } else {
            // If we're already on the login page, just clear the auth data
            await clearAuthData();
            setUser(null);
          }
          break;
        case 403:
          // Could redirect to a different page for forbidden access
          navigate('/unauthorized');
          break;
        default:
          // For other errors, might want to stay on the same page
          console.error('Auth error:', error);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  };

  const checkAuth = async () => {
    try {
      // First try to get user from storage
      const storedUser = await getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      // Only verify with backend if we have a stored user
      if (storedUser) {
        try {
          const userData = await api.get('/auth/verify');
          setUser(userData);
        } catch (error) {
          if (error.status === 401) {
            // Clear stored data if verification fails
            await clearAuthData();
            setUser(null);
          } else {
            throw error;
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      await handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Set up periodic token check (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    user,
    setUser,
    logout,
    checkAuth,
    isLoading,
    handleAuthError
  };

  if (isLoading) {
    // You could return a loading spinner here
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 