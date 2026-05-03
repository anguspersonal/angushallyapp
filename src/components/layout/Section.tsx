import * as React from 'react';
import styles from './layout.module.css';
import { cx, gapClass, type GapToken } from './shared';

export type SectionWidth = 'narrow' | 'default' | 'wide';
export type SectionPadY = 'tight' | 'default' | 'loose' | 'none';

export type SectionProps = {
  /** Max width of the inner content. */
  width?: SectionWidth;
  /** Vertical padding token. */
  padY?: SectionPadY;
  /** Gap between immediate children inside the section. */
  gap?: GapToken;
  /** Render the outer wrapper as an alternative element. */
  as?: 'section' | 'div' | 'article' | 'header' | 'footer' | 'main' | 'aside';
  id?: string;
  ariaLabel?: string;
  /** Class on the outer wrapper. Use for backgrounds, scroll-margin, ids. */
  className?: string;
  /** Class on the inner container. Use for flex / grid overrides. */
  innerClassName?: string;
  style?: React.CSSProperties;
  /** Ref to the outer wrapper element (the landmark). Use for scroll
   * targets, IntersectionObserver, and other DOM measurements. */
  outerRef?: React.Ref<HTMLElement>;
  /** Ref to the inner container div. Use sparingly — usually outerRef is
   * the right answer. */
  innerRef?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
};

const widthClassMap: Record<SectionWidth, string> = {
  narrow: styles.widthNarrow,
  default: styles.widthDefault,
  wide: styles.widthWide,
};

const padYClassMap: Record<SectionPadY, string> = {
  tight: styles.padTight,
  default: styles.padDefault,
  loose: styles.padLoose,
  none: styles.padNone,
};

/**
 * One component for "a section of a page": outer landmark element + token
 * vertical padding + inner Container with horizontal max-width and gutter +
 * vertical Stack rhythm. Establishes a container query context so nested
 * Switcher / Cluster can be component-relative.
 */
export function Section({
  width = 'default',
  padY = 'default',
  gap = 'intra',
  as = 'section',
  id,
  ariaLabel,
  className,
  innerClassName,
  style,
  outerRef,
  innerRef,
  children,
}: SectionProps) {
  const Component = as as React.ElementType;
  return (
    <Component
      ref={outerRef}
      id={id}
      aria-label={ariaLabel}
      className={cx(styles.section, padYClassMap[padY], className)}
      style={style}
    >
      <div
        ref={innerRef}
        className={cx(styles.sectionInner, widthClassMap[width], gapClass(gap), innerClassName)}
      >
        {children}
      </div>
    </Component>
  );
}
