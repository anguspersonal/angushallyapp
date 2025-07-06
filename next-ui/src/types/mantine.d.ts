// Mantine theme type declarations and extensions

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<string, readonly string[]>;
  }
}

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
  type: string;
  stiffness: number;
  damping: number;
  duration: number;
}

export interface ViewportTransition {
  once?: boolean;
  amount: number;
}