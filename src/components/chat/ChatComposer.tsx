'use client';

import * as React from 'react';
import { ActionIcon, Textarea } from '@mantine/core';
import { IconPlayerStop, IconSend } from '@tabler/icons-react';
import styles from './chat.module.css';

type Props = {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
  onInterrupt: () => void;
  status: 'idle' | 'streaming';
  disabled?: boolean;
};

const MAX_INPUT_LENGTH = 1000; // FR-RATE-3

/**
 * Sticky composer at the bottom of the chat panel. Auto-grows up to 4 rows
 * then scrolls internally (FR-RES-29). The action button toggles between
 * send and interrupt in place (FR-RES-30) so users never chase a tiny "×".
 *
 * Soft-keyboard ergonomics:
 *   - 16px font baseline to suppress iOS auto-zoom (FR-RES-18)
 *   - `enterkeyhint="send"` for the right on-screen Send affordance (FR-RES-19)
 *   - `autocapitalize="sentences"`, `autocorrect="on"`, `spellcheck="true"` (FR-RES-20)
 */
export function ChatComposer({
  value,
  onChange,
  onSend,
  onInterrupt,
  status,
  disabled,
}: Props) {
  const isStreaming = status === 'streaming';

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className={styles.composer}>
      <Textarea
        className={styles.composerInput}
        classNames={{ input: styles.composerTextarea }}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything…"
        autosize
        minRows={1}
        maxRows={4}
        maxLength={MAX_INPUT_LENGTH}
        disabled={disabled}
        aria-label="Chat input"
        // @ts-expect-error — `enterkeyhint` is valid HTML, Mantine's prop types are stricter.
        enterkeyhint="send"
        autoCapitalize="sentences"
        autoCorrect="on"
        spellCheck
      />
      <ActionIcon
        className={styles.composerButton}
        size="lg"
        variant="filled"
        color={isStreaming ? 'red' : undefined}
        aria-label={isStreaming ? 'Stop response' : 'Send message'}
        onClick={isStreaming ? onInterrupt : onSend}
        disabled={!isStreaming && (!value.trim() || disabled)}
      >
        {isStreaming ? <IconPlayerStop size={18} /> : <IconSend size={18} />}
      </ActionIcon>
    </div>
  );
}
