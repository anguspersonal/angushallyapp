import * as React from 'react';
import '@mantine/core/styles.css';
import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from '@/components/ClientLayout';

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
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
} 