'use client';

import React from 'react';
import { Container, Title, Text, Stack } from '@mantine/core';
import { GlassContent } from '@/components/design/Glass';
import { SayHelloPill } from '@/components/design/SayHelloPill';

export default function MathsTutoringPage() {
  return (
    <Container size="sm" py="xl">
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
    </Container>
  );
}
