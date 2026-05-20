'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';
import type { ProjectItem, ProjectStatus } from '@/data/projectList';
import { ProjectAppIcon } from './IconTile';
import { RichProjectWindow } from './RichProjectWindow';
import { WriteUpWindow } from './WriteUpWindow';
import { TerseArchivedWindow } from './TerseArchivedWindow';
import styles from './MobileProjectSheet.module.css';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  'in-progress': 'In progress',
  done: 'Done',
  archived: 'Archived',
};

interface MobileProjectSheetProps {
  project: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Fullscreen bottom-sheet for mobile project view.
 *
 * - Animates up from bottom
 * - Uses single-pane layout (no drag, no multi-window)
 * - Sidebar collapses to top header, main content below
 * - Drag-down handle + X button to dismiss
 *
 * Renders appropriate window component based on project type:
 * - Archived → TerseArchivedWindow
 * - Active without screenshot → WriteUpWindow
 * - Active with screenshot → RichProjectWindow
 */
export function MobileProjectSheet({ project, isOpen, onClose }: MobileProjectSheetProps) {
  // Handle swipe to dismiss
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { y: number }; velocity: { y: number } }) => {
    // Close if dragged down more than 100px or with downward velocity
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  // Close on escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!project) return null;

  const tooltipParts: string[] = [project.name, STATUS_LABEL[project.status]];
  if (project.gated) tooltipParts.push('Sign-in required');
  const label = tooltipParts.join(' · ');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={handleDragEnd}
          >
            {/* Handle bar */}
            <div className={styles.handleBar} aria-hidden="true">
              <div className={styles.handle} />
            </div>

            {/* Close button */}
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close project view"
            >
              <IconX size={20} />
            </button>

            {/* Content */}
            <div className={styles.content}>
              {/* Mobile header with icon and title */}
              <div className={styles.mobileHeader}>
                <ProjectAppIcon projectId={project.id} size={56} label={project.name} />
                <div className={styles.headerText}>
                  <h2 className={styles.title}>{project.name}</h2>
                  <span className={styles.status}>{STATUS_LABEL[project.status]}</span>
                  {project.gated && <span className={styles.gated}>Sign-in required</span>}
                </div>
              </div>

              {/* Project content - uses existing window components */}
              <div className={styles.projectContent}>
                {project.status === 'archived' ? (
                  <TerseArchivedWindow project={project} />
                ) : !project.screenshot ? (
                  <WriteUpWindow project={project} />
                ) : (
                  <RichProjectWindow project={project} />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileProjectSheet;
