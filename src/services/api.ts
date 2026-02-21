/**
 * API Service
 *
 * Base HTTP client for making API requests.
 * Replace BASE_URL with your actual API endpoint.
 */

const BASE_URL = 'https://api.example.com';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  headers?: Record<string, string>;
  body?: unknown;
}

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.body && method !== 'GET') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>('GET', endpoint, options),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', endpoint, { ...options, body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', endpoint, { ...options, body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', endpoint, { ...options, body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>('DELETE', endpoint, options),
};
