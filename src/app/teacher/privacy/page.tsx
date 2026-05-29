/**
 * `/teacher/privacy` — Server Component entry for the teacher persona's privacy
 * page (issue B2 / #132).
 *
 * The teacher surface owns its whole subtree (`/teacher/*`) via the surface
 * registry, so this sub-route renders inside the persona's full-bleed chrome.
 * Like the persona index, this thin server wrapper exists only to export
 * per-page `metadata`; the interactive content lives in the sibling
 * `privacy.client.tsx`. The canonical privacy text is the single source in
 * `src/lib/legal/privacyPolicy.ts` — rendered here in teacher chrome, never
 * duplicated.
 */

import { personaMetadata } from '@/lib/persona/personaMetadata';
import TeacherPrivacyClient from './privacy.client';

export const metadata = personaMetadata({
  title: 'Privacy · Maths Teacher',
  description:
    'How Angus Hally handles your data on the teaching persona — the canonical privacy notice, rendered in the chalkboard chrome.',
  ogTitle: 'Privacy · Maths Teacher · Angus Hally',
  url: '/teacher/privacy',
});

export default function TeacherPrivacyPage() {
  return <TeacherPrivacyClient />;
}
