'use client';

import * as React from 'react';
import { Tooltip } from '@mantine/core';
import { ProjectAppIcon } from './IconTile';
import type { ProjectItem } from '@/data/projectList';
import type { OriginRect } from './WindowContext';
import styles from './DockIcon.module.css';

interface DockIconProps {
  project: ProjectItem;
  /**
   * Click handler. Receives the icon's bounding rect in viewport coords so the
   * window manager can animate the open transition from icon → window.
   */
  onClick?: (origin: OriginRect) => void;
  /** Tile size in px. Defaults to 64 (standard dock size). */
  size?: number;
  /** Magnification scale from cursor distance (Phase 8 dock effect). */
  scale?: number;
}

/**
 * Project icon as it appears in the dock.
 *
 * Layered structure:
 *   button.button  ← hover/focus target, owns lift transform
 *     span.iconWrap
 *       <ProjectAppIcon /> (glass tile + tinted glyph)
 *     span.statusDot (in-progress only)
 *
 * Phase 8 adds cursor-distance magnification via the `scale` prop.
 */
export const DockIcon = React.forwardRef<HTMLButtonElement, DockIconProps>(
  function DockIcon({ project, onClick, size = 64, scale = 1 }, ref) {
    const tooltipLabel = project.name;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!onClick) return;
      const rect = e.currentTarget.getBoundingClientRect();
      onClick({ x: rect.x, y: rect.y, w: rect.width, h: rect.height });
    };

    return (
      <Tooltip
        label={tooltipLabel}
        position="top"
        offset={14}
        withArrow
        openDelay={250}
        radius="md"
        transitionProps={{ duration: 120 }}
      >
        <button
          ref={ref}
          type="button"
          className={styles.button}
          onClick={handleClick}
          aria-label={tooltipLabel}
          style={{ '--dock-scale': scale } as React.CSSProperties}
        >
          <span className={styles.iconWrap}>
            <ProjectAppIcon
              projectId={project.id}
              size={size}
              label={project.name}
              className={styles.dockTile}
            />
          </span>
        </button>
      </Tooltip>
    );
  }
);

export default DockIcon;
