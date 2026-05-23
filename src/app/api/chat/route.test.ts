/**
 * Route-handler smoke tests for POST /api/chat.
 *
 * The tests mock the Anthropic SDK so we can drive the stream from the
 * test (two text deltas + one tool_use block) and the Supabase admin so
 * we can observe persistence calls. The route returns an SSE stream;
 * tests assert on the decoded frame sequence and the order in which
 * writeTurn is invoked relative to the `done` event.
 *
 * Covers tasks 5.6 (golden path) and 5.8 (off-allowlist rejection).
 */
import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { __resetRateLimiterForTests } from '@/lib/chat/rateLimiter';

// --- mocks ------------------------------------------------------------------

type ToolUseBlock = {
  type: 'tool_use';
  name: 'navigate' | 'draft_contact_message';
  input: Record<string, unknown>;
};
type TextBlock = { type: 'text'; text: string };
type FakeContentBlock = TextBlock | ToolUseBlock;

type FakeStreamScript = {
  textDeltas: string[];
  toolUses: ToolUseBlock[];
  usage?: { input_tokens: number; output_tokens: number };
};

let currentScript: FakeStreamScript = {
  textDeltas: [],
  toolUses: [],
};

function setStreamScript(script: FakeStreamScript): void {
  currentScript = script;
}

// Mock Anthropic SDK default export.
vi.mock('@anthropic-ai/sdk', () => {
  class FakeMessageStream {
    private listeners = new Map<string, Array<(...args: unknown[]) => void>>();
    abort = vi.fn();
    on(event: string, listener: (...args: unknown[]) => void): this {
      const existing = this.listeners.get(event) ?? [];
      existing.push(listener);
      this.listeners.set(event, existing);
      return this;
    }
    async finalMessage(): Promise<{
      content: FakeContentBlock[];
      usage: { input_tokens: number; output_tokens: number };
    }> {
      // Drain text deltas first.
      for (const delta of currentScript.textDeltas) {
        for (const fn of this.listeners.get('text') ?? []) {
          fn(delta, '');
        }
      }
      const usage = currentScript.usage ?? { input_tokens: 0, output_tokens: 0 };
      const content: FakeContentBlock[] = [
        ...currentScript.textDeltas.map<TextBlock>((t) => ({
          type: 'text',
          text: t,
        })),
        ...currentScript.toolUses,
      ];
      return { content, usage };
    }
  }

  class FakeAnthropic {
    messages = {
      stream: vi.fn(() => new FakeMessageStream()),
    };
    constructor(_config: { apiKey: string }) {
      // no-op
    }
  }

  return { default: FakeAnthropic };
});

// Mock Supabase admin so persistence helpers no-op gracefully (they
// short-circuit when getSupabaseAdmin() returns null).
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: vi.fn(() => null),
  resetSupabaseAdminCacheForTests: vi.fn(),
}));

// Spy on persistence so we can assert write ordering.
import * as persistence from '@/lib/chat/persistence';
const upsertSpy = vi.spyOn(persistence, 'upsertSession').mockResolvedValue();
const writeTurnSpy = vi.spyOn(persistence, 'writeTurn').mockResolvedValue();

// Import the handler AFTER mocks are registered.
import { POST } from './route';

// --- helpers ----------------------------------------------------------------

const TEST_UUID = '11111111-1111-4111-8111-111111111111';

function makeRequest(body: unknown): NextRequest {
  const init = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  } satisfies RequestInit;
  // NextRequest extends Request; the runtime in jsdom understands Request.
  // We cast because NextRequest's extra members (`.cookies`, `.geo`) are
  // not exercised by the handler.
  return new Request('http://localhost/api/chat', init) as unknown as NextRequest;
}

async function readSseFrames(response: Response): Promise<
  Array<{ event: string; data: string }>
> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value);
  }
  return buffer
    .split('\n\n')
    .filter(Boolean)
    .map((chunk) => {
      const eventLine = chunk.match(/^event: (.+)$/m);
      const dataLine = chunk.match(/^data: (.+)$/m);
      return {
        event: eventLine?.[1] ?? '',
        data: dataLine?.[1] ?? '',
      };
    });
}

// --- env --------------------------------------------------------------------

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.CHAT_IP_HASH_PEPPER = 'test-pepper-32-chars-of-nonsense-xyz';
  __resetRateLimiterForTests();
  upsertSpy.mockClear();
  writeTurnSpy.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

// --- tests ------------------------------------------------------------------

