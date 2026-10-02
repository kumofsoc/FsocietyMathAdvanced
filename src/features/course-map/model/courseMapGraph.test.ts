import { describe, expect, it } from "vitest";
import {
  buildCourseMapGraph,
  type CourseMapChapter,
  type CourseMapTopic,
} from "./courseMapGraph";

const chapters: CourseMapChapter[] = [
  { id: "foundation", number: "01", title: "Foundation", topicIds: ["sets", "functions", "limits"] },
  { id: "analysis", number: "02", title: "Analysis", topicIds: ["derivative"] },
];

const topics: Record<string, CourseMapTopic> = {
  sets: {
    id: "sets",
    number: "1",
    title: "Sets",
    chapterId: "foundation",
    prerequisites: [],
  },
  functions: {
    id: "functions",
    number: "2",
    title: "Functions",
    chapterId: "foundation",
    prerequisites: ["sets"],
  },
  limits: {
    id: "limits",
    number: "3",
    title: "Limits",
    chapterId: "foundation",
    prerequisites: [],
  },
  derivative: {
    id: "derivative",
    number: "4",
    title: "Derivative",
    chapterId: "analysis",
    prerequisites: ["limits", "functions"],
  },
};

const common = {
  chapters,
  topics,
  chapterProgress: () => 25,
  topicProgress: () => 50,
};

describe("buildCourseMapGraph", () => {
  it("aggregates cross-chapter prerequisites into one overview edge", () => {
    const graph = buildCourseMapGraph({ ...common, mode: { kind: "overview" } });

    expect(graph.nodes.map((node) => node.id)).toEqual([
      "chapter:foundation",
      "chapter:analysis",
    ]);
    expect(graph.edges).toEqual([
      expect.objectContaining({
        source: "chapter:foundation",
        target: "chapter:analysis",
        kind: "prerequisite",
      }),
    ]);
  });

  it("keeps chapter edges inside the visible topic set and adds study flow without duplicating prerequisites", () => {
    const graph = buildCourseMapGraph({
      ...common,
      mode: { kind: "chapter", chapterId: "foundation" },
    });

    expect(graph.nodes.map((node) => node.id)).toEqual(["sets", "functions", "limits"]);
    expect(graph.edges).toContainEqual(
      expect.objectContaining({ source: "sets", target: "functions", kind: "prerequisite" }),
    );
    expect(graph.edges).toContainEqual(
      expect.objectContaining({ source: "functions", target: "limits", kind: "study-flow" }),
    );
    expect(graph.edges.some((edge) => edge.target === "derivative")).toBe(false);
  });

  it("never emits an edge whose endpoint is missing from the model", () => {
    for (const mode of [
      { kind: "overview" } as const,
      { kind: "chapter", chapterId: "foundation" } as const,
    ]) {
      const graph = buildCourseMapGraph({ ...common, mode });
      const ids = new Set(graph.nodes.map((node) => node.id));
      expect(graph.edges.every((edge) => ids.has(edge.source) && ids.has(edge.target))).toBe(true);
    }
  });
});
