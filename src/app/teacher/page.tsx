/**
 * `/teacher` — Server Component entry for the Maths Teacher persona.
 *
 * This thin wrapper exists solely to export per-persona `metadata` (tab title,
 * description, OG/Twitter card, favicon) via the `personaMetadata()` helper and
 * the documented server-wrapper-over-client-island pattern — a `'use client'`
 * module cannot export `metadata`, so the interactive page lives in the sibling
 * `teacher.client.tsx`. The rendered output and the page's bespoke chalkboard
 * chrome are byte-for-byte unchanged; only the document <head> gains the
 * persona metadata. See docs/guides/persona-page-workflow.md (issue #128/#129).
 */

import { personaMetadata } from '@/lib/persona/personaMetadata';
import TeacherClient from './teacher.client';

export const metadata = personaMetadata({
  title: 'Maths Teacher',
  description:
    'Angus Hally — TeachFirst-trained GCSE & A-Level maths teacher (Burnt Mill Academy, 2016–2018). The classroom skills that outlasted the classroom.',
  ogTitle: 'Maths Teacher · Angus Hally',
  url: '/teacher',
  // OG image, favicon, and apple-touch icon fall back to the site-wide defaults
  // in PERSONA_METADATA_DEFAULTS. A bespoke chalkboard OG image / favicon is
  // optional visual polish for the owner — drop assets in public/ and set
  // `ogImage` / `favicon` here when they exist.
});

export default function TeacherPage() {
  return <TeacherClient />;
}
