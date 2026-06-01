import { Archivo, Space_Mono } from 'next/font/google';

/** Editorial grotesque — the `/strategist` persona "data field" identity. */
export const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});

/** Mono labels / metrics — paired with Archivo on `/strategist`. */
export const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-space-mono',
  display: 'swap',
});

/** Variables scoped to the `/strategist` editorial re-skin (not loaded site-wide). */
export const strategistFontClassNames = `${archivo.variable} ${spaceMono.variable}`.trim();
