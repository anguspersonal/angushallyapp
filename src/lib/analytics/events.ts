/**
 * Typed analytics event catalogue (issue #141).
 *
 * Events are named with a `noun_verb` convention and carry a typed property
 * bag. Defining them here (rather than sprinkling raw string literals through
 * the app) keeps event names consistent, greppable, and refactor-safe, and lets
 * the capture helper enforce the property shape at the call site.
 *
 * To add an event: add a key to `AnalyticsEventMap` with its property type.
 * Then `captureEvent(client, 'your_event', { ...typed props })` is type-checked.
 *
 * This module is pure data + types — no posthog-js import — so it is safe to
 * import anywhere and trivially unit-testable.
 */

/** Property bag accepted by PostHog capture (JSON-ish values). */
export type AnalyticsProperties = Record<string, unknown>;

/**
 * The canonical event map: event name → its property shape.
 *
 * `$pageview` is PostHog's reserved pageview event; we include it so route-change
 * capture (see usePageviewCapture) goes through the same typed helper. Bespoke
 * product events are added below as the surfaces (#129/#130/#131) need them.
 */
export interface AnalyticsEventMap {
  /** PostHog reserved pageview. Captured on App Router route change. */
  $pageview: { $current_url?: string; pathname?: string };
  /** A persona/surface page was viewed (semantic complement to $pageview). */
  surface_viewed: Record<string, never>;
  /** A call-to-action was clicked (e.g. contact, hire-me). */
  cta_clicked: { cta: string };
  /** The chat panel was opened. */
  chat_opened: Record<string, never>;
}

/** All known event names. */
export type AnalyticsEventName = keyof AnalyticsEventMap;

/** The typed properties for a given event name. */
export type AnalyticsEventProperties<E extends AnalyticsEventName> = AnalyticsEventMap[E];
