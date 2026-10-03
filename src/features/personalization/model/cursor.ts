export const CURSOR_KEY = "fsociety-cursor-style-v1";
export const CURSOR_EVENT = "fsociety-cursor-change";

export type CursorMode = "native" | "halo" | "minimal" | "crosshair" | "comet";

export function parseCursorMode(value: string | null): CursorMode {
  return value === "native" ||
    value === "halo" ||
    value === "minimal" ||
    value === "crosshair" ||
    value === "comet"
    ? value
    : "halo";
}
