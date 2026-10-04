import { runtimeConfig } from "@/shared/config/runtime";

export type ClientErrorContext = {
  source: string;
  requestId?: string;
  extra?: Record<string, string | number | boolean | null | undefined>;
};

type ClientErrorPayload = {
  name: string;
  message: string;
  stack?: string;
  source: string;
  requestId?: string;
  route: string;
  release: string;
  timestamp: string;
  extra?: ClientErrorContext["extra"];
};

let installed = false;
let sentInWindow = 0;
let windowStartedAt = 0;

function canSend() {
  const now = Date.now();
  if (now - windowStartedAt > 60000) {
    windowStartedAt = now;
    sentInWindow = 0;
  }
  if (sentInWindow >= 12) return false;
  sentInWindow += 1;
  return true;
}

function toError(value: unknown) {
  if (value instanceof Error) return value;
  if (typeof value === "string") return new Error(value);
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error("Unknown client error");
  }
}

export function reportClientError(
  value: unknown,
  context: ClientErrorContext,
) {
  const error = toError(value);
  console.error("[VisualMath]", context.source, error);

  if (!runtimeConfig.clientErrorEndpoint || !canSend()) return;

  const payload: ClientErrorPayload = {
    name: error.name,
    message: error.message.slice(0, 2000),
    stack: error.stack?.slice(0, 12000),
    source: context.source,
    requestId: context.requestId,
    route:
      typeof window !== "undefined"
        ? window.location.hash || "#home"
        : "#unknown",
    release: runtimeConfig.release,
    timestamp: new Date().toISOString(),
    extra: context.extra,
  };

  void fetch(runtimeConfig.clientErrorEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "omit",
    keepalive: true,
  }).catch(() => undefined);
}

export function installGlobalErrorReporting() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    reportClientError(event.error ?? event.message, {
      source: "window.error",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportClientError(event.reason, {
      source: "window.unhandledrejection",
    });
  });
}
