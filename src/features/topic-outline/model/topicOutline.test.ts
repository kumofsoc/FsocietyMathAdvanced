import { describe, expect, it } from "vitest";
import type { ContentBlock } from "@/entities/course/model/types";
import {
  buildTopicOutline,
  topicOutlineKey,
} from "@/features/topic-outline/model/topicOutline";

function block(
  kind: ContentBlock["kind"],
  source?: ContentBlock["source"],
): ContentBlock {
  return {
    id: "block-" + kind + "-" + (source ?? "default"),
    kind,
    title: kind,
    body: "",
    source,
  } as ContentBlock;
}

describe("topic outline", () => {
  it("groups semantic block kinds while keeping the first block index", () => {
    const blocks = [
      block("definition"),
      block("property"),
      block("theorem"),
      block("proof"),
      block("example"),
    ];

    const outline = buildTopicOutline(
      blocks,
      "rank",
      new Set(["rank::2"]),
    );

    expect(outline.map((item) => [item.key, item.index])).toEqual([
      ["definition", 0],
      ["properties", 1],
      ["theorems", 2],
      ["examples", 4],
    ]);
    expect(outline[2]).toMatchObject({
      seenCount: 1,
      status: "partial",
      blockIndices: [2, 3],
    });
  });

  it("marks academy source independently of the base block kind", () => {
    expect(topicOutlineKey(block("definition", "academy"))).toBe("academy");
  });

  it("derives unread and complete status from exact reading blocks", () => {
    const blocks = [block("formula"), block("algorithm")];

    expect(buildTopicOutline(blocks, "det", new Set())[0]?.status).toBe(
      "unread",
    );
    expect(
      buildTopicOutline(
        blocks,
        "det",
        new Set(["det::0", "det::1"]),
      )[0]?.status,
    ).toBe("complete");
  });
});
