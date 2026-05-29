/**
 * Shared chat protocol types.
 *
 * Single source of truth for the SSE contract between the browser and the
 * `/api/chat` Route Handler. Field shapes follow docs/chatbotv1/design.md
 * §4.1 (request) and §4.2 (response). The route handler validates the
 * request body shape at runtime; the client renders the SSE event union.
 *
 * Two design rules apply throughout:
 *
 *   1. Tool-use is a *proposal*, not an execution (design §4.3). A
 *      `tool_use` event is emitted exactly once per model-decided tool
 *      block; the client renders an interactive card, but the model is
 *      told via a synthetic tool_result that the proposal was forwarded
 *      to the user — never that it was executed.
 *
 *   2. `done` and `error` are mutually exclusive terminators. Exactly one
 *      of them ends every stream.
 */
import type { AllowedRoute } from './tools.allowlist.generated';

/** A prior turn in the conversation history, replayed to the model. */
export type ChatHistoryEntry = {
  role: 'user' | 'assistant';
  content: string;
  /** Tool proposals the model emitted in this assistant turn, if any. */
  toolUses?: ToolUseRecord[];
};

/** POST /api/chat request body. */
export type ChatRequestBody = {
  /** uuid generated client-side; persisted in localStorage. */
  sessionId: string;
  /** New user turn. Server enforces `length <= 1000` (FR-RATE-3). */
  message: string;
  /** Prior turns within this session, oldest first. */
  history: ChatHistoryEntry[];
  /** Pathname when the message was sent — used for analytics + grounding. */
  route: string;
};

/**
 * A tool invocation the model proposed during an assistant turn.
 *
 * Server-side, this is also what we persist to `chat.messages.tool_args`
 * (jsonb). Client-side, the `name` discriminator drives whether we render
 * a NavSuggestionButton or a ContactDraftCard.
 */
export type ToolUseRecord =
  | {
      name: 'navigate';
      input: {
        /** Internal route. Server-side this is narrowed to `AllowedRoute`. */
        path: AllowedRoute | string;
        label: string;
      };
    }
  | {
      name: 'draft_contact_message';
      input: {
        subject: string;
        body: string;
        name?: string;
        /** Server-validated against an email regex before forwarding. */
        email?: string;
      };
    };

/** SSE frame schemas. Discriminated union on `event`. */
export type StreamEvent =
  | {
      event: 'ready';
      data: { sessionId: string; messageId: string };
    }
  | {
      event: 'delta';
      data: { type: 'text'; text: string };
    }
  | {
      event: 'tool_use';
      data: ToolUseRecord;
    }
  | {
      event: 'done';
      data: {
        tokensIn: number;
        tokensOut: number;
        latencyMs: number;
      };
    }
  | {
      event: 'error';
      data: {
        code:
          | 'rate_limited'
          | 'session_cap_reached'
          | 'budget_exhausted'
          | 'unconfigured'
          | 'upstream_unavailable'
          | 'bad_request';
        message?: string;
      };
    };

/** Convenience: pull just the `event` discriminant union. */
export type StreamEventName = StreamEvent['event'];
