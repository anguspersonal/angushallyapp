'use client';

import * as React from 'react';
import { AnimatePresence } from 'framer-motion';
import { WindowFrame } from './WindowFrame';
import { useWindow, type WindowState } from './WindowContext';
import { projectList } from '@/data/projectList';
import { RichProjectWindow } from './RichProjectWindow';
import { WriteUpWindow } from './WriteUpWindow';
import { TerseArchivedWindow } from './TerseArchivedWindow';
import { FinderWindow } from './FinderWindow';
import { SystemWindow } from './SystemWindow';

function getTitle(win: WindowState): string {
  const { kind } = win;
  switch (kind.type) {
    case 'project': {
      const p = projectList.find((proj) => proj.id === kind.projectId);
      return p?.name ?? 'Project';
    }
    case 'archive-folder':
      return 'Archive';
    case 'about':
      return 'About';
    case 'resume':
      return 'Resume.pdf';
  }
}

/**
 * Get the appropriate window body component based on window kind.
 *
 * Project windows are further routed by status/screenshot:
 * - Archived → TerseArchivedWindow
 * - Active without screenshot → WriteUpWindow
 * - Active with screenshot → RichProjectWindow
 */
function WindowBody({ win }: { win: WindowState }): React.ReactNode {
  const { kind } = win;

  switch (kind.type) {
    case 'project': {
      const project = projectList.find((p) => p.id === kind.projectId);
      if (!project) {
        return <p className="window-error">Project not found</p>;
      }

      // Archived projects get the terse window
      if (project.status === 'archived') {
        return <TerseArchivedWindow project={project} />;
      }

      // Active projects without screenshots get write-up-only window
      if (!project.screenshot) {
        return <WriteUpWindow project={project} />;
      }

      // Projects with screenshots get rich window
      return <RichProjectWindow project={project} />;
    }

    case 'archive-folder':
      return <FinderWindow />;

    case 'about':
    case 'resume':
      return <SystemWindow kind={kind} />;

    default:
      return <p className="window-error">Unknown window type</p>;
  }
}

/**
 * Renders all currently-open windows from `WindowContext`.
 *
 * Phase 5 wires the real window type components:
 * - RichProjectWindow: DVG + Timeline (with hero screenshots)
 * - WriteUpWindow: Strava + AI Text (active, no hero)
 * - TerseArchivedWindow: archived projects
 * - FinderWindow: archive folder
 * - SystemWindow: About + Resume
 */
export function WindowManager() {
  const { windows, focusedId } = useWindow();

  return (
    <AnimatePresence>
      {windows.map((win) => (
        <WindowFrame
          key={win.id}
          window={win}
          isFocused={focusedId === win.id}
          title={getTitle(win)}
        >
          <WindowBody win={win} />
        </WindowFrame>
      ))}
    </AnimatePresence>
  );
}

export default WindowManager;
