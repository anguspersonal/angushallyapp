import { League_Gothic, Newsreader, Ubuntu } from 'next/font/google';

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

export const fontClassNames = `${leagueGothic.variable} ${newsreader.variable} ${ubuntu.variable}`.trim();
