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

export interface PropertyCorollary {
  label: string;
  body: string;
  formula?: string;
}

export interface RigorousStatementExample {
  title?: string;
  body: string;
  formula?: string;
}

export interface RigorousStatement {
  id: string;
  claim: string;
  conditions?: string;
  proof: PropertyProof;
  example: RigorousStatementExample;
  withoutConditions?: string;
}

export interface MatrixOperationVisual {
  before: string;
  after: string;
  operation: string;
  explanation: string;
  beforeHighlightRows?: number[];
  afterHighlightRows?: number[];
}

export interface ContentBlock {
  kind: BlockKind;
  title: string;
  body: string;
  formula?: string;
  items?: string[];
  proofs?: PropertyProof[];
  workedExamples?: RigorousStatementExample[];
  corollaries?: PropertyCorollary[];
  statements?: RigorousStatement[];
  matrixOperation?: MatrixOperationVisual;
  dependsOn?: string[];
}

export interface PracticeTask {
  id: string;
  title: string;
  prompt: string;
  type: "number" | "choice" | "text" | "proof";
  answer: string;
  options?: string[];
  hint?: string;
  solution?: string;
  rubric?: string[];
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

export interface KnowledgeDomain {
  id: string;
  title: string;
  description: string;
  disciplineIds: string[];
}

export interface Discipline {
  id: string;
  domainId: string;
  title: string;
  description: string;
  chapterIds: string[];
}

export interface Chapter {
  id: string;
  number: string;
  title: string;
  topicIds: string[];
  disciplineId?: string;
}
