'use client';

import * as React from 'react';
import { Button, Text } from '@mantine/core';
import { IconMail } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import styles from './chat.module.css';

export type ContactDraft = {
  subject: string;
  body: string;
  name?: string;
  email?: string;
};

export const CONTACT_DRAFT_STORAGE_KEY = 'chat:contact-draft';

type Props = {
  draft: ContactDraft;
  onBeforeNavigate?: () => void;
};

const PREVIEW_MAX_CHARS = 200;

/**
 * Renders a `draft_contact_message` tool proposal as a preview card with
 * an "Open contact form with this draft" button. On click:
 *
 *   1. Persists the draft to sessionStorage (FR-AGENT-8 — bodies can be
 *      long and contain chars that would bloat URL params).
 *   2. Closes the panel if mobile (FR-RES-26).
 *   3. Routes to /contact.
 *
 * The contact page reads sessionStorage on mount and pre-fills the form;
 * the user always reviews and submits manually (FR-AGENT-9).
 */
export function ContactDraftCard({ draft, onBeforeNavigate }: Props) {
  const router = useRouter();
  const preview = draft.body.length > PREVIEW_MAX_CHARS
    ? draft.body.slice(0, PREVIEW_MAX_CHARS).trimEnd() + '…'
    : draft.body;

  const handleClick = () => {
    try {
      sessionStorage.setItem(CONTACT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (err) {
      // sessionStorage can throw in private-mode Safari; degrade to no-prefill.
      console.warn('[chat] ContactDraftCard: failed to persist draft', err);
    }
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 47.99em)').matches;
    if (isMobile && onBeforeNavigate) {
      onBeforeNavigate();
    }
    router.push('/contact');
  };

  return (
    <div className={styles.contactDraftCard}>
      <div className={styles.contactDraftHeader}>
        <IconMail size={14} />
        <Text size="xs" fw={600}>Draft message</Text>
      </div>
      <Text size="sm" fw={500} className={styles.contactDraftSubject}>
        {draft.subject}
      </Text>
      <Text size="sm" className={styles.contactDraftBody}>
        {preview}
      </Text>
      <Button
        className={styles.contactDraftButton}
        size="xs"
        variant="filled"
        onClick={handleClick}
      >
        Open contact form with this draft
      </Button>
    </div>
  );
}
