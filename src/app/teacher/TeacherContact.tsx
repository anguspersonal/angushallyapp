'use client';

/**
 * `/teacher` — contact SECTION (issue B2 / #132).
 *
 * Replaces the B1 placeholder with a real, skinned contact form wired to the
 * shared `useContactForm` hook with `source="teacher"` so leads created here are
 * attributed to this persona. All form behaviour (validation, submit lifecycle,
 * success/error) lives in the hook + the shared `ContactForm` primitive; this
 * component only supplies the teacher source, copy, the collection notice that
 * links to /teacher/privacy, and the (consent-aware) reCAPTCHA slot.
 *
 * reCAPTCHA mirrors the main /contact flow (issue #101 / #140): the Security-
 * category script is deferred until the user consents OR first interacts with
 * the form, and the hook only *requires* a token when a site key is configured.
 * With no key, the form still submits (the server is the source of truth) and a
 * gentle note points at email instead.
 */

import * as React from 'react';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';
import { ContactForm, useContactForm } from '@/components/persona';
import { useConsentGate } from '@/lib/consent/useConsentGate';
import styles from './teacher.module.css';

export function TeacherContact() {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const captchaRequired = Boolean(recaptchaSiteKey);

  // Security-category gate: load reCAPTCHA up-front if consented, otherwise the
  // moment the user touches the form (a legitimate anti-spam signal). We never
  // block — we only defer the eager script. See docs/consent-categorisation.md.
  const securityConsented = useConsentGate('security');
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const recaptchaActive = captchaRequired && (securityConsented || hasInteracted);

  const form = useContactForm({
    source: 'teacher',
    requireRecaptcha: captchaRequired,
    initialValues: { subject: 'Teaching enquiry' },
  });

  const markInteracted = () => setHasInteracted(true);

  return (
    <section className={styles.cta} id="contact" aria-label="Contact">
      <div className={styles.sectionEye}>— Get in touch</div>
      <h2 className={styles.h2}>
        Want to <em>talk teaching?</em>
      </h2>
      <p>
        A school role, an edtech problem, GCSE or A-Level tutoring, or just comparing notes on
        pedagogy — the teaching never really stopped, and I&rsquo;d love to hear from you.
      </p>

      <div
        className={styles.contactForm}
        onFocusCapture={markInteracted}
        onChangeCapture={markInteracted}
      >
        <ContactForm
          form={form}
          title={null}
          className={styles.contactFormInner}
          labels={{ subject: 'Subject' }}
          placeholders={{
            name: 'Your name',
            email: 'you@example.com',
            subject: 'What’s this about?',
            message: 'A note about the room, the role, or the maths…',
          }}
          submitLabels={{ idle: 'Send message', submitting: 'Sending…' }}
          successMessage="Message sent — thanks for reaching out. I’ll reply by email."
          intro={
            <p className={styles.collectionNotice}>
              I only use your name, email and message to reply — nothing else. See how your
              details are handled in the{' '}
              <Link href="/teacher/privacy" className={styles.collectionNoticeLink}>
                privacy notice
              </Link>
              .
            </p>
          }
          recaptchaSlot={
            captchaRequired ? (
              recaptchaActive ? (
                <ReCAPTCHA
                  sitekey={recaptchaSiteKey as string}
                  onChange={(value: string | null) => form.setRecaptchaToken(value)}
                  onExpired={() => form.setRecaptchaToken(null)}
                />
              ) : (
                <span className={styles.recaptchaHint}>Spam protection loads when you start typing.</span>
              )
            ) : null
          }
        />
      </div>
    </section>
  );
}

export default TeacherContact;
