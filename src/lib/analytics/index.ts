/** Analytics — public lib barrel (issue #141). */
export {
  DEFAULT_POSTHOG_HOST,
  readAnalyticsConfig,
  isAnalyticsConfigured,
  type AnalyticsConfig,
} from './config';
export {
  type AnalyticsEventMap,
  type AnalyticsEventName,
  type AnalyticsEventProperties,
  type AnalyticsProperties,
} from './events';
export {
  DEFAULT_SURFACE,
  attributionFor,
  withAttribution,
  type SurfaceAttribution,
} from './attribution';
export {
  initAnalytics,
  shutdownAnalytics,
  captureEvent,
  capturePageview,
  isAnalyticsActive,
  getAnalyticsInstance,
} from './client';
export { useAnalytics } from './useAnalytics';
