/**
 * User-facing messages for HTTP status codes (client-side API layer).
 */
const HTTP_STATUS_MESSAGES: Readonly<Record<number, string>> = {
  400: 'Bad request – please check your input',
  401: 'Unauthorized',
  403: 'Forbidden – you do not have access to this resource',
  404: 'Resource not found',
  429: 'Too many requests – please try again later',
  500: 'Server error – please try again later',
};

export function messageForHttpStatus(status: number): string {
  return HTTP_STATUS_MESSAGES[status] ?? 'An error occurred';
}
