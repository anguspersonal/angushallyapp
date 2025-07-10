'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { api } from '../shared/apiClient';
import type { User, AuthContextType, LoginCredentials } from '../shared/types';
import type { AuthVerifyResponse } from '../shared/types/api';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
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
    try {
      // Call Next.js API route for logout
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
            // If we're already on the login page, just clear the user state
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
      // With cookie-based auth, we always verify with the backend
      const userData = await api.get<AuthVerifyResponse>('/auth/verify');
      // Transform backend response to match User interface
      setUser({
        ...userData,
        name: `${userData.firstName} ${userData.lastName}`.trim()
      });
    } catch (err: unknown) {
      console.error('checkAuth error:', err instanceof Error ? err.message : String(err));
      
      // Handle different types of errors
      if (err instanceof api.ApiError) {
        if (err.status === 401) {
          // User is not authenticated, clear state
          setUser(null);
        } else {
          // For other API errors, log and clear state
          console.error('Auth API error:', err);
          setUser(null);
        }
      } else {
        // For network errors, parsing errors, or other unexpected errors
        console.error('Unexpected auth error:', err);
        setUser(null);
      }
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