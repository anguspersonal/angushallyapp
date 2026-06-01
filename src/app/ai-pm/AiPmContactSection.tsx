'use client';

/**
 * AI-PM contact section (issue #134 · B2).
 *
 * The interactive replacement for the B1 contact placeholder. It composes the
 * SHARED persona contact primitives — `useContactForm` (lifecycle + validation)
 * and the presentational `ContactForm` — wired with `source="ai-pm"` so every
 * lead is attributed to this persona (src/lib/contact/leadSources.ts), and a
 * default subject so the owner email is recognisable. The look is the editorial
 * "field notes" skin: the form is dressed entirely through the --persona-*
 * tokens set on the page root (ai-pm.module.css), never by forking the shared
 * component.
 *
 * reCAPTCHA: the server requires a token (validateContactForm.ts), so we mount
 * Google reCAPTCHA and forward its token through the hook. Mirroring the
 * main-site /contact flow (and docs/consent-categorisation.md), the widget is
 * categorised under "Security" and its script is deferred until the user has
 * consented to Security OR starts interacting with the form — a legitimate
 * anti-spam use. We never block submission on up-front consent; we only defer
 * the eager script load. When no site key is configured the form degrades to an
 * email prompt rather than always-failing submits.
 */

import * as React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { ContactForm, useContactForm } from '@/components/persona';
import { useConsentGate } from '@/lib/consent/useConsentGate';
import styles from './ai-pm.module.css';

const DEFAULT_SUBJECT = 'AI-PM — field notes enquiry';

export interface AiPmContactSectionProps {
    /** Class merged onto the form for editorial skinning. */
    className?: string;
}

export function AiPmContactSection({ className }: AiPmContactSectionProps) {
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    const captchaConfigured = Boolean(recaptchaSiteKey);

    // Security-category consent gate (issue #140). reCAPTCHA loads either when
    // Security is already consented OR the moment the user interacts — see
    // docs/consent-categorisation.md.
    const securityConsented = useConsentGate('security');
    const [hasInteracted, setHasInteracted] = React.useState(false);
    const markInteracted = React.useCallback(() => setHasInteracted(true), []);
    const recaptchaActive = captchaConfigured && (securityConsented || hasInteracted);

    const [recaptchaToken, setRecaptchaToken] = React.useState<string | null>(null);

    const form = useContactForm({
        source: 'ai-pm',
        // Seed the subject so an omitted subject still produces a recognisable
        // owner email; the field stays editable.
        initialValues: { subject: DEFAULT_SUBJECT },
        // Only require the token in the hook when a key is configured — keeps
        // local/dev (no key) usable while guaranteeing prod submissions carry one.
        requireRecaptcha: captchaConfigured,
    });

    // Keep the hook's reCAPTCHA gate in sync with the live widget token.
    // Depend on the stable `setRecaptchaToken` (useCallback in the hook), not
    // the whole `form` object — that is a fresh reference each render.
    const { setRecaptchaToken: syncRecaptchaToken } = form;
    React.useEffect(() => {
        syncRecaptchaToken(recaptchaToken);
    }, [recaptchaToken, syncRecaptchaToken]);

    const collectionNotice = (
        <p className={styles.collectionNotice}>
            What I collect: your name, email, and message — used only to reply, attributed to this
            page, and never sold. See the{' '}
            <a href="/ai-pm/privacy">privacy notes</a>.
        </p>
    );

    if (!captchaConfigured) {
        // No site key: don't ship a form that always 400s server-side. Degrade
        // to the editorial email prompt (still in-voice).
        return (
            <div
                className={[styles.contactForm, className].filter(Boolean).join(' ')}
                data-recaptcha="unconfigured"
            >
                {collectionNotice}
                <p className={styles.formPlaceholder}>
                    The contact form is briefly unavailable. The quickest route is email or
                    LinkedIn, listed alongside.
                </p>
            </div>
        );
    }

    return (
        <div
            className={[styles.contactForm, className].filter(Boolean).join(' ')}
            onFocusCapture={markInteracted}
            onChangeCapture={markInteracted}
        >
            <ContactForm
                form={form}
                title={null}
                intro={collectionNotice}
                labels={{ subject: 'Subject' }}
                placeholders={{
                    name: 'Your name',
                    email: 'you@example.com',
                    subject: DEFAULT_SUBJECT,
                    message: 'A one-page note of where you are stuck is the most useful thing.',
                }}
                submitLabels={{ idle: 'Send correspondence', submitting: 'Sending…' }}
                successMessage="Filed — thank you. I read everything that arrives and reply within two working days."
                recaptchaSlot={
                    recaptchaActive ? (
                        <ReCAPTCHA
                            sitekey={recaptchaSiteKey as string}
                            onChange={(value: string | null) => setRecaptchaToken(value)}
                            onExpired={() => setRecaptchaToken(null)}
                        />
                    ) : (
                        <span className={styles.recaptchaHint}>
                            Spam protection loads when you start typing.
                        </span>
                    )
                }
            />
        </div>
    );
}

export default AiPmContactSection;
