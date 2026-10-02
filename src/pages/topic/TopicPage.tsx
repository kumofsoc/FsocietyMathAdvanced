import { AnimatePresence, motion } from "framer-motion";
import { BlockMath } from "react-katex";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { chapters, topicList, topics } from "@/data/course";
import { practiceTaskIdsByTopic } from "@/data/practiceMeta";
import { linearAcademyBlocks } from "@/data/linearAcademy";
import { linearAcademyPitfallBlocks } from "@/data/linearAcademyPitfalls";
import {
  LEARNING_EVENT,
  loadReadingProgress,
  loadSavedTheorems,
  loadSet,
  markReadingBlock,
  saveReadingProgress,
  saveSet,
  saveTheorems,
  SOLVED_KEY,
  THEORY_KEY,
} from "@/features/learning/model/learning";
import {
  getTopicProgressBreakdown,
  isTrackedTopic,
  THEORY_CHECKPOINT_THRESHOLD,
} from "@/features/learning/model/progress";
import type { BlockKind, ContentBlock, Topic } from "@/entities/course/model/types";
import { RichMatrixText } from "@/visualizations/linear/MatrixNotation";
import { toLayeredTopic } from "@/entities/course/model/learning-architecture/adapter";
import { linearFoundationBlueprints } from "@/data/learning-architecture/linear-foundations";
import { composeTopicWithSupplements } from "@/data/topic-supplements";
import { TopicLabInsert, TopicVisualInsert } from "@/visualizations/registry/TopicVisualRegistry";

