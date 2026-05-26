'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type {
  AuthContextType,
  EmailAuthResult,
  LoginCredentials,
  SignUpCredentials,
  User,
} from '@/lib/auth/types';

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
  loginWithGoogle: async () => { throw new Error('AuthProvider not mounted'); },
  loginWithEmail: async () => ({ error: 'AuthProvider not mounted' }),
  signUpWithEmail: async () => ({ error: 'AuthProvider not mounted' }),
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

  const loginWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, [supabase]);

  const loginWithEmail = useCallback(
    async ({ email, password }: LoginCredentials): Promise<EmailAuthResult> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    [supabase],
  );

  const signUpWithEmail = useCallback(
    async ({ email, password, fullName }: SignUpCredentials): Promise<EmailAuthResult> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: fullName ? { full_name: fullName } : undefined,
        },
      });
      if (error) return { error: error.message };
      // When email confirmation is required, Supabase returns a user without a session.
      return { error: null, needsEmailConfirmation: !data.session };
    },
    [supabase],
  );

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
      loginWithGoogle,
      loginWithEmail,
      signUpWithEmail,
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
