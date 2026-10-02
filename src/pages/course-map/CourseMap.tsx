import { useCallback, useEffect, useMemo, useState } from "react";
import {
  chapters,
  topicListMeta,
  topicMeta,
  type TopicMeta,
} from "@/data/courseMeta";
import {
  buildCourseMapGraph,
  type CourseMapGraphModel,
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

type EdgeMode = "all" | "prerequisite" | "study-flow";

function filterGraphEdges(
  graph: CourseMapGraphModel,
  edgeMode: EdgeMode,
): CourseMapGraphModel {
  if (edgeMode === "all") return graph;
  return {
    nodes: graph.nodes,
    edges: graph.edges.filter((edge) => edge.kind === edgeMode),
  };
}

function CourseMapInner() {
  const [mode, setMode] = useState<CourseMapMode>({ kind: "overview" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [mapFocus, setMapFocus] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [edgeMode, setEdgeMode] = useState<EdgeMode>("all");
  const [search, setSearch] = useState("");
  const [progressVersion, setProgressVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setProgressVersion((value) => value + 1);
    window.addEventListener(LEARNING_EVENT, refresh);
    return () => window.removeEventListener(LEARNING_EVENT, refresh);
  }, []);

  useEffect(() => {
    const overlayOpen = fullscreen || mapFocus;
    document.body.classList.toggle("map-overlay-open", overlayOpen);
    return () => document.body.classList.remove("map-overlay-open");
  }, [fullscreen, mapFocus]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (mapFocus) setMapFocus(false);
      else if (fullscreen) setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, mapFocus]);

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

  const focusTopic = useCallback((topicId: string) => {
    const topic = topicMeta[topicId];
    if (!topic) return;
    setMode({ kind: "chapter", chapterId: topic.chapterId });
    setSelectedId(topic.id);
    setSearch("");
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

  const visibleGraphModel = useMemo(
    () => filterGraphEdges(graphModel, edgeMode),
    [edgeMode, graphModel],
  );

  const searchResults = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ru");
    if (!query) return [];
    return topicListMeta
      .filter((topic) => {
        const haystack =
          topic.number + " " + topic.title + " " + topic.summary;
        return haystack.toLocaleLowerCase("ru").includes(query);
      })
      .slice(0, 8);
  }, [search]);

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

  const inspector = (
    <aside
      className={
        "knowledge-map-inspector " +
        (mapFocus && !inspectorOpen ? "focus-inspector-hidden" : "")
      }
    >
      {selectedTopic ? (
        <>
          <div className="knowledge-inspector-kicker">
            ТЕМА / § {selectedTopic.number}
          </div>
          <h2>{selectedTopic.title}</h2>
          <p>{selectedTopic.summary}</p>

          <div className="knowledge-inspector-progress">
            <span>ОСВОЕНИЕ ТЕМЫ</span>
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
            <span>НУЖНО ЗНАТЬ ДО ЭТОЙ ТЕМЫ</span>
            {selectedTopic.prerequisites.length ? (
              <div className="knowledge-inspector-links">
                {selectedTopic.prerequisites.map((id) => {
                  const prerequisite = topicMeta[id];
                  if (!prerequisite) return null;

                  return (
                    <button
                      key={id}
                      onClick={() => focusTopic(prerequisite.id)}
                    >
                      <small>§ {prerequisite.number}</small>
                      <strong>{prerequisite.title}</strong>
                    </button>
                  );
                })}
              </div>
            ) : (
              <em>Это стартовая тема: обязательных prerequisites нет.</em>
            )}
          </div>

          <div className="knowledge-inspector-section">
            <span>КУДА ИДТИ ДАЛЬШЕ</span>
            {nextTopics.length ? (
              <div className="knowledge-inspector-links">
                {nextTopics.slice(0, 8).map((topic) => (
                  <button key={topic.id} onClick={() => focusTopic(topic.id)}>
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
              Часть prerequisites находится в других разделах. Клик автоматически
              переключит карту на нужную ветку.
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
            {mode.kind === "overview" ? "РАЗДЕЛ КУРСА" : "ТЕКУЩИЙ РАЗДЕЛ"}
          </div>
          <h2>{selectedChapter.title}</h2>
          <p>
            {selectedChapter.topicIds.length} тем. Связи показывают, какие знания
            используются как prerequisites и в каком порядке удобно проходить
            раздел.
          </p>

          <div className="knowledge-inspector-progress">
            <span>ОСВОЕНИЕ РАЗДЕЛА</span>
            <strong>{getChapterProgress(selectedChapter.id, snapshot)}%</strong>
            <i>
              <b
                style={{
                  width: getChapterProgress(selectedChapter.id, snapshot) + "%",
                }}
              />
            </i>
          </div>

          {mode.kind === "overview" && (
            <>
              <div className="knowledge-inspector-section">
                <span>СВЯЗАННЫЕ СЛЕДУЮЩИЕ РАЗДЕЛЫ</span>
                <div className="knowledge-inspector-links">
                  {[...(chapterRelations.get(selectedChapter.id) ?? [])].map(
                    (id) => {
                      const chapter = chapters.find((item) => item.id === id);
                      return chapter ? (
                        <button
                          key={id}
                          onClick={() => setSelectedId("chapter:" + id)}
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
                Открыть темы раздела →
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <div className="knowledge-inspector-kicker">КАК ЧИТАТЬ КАРТУ</div>
          <h2>Выбери узел.</h2>
          <p>
            Один клик показывает локальные зависимости. Двойной клик открывает
            раздел или учебную тему.
          </p>

          <div className="knowledge-inspector-empty">
            <span>01</span>
            <strong>Клик</strong>
            <small>выделить связи</small>
            <span>02</span>
            <strong>Панель</strong>
            <small>посмотреть prerequisites и продолжение</small>
            <span>03</span>
            <strong>Двойной клик</strong>
            <small>открыть материал</small>
          </div>
        </>
      )}
    </aside>
  );

  return (
    <section
      className={
        "knowledge-map-page " +
        (fullscreen ? "knowledge-map-fullscreen " : "") +
        (mapFocus ? "knowledge-map-focus " : "") +
        (mapFocus && !inspectorOpen ? "knowledge-map-focus-wide " : "")
      }
    >
      <header className="knowledge-map-header">
        <div>
          <div className="eyebrow">
            КАРТА ЗНАНИЙ /{" "}
            {mode.kind === "overview"
              ? chapters.length + " РАЗДЕЛА"
              : "РАЗДЕЛ " + currentChapter?.number}
          </div>
          <h1>{currentChapter?.title ?? "Карта высшей математики"}</h1>
          <p>
            {mode.kind === "overview"
              ? "Здесь видно, как разделы высшей математики зависят друг от друга. Открой раздел, чтобы перейти к отдельным темам."
              : "Сплошная связь означает prerequisite: предыдущая тема нужна для следующей. Пунктир показывает рекомендуемый учебный маршрут."}
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
              ← Вся карта
            </button>
          )}
          <button onClick={() => setFullscreen((value) => !value)}>
            {fullscreen ? "× Обычный вид" : "⛶ Развернуть интерфейс"}
          </button>
          <button className="map-focus-entry" onClick={() => setMapFocus(true)}>
            ◎ Только карта
          </button>
        </div>
      </header>

      <div className="knowledge-map-summary">
        <div><span>ПРОГРЕСС КУРСА</span><strong>{courseProgress}%</strong></div>
        <div><span>УЗЛЫ</span><strong>{graphModel.nodes.length}</strong></div>
        <div><span>ВИДИМЫЕ СВЯЗИ</span><strong>{visibleGraphModel.edges.length}</strong></div>
        <div><span>РЕЖИМ</span><strong>{mode.kind === "overview" ? "РАЗДЕЛЫ" : "ТЕМЫ"}</strong></div>
      </div>

      <div className="knowledge-map-controls">
        <div className="knowledge-map-search">
          <label htmlFor="knowledge-map-search">Найти тему</label>
          <input
            id="knowledge-map-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Например: производная, ранг, Фурье…"
          />
          {searchResults.length > 0 && (
            <div className="knowledge-map-search-results">
              {searchResults.map((topic) => (
                <button key={topic.id} onClick={() => focusTopic(topic.id)}>
                  <small>§ {topic.number}</small>
                  <span><strong>{topic.title}</strong><em>{chapters.find((chapter) => chapter.id === topic.chapterId)?.title}</em></span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="knowledge-edge-modes" aria-label="Какие связи показывать">
          <span>Связи:</span>
          {([
            ["all", "Все"],
            ["prerequisite", "Prerequisites"],
            ["study-flow", "Учебный маршрут"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              className={edgeMode === value ? "active" : ""}
              onClick={() => setEdgeMode(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="knowledge-map-legend" aria-label="Легенда карты">
          <span><i className="legend-node" /> узел = раздел или тема</span>
          <span><i className="legend-pre" /> prerequisite</span>
          <span><i className="legend-flow" /> рекомендуемый маршрут</span>
          <span><i className="legend-progress" /> число в узле = освоение</span>
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
            className={mode.kind === "chapter" && mode.chapterId === chapter.id ? "active" : ""}
            onClick={() => openChapter(chapter.id)}
          >
            <span>{chapter.number}</span>
            {chapter.title}
          </button>
        ))}
      </nav>

      <div className="knowledge-map-breadcrumb">
        <button onClick={() => setMode({ kind: "overview" })}>Вся математика</button>
        {currentChapter && <><span>›</span><strong>{currentChapter.title}</strong></>}
        {selectedTopic && <><span>›</span><em>§ {selectedTopic.number} {selectedTopic.title}</em></>}
      </div>

      <div className="knowledge-map-workspace">
        {mapFocus && (
          <div className="map-focus-toolbar">
            <div>
              <strong>{currentChapter?.title ?? "Вся карта высшей математики"}</strong>
              <span>{visibleGraphModel.nodes.length} узлов · {visibleGraphModel.edges.length} связей</span>
            </div>
            <div>
              <button onClick={() => setInspectorOpen((value) => !value)}>
                {inspectorOpen ? "Скрыть панель" : "Показать панель"}
              </button>
              <button onClick={() => setMapFocus(false)}>× Выйти</button>
            </div>
          </div>
        )}

        <div className="knowledge-map-canvas">
          <G6CourseGraph
            model={visibleGraphModel}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onOpen={openGraphNode}
          />
        </div>

        {inspector}
      </div>
    </section>
  );
}

export function CourseMap() {
  return <CourseMapInner />;
}
