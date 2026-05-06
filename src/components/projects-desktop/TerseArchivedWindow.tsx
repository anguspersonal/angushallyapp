'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge, Button } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import type { ProjectItem } from '@/data/projectList';
import { ProjectAppIcon } from './IconTile';
import styles from './TerseArchivedWindow.module.css';

interface TerseArchivedWindowProps {
  project: ProjectItem;
}

/**
 * Terse archived project window — smaller single-pane layout.
 *
 * Used for archived projects (Eat Safe UK, Habit Tracker, Instapaper, Bookmarks).
 * Minimal but complete: title, status, one-line description, tags,
 * "Archived because…" note, and CTA.
 */
export function TerseArchivedWindow({ project }: TerseArchivedWindowProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <ProjectAppIcon projectId={project.id} size={40} label={project.name} />
        <div className={styles.headerText}>
          <h2 className={styles.title}>{project.name}</h2>
          <span className={styles.statusBadge}>Archived</span>
        </div>
      </header>

      <p className={styles.description}>{project.desc}</p>

      <div className={styles.tagsRow}>
        {project.tags.map((tag) => (
          <Badge key={tag} variant="light" size="sm" className={styles.tag}>
            {tag}
          </Badge>
        ))}
      </div>

      {project.archivedReason && (
        <div className={styles.archivedNote}>
          <span className={styles.noteLabel}>Archived because</span>
          <p className={styles.noteText}>{project.archivedReason}</p>
        </div>
      )}

      <div className={styles.ctaSection}>
        <Button
          component={Link}
          href={project.route}
          variant="light"
          size="sm"
          rightSection={<IconExternalLink size={14} />}
          className={styles.ctaButton}
        >
          View project page
        </Button>
      </div>
    </div>
  );
}

export default TerseArchivedWindow;
