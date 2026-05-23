'use client';

import * as React from 'react';
import type { ChatMessage as ChatMessageType } from './useChat';
import styles from './chat.module.css';

type Props = {
  message: ChatMessageType;
};

/**
 * Renders one chat turn. v1 mock renders plain text only; the production
 * version (task 8.4 / FR-UI-9) will render markdown for assistant turns
 * through a sanitiser that strips raw HTML and `javascript:` links.
 */
export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';
  return (
    <div
      className={`${styles.message} ${isUser ? styles.messageUser : styles.messageAssistant}`}
      data-role={message.role}
    >
      <p className={styles.messageContent}>{message.content}</p>
    </div>
  );
}
