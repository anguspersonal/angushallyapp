'use client';

import * as React from 'react';
import { Tooltip } from '@mantine/core';
import { FolderIcon } from './IconTile';
import { DockIcon } from './DockIcon';
import { projectList, type ProjectItem } from '@/data/projectList';
import styles from './Dock.module.css';

/**
 * Active-project order in the dock, locked by the design plan.
 *
 *   [DVG] [Timeline•🔒] [Strava] [AI Text 🔒]   |   [Archive]
 *
 * Order is hard-coded (not derived from `status`) because the plan specifies a
 * curated reading order — DVG first as the most polished, Timeline second to
 * surface the in-progress signal early, then the two `done` apps. Archived
 * projects do not appear in the dock; they live behind the Archive folder.
 */
const DOCK_PROJECT_IDS = [0, 8, 3, 5] as const;

function getDockProjects(): ProjectItem[] {
  return DOCK_PROJECT_IDS.map((id) => {
    const project = projectList.find((p) => p.id === id);
    if (!project) {
      throw new Error(`Dock: missing project id=${id} in projectList`);
    }
    return project;
  });
}

/**
 * Bottom-centred dock for the macOS desktop redesign of `/projects`.
 *
 * Phase 3 builds the dock as a static visual: tiles render, hover lifts, lock
 * badges and in-progress dots show, tooltips work — but click handlers are
 * no-ops because the window manager (Phase 4) does not exist yet. Phase 4
 * swaps the no-op handlers for `WindowContext.openProject(id)` calls without
 * restructuring the JSX.
 */
export function Dock() {
  const projects = React.useMemo(getDockProjects, []);

  return (
    <div className={styles.dock} role="toolbar" aria-label="Projects dock">
      <div className={styles.group}>
        {projects.map((project) => (
          <DockIcon
            key={project.id}
            project={project}
            // Phase 4 wires this to WindowContext.openProject(project.id).
            onClick={() => {}}
          />
        ))}
      </div>

      <span className={styles.divider} aria-hidden />

      <Tooltip
        label="Archive"
        position="top"
        offset={14}
        withArrow
        openDelay={250}
        radius="md"
        transitionProps={{ duration: 120 }}
      >
        <button
          type="button"
          className={styles.folderButton}
          // Phase 4 wires this to WindowContext.openFinder('archive').
          onClick={() => {}}
          aria-label="Archive folder"
        >
          <span className={styles.folderIconWrap}>
            <FolderIcon size={64} label="Archive" />
          </span>
          <span className={styles.folderSpacer} aria-hidden />
        </button>
      </Tooltip>
    </div>
  );
}

export default Dock;
