import * as React from 'react';
import styles from './layout.module.css';
import { cx, gapClass, type GapToken } from './shared';

export type ClusterAlign = 'start' | 'center' | 'end' | 'baseline';
export type ClusterJustify = 'start' | 'center' | 'end' | 'between';

export type ClusterProps<T extends React.ElementType = 'div'> = {
  as?: T;
  gap?: GapToken;
  align?: ClusterAlign;
  justify?: ClusterJustify;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'style' | 'children'>;

const alignClassMap: Record<ClusterAlign, string> = {
  start: styles.clusterAlignStart,
  center: styles.clusterAlignCenter,
  end: styles.clusterAlignEnd,
  baseline: styles.clusterAlignBaseline,
};

const justifyClassMap: Record<ClusterJustify, string> = {
  start: styles.clusterJustifyStart,
  center: styles.clusterJustifyCenter,
  end: styles.clusterJustifyEnd,
  between: styles.clusterJustifyBetween,
};

/**
 * Inline row that wraps to the next line when it runs out of space. Use for
 * pill chips, tag lists, action button rows, footer column rows, anything
 * that should sit horizontally but degrade to wrapping rather than
 * overflowing.
 */
export function Cluster<T extends React.ElementType = 'div'>({
  as,
  gap = 'content',
  align = 'center',
  justify = 'start',
  className,
  style,
  children,
  ...rest
}: ClusterProps<T>) {
  const Component = (as ?? 'div') as React.ElementType;
  return (
    <Component
      className={cx(
        styles.cluster,
        gapClass(gap),
        alignClassMap[align],
        justifyClassMap[justify],
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  );
}