const PracticePanel = lazy(() =>
  import("@/features/learning/ui/PracticePanel").then((module) => ({ default: module.PracticePanel })),
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
    <div id={"practice-" + topicId}>
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
    </div>
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

function displayBlockTitle(title: string) {
  return title
    .replace(/^ACADEMY\s+VISUAL\s*[·/]\s*/i, "Визуализация · ")
    .replace(/^ACADEMY\s+LAB\s*\/\s*/i, "Интерактивная лаборатория · ")
    .replace(/^ACADEMY\s+PRO\s*\/\s*/i, "Углублённое изучение · ")
    .replace(/^ACADEMY\s*\/\s*/i, "")
    .replace(/^ACADEMY\s+/i, "");
}

const BLOCK_TARGET_KEY = "fsociety-block-target-v1";
function isAdvancedLearningBlock(topicId: string, block: ContentBlock) {
  return (
    linearAcademyBlocks[topicId]?.includes(block) ||
    linearAcademyPitfallBlocks[topicId]?.includes(block) ||
    false
  );
}

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
  const academyBlock = isAdvancedLearningBlock(topic.id, block);
  const [saved, setSaved] = useState(() => loadSavedTheorems().some((item) => item.id === theoremId));
  const [propertyPanel, setPropertyPanel] = useState<"proof" | "corollary" | null>(
    () => block.proofs?.length ? "proof" : null,
  );

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
        title: displayBlockTitle(block.title),
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
        <span>{academyBlock ? "УГЛУБЛЁННО / " + labels[block.kind] : labels[block.kind]}</span>
        <small>{String(index + 1).padStart(2, "0")}</small>
      </div>

      <div className="block-body">
        <div className="block-title-row">
          <h3>{displayBlockTitle(block.title)}</h3>
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

        {block.statements?.length ? (
          <div className="rigorous-statements">
            {block.statements.map((statement, statementIndex) => (
              <article key={statement.id} className="rigorous-statement">
                <div className="rigorous-statement-head">
                  <span>СВОЙСТВО {String(statementIndex + 1).padStart(2, "0")}</span>
                  <strong><RichMatrixText text={statement.claim} /></strong>
                </div>
                {statement.conditions && (
                  <div className="rigorous-conditions">
                    <b>УСЛОВИЯ</b>
                    <p><RichMatrixText text={statement.conditions} /></p>
                  </div>
                )}
                <div className="rigorous-proof">
                  <b>ДОКАЗАТЕЛЬСТВО</b>
                  <h4>{statement.proof.label}</h4>
                  <p><RichMatrixText text={statement.proof.body} /></p>
                  {statement.proof.formula && (
                    <div className="property-panel-formula">
                      <BlockMath math={statement.proof.formula} />
                    </div>
                  )}
                </div>
                <div className="rigorous-example">
                  <b>ПРИМЕР</b>
                  <p><RichMatrixText text={statement.example.body} /></p>
                  {statement.example.formula && (
                    <div className="property-panel-formula">
                      <BlockMath math={statement.example.formula} />
                    </div>
                  )}
                </div>
                {statement.withoutConditions && (
                  <div className="rigorous-boundary">
                    <b>БЕЗ УСЛОВИЙ</b>
                    <p><RichMatrixText text={statement.withoutConditions} /></p>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : null}

        {block.claims?.length ? (
          <div className="rigorous-statements">
            {block.claims.map((claim, claimIndex) => (
              <article key={claim.statement + claimIndex} className="rigorous-statement">
                <div className="rigorous-statement-head">
                  <span>СВОЙСТВО {String(claimIndex + 1).padStart(2, "0")}</span>
                  <strong><RichMatrixText text={claim.statement} /></strong>
                </div>
                {claim.conditions && (
                  <div className="rigorous-conditions">
                    <b>УСЛОВИЯ</b>
                    <p><RichMatrixText text={claim.conditions} /></p>
                  </div>
                )}
                <div className="rigorous-proof">
                  <b>ДОКАЗАТЕЛЬСТВО</b>
                  <p><RichMatrixText text={claim.proof} /></p>
                  {claim.formula && (
                    <div className="property-panel-formula">
                      <BlockMath math={claim.formula} />
                    </div>
                  )}
                </div>
                {claim.example && (
                  <div className="rigorous-example">
                    <b>ПРИМЕР</b>
                    <p><RichMatrixText text={claim.example} /></p>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : null}

        {(block.kind === "property" || block.kind === "theorem") && !block.statements?.length && (block.proofs?.length || block.corollaries?.length) && (
          <div className="property-disclosures">
            <div className="property-disclosure-actions">
              {block.proofs?.length ? (
                <button
                  className={propertyPanel === "proof" ? "active" : ""}
                  onClick={() => setPropertyPanel((current) => current === "proof" ? null : "proof")}
                >
                  <span>∵</span>
                  {block.kind === "theorem" ? "Доказательство теоремы" : "Доказательство"}
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
  const baseTopic = topics[topicId];
  const topic = useMemo(() => composeTopicWithSupplements(baseTopic), [baseTopic]);
  const chapter = chapters.find((item) => item.id === topic.chapterId);
  const tracksLearning = isTrackedTopic(topic.id);
  const theorySentinel = useRef<HTMLDivElement>(null);
  const [activeBlock, setActiveBlock] = useState(0);
  const [theoryRead, setTheoryRead] = useState(() => loadSet(THEORY_KEY).has(topic.id));
  const [readingRatio, setReadingRatio] = useState(() =>
    theoryRead ? 1 : (loadReadingProgress()[topic.id] ?? 0),
  );
  const [reachedTheoryEnd, setReachedTheoryEnd] = useState(theoryRead);
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
    const sync = () => {
      const complete = loadSet(THEORY_KEY).has(topic.id);
      setTheoryRead(complete);
      setReadingRatio(complete ? 1 : (loadReadingProgress()[topic.id] ?? 0));
      setSolved(loadSet(SOLVED_KEY));
    };
    sync();

    const refresh = () => sync();
    window.addEventListener(LEARNING_EVENT, refresh);
    return () => window.removeEventListener(LEARNING_EVENT, refresh);
  }, [topic.id]);

  useEffect(() => {
    if (!tracksLearning || theoryRead) return;

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
              (
                entry.intersectionRatio >= 0.35 ||
                entry.intersectionRect.height >= Math.min(320, window.innerHeight * 0.4)
              );

            if (!enoughVisible) {
              cancelDwell(entry.target);
              return;
            }

            if (dwellTimers.has(entry.target)) return;

            const timer = window.setTimeout(() => {
              dwellTimers.delete(entry.target);
              if (document.visibilityState !== "visible") return;

              const index = Number((entry.target as HTMLElement).dataset.blockIndex ?? "-1");
              if (index < 0) return;

              const ratio = markReadingBlock(topic.id, index, topic.blocks.length);
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
  }, [topic.id, topic.blocks.length, theoryRead, tracksLearning]);

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
  }, [topic.id, tracksLearning]);

  const taskIds = practiceTaskIdsByTopic[topic.id] ?? [];
  const progressBreakdown = useMemo(
    () =>
      getTopicProgressBreakdown(topic.id, {
        theory: theoryRead ? new Set([topic.id]) : new Set(),
        solved,
        reading: { [topic.id]: readingRatio },
      }),
    [topic.id, theoryRead, solved, readingRatio],
  );
  const solvedCount = progressBreakdown.solvedCount;
  const practiceRatio = progressBreakdown.practiceRatio;
  const topicProgress = progressBreakdown.total;
  const academyEnabled = Boolean(chapter && ACADEMY_CHAPTERS.has(chapter.id));
  const academyStartIndex = academyEnabled
    ? topic.blocks.findIndex((block) => isAdvancedLearningBlock(topic.id, block))
    : -1;
  const academyTaskIds = academyEnabled
    ? taskIds.filter((id) => id.startsWith("academy-"))
    : [];
  const academyProofCount = academyTaskIds.filter((id) => id.startsWith("academy-proof-")).length;
  const academyCapstoneCount = academyTaskIds.filter((id) => id.includes("capstone")).length;

  const learningArchitecture = useMemo(
    () =>
      toLayeredTopic({
        topic,
        blueprint: linearFoundationBlueprints[topic.id],
      }),
    [topic],
  );

  const completeTheory = () => {
    if (!tracksLearning || theoryRead) return;
    if (!reachedTheoryEnd || !progressBreakdown.canCompleteTheory) return;

    const current = loadSet(THEORY_KEY);
    current.add(topic.id);
    saveReadingProgress(topic.id, 1);
    saveSet(THEORY_KEY, current);
    setReadingRatio(1);
    setTheoryRead(true);
  };

  const jumpToBlock = (index: number) => {
    document
      .getElementById("block-" + topic.id + "-" + index)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="topic-page">
      <header className="topic-hero">
        <div className="eyebrow">
          ГЛАВА {chapter?.number} / § {topic.number} · {chapter?.title}
          {chapter && ACADEMY_CHAPTERS.has(chapter.id) ? " · УГЛУБЛЁННЫЙ МАРШРУТ" : ""}
        </div>
        <div className="hero-title-row">
          <div>
            <h1>{topic.title}</h1>
            <p>{topic.summary}</p>
          </div>

          <div className="topic-learning-status">
            <div>
              <span>МАТЕРИАЛ</span>
              <strong>{Math.round(progressBreakdown.readingRatio * 100)}%</strong>
              <small>просмотрено смысловых блоков</small>
            </div>
            <div>
              <span>ТЕОРИЯ</span>
              <strong>{theoryRead ? "Завершена" : progressBreakdown.canCompleteTheory ? "Готова" : "В процессе"}</strong>
              <small>{theoryRead ? "можно сосредоточиться на задачах" : "нужен контрольный шаг"}</small>
            </div>
            <div>
              <span>ПРАКТИКА</span>
              <strong>{taskIds.length ? solvedCount + " / " + taskIds.length : "—"}</strong>
              <small>{taskIds.length ? Math.round(practiceRatio * 100) + "% задач решено" : "банк задач готовится"}</small>
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

      {tracksLearning && (
        <nav className="topic-mastery-path" aria-label="Этапы освоения темы">
          <div className={progressBreakdown.readingRatio > 0 ? "active" : ""}>
            <span>01</span>
            <strong>Изучение материала</strong>
            <small>{Math.round(progressBreakdown.readingRatio * 100)}% блоков просмотрено</small>
          </div>
          <i aria-hidden="true" />
          <div className={theoryRead ? "complete" : progressBreakdown.canCompleteTheory ? "active" : ""}>
            <span>02</span>
            <strong>Завершение теории</strong>
            <small>{theoryRead ? "завершено" : progressBreakdown.canCompleteTheory ? "можно завершить" : "после основного материала"}</small>
          </div>
          <i aria-hidden="true" />
          <div className={practiceRatio > 0 ? "active" : ""}>
            <span>03</span>
            <strong>Практика</strong>
            <small>{taskIds.length ? solvedCount + " из " + taskIds.length + " задач" : "банк задач готовится"}</small>
          </div>
          <i aria-hidden="true" />
          <div className={topicProgress >= 100 ? "complete" : ""}>
            <span>04</span>
            <strong>Освоение темы</strong>
            <small>{topicProgress >= 100 ? "тема освоена" : topicProgress + "% общего прогресса"}</small>
          </div>
        </nav>
      )}

      <section className="topic-clarity-map" aria-label="Как устроено изучение темы">
        <header>
          <div>
            <span>КАК ПОНЯТЬ ЭТУ ТЕМУ</span>
            <h2>{learningArchitecture.clarityGoal}</h2>
          </div>
          <b>{learningArchitecture.source === "native-v2" ? "СТРУКТУРА V2" : "АДАПТИРОВАНО ИЗ ТЕКУЩЕГО КУРСА"}</b>
        </header>

        <div className="topic-clarity-goals">
          {learningArchitecture.learningGoals.map((goal, index) => (
            <div key={goal}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{goal}</p>
            </div>
          ))}
        </div>

        <div className="topic-layer-rail" aria-label="Слои темы">
          {learningArchitecture.layers.map((layer, index) => {
            const firstBlock = layer.units.find(
              (unit) => unit.legacyBlockIndex !== undefined,
            );
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => {
                  if (firstBlock?.legacyBlockIndex !== undefined) {
                    jumpToBlock(firstBlock.legacyBlockIndex);
                  }
                }}
                disabled={firstBlock?.legacyBlockIndex === undefined}
                title={layer.purpose}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{layer.title}</strong>
                <small>{layer.units.length} {layer.units.length === 1 ? "блок" : "блоков"}</small>
              </button>
            );
          })}
        </div>
      </section>

      {academyEnabled && academyStartIndex >= 0 && (
        <section className="academy-track-banner">
          <div className="academy-track-copy">
            <div className="academy-track-kicker">УГЛУБЛЁННОЕ ИЗУЧЕНИЕ / ЛИНЕЙНАЯ МАТЕМАТИКА</div>
            <h2>Углублённый слой этой темы уже встроен в курс.</h2>
            <p>
              Здесь тема разобрана глубже: концептуальная модель, теоремы и доказательства,
              подробные примеры, интерактивная геометрия, типичные ошибки и более сложные задачи.
            </p>
          </div>

          <div className="academy-track-metrics">
            <div><span>УГЛУБЛЁННЫЕ БЛОКИ</span><strong>5</strong></div>
            <div><span>ДОП. ЗАДАЧИ</span><strong>{academyTaskIds.length}</strong></div>
            <div><span>ДОКАЗАТЕЛЬСТВА</span><strong>{academyProofCount}</strong></div>
            <div><span>ИТОГОВЫЕ ЗАДАЧИ</span><strong>{academyCapstoneCount}</strong></div>
          </div>

          <div className="academy-track-actions">
            <button onClick={() => jumpToBlock(academyStartIndex)}>
              ↓ К углублённой теории
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("practice-" + topic.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              ↓ К углублённым задачам
            </button>
          </div>
        </section>
      )}

      <div className="topic-outline">
        {topic.blocks.map((block, index) => (
          <button
            type="button"
            key={block.title + "-outline"}
            className={activeBlock === index ? "active" : ""}
            aria-current={activeBlock === index ? "step" : undefined}
            onClick={() => document.getElementById("block-" + topic.id + "-" + index)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            {String(index + 1).padStart(2, "0")} · {displayBlockTitle(block.title)}
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

      {tracksLearning && <div className={"theory-finish " + (theoryRead ? "complete" : progressBreakdown.canCompleteTheory && reachedTheoryEnd ? "ready" : "")} ref={theorySentinel}>
        <span>{theoryRead ? "✓" : Math.round(progressBreakdown.readingRatio * 100) + "%"}</span>
        <div>
          <strong>
            {theoryRead
              ? "Теория завершена"
              : progressBreakdown.canCompleteTheory && reachedTheoryEnd
                ? "Материал достаточно изучен"
                : "Продолжай разбирать теорию"}
          </strong>
          <p>
            {theoryRead
              ? "Следующий этап — практика. Прогресс темы будет расти по мере самостоятельного решения задач."
              : progressBreakdown.canCompleteTheory && reachedTheoryEnd
                ? "Если определения, свойства и основные методы понятны, заверши теоретическую часть и переходи к задачам."
                : "Прогресс учитывает только блоки, которые действительно задержались в зоне чтения, а не быстрый скролл страницы. Для завершения теории нужно изучить не менее " + Math.round(THEORY_CHECKPOINT_THRESHOLD * 100) + "% материала и дойти до конца раздела."}
          </p>
          {!theoryRead && (
            <button
              className="theory-complete-button"
              onClick={completeTheory}
              disabled={!reachedTheoryEnd || !progressBreakdown.canCompleteTheory}
            >
              {progressBreakdown.canCompleteTheory && reachedTheoryEnd
                ? "Завершить теорию и перейти к задачам"
                : "Сначала изучи основную часть материала"}
            </button>
          )}
        </div>
      </div>}

      {tracksLearning && <DeferredPracticePanel topicId={topic.id} />}

      <NeighborNav topic={topic} />
    </div>
  );
}
