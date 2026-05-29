/**
 * Thrown when email sending fails because of an operator-fixable
 * misconfiguration (missing/invalid SMTP env vars, missing RECIPIENT_EMAIL,
 * incomplete OAuth bundle). Lets the contact route distinguish "you need
 * to fix the deploy" from "the SMTP server is having a bad day".
 */
export class EmailConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailConfigError';
  }
}
