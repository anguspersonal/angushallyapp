'use client';

import * as React from 'react';

interface LiveClockProps {
  /** Optional class for the surrounding span. */
  className?: string;
}

/**
 * Minute-resolution clock formatted in the visitor's locale.
 *
 * Mirrors the macOS menu-bar clock: short weekday + day + month + 2-digit time.
 * Renders an empty placeholder on first paint to avoid SSR hydration mismatch
 * (the server has no concept of "now"), then takes its first reading on mount
 * and ticks every 60s. Per-minute resolution is intentional — seconds-level
 * updates are unnecessary churn for chrome.
 */
export function LiveClock({ className }: LiveClockProps) {
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
    // Align the first interval to the next minute boundary so the displayed
    // value flips when the wall clock does, not 60s after mount.
    const msUntilNextMinute = 60_000 - (Date.now() % 60_000);
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = window.setTimeout(() => {
      setNow(new Date());
      intervalId = setInterval(() => setNow(new Date()), 60_000);
    }, msUntilNextMinute);
    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Reserve an approximate width during SSR so the bar doesn't reflow on hydrate.
  if (!now) {
    return (
      <span className={className} aria-hidden style={{ visibility: 'hidden' }}>
        Wed 1 Jan 00:00
      </span>
    );
  }

  const formatted = now.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <time
      className={className}
      dateTime={now.toISOString()}
      suppressHydrationWarning
    >
      {formatted}
    </time>
  );
}

export default LiveClock;
