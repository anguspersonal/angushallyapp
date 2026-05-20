'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import styles from '@/app/blog/blog.module.css';

const SESSION_KEY = 'blog-intro-shown';
const TOTAL_DURATION = 2.6;

type NewspaperIntroProps = {
  /** Optional — JSX shown on the folded paper while it opens. */
  masthead?: React.ReactNode;
  headline?: React.ReactNode;
};

/**
 * Newspaper-opening intro overlay for the blog page.
 *
 * - Auto-dismisses after ~2.6s.
 * - Skippable via any key, click, or tap.
 * - Uses sessionStorage so it only plays once per session/tab.
 * - Honours prefers-reduced-motion (does not render at all in that case).
 */
export function NewspaperIntro({
  masthead = (
    <>
      The <em>Hally</em> Herald
    </>
  ),
  headline = 'Dispatches & half-baked theories',
}: NewspaperIntroProps) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = React.useState<boolean | null>(null);

  // Resolve initial visibility on mount (avoid SSR mismatch).
  React.useEffect(() => {
    if (reduceMotion) {
      setVisible(false);
      return;
    }
    try {
      const seen = window.sessionStorage.getItem(SESSION_KEY);
      setVisible(seen ? false : true);
    } catch {
      // sessionStorage may be unavailable in private mode etc.
      setVisible(true);
    }
  }, [reduceMotion]);

  const dismiss = React.useCallback(() => {
    setVisible(false);
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // best effort
    }
  }, []);

  // Auto-dismiss after the animation finishes.
  React.useEffect(() => {
    if (!visible) return;
    const timeout = window.setTimeout(dismiss, TOTAL_DURATION * 1000);
    return () => window.clearTimeout(timeout);
  }, [visible, dismiss]);

  // Skip on any key press.
  React.useEffect(() => {
    if (!visible) return;
    const onKey = () => dismiss();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, dismiss]);

  if (visible !== true) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="blog-intro"
        className={styles.introOverlay}
        role="presentation"
        aria-hidden
        onClick={dismiss}
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 1, 1, 0], transition: { duration: TOTAL_DURATION, times: [0, 0.5, 0.85, 1] } }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      >
        <motion.div
          className={styles.introPaper}
          initial={{ scale: 0.18, rotate: -12, opacity: 0 }}
          animate={{
            scale: [0.18, 1, 1, 1.02],
            rotate: [-12, 0, 0, 0],
            opacity: [0, 1, 1, 1],
            transition: { duration: TOTAL_DURATION, times: [0, 0.45, 0.85, 1], ease: [0.22, 1, 0.36, 1] },
          }}
        >
          <div className={styles.introMasthead}>{masthead}</div>
          <div className={styles.introHeadline}>{headline}</div>
          <div className={styles.introBody} aria-hidden />

          {/* Two halves that "unfold" outward, revealing the page underneath. */}
          <motion.div
            className={`${styles.introFold} ${styles.introFoldLeft}`}
            initial={{ scaleX: 1, originX: 1 }}
            animate={{
              scaleX: [1, 1, 0],
              transition: { duration: TOTAL_DURATION, times: [0, 0.55, 0.85], ease: 'easeInOut' },
            }}
            style={{ transformOrigin: 'right center' }}
          />
          <motion.div
            className={`${styles.introFold} ${styles.introFoldRight}`}
            initial={{ scaleX: 1, originX: 0 }}
            animate={{
              scaleX: [1, 1, 0],
              transition: { duration: TOTAL_DURATION, times: [0, 0.55, 0.85], ease: 'easeInOut' },
            }}
            style={{ transformOrigin: 'left center' }}
          />
        </motion.div>

        <div className={styles.introHint}>Press any key to skip</div>
      </motion.div>
    </AnimatePresence>
  );
}

export default NewspaperIntro;
