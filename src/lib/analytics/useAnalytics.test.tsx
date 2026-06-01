/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

/**
 * useAnalytics (issue #141): the React capture surface threads the current
 * pathname into captureEvent so call sites don't have to. We mock the client's
 * captureEvent and assert it is called with the event, properties, and the
 * pathname from usePathname() (mocked to '/' in the global test setup).
 */

const captureEvent = vi.fn((..._args: unknown[]): void => {});
vi.mock('./client', () => ({
  captureEvent: (...args: unknown[]) => captureEvent(...args),
}));

import { useAnalytics } from './useAnalytics';

beforeEach(() => captureEvent.mockClear());

describe('useAnalytics', () => {
  it('captures with the current pathname threaded through', () => {
    const { result } = renderHook(() => useAnalytics());
    result.current.capture('cta_clicked', { cta: 'hire-me' });

    expect(captureEvent).toHaveBeenCalledWith('cta_clicked', { cta: 'hire-me' }, '/');
  });

  it('defaults to empty properties when none supplied', () => {
    const { result } = renderHook(() => useAnalytics());
    result.current.capture('chat_opened');

    expect(captureEvent).toHaveBeenCalledWith('chat_opened', {}, '/');
  });
});
