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

export interface PropertyProof {
  label: string;
  body: string;
  formula?: string;
}

export interface ContentBlock {
  kind: BlockKind;
  title: string;
  body: string;
  formula?: string;
  items?: string[];
  proofs?: PropertyProof[];
  dependsOn?: string[];
}

export interface PracticeTask {
  id: string;
  title: string;
  prompt: string;
  type: "number" | "choice" | "text";
  answer: string;
  options?: string[];
  hint?: string;
  difficulty?: "base" | "medium" | "hard";
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
  scale?: number;
  progress?: number;
  onOpen: (id: string) => void;
  onRotate: (id: string, delta: number) => void;
  onScale?: (id: string, scale: number) => void;
}