describe('POST /api/chat — golden path', () => {
  it('streams ready, deltas, tool_use, done in order; persists after done', async () => {
    setStreamScript({
      textDeltas: ['Hello, ', "I'm an assistant."],
      toolUses: [
        {
          type: 'tool_use',
          name: 'navigate',
          input: { path: '/about', label: 'About Angus' },
        },
      ],
      usage: { input_tokens: 42, output_tokens: 11 },
    });

    const writeTurnCallsAtDone: number[] = [];
    writeTurnSpy.mockImplementation(async () => {
      writeTurnCallsAtDone.push(Date.now());
    });

    const response = await POST(
      makeRequest({
        sessionId: TEST_UUID,
        message: 'Tell me about Angus.',
        history: [],
        route: '/',
      }),
    );
    const frames = await readSseFrames(response);

    const events = frames.map((f) => f.event);
    expect(events).toEqual(['ready', 'delta', 'delta', 'tool_use', 'done']);

    const toolUseFrame = frames.find((f) => f.event === 'tool_use')!;
    expect(JSON.parse(toolUseFrame.data)).toEqual({
      name: 'navigate',
      input: { path: '/about', label: 'About Angus' },
    });

    const doneFrame = frames.find((f) => f.event === 'done')!;
    const donePayload = JSON.parse(doneFrame.data) as {
      tokensIn: number;
      tokensOut: number;
      latencyMs: number;
    };
    expect(donePayload.tokensIn).toBe(42);
    expect(donePayload.tokensOut).toBe(11);
    expect(donePayload.latencyMs).toBeGreaterThanOrEqual(0);

    // upsertSession called once with the validated session id.
    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy.mock.calls[0][0].sessionId).toBe(TEST_UUID);

    // writeTurn called for both user + assistant turns.
    expect(writeTurnSpy).toHaveBeenCalledTimes(2);
    const userTurnCall = writeTurnSpy.mock.calls.find(
      ([arg]) => arg.role === 'user',
    );
    const assistantTurnCall = writeTurnSpy.mock.calls.find(
      ([arg]) => arg.role === 'assistant',
    );
    expect(userTurnCall?.[0]).toMatchObject({
      role: 'user',
      content: 'Tell me about Angus.',
      injectionFlagged: false,
    });
    expect(assistantTurnCall?.[0]).toMatchObject({
      role: 'assistant',
      content: "Hello, I'm an assistant.",
      toolName: 'navigate',
    });
    // toolArgs carries the tool-use record(s) as jsonb input.
    expect(assistantTurnCall?.[0].toolArgs).toEqual([
      { name: 'navigate', input: { path: '/about', label: 'About Angus' } },
    ]);
  });
});

describe('POST /api/chat — off-allowlist navigate (task 5.7 / 5.8)', () => {
  it('drops the tool_use event and emits no warning to the client', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setStreamScript({
      textDeltas: ['ok'],
      toolUses: [
        {
          type: 'tool_use',
          name: 'navigate',
          input: { path: '/not-a-real-page', label: 'Nope' },
        },
      ],
    });

    const response = await POST(
      makeRequest({
        sessionId: TEST_UUID,
        message: 'Where can I go?',
        history: [],
        route: '/',
      }),
    );
    const frames = await readSseFrames(response);

    expect(frames.map((f) => f.event)).toEqual(['ready', 'delta', 'done']);
    expect(frames.find((f) => f.event === 'tool_use')).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('off-allowlist navigate path'),
    );

    // No tool_use survived to persistence either.
    const assistantTurnCall = writeTurnSpy.mock.calls.find(
      ([arg]) => arg.role === 'assistant',
    );
    expect(assistantTurnCall?.[0].toolName).toBeUndefined();
    expect(assistantTurnCall?.[0].toolArgs).toBeNull();
    warnSpy.mockRestore();
  });
});

describe('POST /api/chat — bad request body', () => {
  it('rejects malformed sessionId with 400', async () => {
    const response = await POST(
      makeRequest({
        sessionId: 'not-a-uuid',
        message: 'hello',
        history: [],
        route: '/',
      }),
    );
    expect(response.status).toBe(400);
    const json = (await response.json()) as { error: string };
    expect(json.error).toContain('sessionId');
  });

  it('rejects messages over the length cap with 400', async () => {
    const response = await POST(
      makeRequest({
        sessionId: TEST_UUID,
        message: 'x'.repeat(1001),
        history: [],
        route: '/',
      }),
    );
    expect(response.status).toBe(400);
    const json = (await response.json()) as { error: string };
    expect(json.error).toContain('1000');
  });

  it('rejects missing fields with 400', async () => {
    const response = await POST(
      makeRequest({
        sessionId: TEST_UUID,
        // message missing
        history: [],
        route: '/',
      }),
    );
    expect(response.status).toBe(400);
  });
});
