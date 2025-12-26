import { describe, it, expect } from 'vitest';
import { calculateUnits } from '@/utils/calculateUnits';

describe('calculateUnits', () => {
  it('calculates units correctly for a single drink', () => {
    const result = calculateUnits(500, 5, 1);
    expect(result).toBe(2.5); // (500 * 5) / 1000 * 1 = 2.5
  });

  it('calculates units correctly for multiple drinks', () => {
    const result = calculateUnits(330, 4.5, 3);
    expect(result).toBeCloseTo(4.455); // (330 * 4.5) / 1000 * 3
  });

  it('handles zero volume', () => {
    const result = calculateUnits(0, 5, 1);
    expect(result).toBe(0);
  });

  it('handles zero ABV', () => {
    const result = calculateUnits(500, 0, 1);
    expect(result).toBe(0);
  });

  it('handles undefined/null values with default count', () => {
    const result = calculateUnits(0, 0);
    expect(result).toBe(0);
  });

  it('uses default count of 1 when not provided', () => {
    const result = calculateUnits(500, 5);
    expect(result).toBe(2.5);
  });
});

