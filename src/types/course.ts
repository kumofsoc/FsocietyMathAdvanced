export type BlockKind =
  | "definition"
  | "concepts"
  | "property"
  | "theorem"
  | "proof"
  | "corollary"
  | "formula"
  | "example"
  | "solution"
  | "note"
  | "algorithm"
  | "geometry"
  | "summary";

export interface ContentBlock {
  kind: BlockKind;
  title: string;
  body: string;
  formula?: string;
  items?: string[];
  dependsOn?: string[];
}

export interface Topic {
  id: string;
  number: string;
  title: string;
  chapterId: string;
  summary: string;
  prerequisites: string[];
  blocks: ContentBlock[];
  hasLab?: boolean;
}

export interface Chapter {
  id: string;
  number: string;
  title: string;
  topicIds: string[];
}

export interface GraphNodeData {
  label: string;
  number: string;
  chapter: string;
  summary: string;
  rotation: number;
  onOpen: (id: string) => void;
  onRotate: (id: string, delta: number) => void;
}
