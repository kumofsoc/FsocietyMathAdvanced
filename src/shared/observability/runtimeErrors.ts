import { runtimeConfig } from "@/shared/config/runtime";

export type RuntimeErrorContext = {
  source: "react" | "window" | "promise";
  componentStack?: string;
  route?: string;
};

// Only coarse diagnostic metadata is sent to telemetry. Error messages,
// stacks and arbitrary URL fragments may contain credentials or user data.
type ErrorPayload = {
  name: string;
  source: RuntimeErrorContext["source"];
  route: string;
  release: string;
  occurredAt: string;
};

const SAFE_ERROR_NAMES = new Set([
  "Error",
  "TypeError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "URIError",
  "EvalError",
  "AggregateError",
]);

function safeRoute(route: string): string {
  // Password-reset and email-verification credentials live after #account?.
  // Never upload a complete hash, URL, topic ID or user-provided route.
  const match = /^#?(home|map|academy|review|marks|account)(?:$|[/?])/i.exec(route.trim());
  return match ? `#${match[1].toLowerCase()}` : "#other";
}

export function buildSafeRuntimeErrorPayload(
  error: unknown,
  context: RuntimeErrorContext,
): ErrorPayload {
  const errorName = error instanceof Error ? error.name : "";
  const rawRoute =
    context.route ??
    (typeof window !== "undefined" ? window.location.hash : "#unknown");

  return {
    name: SAFE_ERROR_NAMES.has(errorName) ? errorName : "Error",
    source: context.source,
    route: safeRoute(rawRoute),
    release: runtimeConfig.appRelease,
    occurredAt: new Date().toISOString(),
  };
}

export function reportRuntimeError(
  error: unknown,
  context: RuntimeErrorContext,
) {
  const payload = buildSafeRuntimeErrorPayload(error, context);
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
