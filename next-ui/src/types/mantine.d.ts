// Mantine theme type declarations and extensions

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { 
  MantineColorsTuple, 
  MantineThemeOverride, 
  MantineTheme
} from '@mantine/core';

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
export type { 
  MantineColorsTuple, 
  MantineThemeOverride, 
  MantineTheme
} from '@mantine/core';

// Global type declarations for theme assets
export interface ThemeAssets {
  placeholderImage: {
    landscape: string;
    square: string;
    portrait: string;
  };
}

// Style object types for components
export interface ComponentStyles {
  [key: string]: React.CSSProperties;
}

export interface HeaderStyles {
  textDecoration: 'none';
  color: 'inherit';
}

export interface ImageStyles {
  display: 'block';
  width: '100%';
  height: 'auto';
}

export interface ContainerStyles {
  maxWidth: number;
  margin: string;
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

// Navigation and component prop types
export interface NavigationLink {
  readonly link: string;
  readonly label: string;
}

export interface SocialLink {
  readonly href: string;
  readonly icon: React.ComponentType<{ size: number }>;
  readonly label: string;
}