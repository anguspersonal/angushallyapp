'use client';

import React from 'react';
import { IconBrandInstagram, IconBrandLinkedin, IconBrandGithub } from '@tabler/icons-react';
import { ActionIcon, Container, Group, Text } from '@mantine/core';

function Footer() {
  const currentYear = new Date().getFullYear();
  const buildInfo = process.env.NEXT_PUBLIC_BUILD_NUMBER;
  
  return (
    <div style={{
      borderTop: '1px solid var(--mantine-color-gray-3)',
      padding: 'var(--mantine-spacing-md) 0',
      marginTop: 'auto'
    }}>
      <Container size="lg">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--mantine-spacing-md)'
        }}>
          <div>
            <Text size="sm" c="secondary">
              © {currentYear} Angus Hally. All rights reserved.
            </Text>
            {process.env.NODE_ENV === 'development' ? (
              <Text size="xs" c="secondary">
                Development Environment
              </Text>
            ) : buildInfo ? (
              <Text size="xs" c="secondary">
                Build: {buildInfo}
              </Text>
            ) : null}
          </div>
          <Group gap={0} justify="flex-end" wrap="nowrap">
            <ActionIcon 
              size="lg" 
              color="secondary" 
              variant="subtle"
              component="a"
              href="https://www.linkedin.com/in/angus-hally-9ab66a87/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandLinkedin size={18} stroke={1.5} />
            </ActionIcon>
            <ActionIcon 
              size="lg" 
              color="secondary" 
              variant="subtle"
              component="a"
              href="https://github.com/anguspersonal"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandGithub size={18} stroke={1.5} />
            </ActionIcon>
            <ActionIcon 
              size="lg" 
              color="secondary" 
              variant="subtle"
              component="a"
              href="https://www.instagram.com/hallyangus/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandInstagram size={18} stroke={1.5} />
            </ActionIcon>
          </Group>
        </div>
      </Container>
    </div>
  );
}

export default Footer; 