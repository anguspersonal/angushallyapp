'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, Button, Container, Group, Burger } from '@mantine/core';
import {
  IconUser,
  IconArticle,
  IconRocket,
  IconFolder,
  IconLogout,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../providers/AuthProvider';
import { NavigationLink } from '../shared/types';

const links: NavigationLink[] = [
  { link: '/projects', label: 'Projects', icon: IconFolder },
  { link: '/blog', label: 'Blog', icon: IconArticle },
  { link: '/about', label: 'About', icon: IconUser },
  { link: '/collab', label: 'Collab', icon: IconRocket },
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
        >
          Logout
        </Button>
      );
    }
    return (
      <Link href="/login" style={{ textDecoration: 'none' }}>
        <Button variant="subtle">
          Login
        </Button>
      </Link>
    );
  };

  const items = links.map((link) => {
    const Icon = link.icon;
    
    return (
      <Link
        key={link.label}
        href={link.link}
        style={{
          textDecoration: 'none',
          color: 'var(--text-color)',
          fontWeight: 500,
          fontSize: '1.1em',
          transition: 'color 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
          const target = e.target as HTMLAnchorElement;
          target.style.color = 'var(--primary-color)';
          target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
          const target = e.target as HTMLAnchorElement;
          target.style.color = 'var(--text-color)';
          target.style.backgroundColor = 'transparent';
        }}
      >
        <Icon size={18} />
        {link.label}
      </Link>
    );
  });

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: 'var(--background-color)',
        borderBottom: '1px solid rgba(233, 236, 239, 0.5)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Container size="xl" h="100%">
        <Group justify="space-between" h="100%">
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Image 
              src="/AH-logo-no-background.ico" 
              alt="AH Logo" 
              width={60}
              height={60}
              style={{
                height: 'clamp(40px, 5vw, 60px)',
                width: 'auto',
                transition: 'height 0.3s ease'
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <Group gap={5} visibleFrom="sm">
            {items}
            {renderAuthButton()}
          </Group>

          {/* Mobile Burger Menu */}
          <Menu
            width={220}
            shadow="md"
            position="bottom-end"
            withArrow
            withinPortal
            opened={opened}
            onClose={() => toggle()}
          >
            <Menu.Target>
              <Burger 
                opened={opened} 
                onClick={toggle} 
                size="sm" 
                hiddenFrom="sm"
                style={{ cursor: 'pointer' }}
              />
            </Menu.Target>

            <Menu.Dropdown>
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Menu.Item
                    key={link.label}
                    leftSection={<Icon size={18} />}
                    onClick={() => toggle()}
                  >
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
                <Menu.Item
                  leftSection={<IconUser size={18} />}
                  onClick={() => toggle()}
                >
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