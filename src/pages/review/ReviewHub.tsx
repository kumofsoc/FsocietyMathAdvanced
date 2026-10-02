import { useMemo, useState } from "react";
import { BlockMath } from "react-katex";
import { chapters, topicMeta } from "@/data/courseMeta";
import { topics } from "@/data/course";
import type { ContentBlock } from "@/entities/course/model/types";
import "@/styles/review-hub.css";

const REVIEW_KINDS = new Set([
  "definition",
  "concepts",
  "property",
  "theorem",
  "corollary",
  "formula",
  "algorithm",
  "summary",
]);

const kindLabel: Record<string, string> = {
  definition: "ОПР.",
  concepts: "ПОНЯТИЯ",
  property: "СВОЙСТВО",
  theorem: "ТЕОРЕМА",
  corollary: "СЛЕДСТВИЕ",
  formula: "ФОРМУЛА",
  algorithm: "АЛГОРИТМ",
  summary: "ИТОГ",
};

function firstSentence(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^(.+?[.!?])(?:\s|$)/);
  const value = match?.[1] ?? normalized;
  return value.length > 260 ? value.slice(0, 257) + "…" : value;
}

function compactBlocks(blocks: ContentBlock[]) {
  const chosen = blocks.filter(
    (block) => REVIEW_KINDS.has(block.kind) && !block.title.startsWith("ACADEMY"),
  );
  const formulas = chosen.filter((block) => block.formula).slice(0, 5);
  const statements = chosen
    .filter((block) => block.kind !== "formula")
    .slice(0, 7);

  return { formulas, statements };
}

export function ReviewHub() {
  const [query, setQuery] = useState("");
  const [chapterId, setChapterId] = useState("all");
  const [formulaOnly, setFormulaOnly] = useState(false);
  const [strictBookMode, setStrictBookMode] = useState(true);

  const visibleTopics = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ru-RU").replace(/ё/g, "е");
    return Object.values(topicMeta).filter((topic) => {
      if (topic.isStub) return false;
      if (chapterId !== "all" && topic.chapterId !== chapterId) return false;
      if (!needle) return true;
      const chapter = chapters.find((item) => item.id === topic.chapterId);
      return [topic.title, topic.summary, topic.number, chapter?.title ?? ""]
        .join(" ")
        .toLocaleLowerCase("ru-RU")
        .replace(/ё/g, "е")
        .includes(needle);
    });
  }, [query, chapterId]);

  return (
    <section className="review-hub">
      <header className="review-hero">
        <div className="eyebrow">REVIEW ARCHIVE / СУХОЙ КОНСПЕКТ</div>
        <h1>Повторение без лишних слов.</h1>
        <p>
          Только определения, ключевые свойства, теоремы, формулы и алгоритмы.
          Без длинных доказательств, визуальных лабораторий и учебного storytelling.
        </p>
      </header>

      <div className="review-toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск: determinant, Грассман, интеграл…"
        />
        <select value={chapterId} onChange={(event) => setChapterId(event.target.value)}>
          <option value="all">Все разделы</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.number} · {chapter.title}
            </option>
          ))}
        </select>
        <button
          className={strictBookMode ? "active" : ""}
          onClick={() => setStrictBookMode((value) => !value)}
        >
          {strictBookMode ? "Сухой режим ✓" : "Сухой режим"}
        </button>
        <button
          className={formulaOnly ? "active" : ""}
          onClick={() => setFormulaOnly((value) => !value)}
        >
          {formulaOnly ? "Только формулы ✓" : "Только формулы"}
        </button>
        <strong>{visibleTopics.length} тем</strong>
      </div>

      <div className="review-list">
        {visibleTopics.map((meta) => {
          const topic = topics[meta.id];
          if (!topic) return null;
          const chapter = chapters.find((item) => item.id === meta.chapterId);
          const { formulas, statements } = compactBlocks(topic.blocks);

          return (
            <article className="review-topic" key={meta.id}>
              <header>
                <div>
                  <span>{chapter?.number} / § {meta.number}</span>
                  <h2>{meta.title}</h2>
                </div>
                <button onClick={() => (window.location.hash = meta.id)}>Полная тема →</button>
              </header>

              {!formulaOnly && (
                <>
                  {!strictBookMode && (
                    <p className="review-topic-summary">{meta.summary}</p>
                  )}
                  <div className="review-statements">
                    {statements
                      .filter((block) =>
                        !strictBookMode ||
                        ["definition", "property", "theorem", "corollary", "algorithm"].includes(block.kind),
                      )
                      .map((block, index) => (
                      <div key={block.title + index}>
                        <span>{kindLabel[block.kind] ?? block.kind.toUpperCase()}</span>
                        <strong>{block.title.replace(/^\d+(?:\.\d+)*\s*·\s*/, "")}</strong>
                        <p>{firstSentence(block.body)}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="review-formulas">
                {formulas.length ? formulas.map((block, index) => (
                  <div key={(block.formula ?? "") + index}>
                    <span>{block.title}</span>
                    <div className="review-formula-math"><BlockMath math={block.formula ?? ""} /></div>
                  </div>
                )) : (
                  <small>В этой теме нет отдельной формулы в метаданных блока.</small>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
