/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Analytics client (issue #141). Hard invariants under test:
 *   - NO init / capture without a KEY  (keyless deployment is a clean no-op)
 *   - NO capture without init           (consent drives init; uninitialised = silent)
 *   - revoke (shutdown) STOPS capture
 *   - captured events carry surface attribution (#125)
 *
 * posthog-js is mocked so nothing touches the network. We import the client
 * module fresh per test (resetModules) so its module-level instance state is
 * isolated.
 */

// A shared mock PostHog whose methods we can assert on.
const posthogMock = {
  init: vi.fn(),
  capture: vi.fn(),
  reset: vi.fn(),
};

vi.mock('posthog-js', () => ({
  __esModule: true,
  default: posthogMock,
}));

const KEY_ENV = { NEXT_PUBLIC_POSTHOG_KEY: 'phc_test', NEXT_PUBLIC_POSTHOG_HOST: 'https://eu.i.posthog.com' };

async function freshClient() {
  vi.resetModules();
  return import('./client');
}

beforeEach(() => {
  posthogMock.init.mockReset();
  posthogMock.capture.mockReset();
  posthogMock.reset.mockReset();
});

describe('initAnalytics — keyless no-op (guardrail: no key → no init)', () => {
  it('does not init and returns null when no key is configured', async () => {
    const client = await freshClient();
    const instance = await client.initAnalytics({}); // no key
    expect(instance).toBeNull();
    expect(posthogMock.init).not.toHaveBeenCalled();
    expect(client.isAnalyticsActive()).toBe(false);
  });

  it('does not capture without a key (capture no-ops when uninitialised)', async () => {
    const client = await freshClient();
    await client.initAnalytics({}); // no key → stays uninitialised
    client.captureEvent('cta_clicked', { cta: 'hire-me' }, '/dev');
    client.capturePageview('/dev');
    expect(posthogMock.capture).not.toHaveBeenCalled();
  });
});

describe('initAnalytics — with key (consent-driven init path)', () => {
  it('initialises posthog with the configured key + host', async () => {
    const client = await freshClient();
    const instance = await client.initAnalytics(KEY_ENV);
    expect(instance).not.toBeNull();
    expect(posthogMock.init).toHaveBeenCalledTimes(1);
    expect(posthogMock.init).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({
        api_host: 'https://eu.i.posthog.com',
        capture_pageview: false,
        autocapture: false,
      }),
    );
    expect(client.isAnalyticsActive()).toBe(true);
  });

  it('is idempotent — a second init does not re-init', async () => {
    const client = await freshClient();
    await client.initAnalytics(KEY_ENV);
    await client.initAnalytics(KEY_ENV);
    expect(posthogMock.init).toHaveBeenCalledTimes(1);
  });
});

describe('captureEvent — typed helper tags surface attribution', () => {
  it('captures with attribution merged onto the properties', async () => {
    const client = await freshClient();
    await client.initAnalytics(KEY_ENV);

    client.captureEvent('cta_clicked', { cta: 'hire-me' }, '/dev');

    expect(posthogMock.capture).toHaveBeenCalledTimes(1);
    expect(posthogMock.capture).toHaveBeenCalledWith('cta_clicked', {
      cta: 'hire-me',
      surface: 'dev',
      surface_kind: 'fullBleed',
      pathname: '/dev',
    });
  });

  it('capturePageview emits a $pageview tagged with surface', async () => {
    const client = await freshClient();
    await client.initAnalytics(KEY_ENV);

    client.capturePageview('/blog/some-post');

    expect(posthogMock.capture).toHaveBeenCalledTimes(1);
    const [event, props] = posthogMock.capture.mock.calls[0];
    expect(event).toBe('$pageview');
    expect(props).toMatchObject({ surface: 'blog', surface_kind: 'editorial', pathname: '/blog/some-post' });
  });
});

describe('shutdownAnalytics — revoke stops capture (guardrail)', () => {
  it('resets posthog and silences further capture', async () => {
    const client = await freshClient();
    await client.initAnalytics(KEY_ENV);
    expect(client.isAnalyticsActive()).toBe(true);

    client.shutdownAnalytics();

    expect(posthogMock.reset).toHaveBeenCalled();
    expect(client.isAnalyticsActive()).toBe(false);

    // Any capture after shutdown is a no-op.
    client.captureEvent('cta_clicked', { cta: 'hire-me' }, '/dev');
    expect(posthogMock.capture).not.toHaveBeenCalled();
  });

  it('is safe to call when nothing was initialised', async () => {
    const client = await freshClient();
    expect(() => client.shutdownAnalytics()).not.toThrow();
    expect(posthogMock.reset).not.toHaveBeenCalled();
  });
});
