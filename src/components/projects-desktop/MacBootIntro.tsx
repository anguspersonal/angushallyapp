'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AHMonogram } from './IconTile';
import styles from './MacBootIntro.module.css';

const SESSION_KEY = 'projects-boot-shown';
const TOTAL_DURATION = 2.6;

/**
 * macOS-style boot intro overlay for the /projects desktop.
 *
 * 5-phase animation timeline (~2.6s total):
 * - 0→0.6s: dark bg, AH monogram fades in centred, scale 0.95→1.0
 * - 0.6→1.6s: thin progress bar fills under monogram in accent colour
 * - 1.6→2.0s: monogram + bar fade as wallpaper crossfades in
 * - 2.0→2.3s: menu bar fades in from top, dock slides up from bottom
 * - 2.3→2.6s: icons populate left-to-right, ~30ms stagger
 *
 * - Auto-dismisses after ~2.6s.
 * - Skippable via any key, click, or tap.
 * - Uses sessionStorage so it only plays once per session/tab.
 * - Honours prefers-reduced-motion (does not render at all in that case).
 */
export function MacBootIntro() {
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

  // Skip on any key press, click, or tap.
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
        key="mac-boot-intro"
        className={styles.overlay}
        role="presentation"
        aria-hidden
        onClick={dismiss}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
      >
        {/* Dark background that fades to reveal wallpaper */}
        <motion.div
          className={styles.darkBg}
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1, 1, 0] }}
          transition={{ duration: TOTAL_DURATION, times: [0, 0.62, 0.77, 1], ease: 'easeOut' }}
        />

        {/* Center content: monogram + progress bar */}
        <div className={styles.centerContent}>
          {/* AH Monogram - fades in 0→0.6s, holds, fades out 1.6→2.0s */}
          <motion.div
            className={styles.monogramWrap}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.95, 1, 1, 1],
            }}
            transition={{
              duration: TOTAL_DURATION,
              times: [0, 0.23, 0.62, 0.77],
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <AHMonogram size={96} label="Angus Hally" className={styles.monogram} />
          </motion.div>

          {/* Progress bar - fills 0.6→1.6s, fades out with monogram */}
          <motion.div
            className={styles.progressTrack}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: TOTAL_DURATION,
              times: [0, 0.23, 0.62, 0.77],
              ease: 'linear',
            }}
          >
            <motion.div
              className={styles.progressFill}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 0, 1, 1, 0] }}
              transition={{
                duration: TOTAL_DURATION,
                times: [0, 0.23, 0.62, 0.77, 1],
                ease: [0.4, 0, 0.2, 1],
              }}
              style={{ transformOrigin: 'left center' }}
            />
          </motion.div>
        </div>

        {/* Skip hint */}
        <motion.div
          className={styles.skipHint}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.6, 0] }}
          transition={{
            duration: TOTAL_DURATION,
            times: [0, 0.15, 0.6, 0.77],
            ease: 'easeOut',
          }}
        >
          Press any key to skip
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default MacBootIntro;
