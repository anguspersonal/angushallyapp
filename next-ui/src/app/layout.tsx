import * as React from 'react';
import '@mantine/core/styles.css';
import '../index.css';
import '../general.css';
import type { Metadata } from 'next';
import ClientLayout from '@/components/ClientLayout';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'Angus Hally App',
  description: 'Personal website of Angus Hally - strategy consultant and amateur developer passionate about business strategy, software, and data.',
  icons: {
    icon: '/AH-logo-no-background.ico',
    shortcut: '/AH-logo-no-background.ico',
    apple: '/ah-logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === 'production' && <link rel="manifest" href="/manifest.json" />}
        <link rel="icon" href="/AH-logo-no-background.ico" />
        <link rel="shortcut icon" href="/AH-logo-no-background.ico" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
        {process.env.NODE_ENV === 'production' && <ServiceWorkerRegistration />}
      </body>
    </html>
  );
} 