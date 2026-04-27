'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { MantineProvider, AppShell } from '@mantine/core';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { theme } from '../lib/theme';
import { AuthProvider } from '../providers/AuthProvider';
import { ErrorBoundary } from './ErrorBoundary';
import Header from './Header';
import Footer from './Footer';
import { GradientRoot } from '@/components/design/GradientRoot';
import { homeHeroIntroCompleteMs } from '@/constants/homeHeroEntrance';

interface ClientLayoutProps {
  children: React.ReactNode;
}

function isHomePath(pathname: string | null): boolean {
  return pathname === '/' || pathname === '';
}

function HomeSyncedHeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const isHome = isHomePath(pathname);
  const [headerRevealed, setHeaderRevealed] = React.useState(() => !isHomePath(pathname));

  React.useLayoutEffect(() => {
    if (!isHome) {
      setHeaderRevealed(true);
      return;
    }

    setHeaderRevealed(false);
    const ms = homeHeroIntroCompleteMs(Boolean(reduceMotion));
    const id = window.setTimeout(() => {
      setHeaderRevealed(true);
    }, ms);
    return () => window.clearTimeout(id);
  }, [isHome, reduceMotion]);

  const headerMotion: Variants = {
    hidden: {
      y: '-100%',
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: reduceMotion ? 0.32 : 0.58,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      variants={headerMotion}
      initial={isHome ? 'hidden' : 'visible'}
      animate={headerRevealed ? 'visible' : 'hidden'}
      style={{
        height: '100%',
        pointerEvents: headerRevealed ? 'auto' : 'none',
      }}
    >
      {children}
    </motion.div>
  );
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <ErrorBoundary>
        <AuthProvider>
          <GradientRoot />
          <AppShell padding={0} header={{ height: 80 }}>
            <AppShell.Header
              withBorder={false}
              style={{ background: 'transparent', overflow: 'hidden' }}
            >
              <HomeSyncedHeaderShell>
                <Header />
              </HomeSyncedHeaderShell>
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
