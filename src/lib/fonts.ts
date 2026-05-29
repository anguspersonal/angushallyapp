import { Archivo, Fraunces, League_Gothic, Newsreader, Space_Mono, Ubuntu } from 'next/font/google';

/** Display: nav brand, hero name, section headings (amendment). */
export const leagueGothic = League_Gothic({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

/** Long-form serif with optical size axis (amendment section 3). */
export const newsreader = Newsreader({
  subsets: ['latin'],
  axes: ['opsz'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

/** UI sans: nav, cards, chrome. */
export const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
});

/** Editorial serif with optical-size axis — used on the blog ("The Hally Herald"). */
export const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz'],
  style: ['normal', 'italic'],
  variable: '--font-editorial',
  display: 'swap',
});

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

export const fontClassNames =
  `${leagueGothic.variable} ${newsreader.variable} ${ubuntu.variable} ${fraunces.variable}`.trim();
