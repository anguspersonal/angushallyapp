'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './LazyImageSequence.module.css';

export type LazyImageSequenceImage = {
  src: string;
  alt: string;
};

type LazyImageSequenceProps = {
  images: LazyImageSequenceImage[];
  className?: string;
  imageClassName?: string;
  eager?: boolean;
  solidDurationMs?: number;
  fadeDurationMs?: number;
  rootMargin?: string;
};

const DEFAULT_SOLID_DURATION_MS = 2000;
const DEFAULT_FADE_DURATION_MS = 2000;
const DEFAULT_ROOT_MARGIN = '300px 0px';

function useNearViewport(rootMargin: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || isNearViewport) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isNearViewport, rootMargin]);

  return { ref, isNearViewport };
}

export function LazyImageSequence({
  images,
  className,
  imageClassName,
  eager = false,
  solidDurationMs = DEFAULT_SOLID_DURATION_MS,
  fadeDurationMs = DEFAULT_FADE_DURATION_MS,
  rootMargin = DEFAULT_ROOT_MARGIN,
}: LazyImageSequenceProps) {
  const { ref, isNearViewport } = useNearViewport(rootMargin);
  const shouldLoad = eager || isNearViewport;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!shouldLoad || images.length <= 1) {
      return;
    }

    let interval: number | undefined;

    const firstTransition = window.setTimeout(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);

      interval = window.setInterval(() => {
        setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
      }, solidDurationMs + fadeDurationMs);
    }, solidDurationMs);

    return () => {
      window.clearTimeout(firstTransition);
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [fadeDurationMs, images.length, shouldLoad, solidDurationMs]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={[styles.sequence, className].filter(Boolean).join(' ')}
      style={{ '--fade-duration': `${fadeDurationMs}ms` } as React.CSSProperties}
    >
      {shouldLoad ? (
        images.map((image, index) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            data-active={index === activeIndex}
            aria-hidden={index === activeIndex ? undefined : true}
            className={[styles.image, imageClassName].filter(Boolean).join(' ')}
          />
        ))
      ) : (
        <div className={styles.placeholder} aria-hidden />
      )}
    </div>
  );
}
