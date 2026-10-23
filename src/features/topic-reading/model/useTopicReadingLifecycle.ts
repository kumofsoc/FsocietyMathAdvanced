import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useEffect,
} from "react";
import type { Topic } from "@/entities/course/model/types";
import {
  LEARNING_EVENT,
  loadReadingBlocks,
  loadReadingProgress,
  loadSet,
  markReadingBlock,
  SOLVED_KEY,
  THEORY_KEY,
} from "@/features/learning/model/learning";
import {
  loadTopicResume,
  saveTopicResume,
} from "@/features/learning/model/topicResume";
import { BLOCK_TARGET_KEY } from "@/features/topic-content/model/dependencyNavigation";
import { parseVisualMathHash } from "@/shared/lib/blockDeepLink";

type Params = {
  topic: Topic;
  tracksLearning: boolean;
  theorySentinel: RefObject<HTMLDivElement | null>;
  setActiveBlock: Dispatch<SetStateAction<number>>;
  setResumeBlockIndex: Dispatch<SetStateAction<number | null>>;
  setTheoryRead: Dispatch<SetStateAction<boolean>>;
  setReadingRatio: Dispatch<SetStateAction<number>>;
  setReadingBlocks: Dispatch<SetStateAction<Set<string>>>;
  setSolved: Dispatch<SetStateAction<Set<string>>>;
  setReachedTheoryEnd: Dispatch<SetStateAction<boolean>>;
};

export function initialTopicResumeBlock(topic: Topic) {
  const saved = loadTopicResume(topic.id);
  if (!saved || saved.blockIndex >= topic.blocks.length) return null;
  return saved.blockIndex;
}

export function useTopicReadingLifecycle({
  topic,
  tracksLearning,
  theorySentinel,
  setActiveBlock,
  setResumeBlockIndex,
  setTheoryRead,
  setReadingRatio,
  setReadingBlocks,
  setSolved,
  setReachedTheoryEnd,
}: Params) {
  useEffect(() => {
    let timer: number | null = null;

    const scrollToIndex = (
      index: number,
      behavior: ScrollBehavior = "smooth",
    ) => {
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= topic.blocks.length
      ) {
        return;
      }
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        document
          .getElementById("block-" + topic.id + "-" + index)
          ?.scrollIntoView({ behavior, block: "start" });
        timer = null;
      }, 140);
    };

    const applyHashTarget = () => {
      const parsed = parseVisualMathHash(window.location.hash);
      if (parsed.topicId !== topic.id || parsed.blockIndex === null) {
        return false;
      }
      scrollToIndex(parsed.blockIndex, "smooth");
      return true;
    };

    if (!applyHashTarget()) {
      const target = sessionStorage.getItem(BLOCK_TARGET_KEY);
      if (target) {
        const [targetTopic, rawIndex] = target.split("::");
        if (targetTopic === topic.id) {
          sessionStorage.removeItem(BLOCK_TARGET_KEY);
          scrollToIndex(Number(rawIndex), "smooth");
        }
      }
    }

    window.addEventListener("hashchange", applyHashTarget);
    return () => {
      window.removeEventListener("hashchange", applyHashTarget);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [topic.id, topic.blocks.length]);

  useEffect(() => {
    setActiveBlock(0);
    let observer: IntersectionObserver | null = null;
    let resumeTimer: number | null = null;
    let resumeCandidate = -1;

    const scheduleResumePersist = (index: number) => {
      if (index === resumeCandidate) return;
      resumeCandidate = index;

      if (resumeTimer !== null) {
        window.clearTimeout(resumeTimer);
      }

      resumeTimer = window.setTimeout(() => {
        resumeTimer = null;
        if (document.visibilityState !== "visible") return;
        if (
          resumeCandidate < 0 ||
          resumeCandidate >= topic.blocks.length
        ) {
          return;
        }

        if (saveTopicResume(topic.id, resumeCandidate)) {
          setResumeBlockIndex(resumeCandidate);
        }
      }, 1000);
    };

    const frame = requestAnimationFrame(() => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-topic-block="' + topic.id + '"]',
        ),
      );
      if (!nodes.length) return;

      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
              (a, b) =>
                Math.abs(a.boundingClientRect.top) -
                Math.abs(b.boundingClientRect.top),
            )[0];
          if (!visible) return;

          const index = Number(
            (visible.target as HTMLElement).dataset.blockIndex ?? "0",
          );
          setActiveBlock(index);
          scheduleResumePersist(index);
        },
        {
          rootMargin: "-18% 0px -64% 0px",
          threshold: [0, 0.05, 0.2],
        },
      );

      nodes.forEach((node) => observer?.observe(node));
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      if (resumeTimer !== null) {
        window.clearTimeout(resumeTimer);
      }
    };
  }, [topic.id, topic.blocks.length, setActiveBlock, setResumeBlockIndex]);

  useEffect(() => {
    const sync = () => {
      const complete = loadSet(THEORY_KEY).has(topic.id);
      setTheoryRead(complete);
      setReadingRatio(
        complete ? 1 : (loadReadingProgress()[topic.id] ?? 0),
      );
      setReadingBlocks(loadReadingBlocks());
      setSolved(loadSet(SOLVED_KEY));
    };
    sync();

    window.addEventListener(LEARNING_EVENT, sync);
    return () => window.removeEventListener(LEARNING_EVENT, sync);
  }, [
    topic.id,
    setReadingBlocks,
    setReadingRatio,
    setSolved,
    setTheoryRead,
  ]);

  useEffect(() => {
    if (!tracksLearning) return;

    const dwellTimers = new Map<Element, number>();
    let observer: IntersectionObserver | null = null;

    const cancelDwell = (target: Element) => {
      const timer = dwellTimers.get(target);
      if (timer !== undefined) {
        window.clearTimeout(timer);
        dwellTimers.delete(target);
      }
    };

    const frame = requestAnimationFrame(() => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-topic-block="' + topic.id + '"]',
        ),
      );
      if (!nodes.length) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const enoughVisible =
              entry.isIntersecting &&
              (entry.intersectionRatio >= 0.35 ||
                entry.intersectionRect.height >=
                  Math.min(320, window.innerHeight * 0.4));

            if (!enoughVisible) {
              cancelDwell(entry.target);
              return;
            }

            if (dwellTimers.has(entry.target)) return;

            const timer = window.setTimeout(() => {
              dwellTimers.delete(entry.target);
              if (document.visibilityState !== "visible") return;

              const index = Number(
                (entry.target as HTMLElement).dataset.blockIndex ?? "-1",
              );
              if (index < 0) return;

              const ratio = markReadingBlock(
                topic.id,
                index,
                topic.blocks.length,
              );
              setReadingRatio((current) => Math.max(current, ratio));
            }, 1200);

            dwellTimers.set(entry.target, timer);
          });
        },
        { threshold: [0.15, 0.35, 0.6] },
      );

      nodes.forEach((node) => observer?.observe(node));
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      dwellTimers.forEach((timer) => window.clearTimeout(timer));
      dwellTimers.clear();
    };
  }, [topic.id, topic.blocks.length, tracksLearning, setReadingRatio]);

  useEffect(() => {
    const target = theorySentinel.current;
    if (!tracksLearning || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReachedTheoryEnd(true);
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    topic.id,
    tracksLearning,
    theorySentinel,
    setReachedTheoryEnd,
  ]);
}
