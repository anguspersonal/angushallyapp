/**
 * Server-Sent Events (SSE) framing helpers for the chat Route Handler.
 *
 * The Route Handler can't use the `EventSource` API directly because we
 * POST the conversation in the request body — `EventSource` is GET-only.
 * Instead we hand-frame the `text/event-stream` MIME type into a Node
 * `ReadableStream`, which Next.js streams back to the client. The client
 * reads it via `Response.body.getReader()`.
 *
 * Frame format (RFC-equivalent; one event per blank-line-terminated block):
 *
 *     event: <name>
 *     data: <json>
 *     <blank line>
 *
 * Anything multi-line inside `data:` must be split onto multiple `data:`
 * lines. We always JSON-stringify the payload first, so payloads are
 * single-line by construction and that edge case stays theoretical.
 *
 * See docs/chatbotv1/design.md §4.2 for the wire shape.
 */
import type { StreamEvent } from './types';

/**
 * Build a single SSE frame. The payload is JSON-stringified; a literal
 * newline inside the stringified data would break the protocol, so we
 * defensively escape it (only matters if a caller passes a hand-rolled
 * string with embedded newlines).
 */
export function sseFrame(event: string, data: unknown): string {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  const safePayload = payload.replace(/\r?\n/g, '\\n');
  return `event: ${event}\ndata: ${safePayload}\n\n`;
}

/**
 * One open SSE channel. Owners call `send(...)` to push frames, `close()`
 * to terminate cleanly, and `abort(reason)` to terminate on error. The
 * underlying `ReadableStream` is what gets returned from the Route Handler.
 *
 * The stream is single-consumer (the Response wraps it once). Repeated
 * `close()` or `abort()` calls are idempotent — the second one is a no-op,
 * not a throw — because consumers may fire both on abort + cleanup paths.
 */
export type SseStream = {
  readonly stream: ReadableStream<Uint8Array>;
  /** Push a typed `StreamEvent` frame. Returns false if already closed. */
  send: (event: StreamEvent) => boolean;
  /** Push a raw frame (escape hatch — typed `send` is preferred). */
  sendRaw: (eventName: string, data: unknown) => boolean;
  /** End the stream cleanly. Idempotent. */
  close: () => void;
  /** Tear the stream down with an error. Idempotent. */
  abort: (reason?: unknown) => void;
  /** Has the stream been terminated (cleanly or otherwise)? */
  readonly closed: boolean;
};

export function createSseStream(): SseStream {
  const encoder = new TextEncoder();
  let controllerRef: ReadableStreamDefaultController<Uint8Array> | null = null;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controllerRef = controller;
    },
    cancel() {
      // Consumer aborted (e.g. browser closed the connection). Mark closed
      // so further sends short-circuit; do not call controller.close here —
      // the platform handles the cancel path.
      closed = true;
      controllerRef = null;
    },
  });

  function ensureOpen(): boolean {
    return !closed && controllerRef !== null;
  }

  function enqueue(chunk: string): boolean {
    if (!ensureOpen() || controllerRef === null) return false;
    try {
      controllerRef.enqueue(encoder.encode(chunk));
      return true;
    } catch {
      // Controller may be in an errored state if the consumer abandoned;
      // swallow and mark closed so we don't keep trying.
      closed = true;
      controllerRef = null;
      return false;
    }
  }

  return {
    stream,
    get closed() {
      return closed;
    },
    send(event) {
      return enqueue(sseFrame(event.event, event.data));
    },
    sendRaw(eventName, data) {
      return enqueue(sseFrame(eventName, data));
    },
    close() {
      if (closed) return;
      closed = true;
      try {
        controllerRef?.close();
      } catch {
        // already terminated — ignore
      } finally {
        controllerRef = null;
      }
    },
    abort(reason) {
      if (closed) return;
      closed = true;
      try {
        controllerRef?.error(reason ?? new Error('Stream aborted'));
      } catch {
        // already terminated — ignore
      } finally {
        controllerRef = null;
      }
    },
  };
}

/** Headers required for SSE responses. */
export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  // Disables response buffering on platforms that respect this hint
  // (Nginx, Vercel's edge cache). Without it, deltas can pile up before
  // the first byte hits the client.
  'X-Accel-Buffering': 'no',
} as const;
