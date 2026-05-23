'use client';

import * as React from 'react';
import { renderMarkdown } from '@/lib/chat/renderMarkdown';
import { ROUTE_ALLOWLIST } from '@/lib/chat/tools.allowlist.generated';
import { ContactDraftCard, type ContactDraft } from './ContactDraftCard';
import { NavSuggestionButton } from './NavSuggestionButton';
import type { ChatMessage as ChatMessageType } from './useChat';
import styles from './chat.module.css';

/**
 * A tool-use proposal emitted by the model (forwarded by the route handler
 * as a `tool_use` SSE event). The route handler ignores any `navigate`
 * with an off-allowlist `path` before forwarding, so we re-validate here
 * as defense-in-depth (FR-AGENT-2).
 */
export type AssistantToolUse =
  | { name: 'navigate'; input: { path: string; label: string } }
  | { name: 'draft_contact_message'; input: ContactDraft };

type Props = {
  message: ChatMessageType;
  /**
   * Tool-use proposals emitted in this assistant turn. Each renders inline
   * after the message content. Only set on assistant messages; ignored
   * on user messages. Optional so the mock useChat (no real tool-use
   * support yet) continues to work without changes.
   */
  toolUses?: readonly AssistantToolUse[];
  /**
   * Called before the user follows any in-message link or tool button.
   * Used to close the panel on mobile so the destination isn't obscured
   * (FR-RES-26).
   */
  onBeforeNavigate?: () => void;
};

/**
 * Renders one chat turn.
 *
 *  - User turns render as plain text (FR-UI-9).
 *  - Assistant turns render through `renderMarkdown` — a minimal markdown
 *    parser that refuses unsafe URL schemes; no `dangerouslySetInnerHTML`
 *    anywhere (FR-SAFE-7).
 *  - Tool-use proposals render inline AFTER the markdown content. Each
 *    proposal is its own clickable card; the user must click to commit
 *    (FR-AGENT-3 / FR-AGENT-7).
 */
export function ChatMessage({ message, toolUses, onBeforeNavigate }: Props) {
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
      {!isUser && toolUses && toolUses.length > 0 && (
        <div className={styles.toolUseStack}>
          {toolUses.map((tu, i) => {
            if (tu.name === 'navigate') {
              if (!(ROUTE_ALLOWLIST as readonly string[]).includes(tu.input.path)) {
                // Defense-in-depth — server should have already filtered,
                // but never trust input.
                return null;
              }
              return (
                <NavSuggestionButton
                  key={`nav-${i}`}
                  path={tu.input.path}
                  label={tu.input.label}
                  onBeforeNavigate={onBeforeNavigate}
                />
              );
            }
            if (tu.name === 'draft_contact_message') {
              return (
                <ContactDraftCard
                  key={`contact-${i}`}
                  draft={tu.input}
                  onBeforeNavigate={onBeforeNavigate}
                />
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
