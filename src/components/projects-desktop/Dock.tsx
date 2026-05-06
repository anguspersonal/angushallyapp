'use client';

import * as React from 'react';
import { Tooltip } from '@mantine/core';
import { FolderIcon } from './IconTile';
import { DockIcon } from './DockIcon';
import { useWindow } from './WindowContext';
import { projectList, type ProjectItem } from '@/data/projectList';
import styles from './Dock.module.css';

/**
 * Mac dock magnification equation.
 * Returns scale factor (1.0 = no magnification) based on distance from cursor.
 *
 * The curve: maximum magnification at 0px (1.5x), falls off smoothly using
 * a sigmoid-like ease. Adjacent icons get partial scale (1.2x, 1.1x).
 *
 * @param distance - distance from cursor center to icon center (px)
 * @param maxDistance - distance at which magnification ends (default 150px)
 * @param maxScale - maximum scale at cursor position (default 1.5)
 */
function getMagnification(distance: number, maxDistance = 150, maxScale = 1.5): number {
  if (distance >= maxDistance) return 1;
  // Smooth falloff using cosine ease: 1 at maxDistance, maxScale at 0
  const t = distance / maxDistance;
  const scale = 1 + (maxScale - 1) * (0.5 * (1 + Math.cos(t * Math.PI)));
  return Math.max(1, Math.min(maxScale, scale));
}

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
 * Phase 4 wires each tile to the window manager (`useWindow`):
 *   project tile → openProject(id, origin)
 *   archive folder → openArchiveFolder(origin)
 *
 * Origin is captured by the icon component (`DockIcon` / inline button) and
 * passed back so the window can animate from the click site.
 *
 * Phase 8 adds cursor-distance magnification (Mac dock equation).
 */
export function Dock() {
  const projects = React.useMemo(getDockProjects, []);
  const { openProject, openArchiveFolder } = useWindow();
  const folderRef = React.useRef<HTMLButtonElement>(null);
  const dockRef = React.useRef<HTMLDivElement>(null);
  const iconRefs = React.useRef<Map<number, HTMLButtonElement>>(new Map());
  const [mouseX, setMouseX] = React.useState<number | null>(null);
  const [scales, setScales] = React.useState<Map<number, number>>(new Map());

  // Track mouse position over the dock
  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    setMouseX(e.clientX);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setMouseX(null);
    setScales(new Map());
  }, []);

  // Calculate magnification for each icon based on cursor distance
  React.useEffect(() => {
    if (mouseX === null) return;

    const newScales = new Map<number, number>();

    // Calculate for project icons
    projects.forEach((project) => {
      const iconEl = iconRefs.current.get(project.id);
      if (iconEl) {
        const rect = iconEl.getBoundingClientRect();
        const iconCenter = rect.left + rect.width / 2;
        const distance = Math.abs(mouseX - iconCenter);
        const scale = getMagnification(distance, 150, 1.5);
        newScales.set(project.id, scale);
      }
    });

    // Calculate for archive folder
    if (folderRef.current) {
      const rect = folderRef.current.getBoundingClientRect();
      const iconCenter = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX - iconCenter);
      const scale = getMagnification(distance, 150, 1.5);
      newScales.set(-1, scale); // -1 represents archive folder
    }

    setScales(newScales);
  }, [mouseX, projects]);

  const handleArchiveClick = () => {
    if (!folderRef.current) {
      openArchiveFolder();
      return;
    }
    const rect = folderRef.current.getBoundingClientRect();
    openArchiveFolder({ x: rect.x, y: rect.y, w: rect.width, h: rect.height });
  };

  const setIconRef = (projectId: number) => (el: HTMLButtonElement | null) => {
    if (el) {
      iconRefs.current.set(projectId, el);
    } else {
      iconRefs.current.delete(projectId);
    }
  };

  return (
    <div
      ref={dockRef}
      className={styles.dock}
      role="toolbar"
      aria-label="Projects dock"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.group}>
        {projects.map((project) => (
          <DockIcon
            key={project.id}
            project={project}
            ref={setIconRef(project.id)}
            scale={scales.get(project.id) ?? 1}
            onClick={(origin) => openProject(project.id, origin)}
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
          ref={folderRef}
          type="button"
          className={styles.folderButton}
          onClick={handleArchiveClick}
          aria-label="Archive folder"
          style={{
            '--dock-scale': scales.get(-1) ?? 1,
          } as React.CSSProperties}
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
