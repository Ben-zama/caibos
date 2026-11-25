import { appConfig } from '@/config/app.config';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
}

type UnauthorizedHandler = () => void;

let onUnauthorizedHandler: UnauthorizedHandler | null = null;
let inMemoryToken: string | null = null;

/** Register a global callback invoked whenever the backend responds with 401. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorizedHandler = handler;
}

export function getAuthToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(appConfig.api.tokenStorageKey);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  inMemoryToken = token;
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem(appConfig.api.tokenStorageKey, token);
    } else {
      localStorage.removeItem(appConfig.api.tokenStorageKey);
    }
  } catch {
    // ignore storage errors
  }
}

export function buildUrl(
  baseUrl: string,
  path: string,
  params?: RequestOptions['params']
): string {
  const isAbsolute = /^https?:\/\//i.test(path);
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const rawUrl = isAbsolute ? path : `${normalizedBase}${normalizedPath}`;

  if (!params) return rawUrl;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }

  const queryString = search.toString();
  if (!queryString) return rawUrl;
  return `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}${queryString}`;
}

/**
 * Unwraps standard backend response envelopes (`{ data: T }`) while also
 * supporting raw JSON payloads (`T`). Customize here if your API uses
 * a different wrapper key (e.g. `result` or `payload`).
 */
export function unwrapResponse<T>(payload: unknown): T {
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'data' in payload &&
    Object.keys(payload as Record<string, unknown>).every(key =>
      ['data', 'message', 'meta', 'status', 'success'].includes(key)
    )
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const url = buildUrl(appConfig.api.baseUrl, path, options.params);
  const controller = new AbortController();
  const timeout = options.timeoutMs ?? appConfig.api.timeoutMs;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAuthToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `${appConfig.api.authHeaderPrefix} ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      signal,
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const parsedBody =
      response.status === 204
        ? undefined
        : isJson
          ? await response.json().catch(() => undefined)
          : await response.text().catch(() => undefined);

    if (!response.ok) {
      if (response.status === 401 && onUnauthorizedHandler) {
        onUnauthorizedHandler();
      }
      const errObj =
        parsedBody && typeof parsedBody === 'object'
          ? (parsedBody as Record<string, unknown>)
          : undefined;
      const message =
        (typeof errObj?.message === 'string' && errObj.message) ||
        (typeof errObj?.error === 'string' && errObj.error) ||
        `Request failed with status ${response.status}`;
      const code = typeof errObj?.code === 'string' ? errObj.code : undefined;
      throw new ApiError(message, response.status, code, parsedBody);
    }

    return unwrapResponse<T>(parsedBody);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timed out', 408, 'TIMEOUT');
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      'NETWORK_ERROR'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};
