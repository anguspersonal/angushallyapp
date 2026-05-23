import { describe, expect, it } from 'vitest';

import { ROUTE_ALLOWLIST } from './tools.allowlist.generated';
import {
  CHAT_TOOLS,
  DRAFT_CONTACT_TOOL,
  NAVIGATE_TOOL,
  isValidEmail,
} from './tools';

describe('chat tool schemas', () => {
  it('NAVIGATE_TOOL.path.enum is exactly ROUTE_ALLOWLIST', () => {
    expect(NAVIGATE_TOOL.input_schema.properties.path.enum).toEqual(ROUTE_ALLOWLIST);
  });

  it('DRAFT_CONTACT_TOOL enforces subject/body length bounds per FR-AGENT-11', () => {
    const props = DRAFT_CONTACT_TOOL.input_schema.properties;
    expect(props.subject.maxLength).toBe(120);
    expect(props.body.maxLength).toBe(2000);
    expect(props.body.minLength).toBe(10);
    expect(DRAFT_CONTACT_TOOL.input_schema.required).toEqual(['subject', 'body']);
  });

  it('exports both tools in the CHAT_TOOLS tuple', () => {
    expect(CHAT_TOOLS).toHaveLength(2);
    expect(CHAT_TOOLS.map((t) => t.name)).toEqual([
      'navigate',
      'draft_contact_message',
    ]);
  });
});

describe('isValidEmail (server-side enforcement of advisory format hint)', () => {
  it('accepts well-formed addresses', () => {
    expect(isValidEmail('angus@example.com')).toBe(true);
    expect(isValidEmail('a.b+tag@sub.example.co.uk')).toBe(true);
  });

  it('rejects malformed strings', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('a@@b.com')).toBe(false);
    expect(isValidEmail('a@b.c d')).toBe(false);
  });

  it('rejects non-strings and over-long values', () => {
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(42)).toBe(false);
    expect(isValidEmail('a@b.' + 'c'.repeat(200))).toBe(false);
  });
});
