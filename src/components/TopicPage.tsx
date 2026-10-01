import { AnimatePresence, motion } from "framer-motion";
import { BlockMath } from "react-katex";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { chapters, topicList, topics } from "../data/course";
import { practiceTaskIdsByTopic } from "../data/practiceMeta";
import {
  LEARNING_EVENT,
  loadSavedTheorems,
  loadSet,
  saveSet,
  saveTheorems,
  SOLVED_KEY,
  THEORY_KEY,
} from "../lib/learning";
import { isTrackedTopic } from "../lib/progress";
import type { BlockKind, ContentBlock, Topic } from "../types/course";
import { RichMatrixText } from "./MatrixNotation";
import { TopicLabInsert, TopicVisualInsert } from "./TopicVisualRegistry";

const PracticePanel = lazy(() =>
  import("./PracticePanel").then((module) => ({ default: module.PracticePanel })),
);

function DeferredPracticePanel({ topicId }: { topicId: string }) {
  const anchor = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) return;
    const node = anchor.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setActive(true);
        observer.disconnect();
      },
      { rootMargin: "900px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [active]);

  if (!active) {
    return (
      <div ref={anchor} className="practice-deferred">
        <span>PRACTICE BANK</span>
        <strong>Практика подключится при приближении к концу теории.</strong>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="practice-deferred loading">
          <span>PRACTICE BANK</span>
          <strong>Загружаю задачи…</strong>
        </div>
      }
    >
      <PracticePanel topicId={topicId} />
    </Suspense>
  );
}

const labels: Record<BlockKind, string> = {
  definition: "ОПРЕДЕЛЕНИЕ",
  concepts: "ОСНОВНЫЕ ПОНЯТИЯ",
  property: "СВОЙСТВО",
  theorem: "ТЕОРЕМА",
  proof: "ДОКАЗАТЕЛЬСТВО",
  corollary: "СЛЕДСТВИЕ",
  formula: "ФОРМУЛА",
  example: "ПРИМЕР",
  solution: "РЕШЕНИЕ",
  note: "ОБРАТИ ВНИМАНИЕ",
  algorithm: "АЛГОРИТМ",
  geometry: "ГЕОМЕТРИЧЕСКИЙ СМЫСЛ",
  summary: "ИТОГ",
};

const BLOCK_TARGET_KEY = "fsociety-block-target-v1";
const ACADEMY_CHAPTERS = new Set([
  "linear",
  "vectors",
  "plane-geometry",
  "space-geometry",
  "plane-transformations",
  "abstract-linear",
  "euclidean",
  "affine-general",
  "tensor-algebra",
]);

function dependencyTarget(dependency: string) {
  const marker = dependency.toLowerCase().match(/(теорема|свойство)\s*(\d+(?:\.\d+)?)/);
  const clean = dependency
    .toLowerCase()
    .replace(/определителей/g, "")
    .replace(/\s+/g, " ")
    .trim();

  for (const candidate of topicList) {
    for (let index = 0; index < candidate.blocks.length; index += 1) {
      const title = candidate.blocks[index].title.toLowerCase();
      if (title.includes(clean) || clean.includes(title)) {
        return { topicId: candidate.id, index, title: candidate.blocks[index].title };
      }
      if (marker && title.includes(marker[1]) && title.includes(marker[2])) {
        return { topicId: candidate.id, index, title: candidate.blocks[index].title };
      }
    }
  }

  return null;
}

