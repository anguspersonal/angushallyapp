const axios = require('axios');
const { randomUUID } = require('crypto');
const defaultConfig = require('../config');
const { createBackgroundContext } = require('../observability/requestContext');

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const SENSITIVE_KEYS = ['token', 'key', 'secret', 'password', 'authorization', 'cookie', 'set-cookie', 'session'];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function redactHeaders(headers = {}) {
  return Object.entries(headers).reduce((acc, [key, value]) => {
    const lower = key.toLowerCase();
    if (SENSITIVE_KEYS.some((sensitive) => lower.includes(sensitive))) {
      acc[key] = '[REDACTED]';
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function resolveUrl(baseURL, url) {
  try {
    return new URL(url, baseURL || undefined).toString();
  } catch (_err) {
    return url;
  }
}

function redactUrl(url) {
  if (!url) return url;
  return url.replace(/([?&](?:token|key|secret|password|authorization)=)[^&#]*/gi, '$1[REDACTED]');
}

class HttpClientError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.name = 'HttpClientError';
    this.status = meta.status;
    this.data = meta.data;
    this.method = meta.method;
    this.url = meta.url;
    this.traceId = meta.traceId;
  }
}

function createHttpClient(options = {}) {
  const config = options.config || defaultConfig.http;
  const settings = {
    timeout: config.timeoutMs,
    maxRetries: config.maxRetries,
    retryDelayMs: config.retryDelayMs,
    retryBackoffFactor: config.retryBackoffFactor || 1,
    logger: options.logger || console,
    getContext: options.getContext || (() => createBackgroundContext('http-client')),
    dependencyName: options.dependencyName || 'http',
    ...options,
  };

  const instance = axios.create({
    timeout: settings.timeout,
    baseURL: settings.baseURL,
  });

  instance.interceptors.request.use((request) => {
    const context = request.context || settings.getContext?.() || createBackgroundContext('http-client');
    const correlationId = context.correlationId || randomUUID();
    request.metadata = { start: Date.now(), correlationId, context };
    request.headers = {
      ...request.headers,
      'x-trace-id': correlationId,
      'x-correlation-id': correlationId,
    };
    return request;
  });

  instance.interceptors.response.use(
    (response) => {
      const duration = Date.now() - (response.config.metadata?.start || Date.now());
      response.metadata = {
        duration,
        correlationId: response.config.metadata?.correlationId,
        context: response.config.metadata?.context,
      };
      return response;
    },
    (error) => {
      if (error.config?.metadata) {
        error.config.metadata.duration = Date.now() - error.config.metadata.start;
      }
      return Promise.reject(error);
    }
  );

  async function request(requestConfig) {
    let attempt = 0;
    let lastError;

    while (attempt <= settings.maxRetries) {
      try {
        const response = await instance(requestConfig);
        const safeUrl = redactUrl(resolveUrl(requestConfig.baseURL || settings.baseURL || instance.defaults.baseURL, requestConfig.url));
        settings.logger.info?.('http:response', {
          dependency: settings.dependencyName,
          outcome: 'success',
          method: requestConfig.method?.toUpperCase() || 'GET',
          url: safeUrl,
          status: response.status,
          durationMs: response.metadata?.duration || 0,
          correlationId: response.metadata?.correlationId,
          source: response.metadata?.context?.source,
        });
        return response;
      } catch (error) {
        lastError = error;
        const status = error.response?.status;
        const shouldRetry =
          error.code === 'ECONNABORTED' ||
          error.code === 'ENOTFOUND' ||
          RETRYABLE_STATUSES.has(status);

        const safeUrl = redactUrl(resolveUrl(requestConfig.baseURL || settings.baseURL || instance.defaults.baseURL, requestConfig.url));
        if (!shouldRetry || attempt === settings.maxRetries) {
          settings.logger.error?.('http:error', {
            dependency: settings.dependencyName,
            outcome: 'error',
            method: requestConfig.method?.toUpperCase() || 'GET',
            url: safeUrl,
            status: error.response?.status,
            message: error.message,
            correlationId: error.config?.metadata?.correlationId,
            source: error.config?.metadata?.context?.source,
            headers: redactHeaders(requestConfig.headers),
            error_class: 'dependency',
            is_recoverable: shouldRetry,
          });
          throw new HttpClientError(error.message, {
            status: error.response?.status,
            data: error.response?.data,
            method: requestConfig.method,
            url: safeUrl,
            traceId: error.config?.metadata?.correlationId,
          });
        }

        const delay = settings.retryDelayMs * Math.pow(settings.retryBackoffFactor, attempt);
        await sleep(delay);
        attempt += 1;
      }
    }

    throw lastError;
  }

  const shorthand = ['get', 'delete', 'head', 'options'].reduce((acc, method) => {
    acc[method] = (url, config = {}) => request({ ...config, method, url });
    return acc;
  }, {});

  ['post', 'put', 'patch'].forEach((method) => {
    shorthand[method] = (url, data, config = {}) => request({ ...config, method, url, data });
  });

  return {
    request,
    ...shorthand,
    instance,
    settings,
    HttpClientError,
  };
}

const httpClient = createHttpClient();

module.exports = {
  createHttpClient,
  httpClient,
  HttpClientError,
};
