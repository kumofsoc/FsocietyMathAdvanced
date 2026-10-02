import { describe, expect, it } from "vitest";
import { practiceTaskIdsByTopic } from "@/data/practiceMeta";
import {
  getTopicProgress,
  getTopicProgressBreakdown,
  type LearningSnapshot,
} from "./progress";

function snapshot(input?: Partial<LearningSnapshot>): LearningSnapshot {
  return {
    theory: new Set(),
    solved: new Set(),
    reading: {},
    ...input,
  };
}

describe("topic mastery progress", () => {
  it("does not award half the topic just for scrolling through part of the theory", () => {
    const state = snapshot({ reading: { matrices: 0.5 } });
    const breakdown = getTopicProgressBreakdown("matrices", state);

    expect(breakdown.reading).toBe(18);
    expect(breakdown.theoryCheckpoint).toBe(0);
    expect(breakdown.practice).toBe(0);
    expect(breakdown.total).toBe(18);
    expect(breakdown.canCompleteTheory).toBe(false);
  });

  it("unlocks the theory checkpoint only after meaningful reading coverage", () => {
    expect(
      getTopicProgressBreakdown(
        "matrices",
        snapshot({ reading: { matrices: 0.74 } }),
      ).canCompleteTheory,
    ).toBe(false);

    expect(
      getTopicProgressBreakdown(
        "matrices",
        snapshot({ reading: { matrices: 0.75 } }),
      ).canCompleteTheory,
    ).toBe(true);
  });

  it("awards fifty percent only after reading plus an explicit theory checkpoint", () => {
    const state = snapshot({
      reading: { matrices: 1 },
      theory: new Set(["matrices"]),
    });

    const breakdown = getTopicProgressBreakdown("matrices", state);
    expect(breakdown.reading).toBe(35);
    expect(breakdown.theoryCheckpoint).toBe(15);
    expect(breakdown.total).toBe(50);
  });

  it("reaches one hundred only after theory and all practice tasks are completed", () => {
    const taskIds = practiceTaskIdsByTopic.matrices;
    const state = snapshot({
      reading: { matrices: 1 },
      theory: new Set(["matrices"]),
      solved: new Set(taskIds),
    });

    expect(getTopicProgress("matrices", state)).toBe(100);
    expect(getTopicProgressBreakdown("matrices", state).stage).toBe("mastered");
  });

  it("preserves legacy theory completion as fully read theory", () => {
    const state = snapshot({
      theory: new Set(["matrices"]),
    });

    const breakdown = getTopicProgressBreakdown("matrices", state);
    expect(breakdown.readingRatio).toBe(1);
    expect(breakdown.total).toBe(50);
  });
});
