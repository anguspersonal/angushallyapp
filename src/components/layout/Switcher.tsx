import * as React from 'react';
import styles from './layout.module.css';
import { cx, gapClass, type GapToken } from './shared';

export type SwitcherProps<T extends React.ElementType = 'div'> = {
  as?: T;
  /** CSS length at which the layout switches from row to column. Compares
   * against the *container's* width, not the viewport, when used inside
   * a Section (which establishes a container query context). */
  threshold?: string;
  gap?: GapToken;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'style' | 'children'>;

/**
 * Two-or-more-up that collapses to a column when there's not enough room.
 * Implemented with the Every Layout flex-basis trick so it works without
 * media queries and is component-relative — the same Switcher behaves
 * correctly inside a sidebar, a card, or a full-width section.
 */
export function Switcher<T extends React.ElementType = 'div'>({
  as,
  threshold = '480px',
  gap = 'intra',
  className,
  style,
  children,
  ...rest
}: SwitcherProps<T>) {
  const Component = (as ?? 'div') as React.ElementType;
  return (
    <Component
      className={cx(styles.switcher, gapClass(gap), className)}
      style={{ ['--switcher-threshold' as string]: threshold, ...style } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Component>
  );
}
