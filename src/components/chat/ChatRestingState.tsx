'use client';

import * as React from 'react';
import { Text, Anchor } from '@mantine/core';
import { IconCoffee } from '@tabler/icons-react';
import styles from './chat.module.css';

/**
 * Rendered inside the chat panel when the daily spend cap has been
 * exceeded (FR-RATE-4). Static, server-free fallback: 4 anticipated
 * questions with quick links + a pointer to the contact form.
 *
 * The panel itself stays usable so users can read this and act.
 */
const FAQ: ReadonlyArray<{ q: string; a: React.ReactNode }> = [
  {
    q: 'Who is Angus?',
    a: (
      <>
        See <Anchor href="/about">/about</Anchor> for the full picture, or{' '}
        <Anchor href="/cv">/cv</Anchor> for the working CV.
      </>
    ),
  },
  {
    q: 'What does this site cover?',
    a: (
      <>
        Projects at <Anchor href="/projects">/projects</Anchor>, writing at{' '}
        <Anchor href="/blog">/blog</Anchor>, and a few hidden landing pages
        under <Anchor href="/work-with-me">/work-with-me</Anchor>.
      </>
    ),
  },
  {
    q: 'How do I get in touch?',
    a: (
      <>
        The <Anchor href="/contact">contact form</Anchor> goes directly to
        Angus.
      </>
    ),
  },
  {
    q: 'When will the chat be back?',
    a: 'The daily spend cap resets at 00:00 UTC. Sorry for the rain check.',
  },
];

export function ChatRestingState() {
  return (
    <div className={styles.restingState}>
      <div className={styles.restingHeader}>
        <IconCoffee size={16} />
        <Text fw={600} size="sm">Chat is resting today</Text>
      </div>
      <Text size="sm" className={styles.restingIntro}>
        Today&apos;s spend cap has been reached. In the meantime — here are
        the most common questions, with links to the canonical pages.
      </Text>
      <ul className={styles.restingFaqList}>
        {FAQ.map(({ q, a }) => (
          <li key={q} className={styles.restingFaqItem}>
            <Text fw={500} size="sm" className={styles.restingFaqQ}>
              {q}
            </Text>
            <Text size="sm" className={styles.restingFaqA}>
              {a}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}
