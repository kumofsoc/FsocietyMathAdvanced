import { chapters } from "./chapters";
import { enrichCourseTopics } from "./enrichments";
import { baseTopics } from "./topics";

export { chapters };

export const topics = enrichCourseTopics(baseTopics);
export const topicList = Object.values(topics);
