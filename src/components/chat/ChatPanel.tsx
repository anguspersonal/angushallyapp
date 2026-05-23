'use client';

import * as React from 'react';
import { ActionIcon, Loader, ScrollArea, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { ChatComposer } from './ChatComposer';
import { ChatMessage } from './ChatMessage';
import { useChat } from './useChat';
import styles from './chat.module.css';

type Props = {
  onClose: () => void;
};

const SUGGESTED_PROMPTS = [
  'Who is Angus?',
  'Show me your habit tracker',
  'How do I get in touch?',
];

const PRIVACY_NOTE =
  'Your messages are stored for up to 90 days so I can review and improve this assistant. No raw IP is kept.';

/**
 * The chat panel. On mobile (`< --bp-sm`) renders as a full-viewport sheet;
 * on tablet+ as an anchored card. See FR-RES-5..15.
 *
 * Focus trapping, ESC-to-close, and the visible-viewport handler for the
 * soft keyboard are kept minimal in this mock; production polish lands
 * alongside the real backend.
 */
export function ChatPanel({ onClose }: Props) {
  const { messages, status, inputValue, setInputValue, send, interrupt } = useChat();
  const scrollViewportRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message as the conversation grows.
  React.useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
  }, [messages.length, status]);

  // ESC closes the panel (FR-UI-5).
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Body scroll lock on mobile while the panel is open (FR-RES-10).
  React.useEffect(() => {
    const original = document.body.style.overflow;
    if (window.matchMedia('(max-width: 47.99em)').matches) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleSend = () => send(inputValue);
  const handleSuggestedPrompt = (prompt: string) => send(prompt);

  return (
    <div className={styles.panel} role="dialog" aria-label="Chat with the site assistant">
      <header className={styles.header}>
        <Text fw={600} size="sm" className={styles.headerTitle}>
          Chat with Angus&apos;s site
        </Text>
        <ActionIcon
          variant="subtle"
          aria-label="Close chat"
          onClick={onClose}
          size="lg"
        >
          <IconX size={18} />
        </ActionIcon>
      </header>

      <ScrollArea
        className={styles.scrollArea}
        viewportRef={scrollViewportRef}
        scrollbarSize={4}
      >
        <div className={styles.messageList} role="log" aria-live="polite">
          {messages.length === 0 && (
            <div className={styles.emptyState}>
              <Text size="sm" className={styles.emptyGreeting}>
                Hi — I&apos;m a mock chatbot demo for this site. The real one is in build.
              </Text>
              <div className={styles.suggestedPrompts}>
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className={styles.suggestedPrompt}
                    onClick={() => handleSuggestedPrompt(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <Text size="xs" className={styles.privacyNote}>
                {PRIVACY_NOTE}
              </Text>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {status === 'streaming' && (
            <div className={styles.typingIndicator} aria-label="Assistant is typing">
              <Loader size="xs" type="dots" />
            </div>
          )}
        </div>
      </ScrollArea>

      <ChatComposer
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        onInterrupt={interrupt}
        status={status}
      />
    </div>
  );
}
