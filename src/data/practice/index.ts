import { enrichPracticeRegistry } from "./enrichments";
import { basePracticeByTopic } from "./topics";

export const practiceByTopic = enrichPracticeRegistry(basePracticeByTopic);
