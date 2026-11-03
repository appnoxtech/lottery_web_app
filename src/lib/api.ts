import axios, { AxiosError } from "axios";

/**
 * Client for the HopiSuerte API (v1). Every response is {data, error}; this unwraps `data` and turns
 * `error` into an ApiError so screens can show the server's own message.
 */
export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, string[]>;

  constructor(code: string, message: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /** First validation message for a field, if the server sent one. */
  field(name: string): string | undefined {
    return this.details?.[name]?.[0];
  }

  /** Seconds to wait before retrying, when the server asked for a pause. */
  get retryAfter(): number | undefined {
    const value = (this.details as Record<string, unknown> | undefined)?.retry_after_seconds;
    return typeof value === "number" ? value : undefined;
  }
}

const SESSION_KEY = "hs_session";
const BASE_URL = (import.meta.env.VITE_API_URL ?? "/api/v1/").replace(/\/?$/, "/");

export function readStoredToken(): string | null {
  try {
    return (JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as { token?: string } | null)?.token ?? null;
  } catch {
    return null;
  }
}

let onUnauthorized: (() => void) | null = null;
/** The auth provider registers itself here so an expired token signs the customer out everywhere. */
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

const http = axios.create({ baseURL: BASE_URL, timeout: 30000, headers: { Accept: "application/json" } });

http.interceptors.request.use((config) => {
  const token = readStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function toApiError(e: unknown): ApiError {
  const err = e as AxiosError<{ error?: { code: string; message: string; details?: Record<string, string[]> } }>;
  const body = err.response?.data?.error;
  if (body) return new ApiError(body.code, body.message, err.response!.status, body.details);
  if (err.response) return new ApiError("http_error", `Request failed (${err.response.status}).`, err.response.status);
  return new ApiError("network_error", "Cannot reach the server. Check your connection and try again.", 0);
}

async function request<T>(method: "get" | "post" | "patch" | "delete", url: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
  try {
    const response = await http.request({ method, url, data, headers });
    return response.data.data as T;
  } catch (e) {
    const apiError = toApiError(e);
    // A signed-in customer whose token expired or was revoked is sent back to sign in.
    if (apiError.status === 401 && readStoredToken() && onUnauthorized) onUnauthorized();
    throw apiError;
  }
}

export const api = {
  get: <T>(url: string) => request<T>("get", url),
  post: <T>(url: string, data?: unknown, headers?: Record<string, string>) => request<T>("post", url, data, headers),
  patch: <T>(url: string, data?: unknown) => request<T>("patch", url, data),
  delete: <T>(url: string, data?: unknown) => request<T>("delete", url, data),
};

export const SESSION_STORAGE_KEY = SESSION_KEY;
