'use client';

import * as React from 'react';
import { MantineProvider, AppShell } from '@mantine/core';
import { theme } from '../lib/theme';
import { AuthProvider } from '../providers/AuthProvider';
import { ErrorBoundary } from './ErrorBoundary';
import Header from './Header';
import Footer from './Footer';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <MantineProvider theme={theme}>
      <ErrorBoundary>
        <AuthProvider>
          <AppShell
            padding={0}
            header={{ height: 80 }}
            footer={{ height: 60 }}
          >
            <AppShell.Header>
              <Header />
            </AppShell.Header>

            <AppShell.Main pt={80} pb={60}>
              {children}
            </AppShell.Main>

            <AppShell.Footer>
              <Footer />
            </AppShell.Footer>
          </AppShell>
        </AuthProvider>
      </ErrorBoundary>
    </MantineProvider>
  );
} 