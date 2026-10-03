import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { Topic } from "@/entities/course/model/types";
import {
  searchTopicBlocks,
  topicSearchKindLabels,
} from "@/features/topic-search/model/topicSearch";

function displaySearchTitle(title: string) {
  return title
    .replace(/^ACADEMY\s+VISUAL\s*[·/]\s*/i, "Визуализация · ")
    .replace(/^ACADEMY\s+LAB\s*\/\s*/i, "Интерактивная лаборатория · ")
    .replace(/^ACADEMY\s+PRO\s*\/\s*/i, "Углублённое изучение · ")
    .replace(/^ACADEMY\s*\/\s*/i, "")
    .replace(/^ACADEMY\s+/i, "");
}

export function TopicLocalSearch({
  topic,
  onJump,
}: {
  topic: Topic;
  onJump: (index: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => searchTopicBlocks(topic, query),
    [topic, query],
  );

  const openResult = (index: number) => {
    onJump(index);
    setFocused(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setQuery("");
      setFocused(false);
      inputRef.current?.blur();
      return;
    }

    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (current) => (current - 1 + results.length) % results.length,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const result = results[Math.min(activeIndex, results.length - 1)];
      if (result) openResult(result.index);
    }
  };

  const showResults = focused && query.trim().length >= 2;

  return (
    <section className="topic-local-search" aria-label="Поиск внутри текущей темы">
      <div className={"topic-local-search-field " + (focused ? "focused" : "")}>
        <span aria-hidden="true">⌕</span>
        <input
          ref={inputRef}
          value={query}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Найти в этой теме: теорема, формула, пример…"
          aria-label={"Поиск внутри темы «" + topic.title + "»"}
          aria-expanded={showResults}
        />
        {query ? (
          <button
            type="button"
            className="topic-local-search-clear"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setQuery("");
              setActiveIndex(0);
              inputRef.current?.focus();
            }}
            aria-label="Очистить поиск"
          >
            ×
          </button>
        ) : (
          <kbd>В теме</kbd>
        )}
      </div>

      {showResults && (
        <div className="topic-local-search-results" role="listbox">
          <header>
            <span>НАЙДЕНО В ТЕМЕ</span>
            <small>{results.length}</small>
          </header>

          {results.length ? (
            <div className="topic-local-search-list">
              {results.map((result, index) => (
                <button
                  type="button"
                  key={result.index}
                  className={index === activeIndex ? "active" : ""}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => openResult(result.index)}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <span className="topic-local-search-kind">
                    {topicSearchKindLabels[result.kind]}
                  </span>
                  <span className="topic-local-search-copy">
                    <strong>{displaySearchTitle(result.title)}</strong>
                    <small>{result.snippet}</small>
                  </span>
                  <span className="topic-local-search-jump">↓</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="topic-local-search-empty">
              Ничего в этой теме не найдено.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
