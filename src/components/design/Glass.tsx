'use client';

import * as React from 'react';
import { Box, type BoxProps } from '@mantine/core';
import styles from './Glass.module.css';

type GlassBaseProps = Omit<BoxProps, 'className'> & {
  className?: string;
  children?: React.ReactNode;
};

export function GlassContent({ className, ...props }: GlassBaseProps) {
  return <Box className={`${styles.content} ${className ?? ''}`.trim()} {...props} />;
}

export function GlassChrome({ className, ...props }: GlassBaseProps) {
  return <Box className={`${styles.chrome} ${className ?? ''}`.trim()} {...props} />;
}
