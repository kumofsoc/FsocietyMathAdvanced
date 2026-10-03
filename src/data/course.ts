// Compatibility facade.
//
// The course is intentionally split into chapter/topic modules under ./course.
// Keep this file as the stable public import path so feature code can continue
// importing from "@/data/course" while the curriculum grows independently.
export { chapters, topics, topicList } from "./course/index";
