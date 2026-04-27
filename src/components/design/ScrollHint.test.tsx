import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollHint } from './ScrollHint';

const { useReducedMotionMock } = vi.hoisted(() => ({
  useReducedMotionMock: vi.fn(),
}));

vi.mock('framer-motion', async () => {
  const ReactModule = (await import('react')).default;

  return {
    motion: {
      button: ({
        animate: _animate,
        transition: _transition,
        whileHover: _whileHover,
        children,
        ...props
      }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
        animate?: unknown;
        transition?: unknown;
        whileHover?: unknown;
      }) => ReactModule.createElement('button', props, children),
    },
    useReducedMotion: () => useReducedMotionMock(),
  };
});

function createTargetRef() {
  const scrollIntoView = vi.fn();
  const target = { scrollIntoView } as unknown as HTMLElement;

  return {
    ref: { current: target },
    scrollIntoView,
  };
}

describe('ScrollHint', () => {
  beforeEach(() => {
    useReducedMotionMock.mockReturnValue(false);
  });

  it('smoothly scrolls to the target section when motion is allowed', () => {
    const { ref, scrollIntoView } = createTargetRef();

    render(<ScrollHint targetRef={ref} />);
    screen.getByRole('button', { name: "Scroll to what I'm working on" }).click();

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('uses an instant jump when reduced motion is preferred', () => {
    useReducedMotionMock.mockReturnValue(true);
    const { ref, scrollIntoView } = createTargetRef();

    render(<ScrollHint targetRef={ref} />);
    screen.getByRole('button', { name: "Scroll to what I'm working on" }).click();

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
    });
  });
});
