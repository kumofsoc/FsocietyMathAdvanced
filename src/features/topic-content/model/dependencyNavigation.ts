import type { CourseSearchEntry } from "@/data/courseSearchIndex";
import { parseVisualMathHash } from "@/shared/lib/blockDeepLink";

export const BLOCK_TARGET_KEY = "fsociety-block-target-v1";

function dependencyTarget(
  dependency: string,
  courseSearchIndex: CourseSearchEntry[],
) {
  const marker = dependency
    .toLowerCase()
    .match(/(теорема|свойство)\s*(\d+(?:\.\d+)?)/);
  const clean = dependency
    .toLowerCase()
    .replace(/определителей/g, "")
    .replace(/\s+/g, " ")
    .trim();

  for (const candidate of courseSearchIndex) {
    const title = candidate.title.toLowerCase();
    if (title.includes(clean) || clean.includes(title)) {
      return {
        topicId: candidate.topicId,
        index: candidate.index,
        title: candidate.title,
      };
    }
    if (marker && title.includes(marker[1]) && title.includes(marker[2])) {
      return {
        topicId: candidate.topicId,
        index: candidate.index,
        title: candidate.title,
      };
    }
  }

  return null;
}

function openBlock(topicId: string, index: number) {
  const id = "block-" + topicId + "-" + index;
  if (parseVisualMathHash(window.location.hash).route === topicId) {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  sessionStorage.setItem(BLOCK_TARGET_KEY, topicId + "::" + index);
  window.location.hash = topicId;
}

export async function openDependency(dependency: string) {
  try {
    const { courseSearchIndex } = await import("@/data/courseSearchIndex");
    const target = dependencyTarget(dependency, courseSearchIndex);
    if (!target) {
      console.warn("[VisualMath] dependency target not found", dependency);
      return;
    }
    openBlock(target.topicId, target.index);
  } catch (error) {
    console.warn("[VisualMath] dependency index failed to load", error);
  }
}
