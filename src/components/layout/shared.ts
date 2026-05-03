import styles from './layout.module.css';

export type GapToken = 'content' | 'intra' | 'section' | 'none';

export function gapClass(gap: GapToken | undefined): string | undefined {
  switch (gap) {
    case 'content':
      return styles.gapContent;
    case 'intra':
      return styles.gapIntra;
    case 'section':
      return styles.gapSection;
    case 'none':
      return styles.gapNone;
    default:
      return undefined;
  }
}

/** Tiny class joiner. Filters falsy and joins with spaces. */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
