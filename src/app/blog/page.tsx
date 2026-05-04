'use client';

import React from 'react';
import { usePosts } from '@/services/content/hooks';
import NewspaperCard from '@/components/blog/NewspaperCard';
import NewspaperIntro from '@/components/blog/NewspaperIntro';
import styles from './blog.module.css';

const FILING_BASE = 42; // Editorial conceit: counts down from a fictitious total.

function formatTodayDateline(): string {
  const now = new Date();
  return now
    .toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase();
}

function pad3(n: number): string {
  return n.toString().padStart(3, '0');
}

export default function Blog() {
  const { data: posts, isLoading, error } = usePosts({ sortBy: 'createdAt', order: 'desc' });
  const dateline = React.useMemo(formatTodayDateline, []);

  return (
    /* The newsprint palette tokens are scoped by [data-mantine-color-scheme]
       in blog.module.css, so the page tracks the user's site-wide theme
       preference (day = cream stock, night = ink-bath broadsheet). No
       per-route theme override needed. */
    <div className={styles.page}>
      <NewspaperIntro />

      <header className={styles.masthead}>
        <div className={styles.mastheadEyebrow}>
          The Writing Desk
          <br />
          Est. 2015
        </div>
        <h1 className={styles.mastheadTitle}>
          The <em>Hally</em> Herald
        </h1>
        <div className={styles.mastheadEyebrowRight}>
          {posts.length || '—'}
          <br />
          filings to date
        </div>
      </header>

      <div className={styles.submast}>
        <span className={styles.submastLeft}>Edited London</span>
        <span>{dateline}</span>
      </div>

      <div className={styles.sectionRule}>
        <div className={styles.sectionRuleLabel}>
          <span>§ Recent filings</span>
          <span className={styles.sectionRuleNote}>— from the desk, this quarter</span>
        </div>
        <div className={styles.sectionRuleRight}>
          {posts.length > 0 ? `Showing 1 — ${posts.length} of ${posts.length}` : 'Showing 0'}
        </div>
      </div>

      {isLoading && (
        <div className={styles.statusBlock}>The presses are warming up&hellip;</div>
      )}

      {error && (
        <div className={styles.statusBlock}>Error loading filings: {error}</div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className={styles.statusBlock}>No dispatches yet.</div>
      )}

      {posts.length > 0 && (
        <div className={styles.masonry}>
          {posts.map((post, i) => (
            <NewspaperCard
              key={post.id}
              post={post}
              index={i}
              filingNumber={pad3(FILING_BASE - i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
