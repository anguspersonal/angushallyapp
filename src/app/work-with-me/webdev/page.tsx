'use client';

import React from 'react';
import { Title, Text, Stack } from '@mantine/core';
import { Section } from '@/components/layout';
import { GlassContent } from '@/components/design/Glass';
import { SayHelloPill } from '@/components/design/SayHelloPill';

export default function WebDevPage() {
  return (
    <Section width="narrow" padY="default">
      <GlassContent p="xl">
        <Stack gap="md">
          <Title
            order={1}
            style={{
              fontFamily: 'var(--font-display), League Gothic, sans-serif',
              textTransform: 'uppercase',
              fontWeight: 400,
            }}
            c="var(--site-ink)"
          >
            Web Development
          </Title>
          <Text c="dimmed">Custom web apps and sites, built to ship. Full copy coming soon.</Text>
          <Text c="var(--site-ink)">
            If you&apos;ve got a project in mind, drop me a line via the contact page and mention web dev.
          </Text>
          <SayHelloPill />
        </Stack>
      </GlassContent>
    </Section>
  );
}
