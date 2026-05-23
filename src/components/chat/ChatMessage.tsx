'use client';

import * as React from 'react';
import { renderMarkdown } from '@/lib/chat/renderMarkdown';
import type { ChatMessage as ChatMessageType } from './useChat';
import styles from './chat.module.css';

type Props = {
  message: ChatMessageType;
};

/**
 * Renders one chat turn.
 *
 *  - User turns render as plain text (FR-UI-9).
 *  - Assistant turns render through `renderMarkdown` — a minimal markdown
 *    parser that supports links, bold, and unordered lists, and that
 *    refuses unsafe URL schemes. No `dangerouslySetInnerHTML` is used
 *    anywhere (FR-SAFE-7).
 */
export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';
  return (
    <div
      className={`${styles.message} ${isUser ? styles.messageUser : styles.messageAssistant}`}
      data-role={message.role}
    >
      {isUser ? (
        <p className={styles.messageContent}>{message.content}</p>
      ) : (
        <div className={styles.messageMarkdown}>{renderMarkdown(message.content)}</div>
      )}
    </div>
  );
}
