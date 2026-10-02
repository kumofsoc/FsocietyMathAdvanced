export type CourseMapMode =
  | { kind: "overview" }
  | { kind: "chapter"; chapterId: string };

export interface CourseMapChapter {
  id: string;
  number: string;
  title: string;
  topicIds: string[];
}

export interface CourseMapTopic {
  id: string;
  number: string;
  title: string;
  chapterId: string;
  prerequisites: string[];
  isStub?: boolean;
}

export interface CourseMapGraphNode {
  id: string;
  entityId: string;
  kind: "chapter" | "topic";
  title: string;
  kicker: string;
  meta: string;
  progress: number;
}

export interface CourseMapGraphEdge {
  id: string;
  source: string;
  target: string;
  kind: "prerequisite" | "study-flow";
}

export interface CourseMapGraphModel {
  nodes: CourseMapGraphNode[];
  edges: CourseMapGraphEdge[];
}

export interface BuildCourseMapGraphInput {
  mode: CourseMapMode;
  chapters: CourseMapChapter[];
  topics: Record<string, CourseMapTopic>;
  chapterProgress: (chapterId: string) => number;
  topicProgress: (topicId: string) => number;
}

function edgeKey(source: string, target: string) {
  return source + "->" + target;
}

function hasPath(
  edges: CourseMapGraphEdge[],
  start: string,
  goal: string,
) {
  const outgoing = new Map<string, string[]>();
  edges.forEach((edge) => {
    const list = outgoing.get(edge.source) ?? [];
    list.push(edge.target);
    outgoing.set(edge.source, list);
  });

  const stack = [start];
  const visited = new Set<string>();

  while (stack.length) {
    const current = stack.pop()!;
    if (current === goal) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    (outgoing.get(current) ?? []).forEach((target) => {
      if (!visited.has(target)) stack.push(target);
    });
  }

  return false;
}

function buildOverviewGraph(input: BuildCourseMapGraphInput): CourseMapGraphModel {
  const chapterById = new Map(input.chapters.map((chapter) => [chapter.id, chapter]));
  const nodes: CourseMapGraphNode[] = input.chapters.map((chapter) => {
    const readyCount = chapter.topicIds.filter((id) => !input.topics[id]?.isStub).length;
    return {
      id: "chapter:" + chapter.id,
      entityId: chapter.id,
      kind: "chapter",
      title: chapter.title,
      kicker: "CHAPTER " + chapter.number,
      meta: readyCount + "/" + chapter.topicIds.length + " ready",
      progress: input.chapterProgress(chapter.id),
    };
  });

  const seen = new Set<string>();
  const edges: CourseMapGraphEdge[] = [];

  Object.values(input.topics).forEach((topic) => {
    if (!chapterById.has(topic.chapterId)) return;

    topic.prerequisites.forEach((prerequisiteId) => {
      const prerequisite = input.topics[prerequisiteId];
      if (!prerequisite || prerequisite.chapterId === topic.chapterId) return;
      if (!chapterById.has(prerequisite.chapterId)) return;

      const source = "chapter:" + prerequisite.chapterId;
      const target = "chapter:" + topic.chapterId;
      const key = edgeKey(source, target);
      if (seen.has(key)) return;

      seen.add(key);
      edges.push({
        id: "pre:" + key,
        source,
        target,
        kind: "prerequisite",
      });
    });
  });

  return { nodes, edges };
}

function buildChapterGraph(input: BuildCourseMapGraphInput): CourseMapGraphModel {
  const chapter = input.chapters.find((item) => item.id === input.mode.chapterId);
  if (!chapter) return { nodes: [], edges: [] };

  const visible = new Set(chapter.topicIds.filter((id) => Boolean(input.topics[id])));

  const nodes: CourseMapGraphNode[] = chapter.topicIds
    .map((topicId) => input.topics[topicId])
    .filter((topic): topic is CourseMapTopic => Boolean(topic))
    .map((topic) => ({
      id: topic.id,
      entityId: topic.id,
      kind: "topic",
      title: topic.title,
      kicker: "§ " + topic.number,
      meta:
        topic.prerequisites.filter((id) => visible.has(id)).length +
        " prerequisite",
      progress: input.topicProgress(topic.id),
    }));

  const seen = new Set<string>();
  const edges: CourseMapGraphEdge[] = [];

  chapter.topicIds.forEach((target) => {
    const topic = input.topics[target];
    if (!topic) return;

    topic.prerequisites.forEach((source) => {
      if (!visible.has(source) || source === target) return;
      const key = edgeKey(source, target);
      if (seen.has(key)) return;

      seen.add(key);
      edges.push({
        id: "pre:" + key,
        source,
        target,
        kind: "prerequisite",
      });
    });
  });

  const orderedIds = chapter.topicIds.filter((id) => visible.has(id));
  for (let index = 1; index < orderedIds.length; index += 1) {
    const source = orderedIds[index - 1];
    const target = orderedIds[index];
    const key = edgeKey(source, target);

    if (seen.has(key)) continue;
    if (hasPath(edges, target, source)) continue;

    seen.add(key);
    edges.push({
      id: "flow:" + key,
      source,
      target,
      kind: "study-flow",
    });
  }

  return { nodes, edges };
}

export function buildCourseMapGraph(input: BuildCourseMapGraphInput): CourseMapGraphModel {
  return input.mode.kind === "overview"
    ? buildOverviewGraph(input)
    : buildChapterGraph(input);
}
