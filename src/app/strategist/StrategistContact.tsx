'use client';

/**
 * `/strategist` — contact section (PRD #123 · Phase B2 · issue #133).
 *
 * Replaces the B1 placeholder anchor with a real, working contact form skinned
 * in the strategist's editorial "ink-on-paper" language. All form behaviour
 * lives in the shared `useContactForm` hook (so this persona behaves identically
 * to every other surface); this component owns only:
 *   - the persona `source` (`'strategist'`) attributed to every lead,
 *   - a default subject,
 *   - the reCAPTCHA wiring (consent-gated, identical to the main /contact form),
 *   - the editorial chrome + a one-line "what we collect" notice linking to
 *     `/strategist/privacy`.
 *
 * The visual skin is FIRST DRAFT for owner polish (PRD #123 guardrail). The
 * shared `ContactForm` is themed via the `--persona-*` tokens set on the page
 * root (strategist.module.css) plus the `.form` className here.
 */

import * as React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ContactForm, useContactForm } from '@/components/persona';
import { useConsentGate } from '@/lib/consent/useConsentGate';
import styles from './strategist.module.css';

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 0.84, 0.24, 1] } },
};

export function StrategistContact() {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const captchaRequired = Boolean(recaptchaSiteKey);

  // reCAPTCHA is a Security-category dependency (docs/consent-categorisation.md).
  // It loads eagerly when Security is consented, OR the moment the visitor
  // starts interacting with the form (a legitimate anti-spam use). We never
  // block submission on up-front consent — we only defer the eager script load.
  const securityConsented = useConsentGate('security');
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const markInteracted = () => setHasInteracted(true);
  const recaptchaActive = captchaRequired && (securityConsented || hasInteracted);

  // The submit button stays disabled until the reCAPTCHA script has loaded so a
  // user on a slow network can't fire a tokenless submit (issue #101). When no
  // key is configured there is nothing to wait for.
  const [captchaReady, setCaptchaReady] = React.useState(!captchaRequired);

  const form = useContactForm({
    source: 'strategist',
    requireRecaptcha: captchaRequired,
    initialValues: { subject: 'Data strategy enquiry' },
  });

  // Once the widget becomes active, reset readiness so the #101 gate applies
  // until the script reports it has finished loading.
  React.useEffect(() => {
    if (recaptchaActive) setCaptchaReady(false);
  }, [recaptchaActive]);

  const recaptchaSlot = !captchaRequired ? null : recaptchaActive ? (
    <ReCAPTCHA
      sitekey={recaptchaSiteKey as string}
      onChange={(value: string | null) => form.setRecaptchaToken(value)}
      onExpired={() => form.setRecaptchaToken(null)}
      // asyncScriptOnLoad is supported at runtime but missing from the TS types.
      {...({ asyncScriptOnLoad: () => setCaptchaReady(true) } as Record<string, unknown>)}
    />
  ) : (
    <p className={styles.contactHint}>Spam protection loads when you start typing.</p>
  );

  return (
    <motion.section
      id="contact"
      className={styles.contact}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={reveal}
    >
      <div className={styles.sectionHead}>
        <span className={styles.sectionNum}>04 / contact</span>
        <h2 className={styles.sectionTitle}>Get in touch</h2>
      </div>
      <p className={styles.contactLede}>
        Have a data-value or strategy problem worth a conversation? Send a short
        note and I&rsquo;ll come back to you directly.
      </p>

      <div
        className={styles.contactForm}
        onFocusCapture={markInteracted}
        onChangeCapture={markInteracted}
      >
        <ContactForm
          form={form}
          title={null}
          className={styles.form}
          labels={{ subject: 'Subject', message: 'How can I help?' }}
          placeholders={{
            name: 'Your name',
            email: 'you@company.com',
            subject: 'What this is about',
            message: 'The data-value or strategy question on your mind…',
          }}
          submitLabels={{ idle: 'Send message', submitting: 'Sending…' }}
          successMessage="Message sent — thanks for reaching out. I'll be in touch."
          recaptchaSlot={recaptchaSlot}
          intro={
            <p className={styles.contactNotice}>
              I collect only your name, email, subject, and message to reply.{' '}
              <a className={styles.contactNoticeLink} href="/strategist/privacy">
                What we collect
              </a>
              .
            </p>
          }
        />
        {captchaRequired && !captchaReady && !form.isSuccess ? (
          <p className={styles.contactHint}>Verifying you&rsquo;re human…</p>
        ) : null}
      </div>
    </motion.section>
  );
}

export default StrategistContact;
