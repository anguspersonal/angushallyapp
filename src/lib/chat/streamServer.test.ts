import { describe, expect, it } from 'vitest';

import { SSE_HEADERS, createSseStream, sseFrame } from './streamServer';

const decoder = new TextDecoder();

async function readAll(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const chunks: string[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) chunks.push(decoder.decode(value));
  }
  return chunks.join('');
}

describe('sseFrame', () => {
  it('emits the canonical `event: ...\\ndata: ...\\n\\n` shape', () => {
    expect(sseFrame('ready', { sessionId: 's', messageId: 'm' })).toBe(
      'event: ready\ndata: {"sessionId":"s","messageId":"m"}\n\n',
    );
  });

  it('stringifies objects and escapes embedded newlines in the payload', () => {
    const out = sseFrame('delta', { type: 'text', text: 'a\nb' });
    expect(out).toBe('event: delta\ndata: {"type":"text","text":"a\\nb"}\n\n');
    // Critically: there is no literal newline inside the data: line.
    // Frame shape has exactly 3 newlines: end-of-event, end-of-data, blank.
    expect(out.match(/\n/g)).toHaveLength(3);
  });

  it('passes strings through unmodified except for newline escaping', () => {
    expect(sseFrame('done', 'literal-string')).toBe('event: done\ndata: literal-string\n\n');
  });
});

describe('createSseStream', () => {
  it('sends typed events in order and closes cleanly', async () => {
    const { stream, send, close } = createSseStream();

    expect(send({ event: 'ready', data: { sessionId: 's', messageId: 'm' } })).toBe(true);
    expect(send({ event: 'delta', data: { type: 'text', text: 'hi' } })).toBe(true);
    expect(send({ event: 'done', data: { tokensIn: 1, tokensOut: 2, latencyMs: 3 } })).toBe(true);
    close();

    const body = await readAll(stream);
    expect(body).toBe(
      'event: ready\ndata: {"sessionId":"s","messageId":"m"}\n\n' +
        'event: delta\ndata: {"type":"text","text":"hi"}\n\n' +
        'event: done\ndata: {"tokensIn":1,"tokensOut":2,"latencyMs":3}\n\n',
    );
  });

  it('close() and abort() are idempotent', () => {
    const { close, abort, closed } = createSseStream();
    expect(closed).toBe(false);
    close();
    close();
    abort();
    // No throw. `closed` is a live getter on the returned object; the local
    // destructure captured its initial value, so we re-check via a fresh
    // stream below.
  });

  it('send() returns false after close()', () => {
    const sse = createSseStream();
    sse.close();
    expect(sse.send({ event: 'delta', data: { type: 'text', text: 'late' } })).toBe(false);
    expect(sse.closed).toBe(true);
  });

  it('exposes the SSE response headers required by browsers and proxies', () => {
    expect(SSE_HEADERS['Content-Type']).toBe('text/event-stream; charset=utf-8');
    expect(SSE_HEADERS['Cache-Control']).toContain('no-cache');
    expect(SSE_HEADERS['X-Accel-Buffering']).toBe('no');
  });
});
