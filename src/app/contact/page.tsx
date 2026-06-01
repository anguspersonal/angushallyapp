'use client';

import React, { useEffect, useState } from 'react';
import { CONTACT_DRAFT_STORAGE_KEY, type ContactDraft } from '@/components/chat/ContactDraftCard';
import {
  Box,
  Title,
  TextInput,
  Textarea,
  Anchor,
  Text,
  Group,
  Stack,
} from '@mantine/core';
import { Section } from '@/components/layout';
import { useForm } from '@mantine/form';
import ReCAPTCHA from 'react-google-recaptcha';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { api } from '@/lib/api/client';
import { GlassContent } from '@/components/design/Glass';
import { PrimaryPillButton } from '@/components/design/SayHelloPill';
import { useConsentGate } from '@/lib/consent/useConsentGate';

const formElementVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const captchaRequired = Boolean(recaptchaSiteKey);

  // Consent gate (issue #140): reCAPTCHA is categorised under "Security".
  // It loads either when the user has consented to Security up-front, OR the
  // moment they interact with the form — a legitimate anti-spam use that keeps
  // the existing /contact flow working for everyone (see
  // docs/consent-categorisation.md). We therefore never block submission; we
  // only defer the *eager* script load until consent or interaction.
  const securityConsented = useConsentGate('security');
  const [hasInteracted, setHasInteracted] = useState(false);
  const markInteracted = () => setHasInteracted(true);
  const recaptchaActive = captchaRequired && (securityConsented || hasInteracted);

  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  // True once reCAPTCHA's script finishes loading. Gates the submit button so
  // users on slow networks can't click Send before the widget is interactive
  // (issue #101). When the widget hasn't mounted yet (no consent + no
  // interaction), there is nothing to wait for, so we treat it as ready.
  const [captchaReady, setCaptchaReady] = useState(!captchaRequired);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    initialValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
    validate: {
      name: (value: string) => (value.trim().length < 2 ? 'Name must have at least 2 letters' : null),
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      subject: (value: string) => (value.trim().length === 0 ? 'Subject cannot be empty' : null),
      message: (value: string) => (value.trim().length < 10 ? 'Message must be at least 10 characters long' : null),
    },
  });

  // Hand-off from the chatbot: if a draft was placed in sessionStorage by
  // the ContactDraftCard (task 9 / FR-AGENT-8), prefill the form once on
  // mount and clear the key. Form remains fully editable; reCAPTCHA flow
  // is untouched.
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(CONTACT_DRAFT_STORAGE_KEY);
    } catch {
      // Private-mode Safari can throw on sessionStorage access; degrade silently.
      return;
    }
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as ContactDraft;
      form.setValues({
        name: typeof draft.name === 'string' ? draft.name : '',
        email: typeof draft.email === 'string' ? draft.email : '',
        subject: typeof draft.subject === 'string' ? draft.subject : '',
        message: typeof draft.body === 'string' ? draft.body : '',
      });
    } catch (err) {
      console.warn('[contact] failed to parse chat draft', err);
    } finally {
      try {
        sessionStorage.removeItem(CONTACT_DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    // We intentionally exclude `form` from deps — only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the reCAPTCHA widget becomes active (consent or interaction) and a key
  // is configured, the script must finish loading before submit is allowed —
  // reset readiness so the #101 gate applies once the widget mounts.
  useEffect(() => {
    if (recaptchaActive) {
      setCaptchaReady(false);
    }
  }, [recaptchaActive]);

  const handleSubmit = async (values: ContactFormValues) => {
    // Submitting is itself an interaction, so ensure the widget is mounted.
    if (captchaRequired && !recaptchaActive) {
      setHasInteracted(true);
      form.setFieldError('captcha', 'Please complete the CAPTCHA.');
      return;
    }
    if (captchaRequired && !captchaValue) {
      // Single channel for this error — the field-level slot under the widget.
      // (Previously also surfaced via setStatus, which duplicated the message.)
      form.setFieldError('captcha', 'Please complete the CAPTCHA.');
      return;
    }

    setStatus('Sending...');
    setIsSubmitting(true);
    try {
      await api.post('/contact', { ...values, recaptchaToken: captchaValue });
      setStatus('Message sent successfully! Thanks for reaching out.');
      form.reset();
      setCaptchaValue(null);
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('An error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section width="narrow" padY="default">
      <motion.div initial="hidden" animate="visible">
        <motion.div custom={0} variants={formElementVariants}>
          <Title
            order={2}
            mb="xl"
            ta="center"
            style={{
              fontFamily: 'var(--font-display), League Gothic, sans-serif',
              textTransform: 'uppercase',
              fontWeight: 400,
              color: 'var(--site-ink)',
            }}
          >
            Get In Touch
          </Title>
        </motion.div>

        <GlassContent p="xl">
          <Box
            component="form"
            onSubmit={form.onSubmit(handleSubmit)}
            // First interaction with the form is a legitimate anti-spam signal
            // that mounts the (Security-category) reCAPTCHA even without
            // up-front consent (issue #140).
            onFocusCapture={markInteracted}
            onChangeCapture={markInteracted}
          >
            <Stack gap="md">
              <motion.div custom={1} variants={formElementVariants}>
                <TextInput
                  required
                  label="Name"
                  placeholder="Your name"
                  {...form.getInputProps('name')}
                  styles={{ label: { textAlign: 'left' } }}
                />
              </motion.div>

              <motion.div custom={2} variants={formElementVariants}>
                <TextInput
                  required
                  label="Email"
                  placeholder="your@email.com"
                  {...form.getInputProps('email')}
                  styles={{ label: { textAlign: 'left' } }}
                />
              </motion.div>

              <motion.div custom={3} variants={formElementVariants}>
                <TextInput
                  required
                  label="Subject"
                  placeholder="What's this about?"
                  {...form.getInputProps('subject')}
                  styles={{ label: { textAlign: 'left' } }}
                />
              </motion.div>

              <motion.div custom={4} variants={formElementVariants}>
                <Textarea
                  required
                  label="Message"
                  placeholder="Your message..."
                  minRows={4}
                  {...form.getInputProps('message')}
                  styles={{ label: { textAlign: 'left' } }}
                />
              </motion.div>

              <motion.div custom={5} variants={formElementVariants}>
                <Group justify="center" mt="md">
                  {!recaptchaSiteKey ? (
                    <Text size="sm" ta="center" style={{ color: 'var(--mantine-color-dimmed)' }}>
                      Contact form verification is temporarily unavailable. Please email me directly at{' '}
                      <Anchor href="mailto:angus.hally@gmail.com">angus.hally@gmail.com</Anchor>.
                    </Text>
                  ) : recaptchaActive ? (
                    <ReCAPTCHA
                      sitekey={recaptchaSiteKey}
                      onChange={(value: string | null) => setCaptchaValue(value)}
                      onExpired={() => setCaptchaValue(null)}
                      // asyncScriptOnLoad is supported by react-google-recaptcha
                      // at runtime but absent from its TS types.
                      {...({ asyncScriptOnLoad: () => setCaptchaReady(true) } as Record<string, unknown>)}
                    />
                  ) : (
                    // Security category not yet consented and no interaction
                    // yet: defer the reCAPTCHA script. It loads the instant the
                    // user starts filling the form (legitimate anti-spam use).
                    <Text size="xs" ta="center" style={{ color: 'var(--mantine-color-dimmed)' }}>
                      Spam protection loads when you start typing.
                    </Text>
                  )}
                </Group>
                {form.errors.captcha && (
                  <Text c="red" size="sm" ta="center" mt="xs">
                    {form.errors.captcha}
                  </Text>
                )}
              </motion.div>

              <motion.div custom={6} variants={formElementVariants}>
                <Stack gap={4} align="center" mt="xl">
                  <PrimaryPillButton type="submit" disabled={isSubmitting || !captchaReady}>
                    {isSubmitting ? 'Sending…' : 'Send Message'}
                  </PrimaryPillButton>
                  {captchaRequired && !captchaReady && (
                    <Text size="xs" ta="center" style={{ color: 'var(--mantine-color-dimmed)' }}>
                      Verifying you’re human…
                    </Text>
                  )}
                </Stack>
              </motion.div>

              {status && (
                <motion.div custom={7} variants={formElementVariants}>
                  <Text
                    ta="center"
                    mt="md"
                    style={{
                      color: status.includes('successfully')
                        ? 'var(--mantine-color-teal-6)'
                        : status.includes('Failed') || status.includes('error')
                          ? 'var(--mantine-color-red-6)'
                          : 'var(--mantine-color-dimmed)',
                    }}
                  >
                    {status}
                  </Text>
                </motion.div>
              )}
            </Stack>
          </Box>
        </GlassContent>
      </motion.div>
    </Section>
  );
}
