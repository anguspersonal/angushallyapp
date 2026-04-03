'use client';

import React, { createContext, useContext } from 'react';
import type { AuthContextType } from '../shared/types';

// Auth is deprecated — this is a no-op stub.
// Login, logout, and session management are no longer supported.
// All pages that previously required auth now either redirect or show deprecation notices.

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  login: async () => { throw new Error('Auth is deprecated'); },
  logout: async () => {},
  checkAuth: async () => {},
  isLoading: false,
  handleAuthError: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={{
      user: null,
      setUser: () => {},
      login: async () => { throw new Error('Auth is deprecated'); },
      logout: async () => {},
      checkAuth: async () => {},
      isLoading: false,
      handleAuthError: async () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
