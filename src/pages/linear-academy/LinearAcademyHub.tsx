import { useEffect, useMemo, useState } from "react";
import { chapters, topicMeta } from "@/data/courseMeta";
import { practiceTaskIdsByTopic } from "@/data/practiceMeta";
import { LEARNING_EVENT } from "@/features/learning/model/learning";
import { getLearningSnapshot, getTopicProgress } from "@/features/learning/model/progress";
import "@/styles/linear-academy-hub.css";

const ACADEMY_CHAPTER_IDS = [
  "linear",
  "vectors",
  "plane-geometry",
  "space-geometry",
  "plane-transformations",
  "abstract-linear",
  "euclidean",
  "affine-general",
  "tensor-algebra",
] as const;

function taskStats(topicId: string) {
  const ids = practiceTaskIdsByTopic[topicId] ?? [];
  const academy = ids.filter((id) => id.startsWith("academy-"));
  return {
    academy: academy.length,
    proof: academy.filter((id) => id.startsWith("academy-proof-")).length,
    capstone: academy.filter((id) => id.includes("capstone")).length,
  };
}

export function LinearAcademyHub() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setVersion((value) => value + 1);
    window.addEventListener(LEARNING_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(LEARNING_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const snapshot = useMemo(() => getLearningSnapshot(), [version]);
  const academyChapters = useMemo(
    () => chapters.filter((chapter) => ACADEMY_CHAPTER_IDS.includes(chapter.id as typeof ACADEMY_CHAPTER_IDS[number])),
    [],
  );

  const topicIds = useMemo(
    () => academyChapters.flatMap((chapter) => chapter.topicIds),
    [academyChapters],
  );

  const stats = useMemo(() => {
    const topicProgress = topicIds.map((id) => getTopicProgress(id, snapshot));
    const academyTasks = topicIds.reduce((sum, id) => sum + taskStats(id).academy, 0);
    const proofTasks = topicIds.reduce((sum, id) => sum + taskStats(id).proof, 0);
    const capstones = topicIds.reduce((sum, id) => sum + taskStats(id).capstone, 0);
    const mastery = topicProgress.length
      ? Math.round(topicProgress.reduce((sum, value) => sum + value, 0) / topicProgress.length)
      : 0;
    const complete = topicProgress.filter((value) => value >= 100).length;
    return { academyTasks, proofTasks, capstones, mastery, complete };
  }, [snapshot, topicIds]);

  const continueTopic = topicIds.find((id) => getTopicProgress(id, snapshot) < 100) ?? topicIds[0];

  return (
    <section className="academy-hub">
      <header className="academy-hub-hero">
        <div>
          <div className="eyebrow">УГЛУБЛЁННЫЙ КУРС / ЛИНЕЙНАЯ МАТЕМАТИКА</div>
          <h1>Линейная математика как единая система.</h1>
          <p>
            От матриц и векторов до жордановой формы, SVD, аффинной геометрии и квадрик,
            тензоров и внешней алгебры. Здесь собран углублённый маршрут: доказательства, подробно разобранные примеры,
            визуальные лаборатории, типичные ошибки, сложные проверочные задачи
            и отдельные задачи на доказательство.
          </p>
        </div>

        <div className="academy-hub-hero-actions">
          <button
            className="academy-hub-primary"
            onClick={() => continueTopic && (window.location.hash = continueTopic)}
          >
            Продолжить обучение →
          </button>
          <button onClick={() => (window.location.hash = "map")}>
            Открыть карту курса
          </button>
        </div>
      </header>

      <div className="academy-hub-metrics">
        <div><span>РАЗДЕЛЫ</span><strong>{academyChapters.length}</strong><small>единая ветка</small></div>
        <div><span>ТЕМЫ</span><strong>{topicIds.length}</strong><small>{stats.complete} завершено</small></div>
        <div><span>УГЛУБЛЁННЫЕ ЗАДАЧИ</span><strong>{stats.academyTasks}</strong><small>проверка + итоговая задача + доказательство</small></div>
        <div><span>ДОКАЗАТЕЛЬСТВА</span><strong>{stats.proofTasks}</strong><small>развёрнутый ответ</small></div>
        <div><span>ИТОГОВЫЕ ЗАДАЧИ</span><strong>{stats.capstones}</strong><small>межтематические задачи</small></div>
        <div className="academy-hub-mastery">
          <span>ОСВОЕНИЕ</span>
          <strong>{stats.mastery}%</strong>
          <i><b style={{ width: stats.mastery + "%" }} /></i>
        </div>
      </div>

      <div className="academy-hub-flow">
        <span>01 МАТРИЦЫ</span><i>→</i>
        <span>02 ВЕКТОРНАЯ ГЕОМЕТРИЯ</span><i>→</i>
        <span>03–05 АНАЛИТИЧЕСКАЯ И АФФИННАЯ</span><i>→</i>
        <span>06 ЛИНЕЙНЫЕ ПРОСТРАНСТВА</span><i>→</i>
        <span>07 МЕТРИКА И СПЕКТР</span><i>→</i>
        <span>08–09 АФФИННАЯ И ТЕНЗОРЫ</span>
      </div>

      <div className="academy-hub-chapters">
        {academyChapters.map((chapter) => {
          const progresses = chapter.topicIds.map((id) => getTopicProgress(id, snapshot));
          const progress = progresses.length
            ? Math.round(progresses.reduce((sum, value) => sum + value, 0) / progresses.length)
            : 0;
          const academyTasks = chapter.topicIds.reduce((sum, id) => sum + taskStats(id).academy, 0);
          const proofTasks = chapter.topicIds.reduce((sum, id) => sum + taskStats(id).proof, 0);

          return (
            <article className="academy-hub-chapter" key={chapter.id}>
              <header>
                <span>{chapter.number}</span>
                <div>
                  <small>РАЗДЕЛ КУРСА</small>
                  <h2>{chapter.title}</h2>
                </div>
                <strong>{progress}%</strong>
              </header>

              <div className="academy-hub-chapter-progress">
                <i style={{ width: progress + "%" }} />
              </div>

              <div className="academy-hub-chapter-meta">
                <span>{chapter.topicIds.length} тем</span>
                <span>{academyTasks} углублённых задач</span>
                {proofTasks > 0 && <span>{proofTasks} доказательств</span>}
              </div>

              <div className="academy-hub-topic-list">
                {chapter.topicIds.map((id) => {
                  const topic = topicMeta[id];
                  if (!topic) return null;
                  const progress = getTopicProgress(id, snapshot);
                  const t = taskStats(id);
                  return (
                    <button key={id} onClick={() => (window.location.hash = id)}>
                      <span className="academy-hub-topic-state">
                        {progress >= 100 ? "●" : progress > 0 ? "◐" : "○"}
                      </span>
                      <span className="academy-hub-topic-title">
                        <small>§ {topic.number}</small>
                        <strong>{topic.title}</strong>
                      </span>
                      <span className="academy-hub-topic-tags">
                        {t.proof > 0 && <em>ДОКАЗАТЕЛЬСТВО</em>}
                        {t.capstone > 0 && <em>ИТОГОВАЯ</em>}
                        <b>{progress}%</b>
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                className="academy-hub-chapter-open"
                onClick={() => (window.location.hash = chapter.topicIds[0])}
              >
                Начать главу →
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
