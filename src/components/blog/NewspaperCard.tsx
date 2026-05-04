'use client';

import * as React from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import type { ContentPostSummary } from '@/lib/content/contracts';
import styles from '@/app/blog/blog.module.css';

interface NewspaperCardProps {
  post: ContentPostSummary;
  /** Filing number to display (e.g. 042). Caller controls numbering scheme. */
  filingNumber: string;
  /** Index within the list — used to vary typographic style for visual rhythm. */
  index?: number;
}

const WORDS_PER_MINUTE = 220;

function estimateReadingMinutes(post: ContentPostSummary): number {
  const text = post.excerpt ?? '';
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 3;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE) + 2);
}

function formatDateline(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

/**
 * Renders a title with simple `*emphasis*` markdown converted into `<em>` —
 * letting the post author flag which words should be set in italic accent red.
 * Falls back to plain text if no asterisk pairs are present.
 */
function renderTitle(title: string): React.ReactNode {
  if (!title.includes('*')) return title;
  const parts = title.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export default function NewspaperCard({ post, filingNumber, index = 0 }: NewspaperCardProps) {
  const handleAttribution = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (post.attributionLink) {
      window.open(post.attributionLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Every fourth card uses the italic-light title variant.
  const titleClass = index % 4 === 3 ? styles.cardTitleQuiet : styles.cardTitle;
  const dateline = formatDateline(post.publishedAt ?? post.createdAt);
  const readingMinutes = estimateReadingMinutes(post);
  const tag = post.tags?.[0];

  return (
    <Link href={`/blog/${post.slug}`} className={styles.card}>
      {post.coverImage && (
        <>
          <div className={styles.cardImageWrap}>
            <NextImage
              src={post.coverImage}
              alt={post.altText || `Cover image for ${post.title}`}
              fill
              sizes="(max-width: 36em) 100vw, (max-width: 60em) 50vw, 33vw"
              className={styles.cardImage}
              style={{ objectFit: 'cover' }}
            />
          </div>
          <p className={styles.cardCaption}>
            <span className={styles.cardCaptionFig}>Fig. {filingNumber}</span>
            {post.attribution && (
              post.attributionLink ? (
                <span className={styles.cardCaptionLink} onClick={handleAttribution}>
                  Photo · {post.attribution}
                </span>
              ) : (
                <span>Photo · {post.attribution}</span>
              )
            )}
          </p>
        </>
      )}

      <div className={styles.cardKicker}>
        <span>Filing No. {filingNumber}</span>
        {tag && (
          <>
            <span className={styles.cardKickerDivider}>·</span>
            <span className={styles.cardKickerCategory}>{tag}</span>
          </>
        )}
      </div>

      <h2 className={titleClass}>{renderTitle(post.title)}</h2>

      {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}

      <div className={styles.cardByline}>
        <span>
          {dateline}
          {dateline && ' · '}
          {readingMinutes} min
        </span>
        <span className={styles.cardBylineMore}>Read</span>
      </div>
    </Link>
  );
}
