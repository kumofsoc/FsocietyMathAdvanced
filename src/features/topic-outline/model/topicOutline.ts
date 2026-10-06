import type { ContentBlock } from "@/entities/course/model/types";

export type TopicOutlineKey =
  | "definition"
  | "properties"
  | "theorems"
  | "methods"
  | "examples"
  | "geometry"
  | "academy"
  | "summary";

export type TopicOutlineItem = {
  key: TopicOutlineKey;
  label: string;
  index: number;
  blockIndices: number[];
  seenCount: number;
  status: "unread" | "partial" | "complete";
};

const topicOutlineLabels: Record<TopicOutlineKey, string> = {
  definition: "Определение",
  properties: "Свойства",
  theorems: "Теоремы",
  methods: "Формулы и методы",
  examples: "Примеры",
  geometry: "Геометрия",
  academy: "Углублённо",
  summary: "Итог",
};

export function topicOutlineKey(block: ContentBlock): TopicOutlineKey {
  if (block.source === "academy") return "academy";

  switch (block.kind) {
    case "definition":
    case "concepts":
      return "definition";
    case "property":
      return "properties";
    case "theorem":
    case "proof":
    case "corollary":
      return "theorems";
    case "formula":
    case "algorithm":
    case "note":
      return "methods";
    case "example":
    case "solution":
      return "examples";
    case "geometry":
      return "geometry";
    case "summary":
      return "summary";
    default:
      return "methods";
  }
}

export function buildTopicOutline(
  blocks: ContentBlock[],
  topicId: string,
  readingBlocks: Set<string>,
): TopicOutlineItem[] {
  const groups = new Map<
    TopicOutlineKey,
    Omit<TopicOutlineItem, "seenCount" | "status">
  >();

  blocks.forEach((block, index) => {
    const key = topicOutlineKey(block);
    const existing = groups.get(key);

    if (existing) {
      existing.blockIndices.push(index);
      return;
    }

    groups.set(key, {
      key,
      label: topicOutlineLabels[key],
      index,
      blockIndices: [index],
    });
  });

  return [...groups.values()].map((item) => {
    const seenCount = item.blockIndices.filter((index) =>
      readingBlocks.has(topicId + "::" + index),
    ).length;

    const status: TopicOutlineItem["status"] =
      seenCount === 0
        ? "unread"
        : seenCount === item.blockIndices.length
          ? "complete"
          : "partial";

    return {
      ...item,
      seenCount,
      status,
    };
  });
}
