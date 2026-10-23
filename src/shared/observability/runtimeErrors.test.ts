import { describe, expect, it } from "vitest";
import { buildSafeRuntimeErrorPayload } from "./runtimeErrors";

describe("runtime error telemetry privacy", () => {
  it("never sends password reset or verification tokens in routes", () => {
    for (const key of ["reset", "verify"]) {
      const secret = "sensitive-test-token-42";
      const payload = buildSafeRuntimeErrorPayload(
        new Error("internal"),
        { source: "react", route: `#account?${key}=${secret}` },
      );
      expect(payload.route).toBe("#account");
      expect(JSON.stringify(payload)).not.toContain(secret);
    }
  });

  it("never serializes error messages, stacks or component stack data", () => {
    const secret = "Bearer sensitive-test-credential-42";
    const error = new TypeError(secret);
    error.stack = `TypeError: ${secret}\n at example`;
    const payload = buildSafeRuntimeErrorPayload(error, {
      source: "promise",
      componentStack: secret,
      route: `#custom-topic?access_token=${secret}`,
    });
    expect(payload.name).toBe("TypeError");
    expect(payload.route).toBe("#other");
    expect(JSON.stringify(payload)).not.toContain(secret);
    expect(Object.keys(payload)).not.toContain("stack");
    expect(Object.keys(payload)).not.toContain("message");
    expect(Object.keys(payload)).not.toContain("componentStack");
  });

  it("does not send an attacker-controlled error name or URL", () => {
    const error = new Error("unsafe");
    error.name = "MySecretToken";
    const payload = buildSafeRuntimeErrorPayload(error, {
      source: "window",
      route: "#accounting?token=sensitive-test-token",
    });
    expect(payload.name).toBe("Error");
    expect(payload.route).toBe("#other");
  });

  it("preserves only known coarse public routes", () => {
    const payload = buildSafeRuntimeErrorPayload(new Error("fail"), {
      source: "react",
      route: "#map",
    });
    expect(payload.route).toBe("#map");
  });
});
