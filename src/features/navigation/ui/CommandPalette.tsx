import { AnimatePresence, motion } from "framer-motion";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { setSessionStorageItem } from "@/shared/lib/browserStorage";
import { chapters, topicListMeta, topicMeta } from "@/data/courseMeta";
import type { CourseSearchEntry } from "@/data/courseSearchIndex";
import { getLearningSnapshot, getTopicProgress } from "@/lib/progress";

const BLOCK_TARGET_KEY = "fsociety-block-target-v1";

const kindLabels: Record<string, string> = {
  definition: "ОПРЕДЕЛЕНИЕ",
  concepts: "ПОНЯТИЯ",
  property: "СВОЙСТВО",
  theorem: "ТЕОРЕМА",
  proof: "ДОКАЗАТЕЛЬСТВО",
  corollary: "СЛЕДСТВИЕ",
  formula: "ФОРМУЛА",
  example: "ПРИМЕР",
  solution: "РЕШЕНИЕ",
  note: "ЗАМЕТКА",
  algorithm: "АЛГОРИТМ",
  geometry: "ГЕОМЕТРИЯ",
  summary: "ИТОГ",
};

function searchableText(value: string) {
  return value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е");
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [deepIndex, setDeepIndex] = useState<CourseSearchEntry[]>([]);
  const [deepIndexReady, setDeepIndexReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
      return;
    }
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open || deepIndexReady) return;

    let cancelled = false;
    void import("@/data/courseSearchIndex")
      .then((module) => {
        if (cancelled) return;
        setDeepIndex(module.courseSearchIndex);
        setDeepIndexReady(true);
      })
      .catch((error) => {
        console.warn("[VisualMath] deep search index failed to load", error);
        if (!cancelled) setDeepIndexReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [open, deepIndexReady]);

  const results = useMemo(() => {
    const needle = searchableText(query.trim());
    const snapshot = getLearningSnapshot();

    const topicResults = topicListMeta
      .map((topic) => {
        const chapter = chapters.find((item) => item.id === topic.chapterId);
        const haystack = searchableText(
          [topic.title, topic.summary, topic.number, chapter?.title ?? ""].join(" "),
        );

        let score = 0;
        if (!needle) {
          score = topic.isStub
            ? 0.5
            : getTopicProgress(topic.id, snapshot) > 0
              ? 3
              : 2;
        } else if (searchableText(topic.title).startsWith(needle)) score = 12;
        else if (searchableText(topic.title).includes(needle)) score = 10;
        else if (searchableText(chapter?.title ?? "").includes(needle)) score = 6;
        else if (haystack.includes(needle)) score = 4;

        return {
          type: "topic" as const,
          topic,
          chapter,
          progress: getTopicProgress(topic.id, snapshot),
          score,
        };
      })
      .filter((item) => item.score > 0);

    const blockResults = needle
      ? deepIndex
          .map((entry) => {
            const topic = topicMeta[entry.topicId];
            const chapter = topic
              ? chapters.find((item) => item.id === topic.chapterId)
              : undefined;
            if (!topic || topic.isStub) return null;

            const title = searchableText(entry.title);
            const kind = searchableText(kindLabels[entry.kind] ?? entry.kind);
            let score = 0;
            if (title.startsWith(needle)) score = 11;
            else if (title.includes(needle)) score = 9;
            else if (kind.includes(needle)) score = 5;
            else if (
              searchableText(topic.title + " " + (chapter?.title ?? "")).includes(needle)
            ) {
              score = 2;
            }

            if (!score) return null;
            return {
              type: "block" as const,
              topic,
              chapter,
              progress: getTopicProgress(topic.id, snapshot),
              score,
              blockIndex: entry.index,
              blockTitle: entry.title,
              kind: entry.kind,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)
      : [];

    return [...topicResults, ...blockResults]
      .sort((a, b) => b.score - a.score || b.progress - a.progress)
      .slice(0, 14);
  }, [query, deepIndex]);

  const openTopic = (id: string, blockIndex?: number) => {
    const current = window.location.hash.replace(/^#/, "");

    if (typeof blockIndex === "number" && current === id) {
      document
        .getElementById("block-" + id + "-" + blockIndex)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
      return;
    }

    if (typeof blockIndex === "number") {
      try {
        setSessionStorageItem(BLOCK_TARGET_KEY, id + "::" + blockIndex);
      } catch {
        // Deep-linking still works without persisted block state.
      }
    }

    window.location.hash = id;
    setOpen(false);
  };

  const onSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected = results[Math.min(activeIndex, results.length - 1)];
      openTopic(
        selected.topic.id,
        selected.type === "block" ? selected.blockIndex : undefined,
      );
    }
  };

  return (
    <>
      <button className="command-trigger" onClick={() => setOpen(true)} data-cursor="active">
        <span>⌕</span>
        <strong>Поиск</strong>
        <kbd>Ctrl K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="command-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setOpen(false)}
          >
            <motion.section
              className="command-palette"
              initial={{ opacity: 0, y: -12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Поиск по курсу"
            >
              <header className="command-search">
                <span>⌕</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Тема, теорема, свойство, доказательство, интеграл..."
                  aria-label="Поиск по курсу"
                />
                <kbd>ESC</kbd>
              </header>

              <div className="command-meta">
                <span>{query ? "Результаты" : "Быстрый переход"}</span>
                <small>
                  {results.length} найдено
                  {open && !deepIndexReady ? " · индексируется…" : ""}
                </small>
              </div>

              <div className="command-results">
                {results.length ? results.map((result, index) => {
                  const { topic, chapter, progress } = result;
                  const isBlock = result.type === "block";
                  const resultKey = isBlock
                    ? topic.id + "::" + result.blockIndex
                    : topic.id;

                  return (
                    <button
                      key={resultKey}
                      className={
                        (activeIndex === index ? "active " : "") +
                        (topic.isStub ? "planned " : "") +
                        (isBlock ? "block-result" : "")
                      }
                      onMouseEnter={() => {
                        setActiveIndex(index);
                        if (!topic.isStub) void import("@/pages/topic/TopicPage");
                      }}
                      onFocus={() => {
                        if (!topic.isStub) void import("@/pages/topic/TopicPage");
                      }}
                      onClick={() =>
                        openTopic(topic.id, isBlock ? result.blockIndex : undefined)
                      }
                    >
                      <span className="command-result-number">
                        {isBlock
                          ? kindLabels[result.kind] ?? result.kind.toUpperCase()
                          : "§ " + topic.number}
                      </span>
                      <span className="command-result-copy">
                        <strong>{isBlock ? result.blockTitle : topic.title}</strong>
                        <small>
                          {isBlock
                            ? "§ " + topic.number + " · " + topic.title + " · " + (chapter?.title ?? "")
                            : (chapter?.title ?? "") + " · " + topic.summary}
                        </small>
                      </span>
                      {topic.isStub ? (
                        <span className="command-result-plan">PLANNED</span>
                      ) : (
                        <span className="command-result-progress">
                          <i><span style={{ width: progress + "%" }} /></i>
                          <b>{progress}%</b>
                        </span>
                      )}
                    </button>
                  );
                }) : (
                  <div className="command-empty">
                    Ничего не найдено. Попробуй название темы или математический термин.
                  </div>
                )}
              </div>

              <footer className="command-footer">
                <button onClick={() => { window.location.hash = "map"; setOpen(false); }}>
                  ◫ Карта курса
                </button>
                <button onClick={() => { window.location.hash = "academy"; setOpen(false); }}>
                  λ Linear Academy
                </button>
                <button onClick={() => { window.location.hash = "review"; setOpen(false); }}>
                  ≡ Краткий конспект
                </button>
                <button onClick={() => { window.location.hash = "home"; setOpen(false); }}>
                  ∑ Главная
                </button>
                <span>↑ ↓ выбрать · Enter открыть · Esc закрыть</span>
              </footer>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
