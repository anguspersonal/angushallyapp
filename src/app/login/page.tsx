'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { Button, Container, Title, Text, Stack, Alert } from '@mantine/core';

function LoginContent() {
  const { user, login, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    if (user && !isLoading) {
      // Only honour same-origin relative paths to avoid open-redirect.
      const target = redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';
      router.push(target);
    }
  }, [user, isLoading, router, redirect]);

  if (isLoading) {
    return (
      <Container size="xs" py="xl">
        <Text ta="center">Loading...</Text>
      </Container>
    );
  }

  if (user) return null;

  return (
    <Container size="xs" py="xl">
      <Stack gap="lg" align="center">
        <Title order={2}>Sign In</Title>
        <Text c="gray" ta="center" opacity={0.65}>
          Sign in with your Google account to access protected features.
        </Text>

        {error && (
          <Alert color="red" title="Authentication Error">
            Sign-in failed. Please try again.
          </Alert>
        )}

        <Button
          size="lg"
          onClick={() => login({ email: '', password: '' })}
          variant="filled"
        >
          Sign in with Google
        </Button>
      </Stack>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Container size="xs" py="xl"><Text ta="center">Loading...</Text></Container>}>
      <LoginContent />
    </Suspense>
  );
}
