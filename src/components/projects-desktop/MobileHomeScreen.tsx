'use client';

import * as React from 'react';
import { ProjectAppIcon, FolderIcon } from './IconTile';
import { projectList, type ProjectItem } from '@/data/projectList';
import type { ProjectStatus } from '@/data/projectList';
import styles from './MobileHomeScreen.module.css';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  'in-progress': 'In progress',
  done: 'Done',
  archived: 'Archived',
};

/**
 * Active project order for mobile grid.
 * DVG → Timeline → Strava → AI Text (same curated order as desktop dock)
 */
const MOBILE_PROJECT_IDS = [0, 8, 3, 5] as const;

/**
 * Get active projects for mobile home screen.
 */
function getMobileProjects(): ProjectItem[] {
  return MOBILE_PROJECT_IDS.map((id) => {
    const project = projectList.find((p) => p.id === id);
    if (!project) {
      throw new Error(`MobileHomeScreen: missing project id=${id} in projectList`);
    }
    return project;
  });
}

/**
 * Get archived projects sorted chronologically.
 */
function getArchivedProjects(): ProjectItem[] {
  return projectList
    .filter((p) => p.status === 'archived')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

interface MobileIconProps {
  project: ProjectItem;
  onClick?: () => void;
}

function MobileIcon({ project, onClick }: MobileIconProps) {
  const tooltipParts: string[] = [project.name, STATUS_LABEL[project.status]];
  if (project.gated) tooltipParts.push('Sign-in required');
  const label = tooltipParts.join(' · ');

  return (
    <button
      type="button"
      className={styles.iconButton}
      onClick={onClick}
      aria-label={label}
    >
      <span className={styles.iconWrap}>
        <ProjectAppIcon projectId={project.id} size={72} label={project.name} />
        {project.gated && (
          <span className={styles.lockBadge} aria-hidden>
            <svg viewBox="0 0 16 16" fill="currentColor" width="10" height="10">
              <path d="M8 1a3 3 0 0 0-3 3v3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V4a3 3 0 0 0-3-3zM6 4a2 2 0 1 1 4 0v3H6V4z" />
            </svg>
          </span>
        )}
      </span>
      <span className={styles.iconLabel}>{project.name}</span>
      {project.status === 'in-progress' && (
        <span className={styles.statusDot} aria-hidden />
      )}
    </button>
  );
}

interface MobileFolderProps {
  onClick?: () => void;
  projectCount: number;
}

function MobileFolder({ onClick, projectCount }: MobileFolderProps) {
  return (
    <button
      type="button"
      className={styles.folderButton}
      onClick={onClick}
      aria-label={`Archive folder with ${projectCount} projects`}
    >
      <span className={styles.iconWrap}>
        <FolderIcon size={72} label="Archive" />
      </span>
      <span className={styles.iconLabel}>Archive</span>
    </button>
  );
}

interface MobileHomeScreenProps {
  /** Called when an active project icon is tapped */
  onOpenProject: (projectId: number) => void;
  /** Called when archive folder is tapped */
  onOpenArchive: () => void;
}

/**
 * iOS Home Screen-style layout for mobile/tablet view of /projects.
 *
 * Features:
 * - 3-4 column grid of app icons (active projects)
 * - Archive folder in its own row
 * - No drag, no multi-window (single sheet UI)
 * - Uses same ProjectAppIcon components as desktop dock
 */
export function MobileHomeScreen({ onOpenProject, onOpenArchive }: MobileHomeScreenProps) {
  const activeProjects = React.useMemo(getMobileProjects, []);
  const archivedProjects = React.useMemo(getArchivedProjects, []);

  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        {activeProjects.map((project) => (
          <MobileIcon
            key={project.id}
            project={project}
            onClick={() => onOpenProject(project.id)}
          />
        ))}
      </div>

      <div className={styles.archiveRow}>
        <MobileFolder
          onClick={onOpenArchive}
          projectCount={archivedProjects.length}
        />
      </div>
    </div>
  );
}

export default MobileHomeScreen;
