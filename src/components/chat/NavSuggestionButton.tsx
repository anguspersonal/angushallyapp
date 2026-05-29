'use client';

import * as React from 'react';
import { Button } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { ROUTE_ALLOWLIST } from '@/lib/chat/tools.allowlist.generated';
import styles from './chat.module.css';

type Props = {
  path: string;
  label: string;
  /** Called before navigation. Used to close the panel on mobile (FR-RES-26). */
  onBeforeNavigate?: () => void;
};

/**
 * Renders a `navigate` tool proposal as a clickable button. Defense-in-
 * depth: re-validates the path against ROUTE_ALLOWLIST client-side even
 * though the server should have already filtered it. If the path is off-
 * allowlist, renders disabled and logs — better than silently routing
 * to a 404.
 *
 * On mobile (<--bp-sm) the panel closes BEFORE the route change so the
 * destination isn't obscured (FR-RES-26). On tablet+ the panel stays
 * open across the route change.
 */
export function NavSuggestionButton({ path, label, onBeforeNavigate }: Props) {
  const router = useRouter();
  const isAllowed = (ROUTE_ALLOWLIST as readonly string[]).includes(path);

  if (!isAllowed) {
    console.warn('[chat] NavSuggestionButton: path not in allowlist, refusing to render:', path);
    return null;
  }

  const handleClick = () => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 47.99em)').matches;
    if (isMobile && onBeforeNavigate) {
      onBeforeNavigate();
    }
    router.push(path);
  };

  return (
    <Button
      className={styles.navButton}
      variant="light"
      size="sm"
      rightSection={<IconArrowRight size={14} />}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}
