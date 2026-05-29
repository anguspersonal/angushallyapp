/** Consent platform — public lib barrel (issue #140). */
export * from './types';
export {
  defaultRecord,
  defaultChoices,
  allGrantedChoices,
  normalizeChoices,
  hasDecided,
  isGranted,
  acceptAll,
  rejectNonEssential,
  savePreferences,
  setCategory,
  revoke,
  grant,
  readConsent,
  writeConsent,
  clearConsent,
} from './store';
export { useConsentGate, useConsent } from './useConsentGate';
