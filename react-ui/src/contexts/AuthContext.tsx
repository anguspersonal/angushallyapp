import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/apiClient';
import { clearAuthData, getStoredUser } from '../utils/authUtils';
import { User, AuthContextType, AuthVerifyResponse } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const login = async (credentials: { email: string; password: string; rememberMe?: boolean }): Promise<void> => {
    // TODO: Implement login functionality
    throw new Error('Login function not yet implemented');
  };

  const logout = async (redirectTo: string = '/login'): Promise<void> => {
    await clearAuthData();
    setUser(null);
    if (redirectTo) {
      navigate(redirectTo);
    }
  };

  const handleAuthError = async (error: any): Promise<void> => {
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

  const checkAuth = async (): Promise<void> => {
    try {
      // First try to get user from storage
      const storedUser = await getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      // Only verify with backend if we have a stored user
      if (storedUser) {
        try {
          const userData = await api.get<AuthVerifyResponse>('/auth/verify');
          // Merge the verified data with the token from storage
          setUser({
            ...userData,
            token: storedUser.token
          });
        } catch (error: any) {
          console.error('Auth verification error:', error.message || error);
          if (error.status === 401) {
            // Clear stored data if verification fails
            await clearAuthData();
            setUser(null);
          } else {
            // For other errors (network, parsing, etc.), clear auth and set user to null
            console.error('Unexpected auth verification error:', error);
            await clearAuthData();
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.error('checkAuth error:', error.message || error);
      await clearAuthData();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Set up periodic token check (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    setUser,
    login,
    logout,
    checkAuth,
    isLoading,
    handleAuthError,
    token: user?.token
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}