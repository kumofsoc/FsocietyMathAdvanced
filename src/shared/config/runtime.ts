export type RuntimeConfig = {
  apiBaseUrl: string;
  apiTimeoutMs: number;
  mediaTransferTimeoutMs: number;
  errorReportingUrl: string;
  appRelease: string;
};

function normalizeOptionalUrl(value: string | undefined) {
  const raw = (value ?? "").trim().replace(/\/$/, "");
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function normalizeTimeout(
  value: string | undefined,
  fallback: number,
) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed >= 1000 ? parsed : fallback;
}

export const runtimeConfig: RuntimeConfig = {
  apiBaseUrl: normalizeOptionalUrl(import.meta.env.VITE_API_BASE_URL),
  apiTimeoutMs: normalizeTimeout(import.meta.env.VITE_API_TIMEOUT_MS, 12000),
  mediaTransferTimeoutMs: normalizeTimeout(
    import.meta.env.VITE_MEDIA_TRANSFER_TIMEOUT_MS,
    600000,
  ),
  errorReportingUrl: normalizeOptionalUrl(import.meta.env.VITE_ERROR_REPORTING_URL),
  appRelease: (import.meta.env.VITE_APP_RELEASE ?? "dev").trim() || "dev",
};

export function getRuntimeConfigWarnings() {
  const warnings: string[] = [];
  const rawApi = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
  const rawErrors = (import.meta.env.VITE_ERROR_REPORTING_URL ?? "").trim();

  if (rawApi && !runtimeConfig.apiBaseUrl) {
    warnings.push("VITE_API_BASE_URL is not a valid http(s) URL.");
  }
  if (rawErrors && !runtimeConfig.errorReportingUrl) {
    warnings.push("VITE_ERROR_REPORTING_URL is not a valid http(s) URL.");
  }
  if (
    import.meta.env.PROD &&
    runtimeConfig.apiBaseUrl.startsWith("http://")
  ) {
    warnings.push("Production API URL should use HTTPS.");
  }

  return warnings;
}
