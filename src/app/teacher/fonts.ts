import { Bricolage_Grotesque, Lora, JetBrains_Mono } from 'next/font/google';

/**
 * Route-scoped fonts for the chalkboard `/teacher` persona (v2). Imported
 * only by the teacher route, so these three families are not loaded site-wide.
 * The design system here is intentionally distinct from the rest of the site
 * (warm-cream chalkboard, 3blue1brown-ish), so it ships its own type stack.
 */

/** Display: hero, section headings, nav brand. */
export const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bricolage',
  display: 'swap',
});

/** Serif accents: italic emphasis, lede, card body. */
export const lora = Lora({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500'],
  variable: '--font-lora',
  display: 'swap',
});

/** Mono: eyebrows, labels, footer. */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const teacherFontClassNames =
  `${bricolage.variable} ${lora.variable} ${jetbrainsMono.variable}`.trim();
