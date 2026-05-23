/**
 * Anthropic tool schemas for the chat assistant.
 *
 * Two tools, both proposal-only — the model emits a `tool_use` block, the
 * server forwards it to the client, the user clicks (or doesn't). Nothing
 * the model "calls" here actually side-effects on the server.
 *
 * On `format: 'email'` and other JSON-Schema-ish keywords:
 *
 *   Anthropic accepts JSON-Schema-style annotations on tool input schemas
 *   but treats `format` (and other validators) as *advisory hints to the
 *   model*, not as enforced constraints. The schema documents intent; the
 *   server is the enforcer.
 *
 *   In particular, the route handler re-validates `email` with a regex
 *   before forwarding the proposal to the client (design §6 note), and
 *   `navigate.path` is re-checked against `ROUTE_ALLOWLIST` (FR-AGENT-2)
 *   even though the schema already constrains it via `enum`. Defense in
 *   depth: assume the model can hallucinate past every annotation.
 *
 * See docs/chatbotv1/design.md §6 and docs/chatbotv1/requirements.md
 * FR-AGENT-1, FR-AGENT-2, FR-AGENT-6, FR-AGENT-11.
 */
import { ROUTE_ALLOWLIST } from './tools.allowlist.generated';

export const NAVIGATE_TOOL = {
  name: 'navigate',
  description:
    'Propose navigating the user to an internal page on angushally.com. Offer' +
    ' this when the user asks about something that has a dedicated page. The' +
    ' user must click a button to actually navigate — you are proposing, not' +
    ' executing. Offer multiple `navigate` calls if intent is ambiguous.',
  input_schema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'An internal route. Must be on the allowlist.',
        enum: ROUTE_ALLOWLIST,
      },
      label: {
        type: 'string',
        description: 'Short button label, e.g. "Habit tracker" or "About Angus".',
        maxLength: 40,
      },
    },
    required: ['path', 'label'],
  },
} as const;

export const DRAFT_CONTACT_TOOL = {
  name: 'draft_contact_message',
  description:
    'Draft a contact-form message on behalf of the user and propose opening' +
    ' the contact page with it pre-filled. Do not invent a name or email; if' +
    ' the user has not supplied them, leave those fields undefined. The user' +
    ' will see the draft and edit it before sending — you are not sending the' +
    ' message yourself.',
  input_schema: {
    type: 'object',
    properties: {
      subject: {
        type: 'string',
        description: 'Short subject line summarising the message.',
        minLength: 1,
        maxLength: 120,
      },
      body: {
        type: 'string',
        description: 'The body of the message Angus will receive.',
        minLength: 10,
        maxLength: 2000,
      },
      name: {
        type: 'string',
        description: 'Sender name, only if the user supplied one.',
        maxLength: 80,
      },
      email: {
        type: 'string',
        // `format: 'email'` is advisory only — see file header. Server-side
        // regex validation is the real enforcement (route.ts).
        format: 'email',
        description:
          "Sender email, only if the user supplied one. Server-validates" +
          ' against an email regex before forwarding; if invalid, the field' +
          ' is dropped from the proposal.',
        maxLength: 120,
      },
    },
    required: ['subject', 'body'],
  },
} as const;

/** Tuple consumed by `messages.stream({ tools })`. */
export const CHAT_TOOLS = [NAVIGATE_TOOL, DRAFT_CONTACT_TOOL] as const;

/** Discriminator for narrowing tool_use blocks by name. */
export type ChatToolName = (typeof CHAT_TOOLS)[number]['name'];

/**
 * Server-side email regex. Conservative — accepts the common shapes and
 * rejects obviously broken ones; we never use it to *grant* access, only to
 * decide whether to forward the proposed `email` field through to the
 * client. Anything ambiguous is dropped (the user can type their own
 * address in the contact form). RFC 5322 perfection is not the goal here.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 120 && EMAIL_REGEX.test(value);
}
