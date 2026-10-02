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
          <div className="eyebrow">LINEAR LAB / PROTOCOL TRACK</div>
          <h1>Линейная математика как единая система.</h1>
          <p>
            От матриц и векторов до Jordan, SVD, аффинной геометрии, квадрик,
            тензоров и exterior algebra. Здесь собран именно углублённый Academy-слой:
            доказательства, worked examples, визуальные лаборатории, pitfalls,
            hard-exams и proof seminar.
          </p>
        </div>

        <div className="academy-hub-hero-actions">
          <button
            className="academy-hub-primary"
            onClick={() => continueTopic && (window.location.hash = continueTopic)}
          >
            Продолжить Academy →
          </button>
          <button onClick={() => (window.location.hash = "map")}>
            Открыть knowledge map
          </button>
        </div>
      </header>

      <div className="academy-hub-metrics">
        <div><span>CHAPTERS</span><strong>{academyChapters.length}</strong><small>единая ветка</small></div>
        <div><span>TOPICS</span><strong>{topicIds.length}</strong><small>{stats.complete} mastered</small></div>
        <div><span>ACADEMY TASKS</span><strong>{stats.academyTasks}</strong><small>checkpoint + exam + proof</small></div>
        <div><span>PROOF SEMINAR</span><strong>{stats.proofTasks}</strong><small>open response</small></div>
        <div><span>CAPSTONES</span><strong>{stats.capstones}</strong><small>межтемные задачи</small></div>
        <div className="academy-hub-mastery">
          <span>ACADEMY MASTERY</span>
          <strong>{stats.mastery}%</strong>
          <i><b style={{ width: stats.mastery + "%" }} /></i>
        </div>
      </div>

      <div className="academy-hub-flow">
        <span>01 MATRIX LANGUAGE</span><i>→</i>
        <span>02 VECTOR GEOMETRY</span><i>→</i>
        <span>03–05 ANALYTIC / AFFINE</span><i>→</i>
        <span>06 ABSTRACT LINEAR</span><i>→</i>
        <span>07 METRIC / SPECTRAL</span><i>→</i>
        <span>08–09 AFFINE / TENSOR</span>
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
                  <small>ACADEMY CHAPTER</small>
                  <h2>{chapter.title}</h2>
                </div>
                <strong>{progress}%</strong>
              </header>

              <div className="academy-hub-chapter-progress">
                <i style={{ width: progress + "%" }} />
              </div>

              <div className="academy-hub-chapter-meta">
                <span>{chapter.topicIds.length} topics</span>
                <span>{academyTasks} academy tasks</span>
                {proofTasks > 0 && <span>{proofTasks} proof</span>}
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
                        {t.proof > 0 && <em>PROOF</em>}
                        {t.capstone > 0 && <em>CAPSTONE</em>}
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
