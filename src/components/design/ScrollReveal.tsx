'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function ScrollReveal({ children, className, style }: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={style}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: reduceMotion ? 0.25 : 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
