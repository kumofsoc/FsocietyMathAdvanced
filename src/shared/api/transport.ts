import type { ApiErrorBody } from "@/shared/api/types";

export type TransportRequestOptions = {
  auth?: boolean;
  timeoutMs?: number;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  requestId?: string;
  cause?: unknown;

  constructor(
    status: number,
    payload: {
      message: string;
      code?: string;
      details?: unknown;
      requestId?: string;
      cause?: unknown;
    },
  ) {
    super(payload.message || "API request failed");
    this.name = "ApiError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
    this.requestId = payload.requestId;
    this.cause = payload.cause;
  }
}

type TransportConfig = {
  baseUrl: string;
  timeoutMs: number;
  getAuthorization: () => string | null;
};

function normalizeErrorBody(payload: ApiErrorBody | null | undefined) {
  const nested = payload?.error;
  return {
    code: nested?.code ?? payload?.code,
    message: nested?.message ?? payload?.message ?? "API request failed",
    details: nested?.details ?? payload?.details,
  };
}

function composeSignal(
  external: AbortSignal | null | undefined,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timer = globalThis.setTimeout(
    () => controller.abort("timeout"),
    timeoutMs,
  );

  const onAbort = () => controller.abort(external?.reason);
  if (external) {
    if (external.aborted) onAbort();
    else external.addEventListener("abort", onAbort, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      globalThis.clearTimeout(timer);
      external?.removeEventListener("abort", onAbort);
    },
  };
}

async function parsePayload(response: Response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function createApiTransport({
  baseUrl,
  timeoutMs: defaultTimeoutMs,
  getAuthorization,
}: TransportConfig) {
  const backendUrl = (path: string) => baseUrl + path;

  const fetchResponse = async (
    path: string,
    init: RequestInit = {},
    options: TransportRequestOptions = {},
  ) => {
    if (!baseUrl) {
      throw new ApiError(0, {
        code: "backend_not_configured",
        message: "VITE_API_BASE_URL is not configured.",
      });
    }

    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (
      init.body &&
      !(init.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    if (options.auth !== false) {
      const authorization = getAuthorization();
      if (authorization) {
        headers.set("Authorization", authorization);
      }
    }

    const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;
    const { signal, cleanup } = composeSignal(init.signal, timeoutMs);

    try {
      return await fetch(backendUrl(path), {
        ...init,
        headers,
        signal,
        credentials: "include",
      });
    } catch (error) {
      const timedOut = signal.aborted && signal.reason === "timeout";
      throw new ApiError(0, {
        code: timedOut ? "request_timeout" : "network_error",
        message: timedOut
          ? "Backend request timed out."
          : "Backend request could not be completed.",
        cause: error,
      });
    } finally {
      cleanup();
    }
  };

  const throwResponseError = async (
    response: Response,
    payload?: unknown,
  ): Promise<never> => {
    const parsed =
      payload === undefined ? await parsePayload(response) : payload;
    const requestId =
      response.headers.get("X-Request-ID") ??
      response.headers.get("X-Request-Id") ??
      undefined;
    const error = normalizeErrorBody(
      parsed && typeof parsed === "object"
        ? (parsed as ApiErrorBody)
        : null,
    );

    throw new ApiError(response.status, {
      ...error,
      message:
        error.message ||
        (typeof parsed === "string"
          ? parsed
          : "Request failed with status " + response.status),
      requestId,
    });
  };

  const rawRequest = async <T>(
    path: string,
    init: RequestInit = {},
    options: TransportRequestOptions = {},
  ): Promise<T> => {
    const response = await fetchResponse(path, init, options);
    const payload = await parsePayload(response);
    if (!response.ok) {
      return throwResponseError(response, payload);
    }

    if (
      payload &&
      typeof payload === "object" &&
      "data" in payload &&
      (payload as { data?: unknown }).data !== undefined
    ) {
      return (payload as { data: T }).data;
    }

    return payload as T;
  };

  const rawBlobRequest = async (
    path: string,
    init: RequestInit = {},
    options: TransportRequestOptions = {},
  ) => {
    const response = await fetchResponse(path, init, options);
    if (!response.ok) {
      return throwResponseError(response);
    }
    return response.blob();
  };

  return {
    backendUrl,
    rawRequest,
    rawBlobRequest,
  };
}
