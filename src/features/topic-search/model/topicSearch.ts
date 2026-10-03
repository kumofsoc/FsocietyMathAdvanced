import type { BlockKind, ContentBlock, Topic } from "@/entities/course/model/types";

export const topicSearchKindLabels: Record<BlockKind, string> = {
  definition: "ОПРЕДЕЛЕНИЕ",
  concepts: "ОСНОВНЫЕ ПОНЯТИЯ",
  property: "СВОЙСТВО",
  theorem: "ТЕОРЕМА",
  proof: "ДОКАЗАТЕЛЬСТВО",
  corollary: "СЛЕДСТВИЕ",
  formula: "ФОРМУЛА",
  example: "ПРИМЕР",
  solution: "РЕШЕНИЕ",
  note: "ЗАМЕТКА",
  algorithm: "АЛГОРИТМ",
  geometry: "ГЕОМЕТРИЯ",
  summary: "ИТОГ",
};

export type TopicLocalSearchResult = {
  index: number;
  kind: BlockKind;
  title: string;
  snippet: string;
  score: number;
};

export function normalizeTopicSearchText(value: string) {
  return value
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е")
    .replace(/[{}$\\^_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nestedSearchText(block: ContentBlock) {
  return [
    ...(block.items ?? []),
    ...(block.dependsOn ?? []),
    ...(block.proofs ?? []).flatMap((item) => [
      item.label,
      item.body,
      item.formula ?? "",
    ]),
    ...(block.corollaries ?? []).flatMap((item) => [
      item.label,
      item.body,
      item.formula ?? "",
    ]),
    ...(block.workedExamples ?? []).flatMap((item) => [
      item.title ?? "",
      item.body,
      item.formula ?? "",
    ]),
    ...(block.statements ?? []).flatMap((item) => [
      item.claim,
      item.conditions ?? "",
      item.proof.label,
      item.proof.body,
      item.proof.formula ?? "",
      item.example.title ?? "",
      item.example.body,
      item.example.formula ?? "",
      item.withoutConditions ?? "",
    ]),
    block.matrixOperation?.before ?? "",
    block.matrixOperation?.after ?? "",
    block.matrixOperation?.operation ?? "",
    block.matrixOperation?.explanation ?? "",
  ].join(" ");
}

function resultSnippet(block: ContentBlock, needle: string) {
  const sources = [
    block.body,
    ...(block.items ?? []),
    ...(block.proofs ?? []).map((item) => item.body),
    ...(block.corollaries ?? []).map((item) => item.body),
    ...(block.workedExamples ?? []).map((item) => item.body),
    ...(block.statements ?? []).flatMap((item) => [
      item.claim,
      item.proof.body,
      item.example.body,
    ]),
  ].filter(Boolean);

  const matched =
    sources.find((source) =>
      normalizeTopicSearchText(source).includes(needle),
    ) ?? block.body;

  const clean = matched.replace(/\s+/g, " ").trim();
  if (clean.length <= 150) return clean;
  return clean.slice(0, 147).trimEnd() + "…";
}

export function searchTopicBlocks(
  topic: Pick<Topic, "blocks">,
  query: string,
  limit = 10,
): TopicLocalSearchResult[] {
  const needle = normalizeTopicSearchText(query);
  if (needle.length < 2) return [];

  return topic.blocks
    .map((block, index) => {
      const title = normalizeTopicSearchText(block.title);
      const kind = normalizeTopicSearchText(topicSearchKindLabels[block.kind]);
      const body = normalizeTopicSearchText(block.body);
      const formula = normalizeTopicSearchText(block.formula ?? "");
      const nested = normalizeTopicSearchText(nestedSearchText(block));

      let score = 0;
      if (title === needle) score = 30;
      else if (title.startsWith(needle)) score = 26;
      else if (title.includes(needle)) score = 22;
      else if (kind === needle || kind.startsWith(needle)) score = 18;
      else if (kind.includes(needle)) score = 16;
      else if (body.includes(needle)) score = 12;
      else if (formula.includes(needle)) score = 11;
      else if (nested.includes(needle)) score = 9;

      if (!score) return null;

      if (block.source === "core") score += 1;
      if (block.kind === "definition" || block.kind === "theorem") score += 1;

      return {
        index,
        kind: block.kind,
        title: block.title,
        snippet: resultSnippet(block, needle),
        score,
      };
    })
    .filter((item): item is TopicLocalSearchResult => item !== null)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit);
}
