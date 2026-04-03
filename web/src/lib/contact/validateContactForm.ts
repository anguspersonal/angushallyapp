const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidatedContactForm = {
  name: string;
  email: string;
  message: string;
  recaptchaToken: string;
};

export function validateContactFormBody(
  body: unknown
): { ok: true; data: ValidatedContactForm } | { ok: false; errors: string[] } {
  const { name, email, message, recaptchaToken } = (body as Record<string, unknown>) ?? {};

  const errors: string[] = [];
  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required');
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    errors.push('Valid email is required');
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    errors.push('Message is required');
  }
  if (!recaptchaToken || typeof recaptchaToken !== 'string' || !recaptchaToken.trim()) {
    errors.push('reCAPTCHA verification required');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name: (name as string).trim(),
      email: (email as string).toLowerCase(),
      message: (message as string).trim(),
      recaptchaToken: (recaptchaToken as string).trim(),
    },
  };
}
