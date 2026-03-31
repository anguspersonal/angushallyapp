'use client';

import React from "react";
import { Container, Title, Text, List, Anchor, Paper, Badge, Group, Stack } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

export default function EatSafeUK() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1} ta="center">Eat Safe UK</Title>

        <Paper p="lg" radius="md" withBorder>
          <Group gap="sm" mb="md">
            <IconAlertTriangle size={24} color="var(--mantine-color-yellow-6)" />
            <Badge color="accent" variant="light" size="lg">Deprecated</Badge>
          </Group>
          <Text mb="md">
            This project helped users check UK food hygiene ratings on an interactive map, combining the Google Maps API with official Food Standards Agency data.
          </Text>
          <Text mb="md" c="dark">
            As of August 2025, this app is no longer maintained due to Google Maps API changes. Here are some alternatives that do the same thing:
          </Text>
          <List spacing="sm">
            <List.Item>
              <Anchor href="https://ratings.food.gov.uk/" target="_blank" rel="noopener noreferrer">
                Food Standards Agency Ratings
              </Anchor>
              {' '}— the official source
            </List.Item>
            <List.Item>
              <Anchor href="https://www.scoresonthedoors.org.uk/" target="_blank" rel="noopener noreferrer">
                Scores on the Doors
              </Anchor>
            </List.Item>
            <List.Item>
              <Anchor href="https://pantryandlarder.com/grubby-grub/" target="_blank" rel="noopener noreferrer">
                Grubby Grub
              </Anchor>
            </List.Item>
          </List>
        </Paper>
      </Stack>
    </Container>
  );
}
