import { describe, expect, it } from 'vitest';
import { computeSpendUsd, isOverCap, type TokenPair } from './spendCap';

/**
 * Property 7 (docs/chatbotv1/tasks.md §6.2): spend cap arithmetic.
 *
 * Cap = sum of (tokens_in × inputPrice + tokens_out × outputPrice) / 1e6.
 * Rows with null token counts are ignored (assistant turn before the
 * usage block arrives, or hand-inserted rows).
 *
 * Validates: FR-RATE-4.
 */
describe('computeSpendUsd', () => {
  it('returns 0 for an empty input', () => {
    expect(computeSpendUsd([], 1, 5)).toBe(0);
  });

  it('handles a single row', () => {
    const pairs: TokenPair[] = [{ tokens_in: 1_000_000, tokens_out: 200_000 }];
    expect(computeSpendUsd(pairs, 1, 5)).toBeCloseTo(1 + 1, 10);
  });

  it('sums across multiple rows', () => {
    const pairs: TokenPair[] = [
      { tokens_in: 100_000, tokens_out: 0 },
      { tokens_in: 0, tokens_out: 1_000_000 },
      { tokens_in: 50_000, tokens_out: 50_000 },
    ];
    // 0.1 + 5 + (0.05 + 0.25) = 5.4
    expect(computeSpendUsd(pairs, 1, 5)).toBeCloseTo(5.4, 6);
  });

  it('skips rows where tokens_in or tokens_out is null', () => {
    const pairs: TokenPair[] = [
      { tokens_in: 1_000_000, tokens_out: null },
      { tokens_in: null, tokens_out: 1_000_000 },
      { tokens_in: 1_000_000, tokens_out: 1_000_000 },
    ];
    // Only the third row counts: 1 + 5 = 6.
    expect(computeSpendUsd(pairs, 1, 5)).toBeCloseTo(6, 10);
  });

  it('uses the supplied pricing without scanning env', () => {
    // Sanity check that pricing is a parameter, not a hidden global.
    const pairs: TokenPair[] = [{ tokens_in: 1_000_000, tokens_out: 1_000_000 }];
    expect(computeSpendUsd(pairs, 2, 10)).toBeCloseTo(12, 10);
    expect(computeSpendUsd(pairs, 0.5, 1.5)).toBeCloseTo(2, 10);
  });
});

describe('isOverCap', () => {
  it('returns false strictly below the cap', () => {
    expect(isOverCap(4.99, 5)).toBe(false);
  });
  it('returns true at exactly the cap (>= semantics)', () => {
    expect(isOverCap(5, 5)).toBe(true);
  });
  it('returns true above the cap', () => {
    expect(isOverCap(7, 5)).toBe(true);
  });
});
