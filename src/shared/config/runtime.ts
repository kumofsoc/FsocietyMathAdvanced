export type RuntimeConfig = {
  apiBaseUrl: string;
  apiTimeoutMs: number;
  requireBackend: boolean;
  appEnv: string;
  buildSha: string;
  errorReportUrl: string;
};

function booleanEnv(value: string | undefined) {
  return value === "1" || value?.toLowerCase() === "true";
}

export function getRuntimeConfig(): RuntimeConfig {
  const timeout = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 12000);
  return {
    apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, ""),
    apiTimeoutMs:
      Number.isFinite(timeout) && timeout >= 1000 ? timeout : 12000,
    requireBackend: booleanEnv(import.meta.env.VITE_REQUIRE_BACKEND),
    appEnv: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE,
    buildSha: import.meta.env.VITE_BUILD_SHA ?? "dev",
    errorReportUrl: import.meta.env.VITE_ERROR_REPORT_URL ?? "",
  };
}

export function validateRuntimeConfig(config = getRuntimeConfig()) {
  const issues: string[] = [];

  if (config.apiBaseUrl) {
    try {
      const url = new URL(config.apiBaseUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        issues.push("VITE_API_BASE_URL must use http or https.");
      }
    } catch {
      issues.push("VITE_API_BASE_URL is not a valid absolute URL.");
    }
  } else if (config.requireBackend) {
    issues.push("Backend is required but VITE_API_BASE_URL is empty.");
  }

  if (!Number.isFinite(config.apiTimeoutMs) || config.apiTimeoutMs < 1000) {
    issues.push("VITE_API_TIMEOUT_MS must be at least 1000ms.");
  }

  if (config.errorReportUrl) {
    try {
      const url = new URL(config.errorReportUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        issues.push("VITE_ERROR_REPORT_URL must use http or https.");
      }
    } catch {
      issues.push("VITE_ERROR_REPORT_URL is not a valid absolute URL.");
    }
  }

  return issues;
}

export function assertRuntimeConfig() {
  const config = getRuntimeConfig();
  const issues = validateRuntimeConfig(config);
  if (issues.length) {
    throw new Error("Invalid VisualMath runtime config: " + issues.join(" "));
  }
  return config;
}
