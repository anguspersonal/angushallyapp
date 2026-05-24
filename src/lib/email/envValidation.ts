/**
 * One-time startup validation of email-related env vars used by the
 * contact form.
 *
 * Mirrors `src/lib/chat/envValidation.ts` — called on the first request
 * to a process, logs a single warning per problem, then stays quiet.
 *
 * Intentionally **fail-open**: warnings are logged but never block a
 * request. The contact route still attempts the send and classifies the
 * actual failure (misconfig → 500, transient → 502) from the thrown
 * error. This helper exists so the operator sees the problem in deploy
 * logs instead of having to read the first 500 to figure out why.
 */

type Check = {
  name: string;
  validate: (value: string | undefined) => true | string;
};

function isProbablyEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

const CHECKS: Check[] = [
  {
    name: 'SMTP_HOST',
    validate: (v) => {
      if (!v) return 'missing — nodemailer will fail to connect';
      return true;
    },
  },
  {
    name: 'SMTP_PORT',
    validate: (v) => {
      if (!v) return 'missing — defaults to 587 (STARTTLS)';
      const n = Number.parseInt(v, 10);
      if (!Number.isInteger(n) || n <= 0) return `non-numeric or non-positive value: "${v}"`;
      return true;
    },
  },
  {
    name: 'SMTP_USER',
    validate: (v) => {
      if (!v) return 'missing — auth will fail for both password and OAuth2 modes';
      return true;
    },
  },
  {
    name: 'RECIPIENT_EMAIL',
    validate: (v) => {
      if (!v) return 'missing — sendInquiryToOwner will throw EmailConfigError on every submit';
      if (!isProbablyEmail(v)) return `does not look like an email address: "${v}"`;
      return true;
    },
  },
  {
    name: 'SMTP auth',
    validate: () => {
      const pass = process.env.SMTP_PASS;
      const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
      const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

      const oauthIntended = Boolean(clientId || clientSecret || refreshToken);

      if (oauthIntended) {
        const missing: string[] = [];
        if (!clientId) missing.push('GOOGLE_OAUTH_CLIENT_ID');
        if (!clientSecret) missing.push('GOOGLE_OAUTH_CLIENT_SECRET');
        if (!refreshToken) missing.push('GOOGLE_OAUTH_REFRESH_TOKEN');
        if (missing.length) {
          return `OAuth2 mode partially configured; missing ${missing.join(', ')}`;
        }
        return true;
      }

      if (!pass) {
        return 'neither SMTP_PASS nor GOOGLE_OAUTH_{CLIENT_ID,CLIENT_SECRET,REFRESH_TOKEN} are set';
      }
      return true;
    },
  },
];

let validated = false;
const warnedNames = new Set<string>();

export type EnvWarning = { name: string; message: string };

/**
 * Run env checks. Returns the list of warnings produced. Logs each one
 * via `console.warn` once per process. Safe to call on every request —
 * the second call is a no-op.
 */
export function validateEmailEnvOnce(): readonly EnvWarning[] {
  if (validated) {
    return Array.from(warnedNames).map((name) => ({ name, message: '(previously warned)' }));
  }
  validated = true;
  const warnings: EnvWarning[] = [];
  for (const check of CHECKS) {
    const result = check.validate(process.env[check.name]);
    if (result !== true) {
      const message = `[email/env] ${check.name}: ${result}`;
      console.warn(message);
      warnings.push({ name: check.name, message });
      warnedNames.add(check.name);
    }
  }
  return warnings;
}

/** Test-only: reset module state between cases. */
export function __resetEmailEnvValidationForTests(): void {
  validated = false;
  warnedNames.clear();
}
