'use client';

import * as React from 'react';
import Image from 'next/image';
import { IconExternalLink } from '@tabler/icons-react';
import { GlassContent } from '@/components/design/Glass';
import styles from './RichLinkCard.module.css';

export type RichLinkCardProps = {
  href: string;
  title: string;
  description: string;
  imageUrl: string | null;
  domainLabel: string;
};

export function RichLinkCard({
  href,
  title,
  description,
  imageUrl,
  domainLabel,
}: RichLinkCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.cardLink}
    >
      <GlassContent className={styles.inner} p={0}>
        <div className={styles.media}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="(max-width: 767px) 100vw, 40vw"
              className={styles.image}
            />
          ) : (
            <span className={styles.placeholder} aria-hidden>
              HEYLINA
            </span>
          )}
        </div>
        <div className={styles.textCol}>
          <p className={styles.title}>{title}</p>
          <p className={styles.description}>{description}</p>
          <span className={styles.domainRow}>
            <span>{domainLabel}</span>
            <IconExternalLink
              className={styles.domainGlyph}
              size={14}
              stroke={1.5}
              aria-hidden
            />
          </span>
        </div>
      </GlassContent>
    </a>
  );
}
