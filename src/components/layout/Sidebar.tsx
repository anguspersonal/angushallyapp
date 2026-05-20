import * as React from 'react';
import styles from './layout.module.css';
import { cx, gapClass, type GapToken } from './shared';

export type SidebarProps = {
  /** Which side of the main content the rail sits on. */
  side?: 'left' | 'right';
  /** The side rail's content. */
  rail: React.ReactNode;
  /** Preferred width of the rail above the collapse breakpoint. */
  railWidth?: string;
  /** Minimum width of the main column. Below this the layout collapses. */
  mainMin?: string;
  gap?: GapToken;
  className?: string;
  style?: React.CSSProperties;
  /** Main content. */
  children: React.ReactNode;
};

/**
 * Content + side rail with an explicit collapse threshold defined by the
 * main column's `min-width`. When the main can't satisfy its min, the rail
 * wraps below it. Works without media queries and respects container
 * width when inside a container-typed parent.
 */
export function Sidebar({
  side = 'left',
  rail,
  railWidth = '18rem',
  mainMin = '50%',
  gap = 'intra',
  className,
  style,
  children,
}: SidebarProps) {
  return (
    <div
      className={cx(
        styles.sidebar,
        gapClass(gap),
        side === 'right' && styles.sidebarRight,
        className,
      )}
      style={
        {
          ['--sidebar-side-width' as string]: railWidth,
          ['--sidebar-main-min' as string]: mainMin,
          ...style,
        } as React.CSSProperties
      }
    >
      <aside className={styles.sidebarSide}>{rail}</aside>
      <div className={styles.sidebarMain}>{children}</div>
    </div>
  );
}
