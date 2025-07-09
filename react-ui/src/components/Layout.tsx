import { AppShell } from '@mantine/core';
import Header from './Header';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AppShell
      header={{ height: 80 }}
      styles={(theme) => ({
        main: {
          paddingTop: `calc(${theme.spacing.xl} + 80px)`,
          paddingBottom: theme.spacing.xl,
          paddingLeft: theme.spacing.md,
          paddingRight: theme.spacing.md,
        },
      })}
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
} 