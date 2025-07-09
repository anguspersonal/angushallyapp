'use client';

import * as React from 'react';
import '@mantine/core/styles.css';
import { MantineProvider, AppShell } from '@mantine/core';
import { theme } from '../lib/theme';
import { AuthProvider } from '../providers/AuthProvider';
import Header from '../components/Header';
import './globals.css';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <MantineProvider theme={theme}>
          <AuthProvider>
            <AppShell
              padding={0}
              header={{ height: 80 }}
            >
              <AppShell.Header>
                <Header />
              </AppShell.Header>

              <AppShell.Main pt={80}>
                {children}
              </AppShell.Main>
            </AppShell>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
