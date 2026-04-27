import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LazyImageSequence } from './LazyImageSequence';

const images = [
  { src: '/first.jpg', alt: 'First photo' },
  { src: '/second.jpg', alt: 'Second photo' },
];

type ObserverInstance = {
  callback: IntersectionObserverCallback;
  disconnect: ReturnType<typeof vi.fn>;
  observe: ReturnType<typeof vi.fn>;
};

const observerInstances: ObserverInstance[] = [];

beforeEach(() => {
  observerInstances.length = 0;

  class IntersectionObserverMock {
    readonly disconnect = vi.fn();
    readonly observe = vi.fn();

    constructor(callback: IntersectionObserverCallback) {
      observerInstances.push({
        callback,
        disconnect: this.disconnect,
        observe: this.observe,
      });
    }
  }

  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('LazyImageSequence', () => {
  it('does not attach image sources until the sequence is near the viewport', () => {
    render(<LazyImageSequence images={images} />);

    expect(screen.queryByAltText('First photo')).not.toBeInTheDocument();
    expect(screen.queryByAltText('Second photo')).not.toBeInTheDocument();

    act(() => {
      observerInstances[0].callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByAltText('First photo')).toHaveAttribute('src', '/first.jpg');
    expect(screen.getByAltText('Second photo')).toHaveAttribute('src', '/second.jpg');
  });

  it('holds each image before fading to the next one in sequence', () => {
    vi.useFakeTimers();

    render(
      <LazyImageSequence
        images={images}
        eager
        solidDurationMs={2000}
        fadeDurationMs={2000}
      />,
    );

    expect(screen.getByAltText('First photo')).toHaveAttribute('data-active', 'true');
    expect(screen.getByAltText('Second photo')).toHaveAttribute('data-active', 'false');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByAltText('First photo')).toHaveAttribute('data-active', 'false');
    expect(screen.getByAltText('Second photo')).toHaveAttribute('data-active', 'true');

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.getByAltText('First photo')).toHaveAttribute('data-active', 'true');
    expect(screen.getByAltText('Second photo')).toHaveAttribute('data-active', 'false');
  });
});
