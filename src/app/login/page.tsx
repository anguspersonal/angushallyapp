'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import {
  Alert,
  Anchor,
  Button,
  Divider,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Section } from '@/components/layout';

type Mode = 'signin' | 'signup';

interface FormValues {
  fullName: string;
  email: string;
  password: string;
}

function LoginContent() {
  const { user, loginWithGoogle, loginWithEmail, signUpWithEmail, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryError = searchParams.get('error');
  const redirect = searchParams.get('redirect');

  const [mode, setMode] = useState<Mode>('signin');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const form = useForm<FormValues>({
    initialValues: { fullName: '', email: '', password: '' },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Enter a valid email'),
      password: (value) => (value.length < 8 ? 'Password must be at least 8 characters' : null),
      fullName: (value) =>
        mode === 'signup' && value.trim().length < 2 ? 'Name must be at least 2 characters' : null,
    },
  });

  useEffect(() => {
    if (user && !isLoading) {
      const target = redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';
      router.push(target);
    }
  }, [user, isLoading, router, redirect]);

  const handleSubmit = async (values: FormValues) => {
    setFormError(null);
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        const { error } = await loginWithEmail({ email: values.email, password: values.password });
        if (error) setFormError(error);
      } else {
        const { error, needsEmailConfirmation } = await signUpWithEmail({
          email: values.email,
          password: values.password,
          fullName: values.fullName.trim() || undefined,
        });
        if (error) {
          setFormError(error);
        } else if (needsEmailConfirmation) {
          setConfirmationSent(true);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setFormError(null);
    setConfirmationSent(false);
    form.clearErrors();
  };

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
      <Stack gap="lg">
        <Stack gap="xs" align="center">
          <Title order={2}>{mode === 'signin' ? 'Sign In' : 'Create an account'}</Title>
          <Text c="gray" ta="center" opacity={0.65}>
            {mode === 'signin'
              ? 'Sign in with email or Google.'
              : 'Sign up with email, or continue with Google.'}
          </Text>
        </Stack>

        {queryError && !formError && (
          <Alert color="red" title="Authentication Error">
            Sign-in failed. Please try again.
          </Alert>
        )}

        {confirmationSent ? (
          <Alert color="success" title="Check your email">
            We&apos;ve sent a confirmation link to <strong>{form.values.email}</strong>. Click it to activate your account.
          </Alert>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
            <Stack gap="md">
              {mode === 'signup' && (
                <TextInput
                  label="Full name"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  {...form.getInputProps('fullName')}
                />
              )}
              <TextInput
                label="Email"
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                required
                {...form.getInputProps('email')}
              />
              <PasswordInput
                label="Password"
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                {...form.getInputProps('password')}
              />

              {formError && (
                <Alert color="red" title="Authentication Error">
                  {formError}
                </Alert>
              )}

              <Button type="submit" size="md" loading={submitting} fullWidth>
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </Button>
            </Stack>
          </form>
        )}

        <Divider label="or" labelPosition="center" />

        <Button
          variant="outline"
          size="md"
          onClick={() => loginWithGoogle()}
          fullWidth
        >
          Continue with Google
        </Button>

        <Text ta="center" size="sm" c="gray">
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <Anchor component="button" type="button" onClick={() => switchMode('signup')}>
                Sign up
              </Anchor>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Anchor component="button" type="button" onClick={() => switchMode('signin')}>
                Sign in
              </Anchor>
            </>
          )}
        </Text>
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
