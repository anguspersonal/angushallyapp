import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { theme } from '../lib/theme';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Angus Hally - Strategy Consultant & Developer',
  description: 'Personal website of Angus Hally - strategy consultant and amateur developer passionate about business strategy, software, and data.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <MantineProvider theme={theme}>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
