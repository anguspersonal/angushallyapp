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
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogFooter } from '@/components/blog/BlogFooter';

interface ClientLayoutProps {
  children: React.ReactNode;
}

function isHomePath(pathname: string | null): boolean {
  return pathname === '/' || pathname === '';
}

function isBlogPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/blog' || pathname.startsWith('/blog/');
}

function isProjectsDesktopPath(pathname: string | null): boolean {
  // Only the `/projects` index gets the macOS desktop shell. Sub-routes like
  // `/projects/strava` or `/projects/data-value-game` keep the default site
  // chrome so deep links continue to work as standalone pages.
  return pathname === '/projects';
}

/**
 * Maps a route to a surface attribute. Surface is orthogonal to colour-scheme:
 * components that care about it (Glass, GradientRoot) read it independently.
 * Add new surfaces here when introducing route-level visual systems.
 */
function surfaceForPath(pathname: string | null): 'blog' | 'projects' | undefined {
  if (isBlogPath(pathname)) return 'blog';
  if (isProjectsDesktopPath(pathname)) return 'projects';
  return undefined;
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
  const surface = surfaceForPath(pathname);

  // Surface "blog" gets bespoke editorial chrome — no AppShell, no Glass nav,
  // no pill shape. Flat sticky topbar and editorial footer instead.
  if (surface === 'blog') {
    return (
      <div data-surface="blog">
        <GradientRoot />
        <BlogHeader />
        <main style={{ minHeight: 'calc(100vh - 60px)' }}>{children}</main>
        <BlogFooter />
      </div>
    );
  }

  // Surface "projects" is a full-bleed macOS desktop. Site Header, Footer,
  // AppShell, and GradientRoot are all suppressed — the page owns the entire
  // viewport and renders its own wallpaper, menu bar, and dock.
  if (surface === 'projects') {
    return (
      <div data-surface="projects">
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
          <SurfaceShell>{children}</SurfaceShell>
        </AuthProvider>
      </ErrorBoundary>
    </MantineProvider>
  );
}
