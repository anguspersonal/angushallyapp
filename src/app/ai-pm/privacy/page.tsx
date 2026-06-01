/**
 * `/ai-pm/privacy` — AI Product Manager persona privacy view (server wrapper).
 *
 * Issue #134 (B2). Thin Server Component over the client island, per the
 * documented server-wrapper-over-client-island pattern
 * (docs/guides/persona-page-workflow.md · issue #128): a `'use client'` module
 * cannot export `metadata`, and the privacy view is a client island (it wires
 * the shared Mantine color-scheme toggle). This wrapper owns the static
 * `metadata` export and renders nothing but the island.
 *
 * The `/ai-pm/*` subtree already resolves to the `ai-pm` fullBleed surface in
 * the registry (src/lib/surfaces.ts), so this page renders inside the persona's
 * own chrome with no extra wiring.
 */

import { personaMetadata } from '@/lib/persona/personaMetadata';
import AiPmPrivacyClient from './privacy.client';

export const metadata = personaMetadata({
    title: 'Privacy — Angus Hally · AI Product Management',
    description:
        'How your data is handled on this site: what is collected, why, the lawful basis, who it is shared with, and your rights under UK GDPR.',
    ogTitle: 'Privacy — Field notes on AI product management',
    url: '/ai-pm/privacy',
});

export default function AiPmPrivacyPage() {
    return <AiPmPrivacyClient />;
}
