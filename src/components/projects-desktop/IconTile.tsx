'use client';

import * as React from 'react';
import type { IconProps } from '@tabler/icons-react';
import styles from './IconTile.module.css';
import { getProjectIcon } from './iconMapping';

type TablerIcon = React.ComponentType<IconProps>;

type CommonProps = {
  /** Pixel size of the square tile. Defaults to 64 (dock size). */
  size?: number;
  /** Optional class for the outer tile container. */
  className?: string;
  /** Accessible label. Required because all four variants are visual. */
  label: string;
};

type AppIconProps = CommonProps & {
  glyph: TablerIcon;
  /** Hex string used for both the glyph stroke and a low-opacity tint wash. */
  tint: string;
};

/**
 * Generic dock-app icon: glass tile + Tabler glyph + per-project tint.
 * Used for any of the eight active or archived projects.
 */
export function AppIcon({ glyph: Glyph, tint, size = 64, className, label }: AppIconProps) {
  return (
    <div
      className={`${styles.tile} ${className ?? ''}`.trim()}
      style={{ ['--tile-size' as string]: `${size}px`, ['--tile-tint' as string]: tint }}
      role="img"
      aria-label={label}
    >
      <span className={styles.tintWash} aria-hidden />
      <span className={styles.glyph} aria-hidden>
        <Glyph />
      </span>
    </div>
  );
}

type ProjectAppIconProps = CommonProps & {
  /** Project id from src/data/projectList.ts. */
  projectId: number;
};

/**
 * Convenience wrapper: looks up the glyph + tint for a given project id.
 * Throws in development if the project is not in the icon map (e.g. Blog).
 */
export function ProjectAppIcon({ projectId, ...rest }: ProjectAppIconProps) {
  const config = getProjectIcon(projectId);
  if (!config) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        `ProjectAppIcon: no icon mapping for projectId=${projectId}. ` +
          `Add an entry to PROJECT_ICONS or use AppIcon directly.`,
      );
    }
    return null;
  }
  return <AppIcon glyph={config.glyph} tint={config.tint} {...rest} />;
}

type FolderIconProps = CommonProps & {
  /** Optional tint. Defaults to site teal so the folder reads as "system". */
  tint?: string;
};

/**
 * Folder shape inside a glass tile — visually distinct from app icons so the
 * eye reads "this is different" at the dock divider.
 */
export function FolderIcon({ tint = '#1f4a44', size = 64, className, label }: FolderIconProps) {
  return (
    <div
      className={`${styles.tile} ${className ?? ''}`.trim()}
      style={{ ['--tile-size' as string]: `${size}px`, ['--tile-tint' as string]: tint }}
      role="img"
      aria-label={label}
    >
      <span className={styles.tintWash} aria-hidden />
      <span className={styles.shape} aria-hidden>
        <svg viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2 8c0-3.3 2.7-6 6-6h14l6 6h28c3.3 0 6 2.7 6 6v28c0 3.3-2.7 6-6 6H8c-3.3 0-6-2.7-6-6V8z"
            fill={tint}
            fillOpacity="0.25"
            stroke={tint}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M2 14h60"
            stroke={tint}
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
        </svg>
      </span>
    </div>
  );
}

type DocumentIconProps = CommonProps & {
  /** Optional tint. Defaults to slate so the doc reads as "neutral". */
  tint?: string;
  /** File extension shown on the document corner (e.g. "PDF"). */
  badge?: string;
};

/**
 * Document shape inside a glass tile — used for Resume.pdf on the desktop.
 */
export function DocumentIcon({
  tint = '#576366',
  badge = 'PDF',
  size = 64,
  className,
  label,
}: DocumentIconProps) {
  return (
    <div
      className={`${styles.tile} ${className ?? ''}`.trim()}
      style={{ ['--tile-size' as string]: `${size}px`, ['--tile-tint' as string]: tint }}
      role="img"
      aria-label={label}
    >
      <span className={styles.tintWash} aria-hidden />
      <span className={styles.shape} aria-hidden>
        <svg viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 4c0-2.2 1.8-4 4-4h24l12 12v44c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4V4z"
            fill={tint}
            fillOpacity="0.18"
            stroke={tint}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M32 0v8c0 2.2 1.8 4 4 4h8" stroke={tint} strokeWidth="2" strokeLinejoin="round" />
          <text
            x="24"
            y="44"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fontFamily="ui-monospace, monospace"
            fill={tint}
          >
            {badge}
          </text>
        </svg>
      </span>
    </div>
  );
}

type AHMonogramProps = CommonProps & {
  /** Optional tint. Defaults to current site ink (theme-aware via CSS). */
  tint?: string;
};

/**
 * "AH" brand monogram set in League Gothic inside a glass tile.
 * Reusable across the menu bar (small) and the boot intro (large).
 */
export function AHMonogram({ size = 24, className, label = 'Angus Hally', tint }: AHMonogramProps) {
  return (
    <div
      className={`${styles.tile} ${className ?? ''}`.trim()}
      style={{
        ['--tile-size' as string]: `${size}px`,
        ...(tint ? { ['--tile-tint' as string]: tint } : {}),
      }}
      role="img"
      aria-label={label}
    >
      {tint && <span className={styles.tintWash} aria-hidden />}
      <span className={styles.monogram} aria-hidden>
        AH
      </span>
    </div>
  );
}
