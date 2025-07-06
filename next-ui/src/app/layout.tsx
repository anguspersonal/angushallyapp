import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { theme } from '../lib/theme';

export const metadata = {
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
        <MantineProvider theme={theme}>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
