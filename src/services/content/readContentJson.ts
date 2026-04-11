export async function readContentJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || `Request failed with status ${response.status}`);
    // @ts-expect-error augmenting error for hooks
    error.code = response.status === 404 ? 'NOT_FOUND' : 'HTTP_ERROR';
    throw error;
  }
  try {
    return await response.json();
  } catch {
    const error = new Error('Invalid JSON response from content API');
    // @ts-expect-error augmenting error for hooks
    error.code = 'HTTP_ERROR';
    throw error;
  }
}
