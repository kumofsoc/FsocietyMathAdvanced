import { useCallback, useEffect, useMemo, useState } from "react";
import {
  chapters,
  topicListMeta,
  topicMeta,
  type TopicMeta,
} from "@/data/courseMeta";
import {
  buildCourseMapGraph,
  type CourseMapMode,
} from "@/features/course-map/model/courseMapGraph";
import { G6CourseGraph } from "@/features/course-map/ui/G6CourseGraph";
import { LEARNING_EVENT } from "@/features/learning/model/learning";
import {
  getChapterProgress,
  getCourseProgress,
  getLearningSnapshot,
  getTopicProgress,
} from "@/features/learning/model/progress";
import "@/styles/course-map.css";

function CourseMapInner() {
  const [mode, setMode] = useState<CourseMapMode>({ kind: "overview" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [progressVersion, setProgressVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setProgressVersion((value) => value + 1);
    window.addEventListener(LEARNING_EVENT, refresh);
    return () => window.removeEventListener(LEARNING_EVENT, refresh);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("map-overlay-open", fullscreen);
    return () => document.body.classList.remove("map-overlay-open");
  }, [fullscreen]);

  const snapshot = useMemo(() => getLearningSnapshot(), [progressVersion]);

  const currentChapter =
    mode.kind === "chapter"
      ? chapters.find((chapter) => chapter.id === mode.chapterId) ?? null
      : null;

  const openTopic = useCallback((topicId: string) => {
    window.location.hash = topicId;
  }, []);

  const openChapter = useCallback((chapterId: string) => {
    setSelectedId(null);
    setMode({ kind: "chapter", chapterId });
  }, []);

  const openGraphNode = useCallback(
    (id: string) => {
      if (mode.kind === "overview") {
        openChapter(id.replace(/^chapter:/, ""));
      } else {
        openTopic(id);
      }
    },
    [mode.kind, openChapter, openTopic],
  );

  const graphModel = useMemo(
    () =>
      buildCourseMapGraph({
        mode,
        chapters,
        topics: topicMeta,
        chapterProgress: (chapterId) => getChapterProgress(chapterId, snapshot),
        topicProgress: (topicId) => getTopicProgress(topicId, snapshot),
      }),
    [mode, snapshot],
  );

  const chapterRelations = useMemo(() => {
    const relations = new Map<string, Set<string>>();

    topicListMeta.forEach((topic) => {
      topic.prerequisites.forEach((prerequisiteId) => {
        const sourceChapter = topicMeta[prerequisiteId]?.chapterId;
        if (!sourceChapter || sourceChapter === topic.chapterId) return;

        const targets = relations.get(sourceChapter) ?? new Set<string>();
        targets.add(topic.chapterId);
        relations.set(sourceChapter, targets);
      });
    });

    return relations;
  }, []);

  const topicDependents = useMemo(() => {
    const map = new Map<string, string[]>();

    topicListMeta.forEach((topic) => {
      topic.prerequisites.forEach((source) => {
        const list = map.get(source) ?? [];
        list.push(topic.id);
        map.set(source, list);
      });
    });

    return map;
  }, []);

  const selectedTopic =
    mode.kind === "chapter" && selectedId ? topicMeta[selectedId] : undefined;

  const selectedChapterId =
    mode.kind === "overview" && selectedId?.startsWith("chapter:")
      ? selectedId.slice("chapter:".length)
      : null;

  const selectedChapter = selectedChapterId
    ? chapters.find((chapter) => chapter.id === selectedChapterId)
    : currentChapter;

  const externalPrerequisites = selectedTopic
    ? selectedTopic.prerequisites
        .map((id) => topicMeta[id])
        .filter(
          (topic): topic is TopicMeta =>
            Boolean(topic && topic.chapterId !== selectedTopic.chapterId),
        )
    : [];

  const nextTopics = selectedTopic
    ? (topicDependents.get(selectedTopic.id) ?? [])
        .map((id) => topicMeta[id])
        .filter((topic): topic is TopicMeta => Boolean(topic))
    : [];

  const courseProgress = getCourseProgress(snapshot);

  return (
    <section
      className={
        "knowledge-map-page " + (fullscreen ? "knowledge-map-fullscreen" : "")
      }
    >
      <header className="knowledge-map-header">
        <div>
          <div className="eyebrow">
            KNOWLEDGE MAP /{" "}
            {mode.kind === "overview"
              ? chapters.length + " CHAPTERS"
              : "CHAPTER " + currentChapter?.number}
          </div>
          <h1>{currentChapter?.title ?? "Карта высшей математики"}</h1>
          <p>
            {mode.kind === "overview"
              ? "Разделы автоматически выстраиваются по реальным зависимостям курса."
              : "Темы автоматически выстраиваются слева направо: сплошные связи — prerequisites, пунктир — учебный маршрут."}
          </p>
        </div>

        <div className="knowledge-map-header-actions">
          {mode.kind === "chapter" && (
            <button
              onClick={() => {
                setSelectedId(null);
                setMode({ kind: "overview" });
              }}
            >
              ← Все разделы
            </button>
          )}
          <button onClick={() => setFullscreen((value) => !value)}>
            {fullscreen ? "× Закрыть" : "⛶ Full screen"}
          </button>
        </div>
      </header>

      <div className="knowledge-map-summary">
        <div>
          <span>COURSE</span>
          <strong>{courseProgress}%</strong>
        </div>
        <div>
          <span>NODES</span>
          <strong>{graphModel.nodes.length}</strong>
        </div>
        <div>
          <span>CONNECTIONS</span>
          <strong>{graphModel.edges.length}</strong>
        </div>
        <div>
          <span>MODE</span>
          <strong>{mode.kind === "overview" ? "OVERVIEW" : "TOPICS"}</strong>
        </div>
      </div>

      <nav className="knowledge-map-tabs" aria-label="Разделы карты">
        <button
          className={mode.kind === "overview" ? "active" : ""}
          onClick={() => {
            setSelectedId(null);
            setMode({ kind: "overview" });
          }}
        >
          <span>00</span>
          Весь курс
        </button>

        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            className={
              mode.kind === "chapter" && mode.chapterId === chapter.id
                ? "active"
                : ""
            }
            onClick={() => openChapter(chapter.id)}
          >
            <span>{chapter.number}</span>
            {chapter.title}
          </button>
        ))}
      </nav>

      <div className="knowledge-map-workspace">
        <div className="knowledge-map-canvas">
          <G6CourseGraph
            model={graphModel}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onOpen={openGraphNode}
          />
        </div>

        <aside className="knowledge-map-inspector">
          {selectedTopic ? (
            <>
              <div className="knowledge-inspector-kicker">
                SELECTED / § {selectedTopic.number}
              </div>
              <h2>{selectedTopic.title}</h2>
              <p>{selectedTopic.summary}</p>

              <div className="knowledge-inspector-progress">
                <span>MASTERY</span>
                <strong>{getTopicProgress(selectedTopic.id, snapshot)}%</strong>
                <i>
                  <b
                    style={{
                      width: getTopicProgress(selectedTopic.id, snapshot) + "%",
                    }}
                  />
                </i>
              </div>

              <div className="knowledge-inspector-section">
                <span>PREREQUISITES</span>
                {selectedTopic.prerequisites.length ? (
                  <div className="knowledge-inspector-links">
                    {selectedTopic.prerequisites.map((id) => {
                      const prerequisite = topicMeta[id];
                      if (!prerequisite) return null;

                      return (
                        <button
                          key={id}
                          onClick={() => {
                            if (
                              prerequisite.chapterId === selectedTopic.chapterId
                            ) {
                              setSelectedId(id);
                            } else {
                              openChapter(prerequisite.chapterId);
                            }
                          }}
                        >
                          <small>§ {prerequisite.number}</small>
                          <strong>{prerequisite.title}</strong>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <em>Стартовая тема: prerequisites нет.</em>
                )}
              </div>

              <div className="knowledge-inspector-section">
                <span>NEXT</span>
                {nextTopics.length ? (
                  <div className="knowledge-inspector-links">
                    {nextTopics.slice(0, 8).map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => {
                          if (topic.chapterId === selectedTopic.chapterId) {
                            setSelectedId(topic.id);
                          } else {
                            openChapter(topic.chapterId);
                          }
                        }}
                      >
                        <small>§ {topic.number}</small>
                        <strong>{topic.title}</strong>
                      </button>
                    ))}
                  </div>
                ) : (
                  <em>Из этой темы нет прямой исходящей зависимости.</em>
                )}
              </div>

              {externalPrerequisites.length > 0 && (
                <div className="knowledge-inspector-note">
                  Есть prerequisites из других разделов. Клик переключит ветку
                  карты.
                </div>
              )}

              <button
                className="knowledge-inspector-primary"
                onClick={() => openTopic(selectedTopic.id)}
              >
                Открыть тему →
              </button>
            </>
          ) : selectedChapter ? (
            <>
              <div className="knowledge-inspector-kicker">
                {mode.kind === "overview"
                  ? "SELECTED CHAPTER"
                  : "CURRENT BRANCH"}
              </div>
              <h2>{selectedChapter.title}</h2>
              <p>
                {selectedChapter.topicIds.length} тем. Позиции и маршруты
                рассчитываются из одной модели зависимостей.
              </p>

              <div className="knowledge-inspector-progress">
                <span>CHAPTER MASTERY</span>
                <strong>
                  {getChapterProgress(selectedChapter.id, snapshot)}%
                </strong>
                <i>
                  <b
                    style={{
                      width:
                        getChapterProgress(selectedChapter.id, snapshot) + "%",
                    }}
                  />
                </i>
              </div>

              {mode.kind === "overview" && (
                <>
                  <div className="knowledge-inspector-section">
                    <span>LEADS TO</span>
                    <div className="knowledge-inspector-links">
                      {[...(chapterRelations.get(selectedChapter.id) ?? [])].map(
                        (id) => {
                          const chapter = chapters.find(
                            (item) => item.id === id,
                          );
                          return chapter ? (
                            <button
                              key={id}
                              onClick={() =>
                                setSelectedId("chapter:" + id)
                              }
                            >
                              <small>{chapter.number}</small>
                              <strong>{chapter.title}</strong>
                            </button>
                          ) : null;
                        },
                      )}
                    </div>
                  </div>

                  <button
                    className="knowledge-inspector-primary"
                    onClick={() => openChapter(selectedChapter.id)}
                  >
                    Открыть ветку →
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <div className="knowledge-inspector-kicker">MAP INSPECTOR</div>
              <h2>Выбери узел.</h2>
              <p>
                Клик подсвечивает локальную сеть. Двойной клик открывает раздел
                или учебную тему.
              </p>

              <div className="knowledge-inspector-empty">
                <span>01</span>
                <strong>Click</strong>
                <small>подсветить зависимости</small>
                <span>02</span>
                <strong>Inspect</strong>
                <small>увидеть prerequisites и next</small>
                <span>03</span>
                <strong>Open</strong>
                <small>перейти в материал</small>
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}

export function CourseMap() {
  return <CourseMapInner />;
}
