import { runtimeConfig } from "@/shared/config/runtime";

export type RuntimeErrorContext = {
  source: "react" | "window" | "promise";
  componentStack?: string;
  route?: string;
};

type ErrorPayload = {
  name: string;
  message: string;
  stack?: string;
  source: RuntimeErrorContext["source"];
  componentStack?: string;
  route: string;
  release: string;
  occurredAt: string;
};

function normalizeError(error: unknown) {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);

  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error("Unknown runtime error");
  }
}

function buildPayload(
  error: unknown,
  context: RuntimeErrorContext,
): ErrorPayload {
  const normalized = normalizeError(error);
  return {
    name: normalized.name || "Error",
    message: normalized.message || "Unknown runtime error",
    stack: normalized.stack?.slice(0, 8000),
    source: context.source,
    componentStack: context.componentStack?.slice(0, 8000),
    route:
      context.route ??
      (typeof window !== "undefined" ? window.location.hash || "#home" : "#unknown"),
    release: runtimeConfig.appRelease,
    occurredAt: new Date().toISOString(),
  };
}

export function reportRuntimeError(
  error: unknown,
  context: RuntimeErrorContext,
) {
  const payload = buildPayload(error, context);

  console.error("[VisualMath] runtime error", payload);

  if (!runtimeConfig.errorReportingUrl || typeof window === "undefined") {
    return;
  }

  const body = JSON.stringify(payload);

  try {
    if (navigator.sendBeacon) {
      const accepted = navigator.sendBeacon(
        runtimeConfig.errorReportingUrl,
        new Blob([body], { type: "application/json" }),
      );
      if (accepted) return;
    }

    void fetch(runtimeConfig.errorReportingUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "omit",
    }).catch(() => undefined);
  } catch {
    // Error reporting must never break the application.
  }
}

let installed = false;

export function installGlobalRuntimeErrorReporting() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    reportRuntimeError(event.error ?? event.message, { source: "window" });
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportRuntimeError(event.reason, { source: "promise" });
  });
}
