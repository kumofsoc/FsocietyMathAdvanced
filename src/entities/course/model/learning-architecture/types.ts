import type { ContentBlock, PracticeTask, Topic } from "@/entities/course/model/types";

export type LearningLayerKind =
  | "intuition"
  | "notation"
  | "formal"
  | "properties"
  | "theorem"
  | "proof"
  | "example"
  | "counterexample"
  | "visualization"
  | "connection"
  | "application"
  | "history"
  | "extension"
  | "research";

export type PracticeSkillKind =
  | "recall-definition"
  | "recognize-object"
  | "compute"
  | "choose-method"
  | "explain"
  | "construct-example"
  | "construct-counterexample"
  | "prove"
  | "repair-proof"
  | "mixed"
  | "challenge"
  | "research";

export interface LearningUnit {
  id: string;
  layer: LearningLayerKind;
  title: string;
  summary?: string;
  legacyBlockIndex?: number;
  block?: ContentBlock;
  dependsOn?: string[];
  optional?: boolean;
}

export interface LearningLayer {
  id: string;
  kind: LearningLayerKind;
  title: string;
  purpose: string;
  units: LearningUnit[];
}

export interface PracticeUnit {
  taskId: string;
  skill: PracticeSkillKind;
  optional?: boolean;
}

export interface LayeredTopicBlueprint {
  topicId: string;
  clarityGoal: string;
  learningGoals: string[];
  layerOrder?: LearningLayerKind[];
  units?: Array<Omit<LearningUnit, "id"> & { id?: string }>;
  practice?: PracticeUnit[];
}

export interface LayeredTopic {
  topic: Topic;
  clarityGoal: string;
  learningGoals: string[];
  layers: LearningLayer[];
  practice: PracticeUnit[];
  source: "native-v2" | "legacy-adapter";
}

export interface LayeredTopicInput {
  topic: Topic;
  blueprint?: LayeredTopicBlueprint;
  practiceTasks?: PracticeTask[];
}
