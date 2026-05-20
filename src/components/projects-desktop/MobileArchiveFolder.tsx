'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';
import type { ProjectItem } from '@/data/projectList';
import { projectList } from '@/data/projectList';
import { ProjectAppIcon } from './IconTile';
import type { ProjectStatus } from '@/data/projectList';
import styles from './MobileArchiveFolder.module.css';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  'in-progress': 'In progress',
  done: 'Done',
  archived: 'Archived',
};

/**
 * Get archived projects sorted chronologically.
 * Eat Safe UK → Habit → Instapaper → Bookmarks
 */
function getArchivedProjects(): ProjectItem[] {
  return projectList
    .filter((p) => p.status === 'archived')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

interface ArchiveIconProps {
  project: ProjectItem;
  onClick?: () => void;
}

function ArchiveIcon({ project, onClick }: ArchiveIconProps) {
  const tooltipParts: string[] = [project.name, STATUS_LABEL[project.status]];
  const label = tooltipParts.join(' · ');

  return (
    <button
      type="button"
      className={styles.iconButton}
      onClick={onClick}
      aria-label={label}
    >
      <span className={styles.iconWrap}>
        <ProjectAppIcon projectId={project.id} size={64} label={project.name} />
      </span>
      <span className={styles.iconLabel}>{project.name}</span>
    </button>
  );
}

interface MobileArchiveFolderProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProject: (projectId: number) => void;
}

/**
 * iOS-style folder overlay for archived projects.
 *
 * - Opens as a centered modal with blurred backdrop
 * - Shows 3-4 column grid of archived project icons
 * - Tap icon opens project sheet
 * - No Finder window - direct project open
 */
export function MobileArchiveFolder({ isOpen, onClose, onOpenProject }: MobileArchiveFolderProps) {
  const archived = React.useMemo(getArchivedProjects, []);

  // Close on escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

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

          {/* Folder container */}
          <motion.div
            className={styles.folder}
            role="dialog"
            aria-modal="true"
            aria-label="Archive folder"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <h2 className={styles.title}>Archive</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close archive folder"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Project grid */}
            <div className={styles.grid}>
              {archived.map((project) => (
                <ArchiveIcon
                  key={project.id}
                  project={project}
                  onClick={() => {
                    onClose();
                    onOpenProject(project.id);
                  }}
                />
              ))}
            </div>

            {/* Count footer */}
            <div className={styles.footer}>
              <span className={styles.count}>{archived.length} projects</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileArchiveFolder;
