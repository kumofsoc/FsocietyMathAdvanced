import { describe, expect, it } from "vitest";
import { disciplines, getCoursesForDiscipline } from "./disciplines";

describe("science platform catalog", () => {
  it("keeps mathematics active and physics planned without exposing fake content", () => {
    expect(disciplines.find((item) => item.id === "mathematics")?.status).toBe("active");
    expect(disciplines.find((item) => item.id === "physics")?.status).toBe("planned");
  });

  it("associates courses with disciplines", () => {
    expect(getCoursesForDiscipline("mathematics").map((course) => course.id)).toContain("higher-mathematics");
    expect(getCoursesForDiscipline("physics")).toEqual([]);
  });
});
