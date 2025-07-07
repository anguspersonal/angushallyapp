'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Snippet.module.css';

interface SnippetProps {
  excerpt: string;
  id: string;
  slug: string;
  title: string;
  link?: string;
}

function Snippet({ excerpt, id, slug, title, link = `/blog/${slug}` }: SnippetProps) {
  return (
    <Link key={id} href={link} className={styles.blogLink} aria-label={`Read more about ${title}`}>
      <div className={styles.gridItem}>
        <h3 className={styles.truncateTwoLines}>{title}</h3>
        <p className={styles.truncateTwoLines}>{excerpt}</p>
      </div>
    </Link>
  );
}

export default Snippet;