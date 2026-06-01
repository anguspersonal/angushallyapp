import { Source_Serif_4, Inter_Tight, JetBrains_Mono } from 'next/font/google';

/**
 * Typefaces specific to the editorial "field notes" treatment of `/ai-pm`
 * (persona v2). Scoped to this route by applying `aipmFontVars` to the page
 * root rather than the global <html> className, so the rest of the site keeps
 * its Newsreader/Fraunces/Ubuntu stack and these only load on this page.
 */

/** Long-form body serif with optical-size axis — the brief's primary voice. */
export const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['300', '400', '500', '600'],
  variable: '--aipm-serif',
  display: 'swap',
});

/** UI sans for nav, kickers, figure bodies. */
export const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--aipm-sans',
  display: 'swap',
});

/** Mono for the masthead, section numbers, and captions. */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--aipm-mono',
  display: 'swap',
});

export const aipmFontVars =
  `${sourceSerif.variable} ${interTight.variable} ${jetbrainsMono.variable}`.trim();
