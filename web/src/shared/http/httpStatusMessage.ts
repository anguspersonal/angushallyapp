/**
 * User-facing messages for HTTP status codes (client-side API layer).
 */
export function messageForHttpStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Bad request – please check your input';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden – you do not have access to this resource';
    case 404:
      return 'Resource not found';
    case 429:
      return 'Too many requests – please try again later';
    case 500:
      return 'Server error – please try again later';
    default:
      return 'An error occurred';
  }
}
