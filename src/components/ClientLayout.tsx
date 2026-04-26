'use client';

import * as React from 'react';
import { MantineProvider, AppShell } from '@mantine/core';
import { theme } from '../lib/theme';
import { AuthProvider } from '../providers/AuthProvider';
import { ErrorBoundary } from './ErrorBoundary';
import Header from './Header';
import Footer from './Footer';
import { GradientRoot } from '@/components/design/GradientRoot';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <ErrorBoundary>
        <AuthProvider>
          <GradientRoot />
          <AppShell padding={0} header={{ height: 80 }}>
            <AppShell.Header withBorder={false} style={{ background: 'transparent' }}>
              <Header />
            </AppShell.Header>

            <AppShell.Main pt={80}>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)' }}>
                <div style={{ flex: 1 }}>{children}</div>
                <Footer />
              </div>
            </AppShell.Main>
          </AppShell>
        </AuthProvider>
      </ErrorBoundary>
    </MantineProvider>
  );
}
