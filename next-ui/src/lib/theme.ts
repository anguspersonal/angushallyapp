import { createTheme } from '@mantine/core';
import type { MantineColorsTuple, MantineThemeOverride } from '@mantine/core';
import type { 
  MotionTransition, 
  ViewportTransition, 
  ThemeAssets 
} from '../types/mantine';

export const motionTransitions: {
  readonly spring: MotionTransition;
  readonly springFast: MotionTransition;
  readonly springSlow: MotionTransition;
  readonly viewportRepeat: ViewportTransition;
  readonly viewportOnce: ViewportTransition;
} = {
  // Standard spring animation
  spring: {
    type: "spring",
    stiffness: 100,
    damping: 20,
    duration: 0.8
  },
  // Faster spring for quick animations
  springFast: {
    type: "spring",
    stiffness: 120,
    damping: 25,
    duration: 0.6
  },
  // Slower spring for more dramatic animations
  springSlow: {
    type: "spring",
    stiffness: 80,
    damping: 15,
    duration: 1
  },
  // Viewport that triggers animation each time
  viewportRepeat: {
    // once defaults to false
    amount: 0.3
  },
  // Viewport that triggers animation only once
  viewportOnce: {
    once: true,
    amount: 0.2 // Keeping the earlier trigger amount
  }
};

// Define custom color tuples with proper Mantine types
const primaryColors: MantineColorsTuple = [
  '#E8EBE8', // lightest
  '#D1D7D1',
  '#BAC3BA',
  '#A3AFA3',
  '#8C9B8C',
  '#758775',
  '#5E735E',
  '#475F47',
  '#384C37', // base color
  '#2A3929', // darkest
];

const secondaryColors: MantineColorsTuple = [
  '#E8EDF2',
  '#D1DBE5',
  '#BAC9D8',
  '#A3B7CB',
  '#8CA5BE',
  '#7593B1',
  '#88A5BC', // base color
  '#5B7A9A',
  '#4A6A8A',
  '#395A7A',
];

const accentColors: MantineColorsTuple = [
  '#F9F5F3',
  '#F3EBE7',
  '#EDE1DB',
  '#E7D7CF',
  '#E1CDC3',
  '#E1C8BC', // base color
  '#D5B8AC',
  '#C9A89C',
  '#BD988C',
  '#B1887C',
];

const successColors: MantineColorsTuple = [
  '#E8F0E9',
  '#D1E1D3',
  '#BAD2BD',
  '#A3C3A7',
  '#8CB491',
  '#75A57B',
  '#6B9F70', // base color
  '#5A8E5F',
  '#497D4E',
  '#386C3D',
];

// Global assets with proper typing
export const assets: ThemeAssets = {
  placeholderImage: {
    landscape: '/20250418_3BY2_Default_Image_Placeholder.png',  // 3:2 ratio
    square: '/20250419_1BY1_Default_Image_Placeholder.png',     // 1:1 ratio
    portrait: '/20250419_2BY3_Default_Image_Placeholder.png',   // 2:3 ratio
  }
};

// Define the theme configuration with comprehensive typing
const themeConfig: MantineThemeOverride = {
  // Define standard breakpoints for clarity and customization
  breakpoints: {
    xs: '36em',  // 576px
    sm: '48em',  // 768px
    md: '62em',  // 992px
    lg: '75em',  // 1200px
    xl: '88em',  // 1400px
  } as const,
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ] as MantineColorsTuple,
    primary: primaryColors,
    secondary: secondaryColors,
    accent: accentColors,
    success: successColors,
  } as const,
  primaryColor: 'primary',
  primaryShade: 8, // This will use the base color (index 8)
  defaultRadius: 'md',
  fontFamily: 'Ubuntu, sans-serif',
  components: {
    Button: {
      // Default props for all buttons unless overridden
      defaultProps: {
        color: 'secondary', // Use the secondary color palette
        variant: 'filled',    // Use the filled style
      },
    },
  },
};

export const theme = createTheme(themeConfig);