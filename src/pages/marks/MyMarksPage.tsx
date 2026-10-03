import { useEffect, useMemo, useState } from "react";
import { chapters, topicMeta } from "@/data/courseMeta";
import { courseSearchIndex } from "@/data/courseSearchIndex";
import {
  BLOCK_NOTES_EVENT,
  BLOCK_NOTES_KEY,
  deleteBlockNote,
  loadBlockNoteEntries,
} from "@/features/block-notes/model/blockNotes";
import {
  IMPORTANT_BLOCKS_EVENT,
  IMPORTANT_BLOCKS_KEY,
  loadImportantBlocks,
  setBlockImportant,
} from "@/features/important-blocks/model/importantBlocks";
import { buildBlockHash } from "@/shared/lib/blockDeepLink";
import type { BlockKind } from "@/entities/course/model/types";

type MarksFilter = "all" | "notes" | "important";

type MarksItem = {
  id: string;
  topicId: string;
  blockIndex: number;
  topicTitle: string;
  topicNumber: string;
  chapterTitle: string;
  blockTitle: string;
  kind: BlockKind | null;
  note: string | null;
  important: boolean;
  updatedAt: number;
};

const kindLabels: Partial<Record<BlockKind, string>> = {
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

function normalize(value: string) {
  return value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е");
}

function formatUpdatedAt(value: number) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function buildMarksItems(): MarksItem[] {
  const important = loadImportantBlocks();
  const notes = loadBlockNoteEntries();
  const importantById = new Map(important.map((item) => [item.id, item]));
  const noteById = new Map(notes.map((item) => [item.id, item]));
  const ids = new Set([...importantById.keys(), ...noteById.keys()]);

  return [...ids].flatMap((id) => {
    const mark = importantById.get(id);
    const note = noteById.get(id);
    const topicId = mark?.topicId ?? note?.topicId;
    const blockIndex = mark?.blockIndex ?? note?.blockIndex;
    if (!topicId || blockIndex === undefined) return [];

    const meta = topicMeta[topicId];
    const chapter = meta
      ? chapters.find((item) => item.id === meta.chapterId)
      : undefined;
    const searchEntry = courseSearchIndex.find(
      (entry) => entry.topicId === topicId && entry.index === blockIndex,
    );

    return [{
      id,
      topicId,
      blockIndex,
      topicTitle: mark?.topicTitle ?? meta?.title ?? topicId,
      topicNumber: meta?.number ?? "—",
      chapterTitle: chapter?.title ?? "",
      blockTitle: mark?.blockTitle ?? searchEntry?.title ?? "Блок " + (blockIndex + 1),
      kind: mark?.kind ?? searchEntry?.kind ?? null,
      note: note?.text ?? null,
      important: Boolean(mark),
      updatedAt: Math.max(mark?.updatedAt ?? 0, note?.updatedAt ?? 0),
    }];
  }).sort((a, b) => b.updatedAt - a.updatedAt || a.topicTitle.localeCompare(b.topicTitle, "ru"));
}

export function MyMarksPage() {
  const [version, setVersion] = useState(0);
  const [filter, setFilter] = useState<MarksFilter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const refresh = () => setVersion((value) => value + 1);
    const onStorage = (event: StorageEvent) => {
      if (event.key === BLOCK_NOTES_KEY || event.key === IMPORTANT_BLOCKS_KEY) {
        refresh();
      }
    };

    window.addEventListener(BLOCK_NOTES_EVENT, refresh);
    window.addEventListener(IMPORTANT_BLOCKS_EVENT, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(BLOCK_NOTES_EVENT, refresh);
      window.removeEventListener(IMPORTANT_BLOCKS_EVENT, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const items = useMemo(() => {
    void version;
    return buildMarksItems();
  }, [version]);

  const noteCount = useMemo(
    () => items.filter((item) => Boolean(item.note)).length,
    [items],
  );
  const importantCount = useMemo(
    () => items.filter((item) => item.important).length,
    [items],
  );

  const visibleItems = useMemo(() => {
    const needle = normalize(query.trim());
    return items.filter((item) => {
      if (filter === "notes" && !item.note) return false;
      if (filter === "important" && !item.important) return false;
      if (!needle) return true;

      return normalize([
        item.topicTitle,
        item.topicNumber,
        item.chapterTitle,
        item.blockTitle,
        item.kind ? kindLabels[item.kind] ?? item.kind : "",
        item.note ?? "",
      ].join(" ")).includes(needle);
    });
  }, [items, filter, query]);

  return (
    <section className="my-marks-page">
      <header className="my-marks-hero">
        <div className="eyebrow">PERSONAL ARCHIVE / МОИ ОТМЕТКИ</div>
        <div className="my-marks-hero-row">
          <div>
            <h1>Важное и заметки в одном месте.</h1>
            <p>
              Один блок курса — одна запись. Здесь собираются твои заметки и
              отмеченные как важные определения, теоремы, формулы, примеры и доказательства.
            </p>
          </div>
          <div className="my-marks-metrics" aria-label="Статистика отметок">
            <div>
              <span>БЛОКОВ</span>
              <strong>{items.length}</strong>
            </div>
            <div>
              <span>ЗАМЕТОК</span>
              <strong>{noteCount}</strong>
            </div>
            <div>
              <span>ВАЖНЫХ</span>
              <strong>{importantCount}</strong>
            </div>
          </div>
        </div>
      </header>

      <div className="my-marks-toolbar">
        <label>
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по теме, блоку или тексту заметки…"
            aria-label="Поиск по моим отметкам"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Очистить поиск">
              ×
            </button>
          )}
        </label>

        <div className="my-marks-filters" role="group" aria-label="Фильтр отметок">
          {([
            ["all", "Все", items.length],
            ["notes", "Заметки", noteCount],
            ["important", "Важное", importantCount],
          ] as const).map(([id, label, count]) => (
            <button
              type="button"
              key={id}
              className={filter === id ? "active" : ""}
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
            >
              <span>{label}</span>
              <b>{count}</b>
            </button>
          ))}
        </div>
      </div>

      {visibleItems.length ? (
        <div className="my-marks-list">
          {visibleItems.map((item) => (
            <article
              className={
                "my-mark-card " +
                (item.important ? "important " : "") +
                (item.note ? "has-note" : "")
              }
              key={item.id}
            >
              <div className="my-mark-rail">
                <span>{item.kind ? kindLabels[item.kind] ?? item.kind.toUpperCase() : "БЛОК"}</span>
                <small>{String(item.blockIndex + 1).padStart(2, "0")}</small>
              </div>

              <div className="my-mark-body">
                <header>
                  <div>
                    <span>
                      {item.chapterTitle ? item.chapterTitle + " / " : ""}
                      § {item.topicNumber} · {item.topicTitle}
                    </span>
                    <h2>{item.blockTitle}</h2>
                  </div>
                  <div className="my-mark-badges">
                    {item.important && <b className="important">◆ ВАЖНО</b>}
                    {item.note && <b className="note">✎ ЗАМЕТКА</b>}
                  </div>
                </header>

                {item.note && (
                  <blockquote>
                    <p>{item.note}</p>
                  </blockquote>
                )}

                <footer>
                  <span>{formatUpdatedAt(item.updatedAt)}</span>
                  <div>
                    {item.note && (
                      <button
                        type="button"
                        className="danger"
                        onClick={() => deleteBlockNote(item.topicId, item.blockIndex)}
                      >
                        Удалить заметку
                      </button>
                    )}
                    {item.important && (
                      <button
                        type="button"
                        onClick={() =>
                          setBlockImportant(
                            {
                              topicId: item.topicId,
                              blockIndex: item.blockIndex,
                              topicTitle: item.topicTitle,
                              blockTitle: item.blockTitle,
                              kind: item.kind ?? "note",
                            },
                            false,
                          )
                        }
                      >
                        Снять важность
                      </button>
                    )}
                    <button
                      type="button"
                      className="open"
                      onClick={() => {
                        window.location.hash = buildBlockHash(item.topicId, item.blockIndex);
                      }}
                    >
                      Открыть блок →
                    </button>
                  </div>
                </footer>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="my-marks-empty">
          <span>{items.length ? "⌕" : "◇"}</span>
          <h2>{items.length ? "Ничего не найдено." : "Отметок пока нет."}</h2>
          <p>
            {items.length
              ? "Измени фильтр или поисковый запрос."
              : "Добавляй заметки и помечай блоки как «Важно» прямо внутри тем."}
          </p>
          {!items.length && (
            <button type="button" onClick={() => (window.location.hash = "map")}>
              Открыть карту курса
            </button>
          )}
        </div>
      )}
    </section>
  );
}
