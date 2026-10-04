type RuntimeIssue = {
  level: "error" | "warning";
  message: string;
};

function parseBoolean(value: string | undefined, fallback = false) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function parseTimeout(value: string | undefined) {
  const parsed = Number(value ?? 12000);
  return Number.isFinite(parsed) && parsed >= 1000 && parsed <= 120000
    ? parsed
    : 12000;
}

function normalizeBaseUrl(value: string | undefined) {
  const raw = (value ?? "").trim();
  if (!raw || raw === "/") return "";
  return raw.replace(/\/$/, "");
}

const rawApiBase = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

export const runtimeConfig = {
  mode: import.meta.env.MODE,
  production: import.meta.env.PROD,
  apiBaseUrl: normalizeBaseUrl(rawApiBase),
  backendConfigured: Boolean(rawApiBase),
  requireBackend: parseBoolean(import.meta.env.VITE_REQUIRE_BACKEND, false),
  apiTimeoutMs: parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS),
  clientErrorEndpoint: (
    import.meta.env.VITE_CLIENT_ERROR_ENDPOINT ?? ""
  ).trim(),
  release: (import.meta.env.VITE_RELEASE ?? "dev").trim() || "dev",
} as const;

export function validateRuntimeConfig(): RuntimeIssue[] {
  const issues: RuntimeIssue[] = [];

  if (runtimeConfig.requireBackend && !runtimeConfig.backendConfigured) {
    issues.push({
      level: "error",
      message:
        "VITE_REQUIRE_BACKEND is enabled but VITE_API_BASE_URL is empty.",
    });
  }

  if (runtimeConfig.backendConfigured && runtimeConfig.apiBaseUrl) {
    try {
      const url = new URL(
        runtimeConfig.apiBaseUrl,
        typeof window !== "undefined" ? window.location.origin : "http://localhost",
      );
      if (
        runtimeConfig.production &&
        url.protocol === "http:" &&
        url.hostname !== "localhost" &&
        url.hostname !== "127.0.0.1"
      ) {
        issues.push({
          level: "error",
          message: "Production backend URL must use HTTPS.",
        });
      }
    } catch {
      issues.push({
        level: "error",
        message: "VITE_API_BASE_URL is not a valid URL or path.",
      });
    }
  }

  if (
    runtimeConfig.production &&
    runtimeConfig.clientErrorEndpoint &&
    runtimeConfig.clientErrorEndpoint.startsWith("http://")
  ) {
    issues.push({
      level: "warning",
      message: "Client error endpoint should use HTTPS in production.",
    });
  }

  return issues;
}

export function runtimeConfigHasErrors() {
  return validateRuntimeConfig().some((issue) => issue.level === "error");
}
