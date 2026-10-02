import { describe, expect, it } from "vitest";
import {
  disciplines,
  getCoursesForDiscipline,
  getDisciplinesForDomain,
  knowledgeDomains,
} from "./disciplines";

describe("science platform catalog", () => {
  it("groups mathematics and planned physics under one fundamental-sciences domain", () => {
    expect(knowledgeDomains.map((item) => item.id)).toContain("fundamental-sciences");
    expect(getDisciplinesForDomain("fundamental-sciences").map((item) => item.id)).toEqual([
      "mathematics",
      "physics",
    ]);
  });
  it("keeps mathematics active and physics planned without exposing fake content", () => {
    expect(disciplines.find((item) => item.id === "mathematics")?.status).toBe("active");
    expect(disciplines.find((item) => item.id === "physics")?.status).toBe("planned");
  });

  it("associates courses with disciplines", () => {
    expect(getCoursesForDiscipline("mathematics").map((course) => course.id)).toContain("higher-mathematics");
    expect(getCoursesForDiscipline("physics")).toEqual([]);
  });
});
