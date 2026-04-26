'use client';

import * as React from 'react';
import { motion, useScroll, useTransform, useMotionValue, animate, useReducedMotion } from 'framer-motion';
import { useDocumentColorScheme } from '@/hooks/useDocumentColorScheme';
import styles from './GradientRoot.module.css';

const GLOW_X_KEYS = [0, 0.5, 1];
const GLOW_X_VALUES = ['66%', '84%', '66%'];
const GLOW_Y_KEYS = [0, 0.5, 1];
const GLOW_Y_VALUES = ['36%', '54%', '36%'];

function AmbientGlow() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scrollShiftY = useTransform(scrollYProgress, [0, 1], [0, -48]);
  const driftX = useMotionValue('75%');
  const driftY = useMotionValue('45%');

  React.useEffect(() => {
    if (reduceMotion) return;

    const cx = animate(driftX, GLOW_X_VALUES, {
      duration: 50,
      repeat: Infinity,
      ease: 'easeInOut',
      times: GLOW_X_KEYS,
    });
    const cy = animate(driftY, GLOW_Y_VALUES, {
      duration: 50,
      repeat: Infinity,
      ease: 'easeInOut',
      times: GLOW_Y_KEYS,
      delay: 4,
    });
    return () => {
      cx.stop();
      cy.stop();
    };
  }, [reduceMotion, driftX, driftY]);

  if (reduceMotion) {
    return (
      <div className={styles.glowBlob} style={{ '--glow-x': '75%', '--glow-y': '45%' } as React.CSSProperties} />
    );
  }

  return (
    <motion.div className={styles.glowScroll} style={{ y: reduceMotion ? 0 : scrollShiftY }}>
      <motion.div
        className={styles.glowBlob}
        style={
          {
            '--glow-x': driftX,
            '--glow-y': driftY,
          } as React.CSSProperties
        }
      />
    </motion.div>
  );
}

export function GradientRoot() {
  const colorScheme = useDocumentColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <div className={styles.root} aria-hidden>
      <div className={styles.base} data-testid="gradient-base" />
      {isDark ? (
        <div className={styles.glowLayer} data-testid="ambient-glow-layer">
          <AmbientGlow />
        </div>
      ) : null}
    </div>
  );
}
