import { createHash } from 'node:crypto';

/**
 * One-way hash of a client IP, salted with a server-side pepper that never
 * leaves the host. Used for abuse detection (rate-limit keying, session
 * fingerprinting) without storing the raw IP.
 *
 * Rotating the pepper invalidates correlation across the rotation point but
 * cannot leak any historical IP — see docs/chatbotv1/requirements.md
 * FR-PERS-7 and docs/chatbotv1/design.md §8.2.
 */
export function hashIp(ip: string): string {
  const pepper = process.env.CHAT_IP_HASH_PEPPER;
  if (!pepper) {
    throw new Error('CHAT_IP_HASH_PEPPER environment variable is not set');
  }
  return createHash('sha256').update(`${ip}|${pepper}`).digest('hex');
}
