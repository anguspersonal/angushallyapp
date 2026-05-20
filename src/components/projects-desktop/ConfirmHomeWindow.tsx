'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@mantine/core';
import { useWindow } from './WindowContext';
import styles from './ConfirmHomeWindow.module.css';

/**
 * Confirmation window opened from the menu bar's AH brand button.
 * The brand mark on a real Mac opens an Apple menu; here it asks the
 * visitor whether they want to leave the projects desktop and head
 * back to the site home (`/`).
 */
export function ConfirmHomeWindow() {
  const { closeWindow } = useWindow();

  return (
    <div className={styles.root}>
      <p className={styles.message}>
        Leave the Projects desktop and go to the home page?
      </p>
      <div className={styles.actions}>
        <Button
          variant="default"
          size="xs"
          onClick={() => closeWindow('confirm-home')}
        >
          Cancel
        </Button>
        <Button
          component={Link}
          href="/"
          variant="filled"
          size="xs"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
}

export default ConfirmHomeWindow;
