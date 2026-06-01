'use client';

import React from 'react';
import { Title, Text, Stack, List } from '@mantine/core';
import { motion } from 'framer-motion';
import { Section } from '@/components/layout';
import { ConsentManageLink } from '@/components/consent/ConsentManageLink';
import { CONSENT_CATEGORIES } from '@/lib/consent/types';

/**
 * Privacy page — PLACEHOLDER (issue #140).
 *
 * The canonical privacy-policy content lands separately in #126. For now this
 * page exists so the consent banner / footer can link to a real /privacy route
 * and so visitors can re-open their cookie preferences. It renders in default
 * site chrome (no surface registry entry needed).
 */
export default function PrivacyPage() {
  return (
    <Section width="narrow" padY="default">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title
          order={1}
          mb="lg"
          ta="center"
          style={{
            fontFamily: 'var(--font-display), League Gothic, sans-serif',
            textTransform: 'uppercase',
            fontWeight: 400,
            color: 'var(--site-ink)',
          }}
        >
          Privacy
        </Title>

        <Stack gap="md">
          <Text style={{ color: 'var(--site-ink-muted)' }}>
            The full privacy policy is being finalised. In the meantime, here is
            a summary of how cookies are used on this site and how you can
            control them.
          </Text>

          <Title order={3} style={{ color: 'var(--site-ink)' }}>
            Cookie categories
          </Title>

          <List spacing="sm" style={{ color: 'var(--site-ink-muted)' }}>
            {CONSENT_CATEGORIES.map((cat) => (
              <List.Item key={cat.id}>
                <Text component="span" fw={600} style={{ color: 'var(--site-ink)' }}>
                  {cat.label}
                  {cat.alwaysOn ? ' (always on)' : ''}:
                </Text>{' '}
                {cat.description}{' '}
                <Text component="span" style={{ color: 'var(--site-ink-caption)' }}>
                  e.g. {cat.examples}.
                </Text>
              </List.Item>
            ))}
          </List>

          <Text style={{ color: 'var(--site-ink-muted)' }}>
            You can change which categories you allow at any time:{' '}
            <ConsentManageLink>
              <Text
                component="span"
                style={{ color: 'var(--site-accent)', textDecoration: 'underline', cursor: 'pointer' }}
              >
                open cookie preferences
              </Text>
            </ConsentManageLink>
            .
          </Text>

          <Text size="sm" style={{ color: 'var(--site-ink-caption)' }}>
            Data controller: Angus Hally. Full policy text to follow (#126).
          </Text>
        </Stack>
      </motion.div>
    </Section>
  );
}
