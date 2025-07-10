'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { api } from '../shared/apiClient';
import { clearAuthData, getStoredUser } from '../shared/authUtils';
import type { User, AuthContextType, LoginCredentials } from '../shared/types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthVerifyResponse {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const login = async (credentials: LoginCredentials): Promise<void> => {
    // This function is for traditional email/password login
    // Google OAuth is handled directly in the Login component
    console.log('Traditional login called with:', credentials);
    throw new Error('Traditional login not implemented - use Google OAuth');
  };

  const logout = async (redirectTo: string = '/login'): Promise<void> => {
    await clearAuthData();
    setUser(null);
    if (redirectTo) {
      router.push(redirectTo);
    }
  };

  const handleAuthError = async (error: unknown): Promise<void> => {
    if (error instanceof api.ApiError) {
      switch (error.status) {
        case 401:
          // Only redirect to login if we're not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            await logout('/login');
          } else {
            // If we're already on the login page, just clear the auth data
            await clearAuthData();
            setUser(null);
          }
          break;
        case 403:
          // Could redirect to a different page for forbidden access
          router.push('/unauthorized');
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
        } catch (error: unknown) {
          if (error instanceof api.ApiError && error.status === 401) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up periodic token check (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}