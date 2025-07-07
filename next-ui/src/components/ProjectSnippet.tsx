'use client';

import React from 'react';
import Link from 'next/link';
import styles from './ProjectSnippet.module.css';

interface Project {
  name: string;
  desc: string;
  route: string;
  tags?: string[];
}

interface ProjectSnippetProps {
  project: Project;
}

function ProjectSnippet({ project }: ProjectSnippetProps) {
  const { name, desc, route, tags = [] } = project;
  
  return (
    <Link href={route} className={styles.projectLink}>
      <div className={styles.gridItem}>
        <h3 className={styles.truncateTwoLines}>{name}</h3>
        <p className={styles.truncateTwoLines}>{desc}</p>
        <div className={styles.tagContainer}>
          {tags.map((tag) => (
            <span key={tag} className={`${styles.tag} ${styles[`tag${tag.toLowerCase().replace(/\s+/g, '')}`]}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default ProjectSnippet;