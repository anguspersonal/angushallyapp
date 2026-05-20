'use client';

import * as React from 'react';

const MOBILE_BREAKPOINT = 1024;

/**
 * Hook to detect mobile viewport (≤1024px).
 *
 * Returns `true` when viewport width is at or below the tablet breakpoint,
 * `false` when above. Safe for SSR (defaults to `false` during server render).
 *
 * Used by MacDesktop to switch between desktop (macOS) and mobile (iOS Home Screen)
 * layouts for the /projects page.
 */
export function useMobileBreakpoint(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    // Initial check
    check();

    // Listen for resize
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

export default useMobileBreakpoint;
