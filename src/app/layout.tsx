import * as React from 'react';
import '@mantine/core/styles.css';
import '../index.css';
import '../general.css';
import './globals.css';
import type { Metadata } from 'next';
import { ColorSchemeScript } from '@mantine/core';
import ClientLayout from '@/components/ClientLayout';
import PwaUpdatePrompt from '@/components/PwaUpdatePrompt';
import { fontClassNames } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Angus Hally App',
  description:
    'Personal website of Angus Hally - COO of HeyLina, building emotionally intelligent AI. Projects, blog, and more.',
  icons: {
    icon: '/AH-logo-no-background.ico',
    shortcut: '/AH-logo-no-background.ico',
    apple: '/ah-logo.jpg',
  },
};

/** Node runtime avoids edge prerender issues when the monorepo briefly had two React copies; safe to keep. */
export const runtime = 'nodejs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontClassNames} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        {process.env.NODE_ENV === 'production' && (
          <link rel="manifest" href="/manifest.json" />
        )}
        <link rel="icon" href="/AH-logo-no-background.ico" />
        <link rel="shortcut icon" href="/AH-logo-no-background.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
        {process.env.NODE_ENV === 'production' && <PwaUpdatePrompt />}
      </body>
    </html>
  );
}
