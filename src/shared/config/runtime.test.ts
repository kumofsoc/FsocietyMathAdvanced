import { describe, expect, it } from "vitest";
import { validateRuntimeConfig, type RuntimeConfig } from "./runtime";

const base: RuntimeConfig = {
  apiBaseUrl: "",
  apiTimeoutMs: 12000,
  requireBackend: false,
  appEnv: "test",
  buildSha: "test",
  errorReportUrl: "",
};

describe("runtime config validation", () => {
  it("accepts local-first deployments without a backend", () => {
    expect(validateRuntimeConfig(base)).toEqual([]);
  });

  it("rejects a required backend without an API URL", () => {
    expect(
      validateRuntimeConfig({ ...base, requireBackend: true }),
    ).toContain("Backend is required but VITE_API_BASE_URL is empty.");
  });

  it("rejects unsafe or malformed transport URLs", () => {
    expect(
      validateRuntimeConfig({ ...base, apiBaseUrl: "ftp://example.com" }),
    ).toContain("VITE_API_BASE_URL must use http or https.");
  });

  it("validates the optional reporting endpoint", () => {
    expect(
      validateRuntimeConfig({
        ...base,
        errorReportUrl: "not-a-url",
      }),
    ).toContain("VITE_ERROR_REPORT_URL is not a valid absolute URL.");
  });
});
