'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge, Button } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import type { ProjectItem, ProjectStatus } from '@/data/projectList';
import { ProjectAppIcon } from './IconTile';
import styles from './WriteUpWindow.module.css';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  'in-progress': 'In progress',
  done: 'Done',
  archived: 'Archived',
};

const STATUS_VARIANT: Record<ProjectStatus, string> = {
  'in-progress': 'statusInProgress',
  done: 'statusDone',
  archived: 'statusArchived',
};

interface WriteUpWindowProps {
  project: ProjectItem;
}

/**
 * Write-up only project window — narrower single-pane layout.
 *
 * Used for Strava and AI Text: active projects without hero screenshots.
 * Sits between RichProjectWindow and TerseArchivedWindow in fidelity.
 *
 * Layout: header row with icon + title + status, then tags/built-with chips
 * inline, then write-up, then CTA at bottom.
 */
export function WriteUpWindow({ project }: WriteUpWindowProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <ProjectAppIcon projectId={project.id} size={48} label={project.name} />
        <div className={styles.headerText}>
          <h2 className={styles.title}>{project.name}</h2>
          <div className={styles.headerMeta}>
            <span className={styles.metaKey}>Status:</span>
            <span className={`${styles.statusBadge} ${styles[STATUS_VARIANT[project.status]]}`}>
              {STATUS_LABEL[project.status]}
            </span>
            {project.gated && (
              <span className={styles.gatedBadge}>Sign-in required</span>
            )}
          </div>
        </div>
      </header>

      <div className={styles.chipsRow}>
        {project.tags.map((tag) => (
          <Badge key={tag} variant="light" size="sm" className={styles.tag}>
            {tag}
          </Badge>
        ))}
        {project.builtWith?.map((tech) => (
          <span key={tech} className={styles.techChip}>
            {tech}
          </span>
        ))}
      </div>

      {project.writeUp && (
        <div className={styles.writeUp}>
          {project.writeUp.split('\n\n').map((para, i) => (
            <p key={i} className={styles.paragraph}>
              {para}
            </p>
          ))}
        </div>
      )}

      <div className={styles.ctaSection}>
        <Button
          component={Link}
          href={project.route}
          variant="filled"
          size="sm"
          rightSection={<IconExternalLink size={14} />}
          className={styles.ctaButton}
        >
          Visit project
        </Button>
      </div>
    </div>
  );
}

export default WriteUpWindow;
