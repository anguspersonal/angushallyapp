import type { Metadata } from 'next';
import { Section, Stack } from '@/components/layout';
import { announcements, type Announcement } from '@/data/announcements';
import styles from './announcements.module.css';

/**
 * Announcements — stub surface.
 *
 * Tracking issue: https://github.com/anguspersonal/angushallyapp/issues/63
 *
 * This is a deliberate first cut. The owner will iterate on the visuals in
 * subsequent PRs. Today: static data from src/data/announcements.ts, no
 * nav link (URL-only access), no dynamic data, no detail pages. The
 * editorial typography is adapted from the blog redesign but uses
 * --site-* tokens so the surface reads as part of the main site rather
 * than the dedicated blog theme.
 */

export const metadata: Metadata = {
  title: 'Announcements · Angus Hally',
  description: 'Short dispatches from the site.',
};

function formatDateline(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

function sortByDateDesc(list: readonly Announcement[]): Announcement[] {
  return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export default function AnnouncementsPage() {
  const items = sortByDateDesc(announcements);
  const count = items.length;

  return (
    <Section width="narrow" padY="loose">
      <div className={styles.page}>
        <Stack gap="content">
          <header className={styles.masthead}>
            <div className={styles.mastheadEyebrow}>
              From the desk
              <br />
              Updates & notices
            </div>
            <h1 className={styles.mastheadTitle}>
              <em>Announcements</em>
            </h1>
            <div className={styles.mastheadEyebrowRight}>
              {count}
              <br />
              {count === 1 ? 'notice' : 'notices'}
            </div>
          </header>

          <div className={styles.submast}>
            <span className={styles.submastLeft}>Edited London</span>
            <span>Latest first</span>
          </div>

          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.slug} className={styles.item}>
                <div className={styles.itemKicker}>
                  <span>{formatDateline(item.date)}</span>
                  {item.category && (
                    <>
                      <span className={styles.itemKickerDivider}>·</span>
                      <span className={styles.itemKickerCategory}>{item.category}</span>
                    </>
                  )}
                </div>
                <h2 className={styles.itemTitle}>{item.title}</h2>
                <p className={styles.itemBody}>{item.body}</p>
              </li>
            ))}
          </ul>
        </Stack>
      </div>
    </Section>
  );
}
