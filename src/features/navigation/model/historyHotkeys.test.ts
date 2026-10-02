import { describe, expect, it } from "vitest";
import { getHistoryHotkeyDirection } from "./historyHotkeys";

function key(input: Partial<KeyboardEvent>) {
  return {
    key: "z",
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    target: null,
    ...input,
  } as KeyboardEvent;
}

describe("navigation history hotkeys", () => {
  it("maps Ctrl/Cmd+Z to back and Shift+Z to forward", () => {
    expect(getHistoryHotkeyDirection(key({ ctrlKey: true }))).toBe(-1);
    expect(getHistoryHotkeyDirection(key({ metaKey: true, shiftKey: true }))).toBe(1);
  });

  it("ignores unrelated shortcuts", () => {
    expect(getHistoryHotkeyDirection(key({ ctrlKey: true, key: "x" }))).toBe(0);
    expect(getHistoryHotkeyDirection(key({ key: "z" }))).toBe(0);
    expect(getHistoryHotkeyDirection(key({ ctrlKey: true, altKey: true }))).toBe(0);
  });
});
