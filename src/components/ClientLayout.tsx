'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { MantineProvider, AppShell } from '@mantine/core';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { theme } from '../lib/theme';
import { resolveSurface } from '../lib/surfaces';
import { AuthProvider } from '../providers/AuthProvider';
import { ConsentProvider } from '../providers/ConsentProvider';
import { AnalyticsProvider } from '../providers/AnalyticsProvider';
import { ErrorBoundary } from './ErrorBoundary';
import Header from './Header';
import Footer from './Footer';
import { GradientRoot } from '@/components/design/GradientRoot';
import { homeHeroIntroCompleteMs } from '@/constants/homeHeroEntrance';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogFooter } from '@/components/blog/BlogFooter';
import { ChatLauncher } from '@/components/chat/ChatLauncher';
import { ConsentRoot } from '@/components/consent/ConsentRoot';

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

function SurfaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const def = resolveSurface(pathname);

  // Surface kind "editorial" gets bespoke editorial chrome — no AppShell, no
  // Glass nav, no pill shape. Flat sticky topbar and editorial footer instead.
  if (def?.kind === 'editorial') {
    return (
      <div data-surface={def.surface}>
        <GradientRoot />
        <BlogHeader />
        <main style={{ minHeight: 'calc(100vh - 60px)' }}>{children}</main>
        <BlogFooter />
      </div>
    );
  }

  // Surface kind "fullBleed" — the page owns the entire viewport and renders
  // its own nav / hero / footer. Site Header, Footer, AppShell, and
  // GradientRoot are all suppressed.
  if (def?.kind === 'fullBleed') {
    return (
      <div data-surface={def.surface}>
        <main>{children}</main>
      </div>
    );
  }

  // Default site chrome — Mantine AppShell with Glass header pill and existing footer.
  return (
    <div>
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
    </div>
  );
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <ErrorBoundary>
        <AuthProvider>
          <ConsentProvider>
            {/* AnalyticsProvider sits inside ConsentProvider so it can read the
                analytics consent gate; it initialises PostHog only after consent
                (and only when a key is configured) and captures pageviews on
                route change. Renders no chrome. */}
            <AnalyticsProvider />
            {/* SurfaceShell owns per-surface chrome; ConsentRoot sits beside it
                so the banner / preference center appear site-wide (default,
                blog, projects, persona) without any surface knowing about it. */}
            <SurfaceShell>{children}</SurfaceShell>
            <ChatLauncher />
            <ConsentRoot />
          </ConsentProvider>
        </AuthProvider>
      </ErrorBoundary>
    </MantineProvider>
  );
}
