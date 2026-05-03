'use client';

import React from 'react';
import { Title, Text, Stack } from '@mantine/core';
import { Section } from '@/components/layout';
import { GlassContent } from '@/components/design/Glass';
import { SayHelloPill } from '@/components/design/SayHelloPill';

export default function MathsTutoringPage() {
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
            Maths Tutoring
          </Title>
          <Text c="dimmed">One-to-one tutoring for secondary and A-level students. Full copy coming soon.</Text>
          <Text c="var(--site-ink)">
            Interested? Drop me a line via the contact page and mention maths tutoring.
          </Text>
          <SayHelloPill />
        </Stack>
      </GlassContent>
    </Section>
  );
}
