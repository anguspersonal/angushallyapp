'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge, Button } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import type { ProjectItem, ProjectStatus } from '@/data/projectList';
import { ProjectAppIcon } from './IconTile';
import styles from './RichProjectWindow.module.css';

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

interface RichProjectWindowProps {
  project: ProjectItem;
}

/**
 * Rich project window — two-pane layout for projects with hero screenshots.
 *
 * Left sidebar (~30%): icon, title, status badge, tags, "Built with" chips, CTA
 * Right main (~70%): hero screenshot + write-up
 *
 * Used for Data Value Game and Timeline (the two with hero screenshots).
 */
export function RichProjectWindow({ project }: RichProjectWindowProps) {
  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.iconSection}>
          <ProjectAppIcon projectId={project.id} size={80} label={project.name} />
        </div>

        <h2 className={styles.title}>{project.name}</h2>

        <div className={styles.metaSection}>
          <div className={styles.statusRow}>
            <span className={styles.metaKey}>Status:</span>
            <span className={`${styles.statusBadge} ${styles[STATUS_VARIANT[project.status]]}`}>
              {STATUS_LABEL[project.status]}
            </span>
          </div>

          {project.gated && (
            <span className={styles.gatedBadge}>Sign-in required</span>
          )}
        </div>

        <div className={styles.tagsSection}>
          {project.tags.map((tag) => (
            <Badge key={tag} variant="light" size="sm" className={styles.tag}>
              {tag}
            </Badge>
          ))}
        </div>

        {project.builtWith && project.builtWith.length > 0 && (
          <div className={styles.builtWithSection}>
            <span className={styles.sectionLabel}>Built with</span>
            <div className={styles.chipsRow}>
              {project.builtWith.map((tech) => (
                <span key={tech} className={styles.techChip}>
                  {tech}
                </span>
              ))}
            </div>
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
      </aside>

      <main className={styles.main}>
        {project.screenshot && (
          <div className={styles.screenshotWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.screenshot}
              alt={`${project.name} screenshot`}
              className={styles.screenshot}
            />
          </div>
        )}

        {project.writeUp && (
          <div className={styles.writeUp}>
            {project.writeUp.split('\n\n').map((para, i) => (
              <p key={i} className={styles.paragraph}>
                {para}
              </p>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default RichProjectWindow;
