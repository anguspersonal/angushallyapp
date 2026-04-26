'use client';

import * as React from 'react';

type ColorScheme = 'light' | 'dark';

export function getDocumentColorScheme(): ColorScheme | null {
  if (typeof document === 'undefined') return null;

  const renderedInk = getComputedStyle(document.body).getPropertyValue('--site-ink').trim().toLowerCase();

  if (renderedInk === '#faf7f0' || renderedInk.includes('250, 247, 240')) {
    return 'dark';
  }

  if (renderedInk === '#0d1f1e' || renderedInk.includes('13, 31, 30')) {
    return 'light';
  }

  const schemeElements = document.querySelectorAll('[data-mantine-color-scheme]');
  const schemeElement = schemeElements[schemeElements.length - 1];
  return schemeElement?.getAttribute('data-mantine-color-scheme') === 'dark' ? 'dark' : 'light';
}

export function useDocumentColorScheme(fallback: ColorScheme = 'light') {
  const [scheme, setScheme] = React.useState<ColorScheme | null>(getDocumentColorScheme);

  React.useEffect(() => {
    const readScheme = () => {
      const nextScheme = getDocumentColorScheme() ?? fallback;
      setScheme((currentScheme) => (currentScheme === nextScheme ? currentScheme : nextScheme));
    };

    readScheme();

    const observer = new MutationObserver(readScheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mantine-color-scheme'],
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [fallback]);

  return scheme ?? fallback;
}
