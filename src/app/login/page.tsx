'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { Button, Title, Text, Stack, Alert } from '@mantine/core';
import { Section } from '@/components/layout';

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
      <Section width="narrow" padY="default">
        <Text ta="center">Loading...</Text>
      </Section>
    );
  }

  if (user) return null;

  return (
    <Section width="narrow" padY="default">
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
    </Section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 'var(--section-pad-y-default) var(--container-px)', textAlign: 'center' }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
