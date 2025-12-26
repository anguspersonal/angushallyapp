jest.mock('axios');
const axios = require('axios');
const { createHttpClient, HttpClientError } = require('../http/client');

function createMockInstance(sequence) {
  let call = 0;
  let requestHandler;
  let responseSuccess;
  let responseError;

  const instance = jest.fn(async (config) => {
    if (requestHandler) {
      config = requestHandler(config) || config;
    }

    const outcome = sequence[call++];
    if (outcome instanceof Error) {
      outcome.response = outcome.response || {};
      if (responseError) {
        return responseError(outcome);
      }
      throw outcome;
    }

    let response = { data: outcome.data, status: outcome.status || 200, config };
    if (responseSuccess) {
      response = responseSuccess(response) || response;
    }
    return response;
  });

  instance.interceptors = {
    request: { use: (fn) => { requestHandler = fn; } },
    response: { use: (success, error) => { responseSuccess = success; responseError = error; } },
  };

  return instance;
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('retries retryable errors and logs success', async () => {
  const mockInstance = createMockInstance([
    Object.assign(new Error('Server error'), { response: { status: 500 } }),
    { data: { ok: true }, status: 200 },
  ]);
  axios.create.mockReturnValue(mockInstance);

  const logger = { info: jest.fn(), error: jest.fn() };
  const client = createHttpClient({ logger, config: { timeoutMs: 100, maxRetries: 2, retryDelayMs: 1, retryBackoffFactor: 2 } });

  const response = await client.get('/test');

  expect(response.data.ok).toBe(true);
  expect(mockInstance).toHaveBeenCalledTimes(2);
  expect(logger.info).toHaveBeenCalledWith('http:response', expect.objectContaining({ status: 200 }));
  expect(logger.error).not.toHaveBeenCalled();
});

test('propagates provided context correlation IDs into logs', async () => {
  const mockInstance = createMockInstance([{ data: { ok: true }, status: 201 }]);
  axios.create.mockReturnValue(mockInstance);

  const logger = { info: jest.fn(), error: jest.fn() };
  const client = createHttpClient({
    logger,
    getContext: () => ({ correlationId: 'ctx-123' }),
    config: { timeoutMs: 100, maxRetries: 0, retryDelayMs: 1, retryBackoffFactor: 1 },
  });

  await client.post('/context-aware');

  const [, meta] = logger.info.mock.calls[0];
  expect(meta.correlationId).toBe('ctx-123');
  expect(meta.outcome).toBe('success');
});

test('logs and throws on non-retryable error', async () => {
  const mockInstance = createMockInstance([
    Object.assign(new Error('Bad request'), { response: { status: 400 } }),
  ]);
  axios.create.mockReturnValue(mockInstance);

  const logger = { info: jest.fn(), error: jest.fn() };
  const client = createHttpClient({ logger, config: { timeoutMs: 100, maxRetries: 1, retryDelayMs: 1, retryBackoffFactor: 2 } });

  await expect(client.get('/test')).rejects.toBeInstanceOf(HttpClientError);
  expect(logger.error).toHaveBeenCalledWith('http:error', expect.objectContaining({ status: 400 }));
});

test('wraps errors with HttpClientError shape and preserves traceId', async () => {
  const mockInstance = createMockInstance([
    Object.assign(new Error('Unauthorized'), { response: { status: 401 }, config: { metadata: { correlationId: 'abc-123' } } }),
  ]);
  axios.create.mockReturnValue(mockInstance);
  const logger = { info: jest.fn(), error: jest.fn() };
  const client = createHttpClient({ logger, config: { timeoutMs: 100, maxRetries: 0, retryDelayMs: 1, retryBackoffFactor: 1 } });

  await expect(client.get('/auth')).rejects.toThrow(HttpClientError);
  const errorCall = logger.error.mock.calls[0];
  expect(errorCall[1]).toMatchObject({ outcome: 'error', correlationId: 'abc-123' });
});

test('applies exponential backoff between retries', async () => {
  jest.useFakeTimers();
  const mockInstance = createMockInstance([
    Object.assign(new Error('Timeout'), { code: 'ECONNABORTED' }),
    Object.assign(new Error('Timeout'), { code: 'ECONNABORTED' }),
    { data: { ok: true }, status: 200 },
  ]);
  axios.create.mockReturnValue(mockInstance);

  const logger = { info: jest.fn(), error: jest.fn() };
  const client = createHttpClient({ logger, config: { timeoutMs: 100, maxRetries: 2, retryDelayMs: 50, retryBackoffFactor: 2 } });

  const promise = client.get('/backoff-test');
  await jest.runOnlyPendingTimersAsync();
  await jest.runOnlyPendingTimersAsync();
  const response = await promise;

  expect(response.data.ok).toBe(true);
  const delayCalls = setTimeout.mock.calls.map(([, delay]) => delay);
  expect(delayCalls).toEqual([50, 100]);
  jest.useRealTimers();
});

test('redacts sensitive data in logs and errors are wrapped', async () => {
  const mockInstance = createMockInstance([
    Object.assign(new Error('Unauthorized'), {
      response: { status: 401, data: { error: 'bad token' } },
      config: { metadata: { traceId: '123' } },
    }),
  ]);
  axios.create.mockReturnValue(mockInstance);
  const logger = { info: jest.fn(), error: jest.fn() };
  const client = createHttpClient({
    logger,
    config: { timeoutMs: 100, maxRetries: 0, retryDelayMs: 1, retryBackoffFactor: 2 },
  });

  await expect(
    client.get('https://api.test.com/resource?token=secret', {
      headers: { Authorization: 'Bearer top-secret' },
    })
  ).rejects.toBeInstanceOf(HttpClientError);

  const [, errorMeta] = logger.error.mock.calls[0];
  expect(errorMeta.url).not.toContain('secret');
  expect(errorMeta.headers.Authorization).toBe('[REDACTED]');
});
