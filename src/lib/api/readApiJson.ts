import { ApiError } from './apiError';

/**
 * Read a JSON Response from one of the app's API endpoints.
 *
 * - 2xx → parsed JSON body cast to T.
 * - non-2xx → throws ApiError with status, message, and code drawn from the
 *   server's `{ error, code? }` envelope (or `{ errors: [...] }` for
 *   multi-field validation), falling back to the raw text body or the HTTP
 *   status when the envelope is missing.
 */
export async function readApiJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await buildApiError(response);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError('Invalid JSON response', response.status, 'INVALID_JSON');
  }
}

async function buildApiError(response: Response): Promise<ApiError> {
  const payload = await readPayload(response);
  return new ApiError(
    extractMessage(payload, response.status),
    response.status,
    extractCode(payload, response.status),
  );
}

async function readPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    return await response.text();
  } catch {
    return null;
  }
}

function extractMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === 'object') {
    const obj = payload as { error?: unknown; errors?: unknown };
    if (typeof obj.error === 'string' && obj.error.length > 0) {
      return obj.error;
    }
    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      return obj.errors.map(String).join(', ');
    }
  }
  if (typeof payload === 'string' && payload.length > 0) {
    return payload;
  }
  return `Request failed with status ${status}`;
}

function extractCode(payload: unknown, status: number): string {
  if (payload && typeof payload === 'object') {
    const obj = payload as { code?: unknown };
    if (typeof obj.code === 'string' && obj.code.length > 0) {
      return obj.code;
    }
  }
  if (status === 404) return 'NOT_FOUND';
  return 'HTTP_ERROR';
}