function openBlock(topicId: string, index: number) {
  const id = "block-" + topicId + "-" + index;
  if (window.location.hash.replace(/^#/, "") === topicId) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  sessionStorage.setItem(BLOCK_TARGET_KEY, topicId + "::" + index);
  window.location.hash = topicId;
}

function ContentCard({
  topic,
  block,
  index,
}: {
  topic: Topic;
  block: ContentBlock;
  index: number;
}) {
  const theoremId = topic.id + "::" + index;
  const academyBlock = block.title.startsWith("ACADEMY");
  const [saved, setSaved] = useState(() => loadSavedTheorems().some((item) => item.id === theoremId));
  const [propertyPanel, setPropertyPanel] = useState<"proof" | "corollary" | null>(null);

  const toggleSaved = () => {
    const current = loadSavedTheorems();
    if (current.some((item) => item.id === theoremId)) {
      saveTheorems(current.filter((item) => item.id !== theoremId));
      setSaved(false);
      return;
    }

    saveTheorems([
      ...current,
      {
        id: theoremId,
        topicId: topic.id,
        topicTitle: topic.title,
        title: block.title,
        body: block.body,
        formula: block.formula,
      },
    ]);
    setSaved(true);
  };

  return (
    <motion.article
      className={
        "content-block kind-" +
        block.kind +
        (academyBlock ? " academy-content-block" : "")
      }
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.44, delay: Math.min(index * 0.018, 0.16) }}
    >
      <div className="block-rail">
        <span>{academyBlock ? "ACADEMY / " + labels[block.kind] : labels[block.kind]}</span>
        <small>{String(index + 1).padStart(2, "0")}</small>
      </div>

      <div className="block-body">
        <div className="block-title-row">
          <h3>{block.title}</h3>
          {block.kind === "theorem" && (
            <button
              className={"save-theorem-button " + (saved ? "saved" : "")}
              onClick={toggleSaved}
              title={saved ? "Убрать из сохранённых" : "Сохранить теорему"}
            >
              {saved ? "★" : "☆"}
            </button>
          )}
        </div>
        <p><RichMatrixText text={block.body} /></p>

        {block.formula && (
          <div className="formula-box">
            <BlockMath math={block.formula} />
          </div>
        )}

        {block.items && (
          <ul className="property-list">
            {block.items.map((item, itemIndex) => (
              <li key={item}>
                <span className="property-list-index">{String(itemIndex + 1).padStart(2, "0")}</span>
                <span><RichMatrixText text={item} /></span>
              </li>
            ))}
          </ul>
        )}

        {block.kind === "property" && (block.proofs?.length || block.corollaries?.length) && (
          <div className="property-disclosures">
            <div className="property-disclosure-actions">
              {block.proofs?.length ? (
                <button
                  className={propertyPanel === "proof" ? "active" : ""}
                  onClick={() => setPropertyPanel((current) => current === "proof" ? null : "proof")}
                >
                  <span>∵</span>
                  Доказательство
                  <b>{propertyPanel === "proof" ? "−" : "+"}</b>
                </button>
              ) : null}
              {block.corollaries?.length ? (
                <button
                  className={propertyPanel === "corollary" ? "active" : ""}
                  onClick={() => setPropertyPanel((current) => current === "corollary" ? null : "corollary")}
                >
                  <span>⇒</span>
                  Следствие
                  <b>{propertyPanel === "corollary" ? "−" : "+"}</b>
                </button>
              ) : null}
            </div>

            <AnimatePresence initial={false} mode="wait">
              {propertyPanel === "proof" && block.proofs?.length ? (
                <motion.div
                  key="proof"
                  className="property-proof-panel"
                  initial={{ height: 0, opacity: 0, y: -4 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -4 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  {block.proofs.map((proof, proofIndex) => (
                    <article key={proof.label + proofIndex}>
                      <div className="property-panel-label">ДОКАЗАТЕЛЬСТВО {proofIndex + 1}</div>
                      <h4>{proof.label}</h4>
                      <p><RichMatrixText text={proof.body} /></p>
                      {proof.formula && (
                        <div className="property-panel-formula">
                          <BlockMath math={proof.formula} />
                        </div>
                      )}
                    </article>
                  ))}
                </motion.div>
              ) : null}

              {propertyPanel === "corollary" && block.corollaries?.length ? (
                <motion.div
                  key="corollary"
                  className="property-corollary-panel"
                  initial={{ height: 0, opacity: 0, y: -4 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -4 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  {block.corollaries.map((corollary, corollaryIndex) => (
                    <article key={corollary.label + corollaryIndex}>
                      <div className="property-panel-label">СЛЕДСТВИЕ {corollaryIndex + 1}</div>
                      <h4>{corollary.label}</h4>
                      <p><RichMatrixText text={corollary.body} /></p>
                      {corollary.formula && (
                        <div className="property-panel-formula">
                          <BlockMath math={corollary.formula} />
                        </div>
                      )}
                    </article>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}

        {block.dependsOn && (
          <div className="depends-row">
            <span>Использует:</span>
            {block.dependsOn.map((dependency) => {
              const target = dependencyTarget(dependency);
              return target ? (
                <button
                  key={dependency}
                  className="dependency-link"
                  onClick={() => openBlock(target.topicId, target.index)}
                  title={"Перейти: " + target.title}
                >
                  {dependency} ↗
                </button>
              ) : (
                <b key={dependency}>{dependency}</b>
              );
            })}
          </div>
        )}
      </div>
    </motion.article>
  );
}

function NeighborNav({ topic }: { topic: Topic }) {
  const sequence = chapters.flatMap((chapter) =>
    chapter.topicIds
      .filter((id) => Boolean(topics[id]))
      .map((id) => ({ id, chapter })),
  );
  const index = sequence.findIndex((entry) => entry.id === topic.id);
  const previousEntry = index > 0 ? sequence[index - 1] : undefined;
  const nextEntry = index >= 0 && index < sequence.length - 1 ? sequence[index + 1] : undefined;
  const previous = previousEntry ? topics[previousEntry.id] : undefined;
  const next = nextEntry ? topics[nextEntry.id] : undefined;

  return (
    <nav className="neighbor-nav">
      <button
        disabled={!previous}
        onClick={() => previous && (window.location.hash = previous.id)}
      >
        <span>
          {previousEntry && previousEntry.chapter.id !== topic.chapterId
            ? "← Предыдущая глава"
            : "← Предыдущая тема"}
        </span>
        <strong>{previous?.title ?? "Начало курса"}</strong>
        {previousEntry && <small>Глава {previousEntry.chapter.number} · {previousEntry.chapter.title}</small>}
      </button>
      <button
        disabled={!next}
        onClick={() => next && (window.location.hash = next.id)}
      >
        <span>
          {nextEntry && nextEntry.chapter.id !== topic.chapterId
            ? "Следующая глава →"
            : "Следующая тема →"}
        </span>
        <strong>{next?.title ?? "Конец курса"}</strong>
        {nextEntry && <small>Глава {nextEntry.chapter.number} · {nextEntry.chapter.title}</small>}
      </button>
    </nav>
  );
}

export function TopicPage({ topicId }: { topicId: string }) {
  const topic = topics[topicId];
  const chapter = chapters.find((item) => item.id === topic.chapterId);
  const tracksLearning = isTrackedTopic(topic.id);
  const theorySentinel = useRef<HTMLDivElement>(null);
  const [activeBlock, setActiveBlock] = useState(0);
  const [theoryRead, setTheoryRead] = useState(() => loadSet(THEORY_KEY).has(topic.id));
  const [solved, setSolved] = useState(() => loadSet(SOLVED_KEY));

  useEffect(() => {
    const target = sessionStorage.getItem(BLOCK_TARGET_KEY);
    if (!target) return;
    const [targetTopic, rawIndex] = target.split("::");
    if (targetTopic !== topic.id) return;
    sessionStorage.removeItem(BLOCK_TARGET_KEY);
    const timer = window.setTimeout(() => {
      document
        .getElementById("block-" + topic.id + "-" + rawIndex)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 140);
    return () => window.clearTimeout(timer);
  }, [topic.id]);

  useEffect(() => {
    setActiveBlock(0);
    let observer: IntersectionObserver | null = null;

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
    };
  }, [topic.id, topic.blocks.length]);

  useEffect(() => {
    setTheoryRead(loadSet(THEORY_KEY).has(topic.id));
    setSolved(loadSet(SOLVED_KEY));

    const refresh = () => {
      setTheoryRead(loadSet(THEORY_KEY).has(topic.id));
      setSolved(loadSet(SOLVED_KEY));
    };
    window.addEventListener(LEARNING_EVENT, refresh);
    return () => window.removeEventListener(LEARNING_EVENT, refresh);
  }, [topic.id]);

  useEffect(() => {
    const target = theorySentinel.current;
    if (!tracksLearning || !target || theoryRead) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        const current = loadSet(THEORY_KEY);
        current.add(topic.id);
        saveSet(THEORY_KEY, current);
        setTheoryRead(true);
        observer.disconnect();
      },
      { threshold: 0.65 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [topic.id, theoryRead, tracksLearning]);

  const taskIds = practiceTaskIdsByTopic[topic.id] ?? [];
  const solvedCount = useMemo(
    () => taskIds.filter((taskId) => solved.has(taskId)).length,
    [taskIds, solved],
  );
  const practiceRatio = taskIds.length ? solvedCount / taskIds.length : 0;
  const topicProgress = Math.round((theoryRead ? 50 : 0) + practiceRatio * 50);

  return (
    <div className="topic-page">
      <header className="topic-hero">
        <div className="eyebrow">
          ГЛАВА {chapter?.number} / § {topic.number} · {chapter?.title}
          {chapter && ACADEMY_CHAPTERS.has(chapter.id) ? " · ACADEMY PRO" : ""}
        </div>
        <div className="hero-title-row">
          <div>
            <h1>{topic.title}</h1>
            <p>{topic.summary}</p>
          </div>

          <div className="topic-learning-status">
            <div>
              <span>ТЕОРИЯ</span>
              <strong>{theoryRead ? "50 / 50" : "0 / 50"}</strong>
              <small>{theoryRead ? "прочитана" : "дочитай до практики"}</small>
            </div>
            <div>
              <span>ПРАКТИКА</span>
              <strong>{Math.round(practiceRatio * 50)} / 50</strong>
              <small>{taskIds.length ? solvedCount + " / " + taskIds.length + " задач" : "банк готовится"}</small>
            </div>
            <div className="topic-total">
              <span>ОСВОЕНИЕ</span>
              <strong>{topicProgress}%</strong>
            </div>
          </div>
        </div>

        {topic.prerequisites.length > 0 && (
          <div className="prerequisites">
            <span>Prerequisites</span>
            {topic.prerequisites.map((id) => (
              <button key={id} onClick={() => (window.location.hash = id)}>
                {topics[id]?.title ?? id}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="topic-outline">
        {topic.blocks.map((block, index) => (
          <button
            type="button"
            key={block.title + "-outline"}
            className={activeBlock === index ? "active" : ""}
            aria-current={activeBlock === index ? "step" : undefined}
            onClick={() => document.getElementById("block-" + topic.id + "-" + index)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            {String(index + 1).padStart(2, "0")} · {block.title}
          </button>
        ))}
      </div>

      <section className="lesson-content">
        {topic.blocks.map((block, index) => (
          <div
            id={"block-" + topic.id + "-" + index}
            key={topic.id + "-" + block.title}
            className="lesson-block-anchor"
            data-topic-block={topic.id}
            data-block-index={index}
          >
            <ContentCard topic={topic} block={block} index={index} />
            <TopicVisualInsert
              topicId={topic.id}
              index={index}
              blockTitle={block.title}
            />
          </div>
        ))}
      </section>

      <TopicLabInsert topicId={topic.id} enabled={Boolean(topic.hasLab)} />

      {tracksLearning && <div className="theory-finish" ref={theorySentinel}>
        <span>{theoryRead ? "✓" : "↓"}</span>
        <div>
          <strong>{theoryRead ? "Теоретический маршрут пройден" : "Финиш теоретической части"}</strong>
          <p>
            {theoryRead
              ? "Система зафиксировала, что ты дошёл до конца материала. Теперь практика проверит, можешь ли ты самостоятельно использовать определения, свойства и методы этой темы."
              : "Когда этот блок попадёт в область просмотра, система отметит теоретический материал как пройденный и откроет следующий этап — проверку на задачах."}
          </p>
        </div>
      </div>}

      {tracksLearning && <DeferredPracticePanel topicId={topic.id} />}

      <NeighborNav topic={topic} />
    </div>
  );
}
