import {
  IconLayoutGrid,
  IconActivity,
  IconClock,
  IconSparkles,
  IconMap,
  IconRepeat,
  IconNews,
  IconBookmark,
  type IconProps,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

type TablerIcon = ComponentType<IconProps>;

export interface ProjectIconConfig {
  /** Tabler icon component used as the glyph. */
  glyph: TablerIcon;
  /**
   * Single hex tint applied to the glyph stroke.
   * Picked to harmonise with the site palette (cream / deep-teal / coral) and to
   * remain legible on both day and night wallpapers.
   */
  tint: string;
  /** Optional human-readable name for the tint, useful for debugging / storybook. */
  tintName: string;
}

/**
 * Per-project icon mapping for the macOS desktop redesign of /projects.
 *
 * Project IDs come from src/data/projectList.ts. Blog (id 2) is intentionally
 * excluded — it's a site-nav destination, not a dock app.
 *
 * Tint palette is deliberately small and "muted, slightly warm" so all eight
 * tiles read as a coherent set even though each project has a distinct hue.
 */
export const PROJECT_ICONS: Record<number, ProjectIconConfig> = {
  0: { glyph: IconLayoutGrid, tint: '#c8a951', tintName: 'mustard' },
  1: { glyph: IconMap, tint: '#7a9c83', tintName: 'sage' },
  3: { glyph: IconActivity, tint: '#f0997b', tintName: 'coral' },
  4: { glyph: IconRepeat, tint: '#b4654a', tintName: 'brick' },
  5: { glyph: IconSparkles, tint: '#8b6a90', tintName: 'plum' },
  6: { glyph: IconNews, tint: '#576366', tintName: 'slate' },
  7: { glyph: IconBookmark, tint: '#1f4a44', tintName: 'site-teal' },
  8: { glyph: IconClock, tint: '#7898b5', tintName: 'periwinkle' },
};

export function getProjectIcon(projectId: number): ProjectIconConfig | undefined {
  return PROJECT_ICONS[projectId];
}
