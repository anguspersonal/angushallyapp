'use client';

import * as React from 'react';
import { resolveSurface } from '@/lib/surfaces';
import type { ToolUseRecord } from '@/lib/chat/types';

/**
 * Real chat hook — POSTs to `/api/chat` and parses the SSE stream that
 * comes back. Same exported surface as the prior mock so `ChatPanel`
 * doesn't need to change.
 *
 * State shape:
 *   - `messages`         — full conversation, oldest first.
 *   - `status`           — drives the panel UI:
 *       'idle'      ready for input
 *       'streaming' a response is in-flight
 *       'resting'   daily spend cap exceeded; show ChatRestingState
 *       'error'     last request failed; show the inline error banner
 *   - `lastError`        — code from the SSE `error` event (if any).
 *   - `inputValue`       — composer textarea value (controlled).
 *
 * Persistence: a stable `sessionId` is kept in `localStorage` under
 * `chat:session-id` so the server can group turns into a single session
 * across panel opens/closes and page reloads.
 *
 * Aborting: `interrupt()` cancels the in-flight fetch via AbortController.
 * The server detects `request.signal.aborted` and tears down the
 * Anthropic upstream stream as well (route.ts onClientAbort).
 */

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  toolUses?: ToolUseRecord[];
};

export type ChatErrorCode =
  | 'rate_limited'
  | 'session_cap_reached'
  | 'budget_exhausted'
  | 'unconfigured'
  | 'upstream_unavailable'
  | 'bad_request'
  | 'network'
  | 'aborted';

export type ChatStatus = 'idle' | 'streaming' | 'resting' | 'error';

const SESSION_KEY = 'chat:session-id';

const HISTORY_TOKEN_BUDGET = 6000; // FR-CONV-6
const HISTORY_CHARS_PER_TOKEN = 4; // matches build-chat-knowledge.mjs

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return randomId();
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh = randomId();
    window.localStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    // Private mode or storage disabled — keep a per-tab uuid.
    return randomId();
  }
}

/** Truncate oldest history turns to fit under the 6k-token budget. */
function trimHistory(messages: ChatMessage[]): ChatMessage[] {
  const budgetChars = HISTORY_TOKEN_BUDGET * HISTORY_CHARS_PER_TOKEN;
  let total = 0;
  const out: ChatMessage[] = [];
  // Walk newest → oldest, accumulate until we hit the budget, then reverse.
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    total += m.content.length;
    if (total > budgetChars && out.length > 0) break;
    out.unshift(m);
  }
  return out;
}

type SseEvent =
  | { event: 'ready'; data: { sessionId: string; messageId: string } }
  | { event: 'delta'; data: { type: 'text'; text: string } }
  | { event: 'tool_use'; data: ToolUseRecord }
  | { event: 'done'; data: { tokensIn: number; tokensOut: number; latencyMs: number } }
  | { event: 'error'; data: { code: ChatErrorCode; message?: string } };

/**
 * Async generator over SSE frames from a fetch response body. Frames are
 * delimited by a blank line; we buffer partial chunks across reads.
 */
async function* parseSseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<SseEvent> {
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      if (buffer.trim()) {
        const parsed = parseFrame(buffer);
        if (parsed) yield parsed;
      }
      return;
    }
    buffer += decoder.decode(value, { stream: true });

    let separator = buffer.indexOf('\n\n');
    while (separator !== -1) {
      const block = buffer.slice(0, separator);
      buffer = buffer.slice(separator + 2);
      const parsed = parseFrame(block);
      if (parsed) yield parsed;
      separator = buffer.indexOf('\n\n');
    }
  }
}

function parseFrame(block: string): SseEvent | null {
  let eventName: string | null = null;
  const dataLines: string[] = [];
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }
  if (!eventName || dataLines.length === 0) return null;
  try {
    const data = JSON.parse(dataLines.join('\n'));
    return { event: eventName, data } as SseEvent;
  } catch {
    console.warn('[chat] failed to parse SSE frame', block);
    return null;
  }
}

export function useChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [status, setStatus] = React.useState<ChatStatus>('idle');
  const [lastError, setLastError] = React.useState<ChatErrorCode | null>(null);
  const [inputValue, setInputValue] = React.useState('');
  const abortRef = React.useRef<AbortController | null>(null);
  const sessionIdRef = React.useRef<string | null>(null);

  // Lazy-init the session id on first render.
  React.useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = getOrCreateSessionId();
    }
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const send = React.useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      if (status === 'streaming') return;
      const sessionId = sessionIdRef.current ?? getOrCreateSessionId();
      sessionIdRef.current = sessionId;

      const userMessage: ChatMessage = {
        id: randomId(),
        role: 'user',
        content: trimmed,
      };
      const assistantId = randomId();
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
      };

      setLastError(null);
      setStatus('streaming');
      setInputValue('');

      // Capture the conversation that we'll replay as history for the
      // model. We trim to the FR-CONV-6 token budget here, not server-
      // side, so it's predictable for the user.
      const historyForRequest = trimHistory(messages).map((m) => ({
        role: m.role,
        content: m.content,
        toolUses: m.toolUses,
      }));

      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);

      const abort = new AbortController();
      abortRef.current = abort;

      // Resolve the route + persona surface at send time from the live
      // pathname. The surface is looked up through the shared surface
      // registry (single source of truth) so the server can layer the
      // matching per-persona behavioural block onto the system prompt.
      // Unknown/absent surface → omitted → no persona block (server falls
      // back to today's behaviour).
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
      const surface = resolveSurface(pathname)?.surface;

      void (async () => {
        let receivedDone = false;
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            signal: abort.signal,
            body: JSON.stringify({
              sessionId,
              message: trimmed,
              history: historyForRequest,
              route: pathname,
              ...(surface ? { surface } : {}),
            }),
          });

          if (!res.ok) {
            setLastError('bad_request');
            setStatus('error');
            return;
          }
          if (!res.body) {
            setLastError('network');
            setStatus('error');
            return;
          }

          const reader = res.body.getReader();
          for await (const frame of parseSseStream(reader)) {
            if (frame.event === 'delta') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + frame.data.text }
                    : m,
                ),
              );
            } else if (frame.event === 'tool_use') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, toolUses: [...(m.toolUses ?? []), frame.data] }
                    : m,
                ),
              );
            } else if (frame.event === 'done') {
              receivedDone = true;
              setStatus('idle');
            } else if (frame.event === 'error') {
              setLastError(frame.data.code);
              setStatus(frame.data.code === 'budget_exhausted' ? 'resting' : 'error');
              return;
            }
          }

          if (!receivedDone) {
            // Stream ended without a `done` frame — treat as an unclean
            // network drop. The placeholder may have partial text, leave
            // it visible; surface the error so the panel can offer retry.
            setLastError('network');
            setStatus('error');
          }
        } catch (err) {
          if ((err as Error).name === 'AbortError') {
            setLastError('aborted');
            setStatus('idle');
          } else {
            console.error('[chat] /api/chat fetch failed', err);
            setLastError('network');
            setStatus('error');
          }
        }
      })();
    },
    [messages, status],
  );

  const interrupt = React.useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  return {
    messages,
    status,
    lastError,
    inputValue,
    setInputValue,
    send,
    interrupt,
  };
}
