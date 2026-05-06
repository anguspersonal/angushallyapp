'use client';

import * as React from 'react';
import { Tooltip } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { ProjectAppIcon } from './IconTile';
import type { ProjectItem, ProjectStatus } from '@/data/projectList';
import type { OriginRect } from './WindowContext';
import styles from './DockIcon.module.css';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  'in-progress': 'In progress',
  done: 'Done',
  archived: 'Archived',
};

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
 *     span.iconWrap (positioning context for badge)
 *       <ProjectAppIcon /> (glass tile + tinted glyph)
 *       span.lockBadge (gated only)
 *     span.statusDot (in-progress only)
 *
 * Phase 8 adds cursor-distance magnification via the `scale` prop.
 */
export const DockIcon = React.forwardRef<HTMLButtonElement, DockIconProps>(
  function DockIcon({ project, onClick, size = 64, scale = 1 }, ref) {
    const tooltipParts: string[] = [project.name, STATUS_LABEL[project.status]];
    if (project.gated) tooltipParts.push('Sign-in required');
    const tooltipLabel = tooltipParts.join(' · ');

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
            <ProjectAppIcon projectId={project.id} size={size} label={project.name} />
            {project.gated && (
              <span className={styles.lockBadge} aria-hidden>
                <IconLock />
              </span>
            )}
          </span>
          {project.status === 'in-progress' ? (
            <span className={styles.statusDot} aria-hidden />
          ) : (
            <span className={styles.statusDotPlaceholder} aria-hidden />
          )}
        </button>
      </Tooltip>
    );
  }
);

export default DockIcon;
