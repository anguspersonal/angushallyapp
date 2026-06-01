/**
 * `/ai-pm` — AI Product Manager persona, v2 (server wrapper).
 *
 * Thin Server Component over the client island, per the documented
 * server-wrapper-over-client-island pattern (docs/guides/persona-page-workflow.md
 * · issue #128). It exists for one reason: a `'use client'` module cannot export
 * `metadata`, and the persona page is a client island (it wires the Mantine
 * color-scheme toggle). So this wrapper owns the static `metadata` export and
 * renders nothing but the island — the rendered output and bespoke chrome are
 * unchanged; only the document <head> gains the persona's title/description/OG/
 * favicon via personaMetadata().
 */

import { personaMetadata } from '@/lib/persona/personaMetadata';
import AiPmPersonaClient from './ai-pm.client';

export const metadata = personaMetadata({
    title: 'Angus Hally — AI Product Management',
    description:
        'A working paper on what AI product management actually looks like when the model is the hard part — clinical advisors, compliance, versioning, app-store ops, pricing — from inside HeyLina.',
    ogTitle: 'Field notes on AI product management — Angus Hally',
    url: '/ai-pm',
});

export default function AiPmPersonaPage() {
    return <AiPmPersonaClient />;
}
