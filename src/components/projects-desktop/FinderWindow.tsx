'use client';

import * as React from 'react';
import type { ProjectItem } from '@/data/projectList';
import { projectList } from '@/data/projectList';
import { FolderIcon, ProjectAppIcon } from './IconTile';
import { useWindow, type OriginRect } from './WindowContext';
import styles from './FinderWindow.module.css';

/**
 * Get archived projects in chronological order:
 * Eat Safe UK (2025-01-03) → Habit (2025-02-23) → Instapaper (2025-05-21) → Bookmarks (2025-05-22)
 */
function getArchivedProjects(): ProjectItem[] {
  return projectList
    .filter((p) => p.status === 'archived')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

interface ArchiveIconProps {
  project: ProjectItem;
  onClick?: (origin: OriginRect) => void;
}

function ArchiveIcon({ project, onClick }: ArchiveIconProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onClick({ x: rect.x, y: rect.y, w: rect.width, h: rect.height });
  };

  return (
    <button
      type="button"
      className={styles.archiveIcon}
      onClick={handleClick}
      aria-label={`Open ${project.name}`}
    >
      <span className={styles.iconWrap}>
        <ProjectAppIcon projectId={project.id} size={64} label={project.name} />
      </span>
      <span className={styles.iconLabel}>{project.name}</span>
    </button>
  );
}

/**
 * Finder-style archive folder window.
 *
 * Layout:
 * - Sidebar: "Archive" folder highlighted
 * - Main pane: icon-view grid of archived projects in chronological order
 *
 * Clicking an archive icon opens its terse window alongside Finder (multi-window).
 */
export function FinderWindow() {
  const archived = React.useMemo(getArchivedProjects, []);
  const { openProject } = useWindow();

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <div className={styles.folderItem} data-active="true">
            <span className={styles.folderIcon}>
              <FolderIcon size={20} label="Archive" />
            </span>
            <span className={styles.folderLabel}>Archive</span>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.grid}>
          {archived.map((project) => (
            <ArchiveIcon
              key={project.id}
              project={project}
              onClick={(origin) => openProject(project.id, origin)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default FinderWindow;
