import { createTheme } from '@mantine/core';
import type { MantineColorsTuple, MantineThemeOverride } from '@mantine/core';
import type {
  MotionTransition,
  ViewportTransition,
  ThemeAssets,
} from '../types/mantine';

export const motionTransitions: {
  readonly spring: MotionTransition;
  readonly springFast: MotionTransition;
  readonly springSlow: MotionTransition;
  readonly viewportRepeat: ViewportTransition;
  readonly viewportOnce: ViewportTransition;
} = {
  spring: {
    type: 'spring',
    stiffness: 100,
    damping: 20,
    duration: 0.8,
  },
  springFast: {
    type: 'spring',
    stiffness: 120,
    damping: 25,
    duration: 0.6,
  },
  springSlow: {
    type: 'spring',
    stiffness: 80,
    damping: 15,
    duration: 1,
  },
  viewportRepeat: {
    amount: 0.3,
  },
  viewportOnce: {
    once: true,
    amount: 0.2,
  },
};

/** Palette amendment section 2: teal scale anchored at #1F4A44 (index 6). */
const tealColors: MantineColorsTuple = [
  '#F4FAF9',
  '#E4EFED',
  '#CDE5E1',
  '#B6DBD5',
  '#9FD1C9',
  '#88C7BD',
  '#1F4A44',
  '#1A3F3A',
  '#14302D',
  '#0D1F1E',
];

/** Coral accent anchored at #F0997B (index 6). */
const coralColors: MantineColorsTuple = [
  '#FFF8F6',
  '#FFEDE8',
  '#FFE2DA',
  '#FFD7CC',
  '#FFCCBE',
  '#FFB8A5',
  '#F0997B',
  '#E08568',
  '#C86A52',
  '#A85540',
];

const grayColors: MantineColorsTuple = [
  '#f8f9fa',
  '#f1f3f5',
  '#e9ecef',
  '#dee2e6',
  '#ced4da',
  '#adb5bd',
  '#868e96',
  '#495057',
  '#343a40',
  '#212529',
];

const redColors: MantineColorsTuple = [
  '#fff5f5',
  '#ffe3e3',
  '#ffc9c9',
  '#ffa8a8',
  '#ff8787',
  '#ff6b6b',
  '#fa5252',
  '#f03e3e',
  '#e03131',
  '#c92a2a',
];

const successColors: MantineColorsTuple = [
  '#E8F0E9',
  '#D1E1D3',
  '#BAD2BD',
  '#A3C3A7',
  '#8CB491',
  '#75A57B',
  '#6B9F70',
  '#5A8E5F',
  '#497D4E',
  '#386C3D',
];

/** Alias for legacy `color="primary"`; same scale as teal. */
const primaryColors = [...tealColors] as MantineColorsTuple;

export const assets: ThemeAssets = {
  placeholderImage: {
    landscape: '/20250418_3BY2_Default_Image_Placeholder.png',
    square: '/20250419_1BY1_Default_Image_Placeholder.png',
    portrait: '/20250419_2BY3_Default_Image_Placeholder.png',
  },
};

/** Amendment palette tokens (hex only from brief). */
export const palette = {
  night: {
    bg0: '#0D1F1E',
    bg1: '#14302D',
    bg2: '#1F4A44',
    glow: '#F0997B',
    ink: '#FAF7F0',
    ctaFill: '#F0997B',
    ctaTextOnCoral: '#4A1B0C',
  },
  day: {
    bg0: '#FAF7F0',
    bg1: '#F0ECE0',
    accent: '#1F4A44',
    ink: '#0D1F1E',
    ctaFill: '#1F4A44',
    ctaTextOnTeal: '#FAF7F0',
  },
} as const;

const themeConfig: MantineThemeOverride = {
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
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
    teal: tealColors,
    secondary: grayColors,
    accent: coralColors,
    coral: coralColors,
    success: successColors,
    gray: grayColors,
    red: redColors,
  } as const,
  primaryColor: 'teal',
  primaryShade: 6,
  defaultRadius: 'lg',
  fontFamily: 'var(--font-sans), Ubuntu, system-ui, sans-serif',
  headings: {
    fontFamily: 'var(--font-display), League Gothic, sans-serif',
    fontWeight: '400',
    sizes: {
      h1: { fontSize: 'clamp(2.25rem, 4vw, 3rem)', lineHeight: '1.1' },
      h2: { fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', lineHeight: '1.15' },
      h3: { fontSize: '1.5rem', lineHeight: '1.2' },
    },
  },
  other: {
    fontSerif: 'var(--font-serif), Newsreader, Georgia, serif',
    fontDisplay: 'var(--font-display), League Gothic, sans-serif',
    /** Cross-fade on mode toggle (amendment section 8). */
    modeTransitionMs: 300,
    ...palette,
  },
  components: {
    Button: {
      defaultProps: {
        color: 'teal',
        variant: 'filled',
      },
    },
  },
};

export const theme = createTheme(themeConfig);
