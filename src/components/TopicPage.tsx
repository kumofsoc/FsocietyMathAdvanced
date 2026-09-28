import { motion } from "framer-motion";
import { BlockMath } from "react-katex";
import { chapters, topics } from "../data/course";
import type { BlockKind, ContentBlock, Topic } from "../types/course";
import { MatrixLab } from "./MatrixLab";

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

function ContentCard({ block, index }: { block: ContentBlock; index: number }) {
  return (
    <motion.article
      className={`content-block kind-${block.kind}`}
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
        <h3>{block.title}</h3>
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

export function TopicPage({
  topic,
  mastered,
  onToggleMastered,
}: {
  topic: Topic;
  mastered: boolean;
  onToggleMastered: (id: string) => void;
}) {
  const chapter = chapters.find((item) => item.id === topic.chapterId);

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
          <button
            className={`mastery-button ${mastered ? "done" : ""}`}
            onClick={() => onToggleMastered(topic.id)}
          >
            {mastered ? "✓ Освоено" : "Отметить освоенным"}
          </button>
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
          <a href={`#block-${index}`} key={`${block.title}-outline`}>
            {String(index + 1).padStart(2, "0")} · {block.title}
          </a>
        ))}
      </div>

      <section className="lesson-content">
        {topic.blocks.map((block, index) => (
          <div id={`block-${index}`} key={`${topic.id}-${block.title}`}>
            <ContentCard block={block} index={index} />
          </div>
        ))}
      </section>

      {topic.hasLab && <MatrixLab />}

      <NeighborNav topic={topic} />
    </div>
  );
}
