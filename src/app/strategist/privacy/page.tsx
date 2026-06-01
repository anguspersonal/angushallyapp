/**
 * `/strategist/privacy` — persona privacy route entry (Server Component).
 *
 * Thin server wrapper over the client island (the same server-wrapper-over-
 * client-island pattern as the strategist index — see
 * docs/guides/persona-page-workflow.md). Exports persona metadata so a shared
 * link to the privacy page still reads as the strategist surface, then renders
 * the interactive island that paints the canonical privacy content (#126) in
 * strategist chrome. PRD #123 · Phase B2 · issue #133.
 */

import { personaMetadata } from '@/lib/persona/personaMetadata';
import StrategistPrivacyClient from './privacy.client';

export const metadata = personaMetadata({
  title: 'Privacy · Data Strategist',
  description:
    'How angushally.com handles your data — the privacy policy, rendered in the data-strategist surface.',
  ogTitle: 'Privacy · Angus Hally · Data Strategist',
  url: '/strategist/privacy',
});

export default function StrategistPrivacyPage() {
  return <StrategistPrivacyClient />;
}
