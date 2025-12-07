/**
 * Shared, stateless helpers for service-layer tests. These functions mirror
 * the dependency boundaries of the services (e.g., database adapter or
 * provider interfaces) instead of lower-level DB or HTTP clients. Each helper
 * has a narrow purpose so tests can compose only what they need without
 * shared mutable state. Keep additions focused on:
 * - builders for contract-shaped rows/envelopes;
 * - dependency factories that align with DI boundaries;
 * - zero business logic beyond shaping data for tests.
 */

// Canonical habit metrics are imported from the shared contract layer to avoid
// drifting aggregates between helpers, services, and tests.
const { HABIT_METRICS } = require('../../../shared/services/habit/contracts');

// Content builders (contract-aligned DB rows and pagination envelopes)
const DEFAULT_CONTENT_ROW = {
  id: 1,
  slug: 'hello-world',
  title: 'Hello World',
  excerpt: 'Intro post',
  cover_image: null,
  alt_text: null,
  attribution: null,
  attribution_link: null,
  tags: ['intro'],
  metadata: null,
  created_at: '2024-01-01',
  published_at: '2024-01-01',
  updated_at: '2024-01-02',
  author_name: 'Alex Kim',
  author_id: 'user-1',
  content_md: '# Hello',
};

// Habit builders (provider-shaped logs and aggregate defaults)
const DEFAULT_HABIT_AGGREGATES = HABIT_METRICS.reduce((acc, metric) => {
  acc[metric] = 0;
  return acc;
}, {});

/**
 * Returns a db-like dependency with a stubbed query function.
 * Override query or add additional properties per test.
 */
function createMockDb(overrides = {}) {
  const db = {
    query: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
  return db;
}

/**
 * Returns a logger with fresh spies for common log levels. Keep overrides
 * minimal so logging expectations stay focused on observable calls.
 */
function createMockLogger(overrides = {}) {
  const logger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    ...overrides,
  };
  return logger;
}

/**
 * Builds a DB row-shaped object for content posts using contract-aligned
 * fields. Overrides let tests model missing data or alternate authors.
 */
function createContentRow(overrides = {}) {
  return { ...DEFAULT_CONTENT_ROW, ...overrides };
}

/**
 * Builds a contract-aligned pagination envelope for content list results.
 */
function createContentPage({ items = [createContentRow()], page = 1, pageSize = 10, totalItems = items.length } = {}) {
  const safePageSize = pageSize > 0 ? pageSize : 10;
  const totalPages = Math.ceil(totalItems / safePageSize) || 0;
  return {
    items,
    pagination: {
      totalItems,
      page,
      pageSize: safePageSize,
      totalPages,
      hasMore: page * safePageSize < totalItems,
    },
  };
}

/**
 * Creates a mock habit log row as returned by the habit provider.
 */
function createHabitLog(overrides = {}) {
  return {
    id: 'habit-log-1',
    habit_type: 'walk',
    metric: HABIT_METRICS[0],
    created_at: '2024-01-01T00:00:00Z',
    published_at: null,
    updated_at: null,
    extra_data: { notes: 'morning walk' },
    ...overrides,
  };
}

/**
 * Creates a mock for the habit provider interface consumed by the service.
 * Each method is independent so tests can stub success or failure per case.
 */
function createHabitApiMock(overrides = {}) {
  return {
    getHabitLogsFromDB: jest.fn().mockResolvedValue([]),
    getHabitAggregates: jest.fn().mockResolvedValue({ ...DEFAULT_HABIT_AGGREGATES }),
    logHabitLog: jest.fn(),
    ...overrides,
  };
}

/**
 * Constructs the dependency bag for createContentService with distinct db and
 * logger instances to prevent cross-test leakage.
 */
// Dependency factories (DI-aligned bags for services)
function createContentServiceDeps({ dbOverrides = {}, loggerOverrides = {} } = {}) {
  const db = createMockDb(dbOverrides);
  const logger = createMockLogger(loggerOverrides);
  return { db, logger };
}

/**
 * Constructs the dependency bag for createHabitService. Each dependency
 * mirrors the service-facing interfaces and can be overridden independently.
 */
function createHabitServiceDeps({
  habitApiOverrides = {},
  aggregateServiceOverrides = {},
  alcoholServiceOverrides = {},
  loggerOverrides = {},
} = {}) {
  return {
    habitApi: createHabitApiMock(habitApiOverrides),
    aggregateService: { getAggregateStats: jest.fn(), ...aggregateServiceOverrides },
    alcoholService: { getAlcoholAggregates: jest.fn(), ...alcoholServiceOverrides },
    logger: createMockLogger(loggerOverrides),
  };
}

// Export groups (contract-aligned, stateless):
// - Content builders: createContentRow, createContentPage (use for route/service pagination cases).
// - Habit fixtures: createHabitLog (provider-shaped rows for aggregates/edge cases).
// - Provider stubs: createHabitApiMock (wire specific success/failure per test).
// - DI factories: createContentServiceDeps, createHabitServiceDeps (compose test-specific dependencies without shared state).
module.exports = {
  createMockDb,
  createMockLogger,
  createContentRow,
  createContentPage,
  createHabitLog,
  createHabitApiMock,
  createContentServiceDeps,
  createHabitServiceDeps,
};
