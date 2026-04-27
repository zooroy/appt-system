function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export default function fetch(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  if (typeof input === 'string' && input.startsWith('/')) {
    return globalThis.fetch(`${getBaseUrl()}${input}`, init);
  }
  return globalThis.fetch(input, init);
}
