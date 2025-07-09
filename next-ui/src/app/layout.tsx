import * as React from 'react';
import '@mantine/core/styles.css';
import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from '@/components/ClientLayout';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'Angus Hally - Strategy Consultant & Developer',
  description: 'Personal website of Angus Hally - strategy consultant and amateur developer passionate about business strategy, software, and data.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
} 