import { describe, expect, it } from "vitest";
import type { Topic } from "@/entities/course/model/types";
import { toLayeredTopic } from "./adapter";
import type { LayeredTopicBlueprint } from "./types";

const topic: Topic = {
  id: "demo",
  number: "1",
  title: "Demo",
  chapterId: "chapter",
  summary: "demo",
  prerequisites: [],
  blocks: [
    { kind: "concepts", title: "Idea", body: "Understand first" },
    { kind: "definition", title: "Definition", body: "Formal" },
    { kind: "theorem", title: "Theorem", body: "Statement" },
    { kind: "proof", title: "Proof", body: "Reason" },
  ],
};

describe("learning architecture v2", () => {
  it("adapts legacy flat blocks into semantic layers with stable IDs", () => {
    const layered = toLayeredTopic({ topic });
    expect(layered.source).toBe("legacy-adapter");
    expect(layered.layers.map((layer) => layer.kind)).toEqual([
      "intuition",
      "formal",
      "theorem",
      "proof",
    ]);
    expect(layered.layers[0].units[0].id).toBe("demo::legacy::0");
  });

  it("lets a blueprint override placement without losing legacy content", () => {
    const blueprint: LayeredTopicBlueprint = {
      topicId: "demo",
      clarityGoal: "Understand it",
      learningGoals: ["Goal"],
      units: [
        {
          id: "demo::clarity",
          layer: "intuition",
          title: "Human explanation",
          legacyBlockIndex: 1,
        },
      ],
    };

    const layered = toLayeredTopic({ topic, blueprint });
    const allUnits = layered.layers.flatMap((layer) => layer.units);
    expect(layered.source).toBe("native-v2");
    expect(allUnits).toHaveLength(topic.blocks.length);
    expect(allUnits.find((unit) => unit.id === "demo::clarity")?.block?.title).toBe("Definition");
  });

  it("classifies practice by skill while allowing explicit overrides", () => {
    const layered = toLayeredTopic({
      topic,
      practiceTasks: [
        { id: "a", title: "A", prompt: "p", type: "number", answer: "1" },
        { id: "b", title: "B", prompt: "p", type: "proof", answer: "proof" },
      ],
      blueprint: {
        topicId: "demo",
        clarityGoal: "clear",
        learningGoals: [],
        practice: [{ taskId: "a", skill: "choose-method" }],
      },
    });

    expect(layered.practice).toEqual([
      { taskId: "a", skill: "choose-method" },
      { taskId: "b", skill: "prove" },
    ]);
  });
});
