'use client';


import {
  Container,
  Group,
  Burger,
  Paper,
  Transition,
  Text,
  UnstyledButton,
  type MantineSize,
  type MantineTransition,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classes from './Header.module.css';
import type { CSSProperties } from 'react';

// Navigation links with proper typing
interface NavigationLink {
  readonly link: string;
  readonly label: string;
}

const links: readonly NavigationLink[] = [
  { link: '/next/', label: 'Home' },
  { link: '/next/about', label: 'About' },
  { link: '/next/blog', label: 'Blog' },
  { link: '/next/projects', label: 'Projects' },
  { link: '/next/contact', label: 'Contact' },
  { link: '/next/cv', label: 'CV' },
] as const;

export default function Header() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();

  const containerSize: MantineSize = 'md';
  const transitionType: MantineTransition = 'pop-top-right';
  const headerStyles: CSSProperties = { textDecoration: 'none', color: 'inherit' };

  const items = links.map((link) => (
    <UnstyledButton
      component={Link}
      href={link.link}
      key={link.label}
      className={classes.link}
      data-active={pathname === link.link || undefined}
      onClick={() => {
        close();
      }}
    >
      {link.label}
    </UnstyledButton>
  ));

  return (
    <header className={classes.header}>
      <Container size={containerSize} className={classes.inner}>
        <Text
          component={Link}
          href="/next/"
          size="lg"
          fw={700}
          style={headerStyles}
        >
          Angus Hally
        </Text>
        <Group gap={5} visibleFrom="xs">
          {items}
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />

        <Transition transition={transitionType} duration={200} mounted={opened}>
          {(styles) => (
            <Paper className={classes.dropdown} withBorder style={styles}>
              {items}
            </Paper>
          )}
        </Transition>
      </Container>
    </header>
  );
}