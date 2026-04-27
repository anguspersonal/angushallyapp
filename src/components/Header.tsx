'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Button, Container, Group, Burger, Anchor, Box } from '@mantine/core';
import {
  IconHome,
  IconUser,
  IconArticle,
  IconFolder,
  IconLogout,
  IconMessageCircle,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../providers/AuthProvider';
import type { NavigationLink } from '@/types/navigation';
import { GlassChrome } from '@/components/design/Glass';
import { ModeToggle } from '@/components/ModeToggle';

const links: NavigationLink[] = [
  { link: '/', label: 'Home', icon: IconHome },
  { link: '/projects', label: 'Projects', icon: IconFolder },
  { link: '/blog', label: 'Blog', icon: IconArticle },
  { link: '/about', label: 'About', icon: IconUser },
  { link: '/contact', label: 'Contact', icon: IconMessageCircle },
];

function Header() {
  const [opened, { toggle }] = useDisclosure(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = (): void => {
    logout();
    router.push('/login');
  };

  const renderAuthButton = () => {
    if (user) {
      return (
        <Button
          variant="subtle"
          leftSection={<IconLogout size={18} />}
          onClick={handleLogout}
          c="var(--site-ink)"
        >
          Logout
        </Button>
      );
    }
    return (
      <Link href="/login" style={{ textDecoration: 'none' }}>
        <Button variant="subtle" c="var(--site-ink)">
          Login
        </Button>
      </Link>
    );
  };

  const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: 'var(--site-ink)',
    fontWeight: 500,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.65rem',
    borderRadius: 999,
  };

  const items = links.map((link) => {
    const Icon = link.icon;
    return (
      <Link key={link.label} href={link.link} style={linkStyle}>
        <Icon size={16} />
        {link.label}
      </Link>
    );
  });

  return (
    <div style={{ height: '100%', backgroundColor: 'transparent' }}>
      <Container size="xl" h="100%">
        <Group justify="space-between" h="100%" align="center" wrap="nowrap" gap="sm">
          <GlassChrome py={6} px={{ base: 10, sm: 16 }} style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" align="center" wrap="nowrap" gap={6}>
              <Anchor
                component={Link}
                href="/"
                c="var(--site-ink)"
                style={{
                  fontFamily: 'var(--font-display), League Gothic, sans-serif',
                  fontSize: '26px',
                  letterSpacing: 'var(--font-logo-letter-spacing)',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                AH
              </Anchor>

              <Group gap={4} visibleFrom="sm" wrap="nowrap" justify="center" style={{ flex: 1, minWidth: 0 }}>
                {items}
              </Group>

              <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                <ModeToggle />
                <Box visibleFrom="sm">{renderAuthButton()}</Box>
              </Group>
            </Group>
          </GlassChrome>

          <Menu
            width={260}
            shadow="md"
            position="bottom-end"
            withArrow
            withinPortal
            opened={opened}
            onClose={() => toggle()}
          >
            <Menu.Target>
              <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" aria-label="Open menu" />
            </Menu.Target>

            <Menu.Dropdown>
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Menu.Item key={link.label} leftSection={<Icon size={18} />} onClick={() => toggle()}>
                    <Link href={link.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {link.label}
                    </Link>
                  </Menu.Item>
                );
              })}

              <Menu.Divider />

              {user ? (
                <Menu.Item
                  leftSection={<IconLogout size={18} />}
                  onClick={() => {
                    handleLogout();
                    toggle();
                  }}
                >
                  Logout
                </Menu.Item>
              ) : (
                <Menu.Item leftSection={<IconUser size={18} />} onClick={() => toggle()}>
                  <Link href="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                    Login
                  </Link>
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Container>
    </div>
  );
}

export default Header;
