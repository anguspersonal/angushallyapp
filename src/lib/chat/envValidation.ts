/**
 * One-time startup validation of chat-related env vars.
 *
 * Called from the route handler on the first request to a process. Logs
 * a single warning per missing/invalid var and remembers what it warned
 * about so subsequent requests stay quiet.
 *
 * Intentionally **fail-open**: missing env doesn't return errors to
 * users. The downstream code paths each handle missing-env gracefully
 * (e.g. `getDailySpendUsd` returns 0, `getSupabaseAdmin` returns null,
 * `hashIp` throws and route.ts catches). This helper exists so the
 * operator sees the warning at deploy time, not so we can refuse to
 * serve requests.
 *
 * See docs/chatbotv1/README.md → Local setup for the env-var checklist.
 */

type Check = {
  name: string;
  validate: (value: string | undefined) => true | string;
};

const CHECKS: Check[] = [
  {
    name: 'ANTHROPIC_API_KEY',
    validate: (v) => {
      if (!v) return 'missing — chat will return SSE error code "unconfigured"';
      if (!v.startsWith('sk-ant-')) return 'present but does not look like an Anthropic key (expected sk-ant-…)';
      return true;
    },
  },
  {
    name: 'CHAT_IP_HASH_PEPPER',
    validate: (v) => {
      if (!v) return 'missing — ipHash will throw, route.ts will fall back to an unhashed marker';
      if (v.length < 16) return 'present but shorter than 16 chars — recommend `openssl rand -hex 32`';
      return true;
    },
  },
  {
    name: 'CHAT_DAILY_SPEND_CAP_USD',
    validate: (v) => {
      if (!v) return 'missing — daily cap is not enforced (no upper bound on spend)';
      const n = Number(v);
      if (!Number.isFinite(n) || n <= 0) return `non-numeric or non-positive value: "${v}"`;
      return true;
    },
  },
  {
    name: 'CHAT_INPUT_PRICE_USD_PER_MILLION_TOKENS',
    validate: (v) => {
      if (!v) return 'missing — spend-cap calculation will treat input cost as 0 USD/Mtok';
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) return `non-numeric or negative value: "${v}"`;
      return true;
    },
  },
  {
    name: 'CHAT_OUTPUT_PRICE_USD_PER_MILLION_TOKENS',
    validate: (v) => {
      if (!v) return 'missing — spend-cap calculation will treat output cost as 0 USD/Mtok';
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) return `non-numeric or negative value: "${v}"`;
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
export function validateChatEnvOnce(): readonly EnvWarning[] {
  if (validated) {
    return Array.from(warnedNames).map((name) => ({ name, message: '(previously warned)' }));
  }
  validated = true;
  const warnings: EnvWarning[] = [];
  for (const check of CHECKS) {
    const result = check.validate(process.env[check.name]);
    if (result !== true) {
      const message = `[chat/env] ${check.name}: ${result}`;
      console.warn(message);
      warnings.push({ name: check.name, message });
      warnedNames.add(check.name);
    }
  }
  return warnings;
}

/** Test-only: reset module state between cases. */
export function __resetEnvValidationForTests(): void {
  validated = false;
  warnedNames.clear();
}
