import { describe, expect, it } from "vitest";
import { validateCourseIntegrity } from "./courseIntegrity";

describe("course integrity", () => {
  it("keeps the published course graph, practice bank, metadata and search index consistent", () => {
    expect(validateCourseIntegrity()).toEqual([]);
  });
});
