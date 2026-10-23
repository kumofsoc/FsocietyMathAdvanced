// Public GA4 web-stream identifiers are not credentials. A malformed Vercel
// environment variable must not take the entire MathMaMath website offline.
export const DEFAULT_GA4_MEASUREMENT_ID = "G-CTLM64E8WF";

export function resolveGa4MeasurementId(value, warn = console.warn) {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (!candidate) return DEFAULT_GA4_MEASUREMENT_ID;
  if (/^G-[A-Z0-9]{6,16}$/.test(candidate)) return candidate;

  // Do not log the configured value: operators sometimes mistakenly paste
  // another token or credential into this environment variable.
  warn("[Analytics] Invalid VITE_GA4_MEASUREMENT_ID; using the public default GA4 ID instead.");
  return DEFAULT_GA4_MEASUREMENT_ID;
}
