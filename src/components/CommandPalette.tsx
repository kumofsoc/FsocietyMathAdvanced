import { AnimatePresence, motion } from "framer-motion";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { chapters, topicListMeta } from "../data/courseMeta";
import { getLearningSnapshot, getTopicProgress } from "../lib/progress";

function searchableText(value: string) {
  return value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е");
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
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

  const results = useMemo(() => {
    const needle = searchableText(query.trim());
    const snapshot = getLearningSnapshot();

    return topicListMeta
      .map((topic) => {
        const chapter = chapters.find((item) => item.id === topic.chapterId);
        const haystack = searchableText(
          [
            topic.title,
            topic.summary,
            topic.number,
            chapter?.title ?? "",
          ].join(" "),
        );

        let score = 0;
        if (!needle) score = getTopicProgress(topic.id, snapshot) > 0 ? 2 : 1;
        else if (searchableText(topic.title).startsWith(needle)) score = 10;
        else if (searchableText(topic.title).includes(needle)) score = 8;
        else if (searchableText(chapter?.title ?? "").includes(needle)) score = 5;
        else if (haystack.includes(needle)) score = 3;

        return {
          topic,
          chapter,
          progress: getTopicProgress(topic.id, snapshot),
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || b.progress - a.progress)
      .slice(0, 12);
  }, [query]);

  const openTopic = (id: string) => {
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
      openTopic(results[Math.min(activeIndex, results.length - 1)].topic.id);
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
                  placeholder="Тема, раздел, определитель, интеграл..."
                  aria-label="Поиск по курсу"
                />
                <kbd>ESC</kbd>
              </header>

              <div className="command-meta">
                <span>{query ? "Результаты" : "Быстрый переход"}</span>
                <small>{results.length} найдено</small>
              </div>

              <div className="command-results">
                {results.length ? results.map(({ topic, chapter, progress }, index) => (
                  <button
                    key={topic.id}
                    className={activeIndex === index ? "active" : ""}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => openTopic(topic.id)}
                  >
                    <span className="command-result-number">§ {topic.number}</span>
                    <span className="command-result-copy">
                      <strong>{topic.title}</strong>
                      <small>{chapter?.title} · {topic.summary}</small>
                    </span>
                    <span className="command-result-progress">
                      <i><span style={{ width: progress + "%" }} /></i>
                      <b>{progress}%</b>
                    </span>
                  </button>
                )) : (
                  <div className="command-empty">
                    Ничего не найдено. Попробуй название темы или математический термин.
                  </div>
                )}
              </div>

              <footer className="command-footer">
                <button onClick={() => { window.location.hash = "map"; setOpen(false); }}>
                  ◫ Карта курса
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
