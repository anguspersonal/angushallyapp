'use client';

import React from "react";
import { Title, Text, Paper, Badge, Group, Stack } from '@mantine/core';
import { Section } from '@/components/layout';
import { IconAlertTriangle } from '@tabler/icons-react';

export default function InstapaperPage() {
  return (
    <Section width="narrow" padY="default">
      <Stack gap="lg">
        <Title order={1} ta="center">Instapaper Reader</Title>

        <Paper p="lg" radius="md" withBorder>
          <Group gap="sm" mb="md">
            <IconAlertTriangle size={24} color="var(--mantine-color-yellow-6)" />
            <Badge color="gray" variant="light" size="lg">Archived</Badge>
          </Group>
          <Text mb="md" c="dark">
            This feature required backend database integration that is no longer maintained.
          </Text>
        </Paper>
      </Stack>
    </Section>
  );
}
