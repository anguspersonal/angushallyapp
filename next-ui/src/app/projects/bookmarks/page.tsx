'use client';

import React from "react";
import { Container, Title, Text, Paper, Badge, Group, Stack } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

export default function BookmarksPage() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1} ta="center">Bookmarks</Title>

        <Paper p="lg" radius="md" withBorder>
          <Group gap="sm" mb="md">
            <IconAlertTriangle size={24} color="var(--mantine-color-yellow-6)" />
            <Badge color="accent" variant="light" size="lg">Deprecated</Badge>
          </Group>
          <Text mb="md" c="dark">
            This feature required a Raindrop.io OAuth integration and database that are no longer maintained.
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
}
