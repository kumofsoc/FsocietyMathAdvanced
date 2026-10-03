import { getRuntimeConfig } from "@/shared/config/runtime";

export type RuntimeErrorContext = {
  source: "react-boundary" | "window-error" | "unhandled-rejection" | "manual";
  componentStack?: string;
};

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack?.slice(0, 12000),
    };
  }
  return {
    name: "UnknownError",
    message: typeof error === "string" ? error : JSON.stringify(error),
  };
}

export function reportRuntimeError(
  error: unknown,
  context: RuntimeErrorContext,
) {
  const config = getRuntimeConfig();
  const payload = {
    app: "VisualMath",
    environment: config.appEnv,
    buildSha: config.buildSha,
    route: typeof window !== "undefined" ? window.location.hash : "",
    occurredAt: new Date().toISOString(),
    error: serializeError(error),
    context,
  };

  console.error("[VisualMath] runtime error", payload);

  if (
    !config.errorReportUrl ||
    typeof navigator === "undefined" ||
    typeof Blob === "undefined"
  ) {
    return;
  }

  try {
    const body = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });
    navigator.sendBeacon(config.errorReportUrl, body);
  } catch {
    // Reporting must never become another application failure.
  }
}

let installed = false;

export function installGlobalErrorReporting() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    reportRuntimeError(event.error ?? event.message, {
      source: "window-error",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportRuntimeError(event.reason, {
      source: "unhandled-rejection",
    });
  });
}
