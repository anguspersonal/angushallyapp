'use client';

import * as React from 'react';
import type { UseContactFormResult } from './useContactForm';
import styles from './ContactForm.module.css';

/**
 * Skinnable, presentational contact form.
 *
 * All behaviour lives in `useContactForm`; this component only renders. A
 * persona drives the look by:
 *  - passing the hook result via `form` (so the persona owns the source +
 *    submit + reCAPTCHA wiring),
 *  - overriding copy via the label/placeholder props,
 *  - skinning via CSS custom properties (--persona-*) and `className`,
 *  - slotting in extra UI (e.g. a reCAPTCHA widget) via `recaptchaSlot`.
 *
 * It is intentionally built from plain elements with token-driven styles, not
 * Mantine, so each persona can theme it without fighting a component library.
 */
export interface ContactFormProps {
  /** The hook instance. The persona creates it with its own `source`. */
  form: UseContactFormResult;
  /** Heading text. Pass null to omit. */
  title?: React.ReactNode;
  /** Optional intro / collection-notice content above the fields. */
  intro?: React.ReactNode;
  /** Field labels (overridable per persona). */
  labels?: Partial<{
    name: string;
    email: string;
    subject: string;
    message: string;
  }>;
  /** Placeholders (overridable per persona). */
  placeholders?: Partial<{
    name: string;
    email: string;
    subject: string;
    message: string;
  }>;
  /** Submit button text by status. */
  submitLabels?: Partial<{ idle: string; submitting: string }>;
  /** Success message rendered after a successful submit. */
  successMessage?: React.ReactNode;
  /** Slot for a reCAPTCHA widget (rendered above the submit button). */
  recaptchaSlot?: React.ReactNode;
  /** Extra class merged onto the <form> for persona skinning. */
  className?: string;
}

const DEFAULT_LABELS = {
  name: 'Name',
  email: 'Email',
  subject: 'Subject',
  message: 'Message',
};

const DEFAULT_PLACEHOLDERS = {
  name: 'Your name',
  email: 'you@example.com',
  subject: "What's this about?",
  message: 'Your message…',
};

export function ContactForm({
  form,
  title = 'Get in touch',
  intro,
  labels,
  placeholders,
  submitLabels,
  successMessage = 'Message sent — thanks for reaching out.',
  recaptchaSlot,
  className,
}: ContactFormProps) {
  const lbl = { ...DEFAULT_LABELS, ...labels };
  const ph = { ...DEFAULT_PLACEHOLDERS, ...placeholders };
  const submitText = form.isSubmitting
    ? submitLabels?.submitting ?? 'Sending…'
    : submitLabels?.idle ?? 'Send message';

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.handleSubmit();
  };

  if (form.isSuccess) {
    return (
      <div
        className={[styles.form, className].filter(Boolean).join(' ')}
        role="status"
      >
        <p className={styles.success}>{successMessage}</p>
      </div>
    );
  }

  return (
    <form
      className={[styles.form, className].filter(Boolean).join(' ')}
      onSubmit={onSubmit}
      noValidate
    >
      {title ? <h2 className={styles.title}>{title}</h2> : null}
      {intro ? <div className={styles.intro}>{intro}</div> : null}

      <Field
        id="persona-contact-name"
        label={lbl.name}
        error={form.errors.name}
      >
        <input
          id="persona-contact-name"
          className={styles.input}
          type="text"
          value={form.values.name}
          placeholder={ph.name}
          autoComplete="name"
          aria-invalid={Boolean(form.errors.name)}
          onChange={(e) => form.setFieldValue('name', e.target.value)}
        />
      </Field>

      <Field
        id="persona-contact-email"
        label={lbl.email}
        error={form.errors.email}
      >
        <input
          id="persona-contact-email"
          className={styles.input}
          type="email"
          value={form.values.email}
          placeholder={ph.email}
          autoComplete="email"
          aria-invalid={Boolean(form.errors.email)}
          onChange={(e) => form.setFieldValue('email', e.target.value)}
        />
      </Field>

      <Field
        id="persona-contact-subject"
        label={lbl.subject}
        error={form.errors.subject}
      >
        <input
          id="persona-contact-subject"
          className={styles.input}
          type="text"
          value={form.values.subject}
          placeholder={ph.subject}
          aria-invalid={Boolean(form.errors.subject)}
          onChange={(e) => form.setFieldValue('subject', e.target.value)}
        />
      </Field>

      <Field
        id="persona-contact-message"
        label={lbl.message}
        error={form.errors.message}
      >
        <textarea
          id="persona-contact-message"
          className={styles.textarea}
          rows={5}
          value={form.values.message}
          placeholder={ph.message}
          aria-invalid={Boolean(form.errors.message)}
          onChange={(e) => form.setFieldValue('message', e.target.value)}
        />
      </Field>

      {recaptchaSlot ? <div className={styles.recaptcha}>{recaptchaSlot}</div> : null}

      <button className={styles.submit} type="submit" disabled={form.isSubmitting}>
        {submitText}
      </button>

      {form.isError ? (
        <p className={styles.error} role="alert">
          {form.errorMessage ?? 'Something went wrong. Please try again.'}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <span className={styles.fieldError} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export default ContactForm;
