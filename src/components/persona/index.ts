/**
 * Shared "persona chrome kit" — skinnable, unopinionated scaffolding consumed
 * by every persona page (PRD #123 · issue #127).
 *
 * Everything here is behaviour-additive and tokenized: it ships no persona
 * colours and is wired by the consuming persona (its own `source`, palette,
 * and copy). See each module for skinning hooks.
 */
export { PersonaFooter } from './PersonaFooter';
export type { PersonaFooterProps, PersonaFooterMainSiteLink } from './PersonaFooter';

export { PersonaThemeToggle } from './PersonaThemeToggle';
export type { PersonaThemeToggleProps } from './PersonaThemeToggle';

export { ContactForm } from './ContactForm';
export type { ContactFormProps } from './ContactForm';

export { useContactForm, validateContactValues } from './useContactForm';
export type {
  UseContactFormOptions,
  UseContactFormResult,
  ContactFormValues,
  ContactFormErrors,
  ContactFormStatus,
  ContactSubmitFn,
  ContactSubmitPayload,
} from './useContactForm';
