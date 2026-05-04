'use client';

import React from 'react';
import Link from 'next/link';
import { Title, Text, SimpleGrid, Stack } from '@mantine/core';
import { Section } from '@/components/layout';
import { GlassContent } from '@/components/design/Glass';

const services = [
  {
    title: 'Consulting',
    href: '/work-with-me/consulting',
    blurb: 'Strategy, data, and product advisory engagements.',
  },
  {
    title: 'Web Development',
    href: '/work-with-me/webdev',
    blurb: 'Custom web apps and sites, built to ship.',
  },
  {
    title: 'Maths Tutoring',
    href: '/work-with-me/maths',
    blurb: 'One-to-one tutoring for secondary and A-level students.',
  },
];

export default function WorkWithMeIndex() {
  return (
    <Section padY="default">
      <Stack gap="lg" mb="xl">
        <Title
          order={1}
          style={{
            fontFamily: 'var(--font-display), League Gothic, sans-serif',
            textTransform: 'uppercase',
            fontWeight: 400,
            color: 'var(--site-ink)',
          }}
        >
          Work with me
        </Title>
        <Text style={{ color: 'var(--mantine-color-dimmed)' }}>Three ways to get in touch. Pick whichever fits, and I&apos;ll follow up.</Text>
      </Stack>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        {services.map((service) => (
          <Link
            key={service.href}
            href={service.href}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <GlassContent p="lg">
              <Title order={3} size="h4" mb="xs" style={{ color: 'var(--site-ink)' }}>
                {service.title}
              </Title>
              <Text size="sm" style={{ color: 'var(--mantine-color-dimmed)' }}>
                {service.blurb}
              </Text>
            </GlassContent>
          </Link>
        ))}
      </SimpleGrid>
    </Section>
  );
}
