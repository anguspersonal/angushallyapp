import type { Metadata } from 'next';

/**
 * `personaMetadata()` — pure config → Next `Metadata` mapping for persona pages.
 *
 * Each persona (`/teacher`, `/strategist`, `/ai-pm`, …) declares a small
 * `PersonaMetadataConfig` and this helper expands it into a full `Metadata`
 * object: tab title, description, Open Graph + Twitter card (so a shared link
 * looks intentional), and a persona-appropriate favicon. Everything except
 * `title` + `description` has a sensible site-wide default, so a persona only
 * has to declare what differs from the main site.
 *
 * This is intentionally a pure function (no I/O, no Next runtime access) so the
 * config → metadata mapping is trivially testable. Persona pages are currently
 * `'use client'` components and so cannot export `metadata` directly; the thin
 * server-wrapper-over-client-island pattern that lets them do so is documented
 * in docs/guides/persona-page-workflow.md. See PRD #123 / issue #128.
 */

/** Site-wide fallbacks, mirrored from the root layout (src/app/layout.tsx). */
export const PERSONA_METADATA_DEFAULTS = {
  /** Default OG/Twitter preview image when a persona declares none. */
  ogImage: '/AH_Logo.png',
  /** Default favicon (.ico) — matches the root layout. */
  favicon: '/AH-logo-no-background.ico',
  /** Default apple-touch icon — matches the root layout. */
  appleIcon: '/AH_Logo.png',
  /** Suffix appended to the OG/site title when none is supplied. */
  siteName: 'Angus Hally',
} as const;

export interface PersonaMetadataConfig {
  /** Persona tab title, e.g. "Maths Teacher". Required. */
  title: string;
  /** Persona description used for the meta description + OG/Twitter. Required. */
  description: string;
  /**
   * Open Graph / Twitter preview image. Falls back to the site default.
   * Use an absolute path under `public/` (e.g. `/og/teacher.png`).
   */
  ogImage?: string;
  /** Favicon (.ico) path. Falls back to the site default. */
  favicon?: string;
  /** Apple-touch icon path. Falls back to the site default. */
  appleIcon?: string;
  /**
   * OG/Twitter title. Falls back to `"<title> · <siteName>"`. Lets a persona
   * give the social card a richer headline than the bare tab title.
   */
  ogTitle?: string;
  /** Canonical URL for the persona (e.g. `/teacher`). Optional. */
  url?: string;
}

/**
 * Map a declarative persona config to a Next `Metadata` object, applying
 * site-wide defaults for any field the persona omits.
 *
 * Pure: given the same config it always returns the same metadata.
 */
export function personaMetadata(config: PersonaMetadataConfig): Metadata {
  const {
    title,
    description,
    ogImage = PERSONA_METADATA_DEFAULTS.ogImage,
    favicon = PERSONA_METADATA_DEFAULTS.favicon,
    appleIcon = PERSONA_METADATA_DEFAULTS.appleIcon,
    ogTitle = `${title} · ${PERSONA_METADATA_DEFAULTS.siteName}`,
    url,
  } = config;

  return {
    title,
    description,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: appleIcon,
    },
    openGraph: {
      title: ogTitle,
      description,
      type: 'website',
      siteName: PERSONA_METADATA_DEFAULTS.siteName,
      images: [{ url: ogImage }],
      ...(url ? { url } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [ogImage],
    },
  };
}
