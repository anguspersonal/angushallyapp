'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ActionIcon } from '@mantine/core';
import { IconMessageCircle2 } from '@tabler/icons-react';
import { isChatVisible } from '@/lib/chat/visibility';
import { VISIBILITY } from '@/lib/chat/visibility.config';
import styles from './chat.module.css';

// Lazy-load the panel so the launcher itself stays tiny (NFR Bundle size).
const ChatPanel = dynamic(() => import('./ChatPanel').then((mod) => mod.ChatPanel), {
  ssr: false,
});

/**
 * Floating chat launcher. Renders only on routes where visibility config
 * allows it (FR-VIS-5); always rendered client-side (FR-UI-1).
 */
export function ChatLauncher() {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = React.useState(false);

  if (!isChatVisible(pathname, VISIBILITY)) {
    return null;
  }

  return (
    <>
      {!open && (
        <ActionIcon
          className={styles.launcher}
          size="xl"
          radius="xl"
          variant="filled"
          aria-label="Open chat"
          onClick={() => setOpen(true)}
        >
          <IconMessageCircle2 size={26} />
        </ActionIcon>
      )}
      {open && <ChatPanel onClose={() => setOpen(false)} />}
    </>
  );
}
