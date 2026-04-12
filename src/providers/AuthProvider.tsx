'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { AuthContextType, User } from '@/lib/auth/types';

function mapSupabaseUser(su: SupabaseUser): User {
  const meta = su.user_metadata ?? {};
  return {
    id: su.id,
    email: su.email ?? '',
    name: meta.full_name ?? meta.name ?? su.email ?? '',
    roles: [], // populated via identity.user_roles if needed
    picture: meta.avatar_url ?? meta.picture,
    given_name: meta.given_name ?? meta.first_name,
    family_name: meta.family_name ?? meta.last_name,
  };
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  login: async () => { throw new Error('Use signInWithOAuth'); },
  logout: async () => {},
  checkAuth: async () => {},
  isLoading: true,
  handleAuthError: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  const checkAuth = useCallback(async () => {
    const { data: { user: su } } = await supabase.auth.getUser();
    setUser(su ? mapSupabaseUser(su) : null);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    // Initial session check
    checkAuth();

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? mapSupabaseUser(session.user) : null);
        setIsLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, [supabase, checkAuth]);

  const login = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, [supabase]);

  const logout = useCallback(async (redirectTo?: string) => {
    await supabase.auth.signOut();
    setUser(null);
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  }, [supabase]);

  const handleAuthError = useCallback(async () => {
    await logout('/login');
  }, [logout]);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      login,
      logout,
      checkAuth,
      isLoading,
      handleAuthError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
