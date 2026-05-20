/**
 * Thrown by `readApiJson` when the server returns a non-2xx response.
 * Browser-side mirror of the server's `HttpError` (see ADR 0034) — decodes
 * the `{ error, code? }` / `{ errors: [...] }` envelope into a typed
 * exception consumers can pattern-match on (`error.status`, `error.code`).
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
