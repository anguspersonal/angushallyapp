import { describe, it, expect } from 'vitest';
import {
  personaMetadata,
  PERSONA_METADATA_DEFAULTS,
  type PersonaMetadataConfig,
} from './personaMetadata';

const fullConfig: PersonaMetadataConfig = {
  title: 'Maths Teacher',
  description: 'A maths teacher who ships.',
  ogImage: '/og/teacher.png',
  favicon: '/teacher.ico',
  appleIcon: '/teacher-apple.png',
  ogTitle: 'Maths Teacher — proven exam-result deltas',
  url: '/teacher',
};

const minimalConfig: PersonaMetadataConfig = {
  title: 'Strategist',
  description: 'A data strategist for FTSE-100 data leaders.',
};

describe('personaMetadata', () => {
  describe('maps required fields', () => {
    it('passes title and description straight through', () => {
      const meta = personaMetadata(minimalConfig);
      expect(meta.title).toBe('Strategist');
      expect(meta.description).toBe('A data strategist for FTSE-100 data leaders.');
    });

    it('mirrors description into OG and Twitter', () => {
      const meta = personaMetadata(minimalConfig);
      expect(meta.openGraph?.description).toBe(minimalConfig.description);
      expect(meta.twitter).toMatchObject({ description: minimalConfig.description });
    });
  });

  describe('applies declared values', () => {
    it('uses the persona OG image for both OG and Twitter', () => {
      const meta = personaMetadata(fullConfig);
      expect(meta.openGraph?.images).toEqual([{ url: '/og/teacher.png' }]);
      expect(meta.twitter).toMatchObject({ images: ['/og/teacher.png'] });
    });

    it('uses the persona favicon for icon, shortcut, and apple', () => {
      const meta = personaMetadata(fullConfig);
      expect(meta.icons).toEqual({
        icon: '/teacher.ico',
        shortcut: '/teacher.ico',
        apple: '/teacher-apple.png',
      });
    });

    it('uses the explicit ogTitle for OG and Twitter when provided', () => {
      const meta = personaMetadata(fullConfig);
      expect(meta.openGraph?.title).toBe('Maths Teacher — proven exam-result deltas');
      expect(meta.twitter).toMatchObject({ title: 'Maths Teacher — proven exam-result deltas' });
    });

    it('includes the canonical url in OG when provided', () => {
      const meta = personaMetadata(fullConfig);
      expect(meta.openGraph).toMatchObject({ url: '/teacher' });
    });
  });

  describe('applies default fallbacks', () => {
    it('falls back to the default OG image', () => {
      const meta = personaMetadata(minimalConfig);
      expect(meta.openGraph?.images).toEqual([{ url: PERSONA_METADATA_DEFAULTS.ogImage }]);
      expect(meta.twitter).toMatchObject({ images: [PERSONA_METADATA_DEFAULTS.ogImage] });
    });

    it('falls back to the default favicon and apple icon', () => {
      const meta = personaMetadata(minimalConfig);
      expect(meta.icons).toEqual({
        icon: PERSONA_METADATA_DEFAULTS.favicon,
        shortcut: PERSONA_METADATA_DEFAULTS.favicon,
        apple: PERSONA_METADATA_DEFAULTS.appleIcon,
      });
    });

    it('derives ogTitle as "<title> · <siteName>" when none is provided', () => {
      const meta = personaMetadata(minimalConfig);
      const expected = `Strategist · ${PERSONA_METADATA_DEFAULTS.siteName}`;
      expect(meta.openGraph?.title).toBe(expected);
      expect(meta.twitter).toMatchObject({ title: expected });
    });

    it('omits the OG url when none is provided', () => {
      const meta = personaMetadata(minimalConfig);
      expect(meta.openGraph).not.toHaveProperty('url');
    });

    it('always sets a summary_large_image twitter card and website OG type', () => {
      const meta = personaMetadata(minimalConfig);
      expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
      expect(meta.openGraph).toMatchObject({ type: 'website', siteName: PERSONA_METADATA_DEFAULTS.siteName });
    });
  });

  describe('purity', () => {
    it('returns equal metadata for equal config (no hidden state)', () => {
      expect(personaMetadata(minimalConfig)).toEqual(personaMetadata(minimalConfig));
    });

    it('does not mutate the input config', () => {
      const config: PersonaMetadataConfig = { title: 'Dev', description: 'Ships code.' };
      const snapshot = { ...config };
      personaMetadata(config);
      expect(config).toEqual(snapshot);
    });
  });
});
