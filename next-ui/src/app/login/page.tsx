'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/shared/apiClient';
import type { CredentialResponse } from '@react-oauth/google';
import type { User } from '@/shared/types';
import {
  Box, Container, Title, Text, Paper,
  Checkbox, Stack, Alert, Loader
} from '@mantine/core';

const GoogleLoginButton = dynamic(() => import('@/components/GoogleLoginButton'), {
  ssr: false,
  loading: () => <Loader />,
});

export default function LoginPage() {
  const [ready, setReady] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    setReady(true);
    console.log('GOOGLE_CLIENT_ID:', !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  }, []);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (isLoading) return;
    const { credential } = credentialResponse;
    if (!credential) {
      setError('No authentication token received from Google');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Use Next.js API route for Google login
      const response = await api.post<{ user: User }>('/auth/google', {
        credential: credential
      });
      const { user } = response;
      if (!user) throw new Error('Invalid response from server');
      
      // Set user in context (JWT is handled by cookies)
      setUser(user);
      
      // Redirect to home or the intended destination
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to authenticate. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    console.error('Google Sign-In Error');
    setError('Google sign-in failed. Please try again.');
    setIsLoading(false);
  };

  if (!ready) return <Loader />;

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Title order={1} ta="center" mb="xl">Welcome Back!</Title>
        <Text ta="center" mb="md" size="lg">Please login to access your account</Text>
        <Text ta="center" mb="xl" c="secondary">Sign in with your Google account to access member features</Text>
        <Stack align="center" gap="md">
          {error && (
            <Alert color="dark" title="Error" onClose={() => setError(null)} withCloseButton>
              {error}
            </Alert>
          )}
          <Box ta="center" pos="relative">
            {isLoading && (
              <Box 
                pos="absolute" 
                top={0} 
                left={0} 
                right={0} 
                bottom={0} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 1,
                  borderRadius: '4px'
                }}
              >
                <Loader size="sm" />
              </Box>
            )}
            <GoogleLoginButton
              onSuccess={handleSuccess}
              onError={handleError}
              isLoading={isLoading}
            />
          </Box>
          <Checkbox
            label="Remember me"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.currentTarget.checked)}
            disabled={isLoading}
          />
        </Stack>
      </Paper>
    </Container>
  );
} 