import { motion } from "framer-motion";
import { BlockMath } from "react-katex";
import { useEffect, useMemo, useRef, useState } from "react";
import { chapters, topics } from "../data/course";
import { practiceByTopic } from "../data/practice";
import {
  LEARNING_EVENT,
  loadSavedTheorems,
  loadSet,
  saveSet,
  saveTheorems,
  SOLVED_KEY,
  THEORY_KEY,
} from "../lib/learning";
import type { BlockKind, ContentBlock, Topic } from "../types/course";
import { MatrixLab } from "./MatrixLab";
import { MatrixTypesGallery } from "./MatrixTypesGallery";
import { PracticePanel } from "./PracticePanel";

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
  const [saved, setSaved] = useState(() => loadSavedTheorems().some((item) => item.id === theoremId));

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
      className={"content-block kind-" + block.kind}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.44, delay: Math.min(index * 0.018, 0.16) }}
    >
      <div className="block-rail">
        <span>{labels[block.kind]}</span>
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
        <p>{block.body}</p>

        {block.formula && (
          <div className="formula-box">
            <BlockMath math={block.formula} />
          </div>
        )}

        {block.items && (
          <ul className="property-list">
            {block.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}

        {block.dependsOn && (
          <div className="depends-row">
            <span>Использует:</span>
            {block.dependsOn.map((dependency) => <b key={dependency}>{dependency}</b>)}
          </div>
        )}
      </div>
    </motion.article>
  );
}

function NeighborNav({ topic }: { topic: Topic }) {
  const chapter = chapters.find((item) => item.id === topic.chapterId);
  const index = chapter?.topicIds.indexOf(topic.id) ?? -1;
  const previous = index > 0 ? topics[chapter!.topicIds[index - 1]] : undefined;
  const next = chapter && index >= 0 && index < chapter.topicIds.length - 1
    ? topics[chapter.topicIds[index + 1]]
    : undefined;

  return (
    <nav className="neighbor-nav">
      <button
        disabled={!previous}
        onClick={() => previous && (window.location.hash = previous.id)}
      >
        <span>Предыдущая тема</span>
        <strong>{previous?.title ?? "Начало главы"}</strong>
      </button>
      <button
        disabled={!next}
        onClick={() => next && (window.location.hash = next.id)}
      >
        <span>Следующая тема</span>
        <strong>{next?.title ?? "Конец главы"}</strong>
      </button>
    </nav>
  );
}

export function TopicPage({ topic }: { topic: Topic }) {
  const chapter = chapters.find((item) => item.id === topic.chapterId);
  const isLinear = topic.chapterId === "linear";
  const theorySentinel = useRef<HTMLDivElement>(null);
  const [theoryRead, setTheoryRead] = useState(() => loadSet(THEORY_KEY).has(topic.id));
  const [solved, setSolved] = useState(() => loadSet(SOLVED_KEY));

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
    if (!isLinear || !target || theoryRead) return;

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
  }, [topic.id, theoryRead, isLinear]);

  const tasks = practiceByTopic[topic.id] ?? [];
  const solvedCount = useMemo(
    () => tasks.filter((task) => solved.has(task.id)).length,
    [tasks, solved],
  );
  const practiceRatio = tasks.length ? solvedCount / tasks.length : 0;
  const topicProgress = Math.round((theoryRead ? 50 : 0) + practiceRatio * 50);

  return (
    <div className="topic-page">
      <header className="topic-hero">
        <div className="eyebrow">
          ГЛАВА {chapter?.number} / § {topic.number} · {chapter?.title}
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
              <small>{tasks.length ? solvedCount + " / " + tasks.length + " задач" : "банк готовится"}</small>
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
            onClick={() => document.getElementById("block-" + index)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            {String(index + 1).padStart(2, "0")} · {block.title}
          </button>
        ))}
      </div>

      <section className="lesson-content">
        {topic.blocks.map((block, index) => (
          <div id={"block-" + index} key={topic.id + "-" + block.title}>
            <ContentCard topic={topic} block={block} index={index} />
            {topic.id === "matrices" && index === 0 && <MatrixTypesGallery />}
          </div>
        ))}
      </section>

      {topic.hasLab && <MatrixLab />}

      {isLinear && <div className="theory-finish" ref={theorySentinel}>
        <span>{theoryRead ? "✓" : "↓"}</span>
        <div>
          <strong>{theoryRead ? "Теория отмечена как прочитанная" : "Конец теории"}</strong>
          <p>
            {theoryRead
              ? "Это даёт только половину прогресса темы. Остальное — через задачи."
              : "Когда этот блок появляется на экране, теория автоматически засчитывается как прочитанная."}
          </p>
        </div>
      </div>}

      {isLinear && <PracticePanel topicId={topic.id} />}

      <NeighborNav topic={topic} />
    </div>
  );
}
