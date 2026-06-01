/**
 * `/strategist` — Data Strategy persona route entry (Server Component).
 *
 * Thin server wrapper over the client island, following the documented
 * server-wrapper-over-client-island pattern (PRD #123 · issue #128, see
 * docs/guides/persona-page-workflow.md). Its only jobs are to (a) export the
 * per-persona `metadata` via the `personaMetadata()` helper so a shared link
 * gets a strategist-specific tab title, description, OG/Twitter card and
 * favicon, and (b) render the interactive `'use client'` island. The rendered
 * output and the persona's bespoke chrome are unchanged — only the document
 * <head> gains the persona metadata.
 */

import { personaMetadata } from '@/lib/persona/personaMetadata';
import StrategistClient from './strategist.client';

export const metadata = personaMetadata({
    title: 'Data Strategist',
    description:
        'Angus Hally — data strategy that survives contact with engineering reality. FTSE-100 data valuation, data-maturity diagnostics, pricing & GDPR. A strategist who can also stand up the system downstream.',
    ogTitle: 'Angus Hally · Data Strategist',
    url: '/strategist',
});

export default function StrategistPage() {
    return <StrategistClient />;
}
