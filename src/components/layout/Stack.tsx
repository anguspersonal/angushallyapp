import * as React from 'react';
import styles from './layout.module.css';
import { cx, gapClass, type GapToken } from './shared';

export type StackProps<T extends React.ElementType = 'div'> = {
  /** Element to render. Defaults to `div`. */
  as?: T;
  /** Token-driven gap between children. */
  gap?: GapToken;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'style' | 'children'>;

/**
 * Universal vertical layout primitive. Per ADR 0032: columns are universal,
 * rows are opt-in. Reach for Stack first; only use Cluster / Switcher /
 * Sidebar when a row is genuinely needed.
 */
export function Stack<T extends React.ElementType = 'div'>({
  as,
  gap = 'content',
  className,
  style,
  children,
  ...rest
}: StackProps<T>) {
  const Component = (as ?? 'div') as React.ElementType;
  return (
    <Component
      className={cx(styles.stack, gapClass(gap), className)}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  );
}
