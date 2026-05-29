'use client';

import * as React from 'react';
import { ActionIcon, Loader, ScrollArea, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { resolveSurface } from '@/lib/surfaces';
import { ChatComposer } from './ChatComposer';
import { ChatMessage } from './ChatMessage';
import { ChatRestingState } from './ChatRestingState';
import { useChat, type ChatErrorCode } from './useChat';
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

const ERROR_COPY: Record<ChatErrorCode, string> = {
  rate_limited: 'Easy there — try again in a few seconds.',
  session_cap_reached: 'This session has reached its message cap. Open a new tab to start a fresh one.',
  budget_exhausted: 'The chat is resting for the day. See the FAQ below.',
  unconfigured: 'Chat is not fully configured. Please email Angus directly.',
  upstream_unavailable: "I'm having trouble — try again in a moment.",
  bad_request: "I couldn't understand that request. Try a shorter message.",
  network: 'Network hiccup — try again.',
  aborted: 'Stopped.',
};

/**
 * The chat panel. On mobile (`< --bp-sm`) renders as a full-viewport sheet;
 * on tablet+ as an anchored card. See FR-RES-5..15.
 */
export function ChatPanel({ onClose }: Props) {
  const { messages, status, lastError, inputValue, setInputValue, send, interrupt } = useChat();
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
  // Re-runs on pathname change so an in-message link click releases the
  // lock even before the unmount fires (FR-RES-11).
  const pathname = usePathname();
  // Expose the current persona surface as data-surface so personas can skin
  // the panel later (CSS keyed off [data-surface="<persona>"]). Resolved
  // through the shared surface registry (single source of truth). When the
  // route has no surface, the attribute is omitted entirely — no visual
  // change from today's default chrome.
  const surface = resolveSurface(pathname)?.surface;
  React.useEffect(() => {
    const original = document.body.style.overflow;
    const isMobile = window.matchMedia('(max-width: 47.99em)').matches;
    if (isMobile) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [pathname]);

  // VisualViewport API to pin the composer above the soft keyboard
  // (FR-RES-16). Falls back gracefully on browsers without support.
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const root = document.documentElement;
    const update = () => {
      const vv = window.visualViewport!;
      // Inset = window inner height minus viewport height when the keyboard
      // is up. We expose it as a CSS var the composer can read.
      const keyboardInset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty('--chat-keyboard-inset', `${keyboardInset}px`);
    };
    update();
    window.visualViewport.addEventListener('resize', update);
    window.visualViewport.addEventListener('scroll', update);
    return () => {
      root.style.removeProperty('--chat-keyboard-inset');
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    };
  }, []);

  const handleSend = () => send(inputValue);
  const handleSuggestedPrompt = (prompt: string) => send(prompt);

  const isResting = status === 'resting' || lastError === 'budget_exhausted';

  return (
    <div
      className={styles.panel}
      role="dialog"
      aria-label="Chat with the site assistant"
      data-surface={surface}
    >
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

      {isResting ? (
        <ScrollArea className={styles.scrollArea} viewportRef={scrollViewportRef} scrollbarSize={4}>
          <ChatRestingState />
        </ScrollArea>
      ) : (
        <ScrollArea
          className={styles.scrollArea}
          viewportRef={scrollViewportRef}
          scrollbarSize={4}
        >
          <div className={styles.messageList} role="log" aria-live="polite">
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <Text size="sm" className={styles.emptyGreeting}>
                  Hi — ask me about Angus, the projects on this site, or how to get in touch.
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
              <ChatMessage
                key={message.id}
                message={message}
                toolUses={message.toolUses}
                onBeforeNavigate={onClose}
              />
            ))}

            {status === 'streaming' && (
              <div className={styles.typingIndicator} aria-label="Assistant is typing">
                <Loader size="xs" type="dots" />
              </div>
            )}

            {status === 'error' && lastError && (
              <div className={styles.errorBanner} role="alert">
                <Text size="sm">{ERROR_COPY[lastError]}</Text>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      <ChatComposer
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        onInterrupt={interrupt}
        status={status === 'streaming' ? 'streaming' : 'idle'}
        disabled={isResting}
      />
    </div>
  );
}
