const fallbackApiBaseUrl = "https://soilix-public-api.onrender.com";
const requestTimeoutMs = 15000;

export const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "") || fallbackApiBaseUrl;

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: JsonObject;
  headers?: Record<string, string>;
  /** Skip the 401 → refresh retry for this specific request (e.g. the refresh call itself). */
  skipAuthRetry?: boolean;
};

export function getBearerAuthHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

// Registered by AuthContext at startup; called whenever any request gets a 401.
// Returning a new token string triggers a single retry; returning null forces logout.
let unauthorizedHandler: (() => Promise<string | null>) | null = null;

export function setUnauthorizedHandler(handler: () => Promise<string | null>) {
  unauthorizedHandler = handler;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return _doRequest<T>(path, options, false);
}

async function _doRequest<T>(
  path: string,
  options: ApiRequestOptions,
  isRetry: boolean,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The request timed out. Please try again.");
    }

    throw new Error(`Could not reach the API at ${apiBaseUrl}.`);
  }

  clearTimeout(timeoutId);

  // Handle token expiry: try the registered refresh handler once.
  if (response.status === 401 && !isRetry && !options.skipAuthRetry && unauthorizedHandler) {
    const newToken = await unauthorizedHandler();
    if (newToken) {
      const retryOptions: ApiRequestOptions = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      };
      return _doRequest<T>(path, retryOptions, true);
    }
    throw new Error("Session expired. Please log in again.");
  }

  const text = await response.text();
  const data = text ? tryParseJson(text) : null;

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data && typeof data.message === "string"
        ? data.message
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
