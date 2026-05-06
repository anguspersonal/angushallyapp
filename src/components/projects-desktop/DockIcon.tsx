'use client';

import * as React from 'react';
import { Tooltip } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { ProjectAppIcon } from './IconTile';
import type { ProjectItem, ProjectStatus } from '@/data/projectList';
import styles from './DockIcon.module.css';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  'in-progress': 'In progress',
  done: 'Done',
  archived: 'Archived',
};

interface DockIconProps {
  project: ProjectItem;
  /** Click handler. Phase 4 wires this to the window manager. */
  onClick?: () => void;
  /** Tile size in px. Defaults to 64 (standard dock size). */
  size?: number;
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
 * The click handler is intentionally a no-op until Phase 4 mounts the window
 * manager — we render the dock visually first per Milestone 1 of the plan.
 */
export function DockIcon({ project, onClick, size = 64 }: DockIconProps) {
  const tooltipParts: string[] = [project.name, STATUS_LABEL[project.status]];
  if (project.gated) tooltipParts.push('Sign-in required');
  const tooltipLabel = tooltipParts.join(' · ');

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
        type="button"
        className={styles.button}
        onClick={onClick}
        aria-label={tooltipLabel}
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

export default DockIcon;
