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

export function buildCourseMapGraph(_input: BuildCourseMapGraphInput): CourseMapGraphModel {
  return { nodes: [], edges: [] };
}
