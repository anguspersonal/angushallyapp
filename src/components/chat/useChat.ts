'use client';

import * as React from 'react';

/**
 * Mock chat hook for the v1 UI shell.
 *
 * Real version (task 5) will POST to `/api/chat` and parse an SSE stream.
 * This mock keeps the same surface (`messages`, `status`, `send`, `interrupt`)
 * so swapping the implementation later is a one-file change.
 */

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type ChatStatus = 'idle' | 'streaming';

const MOCK_REPLY_DELAY_MS = 600;

const CANNED_REPLIES: Array<{ keywords: RegExp; reply: string }> = [
  {
    keywords: /\b(habit|tracker|streak)\b/i,
    reply:
      'You\'re looking for the **habit tracker** — see [habit tracker](/projects/habit). Real navigation suggestions arrive when the route handler ships.',
  },
  {
    keywords: /\b(contact|email|message|reach)\b/i,
    reply:
      'The contact form lives at [/contact](/contact). In v1 I\'ll be able to:\n\n- draft a message for you\n- pre-fill the form\n- hand off via sessionStorage so you can edit before sending',
  },
  {
    keywords: /\b(who|angus|about|you)\b/i,
    reply:
      'I\'m a mock chat assistant for **Angus Hally\'s** personal site. Once the real backend lands I\'ll answer with grounded info from pages like [about](/about) and [cv](/cv).',
  },
  {
    keywords: /\b(ignore|previous|instructions|system prompt|jailbreak|dan)\b/i,
    reply:
      'Nice try — prompt-injection resistance is one of the v1 acceptance criteria. The production bot will deflect and pivot back to what it can actually help with.',
  },
  {
    keywords: /\b(hi|hello|hey)\b/i,
    reply:
      'Hello. Ask me about Angus, the projects on this site, or how to get in touch via [/contact](/contact).',
  },
];

const FALLBACK_REPLY =
  'This is a mock. The production chatbot will be wired up to Claude Haiku 4.5 with a static knowledge bundle about the site.';

function pickReply(userMessage: string): string {
  const match = CANNED_REPLIES.find(({ keywords }) => keywords.test(userMessage));
  return match ? match.reply : FALLBACK_REPLY;
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function useChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [status, setStatus] = React.useState<ChatStatus>('idle');
  const [inputValue, setInputValue] = React.useState('');
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const send = React.useCallback((content: string) => {
    const trimmed = content.trim();
    if (!trimmed || status === 'streaming') return;

    const userMessage: ChatMessage = { id: randomId(), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setStatus('streaming');

    timeoutRef.current = setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: randomId(),
        role: 'assistant',
        content: pickReply(trimmed),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStatus('idle');
      timeoutRef.current = null;
    }, MOCK_REPLY_DELAY_MS);
  }, [status]);

  const interrupt = React.useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setStatus('idle');
  }, []);

  React.useEffect(() => () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    messages,
    status,
    inputValue,
    setInputValue,
    send,
    interrupt,
  };
}
