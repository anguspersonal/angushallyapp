/**
 * Thrown by Repository functions, validators, or Route Handlers to signal a
 * non-200 response. The `runHandler` wrapper in `./handler` catches it and
 * maps to JSON `{ error, code? }` with the carried status.
 *
 * Repository contract (see ADR 0034): repositories return data or throw
 * HttpError. They never use `null` to signal failure. `null` is reserved
 * for "this entity legitimately does not exist" (e.g. `getById` of an
 * absent row).
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
