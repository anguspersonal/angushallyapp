'use client';

import React from 'react';
import Link from 'next/link';
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandGithub,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';

type FooterLink = { label: string; href: string };

const mainLinks: FooterLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const workWithMeLinks: FooterLink[] = [
  { label: 'Consulting', href: '/work-with-me/consulting' },
  { label: 'Web Development', href: '/work-with-me/webdev' },
  { label: 'Maths Tutoring', href: '/work-with-me/maths' },
];

function LinkColumn({ heading, links }: { heading: string; links: FooterLink[] }) {
  return (
    <Stack gap="xs">
      <Title
        order={6}
        tt="uppercase"
        fz="xs"
        c="secondary"
        style={{ letterSpacing: '0.1em' }}
      >
        {heading}
      </Title>
      {links.map((link) => (
        <Text
          key={link.href}
          component={Link}
          href={link.href}
          size="sm"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {link.label}
        </Text>
      ))}
    </Stack>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();
  const buildInfo = process.env.NEXT_PUBLIC_BUILD_NUMBER;

  return (
    <footer
      style={{
        borderTop: '1px solid var(--mantine-color-gray-3)',
        padding: 'var(--mantine-spacing-xl) 0 var(--mantine-spacing-md)',
        marginTop: 'auto',
      }}
    >
      <Container size="lg">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mb="xl">
          <LinkColumn heading="Main" links={mainLinks} />
          <LinkColumn heading="Work with me" links={workWithMeLinks} />
          <Stack gap="xs">
            <Title
              order={6}
              tt="uppercase"
              fz="xs"
              c="secondary"
              style={{ letterSpacing: '0.1em' }}
            >
              Connect
            </Title>
            <Group gap={0} wrap="nowrap">
              <ActionIcon
                size="lg"
                color="secondary"
                variant="subtle"
                component="a"
                href="https://www.linkedin.com/in/angus-hally-9ab66a87/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
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
                aria-label="GitHub"
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
                aria-label="Instagram"
              >
                <IconBrandInstagram size={18} stroke={1.5} />
              </ActionIcon>
            </Group>
          </Stack>
        </SimpleGrid>

        <Group
          justify="space-between"
          align="center"
          wrap="wrap"
          gap="sm"
          pt="md"
          style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
        >
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
        </Group>
      </Container>
    </footer>
  );
}

export default Footer;
