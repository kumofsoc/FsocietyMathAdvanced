import { describe, expect, it } from "vitest";

function isPristineWorkspace(input: {
  savedTopicIds: string[];
  topicResume: Record<string, unknown>;
  readingWidth: string;
}) {
  return (
    input.savedTopicIds.length === 0 &&
    Object.keys(input.topicResume).length === 0 &&
    input.readingWidth === "normal"
  );
}

describe("user state migration policy", () => {
  it("recognizes the backend's default workspace as pristine", () => {
    expect(
      isPristineWorkspace({
        savedTopicIds: [],
        topicResume: {},
        readingWidth: "normal",
      }),
    ).toBe(true);
  });

  it("does not call an existing server workspace pristine", () => {
    expect(
      isPristineWorkspace({
        savedTopicIds: ["matrices"],
        topicResume: {},
        readingWidth: "normal",
      }),
    ).toBe(false);
  });
});
