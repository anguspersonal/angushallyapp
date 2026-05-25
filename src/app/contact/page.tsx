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
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
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

  const handleSubmit = async (values: ContactFormValues) => {
    if (!captchaValue) {
      setStatus('Please complete the CAPTCHA.');
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
          <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
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
                <Group justify="center" mt="md" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                  {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
                    <ReCAPTCHA
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                      onChange={(value: string | null) => setCaptchaValue(value)}
                    />
                  ) : (
                    <Text size="sm" ta="center" style={{ color: 'var(--mantine-color-dimmed)' }}>
                      Contact form verification is temporarily unavailable. Please email me directly at{' '}
                      <Anchor href="mailto:angus.hally@gmail.com">angus.hally@gmail.com</Anchor>.
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
                <Group justify="center" mt="xl">
                  <PrimaryPillButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending…' : 'Send Message'}
                  </PrimaryPillButton>
                </Group>
              </motion.div>

              {status && (
                <motion.div custom={7} variants={formElementVariants}>
                  <Text
                    ta="center"
                    mt="md"
                    style={{
                      color: status.includes('successfully')
                        ? 'var(--mantine-color-teal-6)'
                        : status.includes('Failed') || status.includes('error') || status.includes('Please complete')
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
