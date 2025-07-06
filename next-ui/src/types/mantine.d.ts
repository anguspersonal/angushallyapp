// Mantine theme type declarations and extensions

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: {
      primary: MantineColorsTuple;
      secondary: MantineColorsTuple;
      accent: MantineColorsTuple;
      success: MantineColorsTuple;
      dark: MantineColorsTuple;
    };
  }
}

// Re-export important Mantine types for easier access
export type { MantineColorsTuple, MantineThemeOverride, MantineTheme } from '@mantine/core';

// Global type declarations for theme assets
export interface ThemeAssets {
  placeholderImage: {
    landscape: string;
    square: string;
    portrait: string;
  };
}

// Framer Motion types for animations
export interface MotionTransition {
  type: 'spring';
  stiffness: number;
  damping: number;
  duration: number;
}

export interface ViewportTransition {
  once?: boolean;
  amount: number;
}