import { describe, expect, it } from "vitest";
import { validateCourseIntegrity } from "./courseIntegrity";

describe("course integrity", () => {
  it("has no broken references or stale generated metadata", () => {
    expect(validateCourseIntegrity()).toEqual([]);
  });
});
