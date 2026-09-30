import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  chapters,
  topicListMeta,
  topicMeta,
  type TopicMeta,
} from "../data/courseMeta";
import { LEARNING_EVENT } from "../lib/learning";
import {
  getChapterProgress,
  getCourseProgress,
  getLearningSnapshot,
  getTopicProgress,
} from "../lib/progress";
import "../styles/course-map.css";

type ChapterNodeData = {
  chapterId: string;
  number: string;
  title: string;
  topicCount: number;
  readyCount: number;
  progress: number;
  onOpen: (chapterId: string) => void;
};

type TopicNodeData = {
  topicId: string;
  number: string;
  title: string;
  summary: string;
  progress: number;
  prerequisiteCount: number;
  nextCount: number;
  onOpen: (topicId: string) => void;
};

type GraphMode = { kind: "overview" } | { kind: "chapter"; chapterId: string };

const NODE_WIDTH = 286;
const CHAPTER_WIDTH = 322;

function topologicalDepth(ids: string[], relations: Array<[string, string]>) {
  const idSet = new Set(ids);
  const indegree = new Map(ids.map((id) => [id, 0]));
  const outgoing = new Map(ids.map((id) => [id, [] as string[]]));

  for (const [source, target] of relations) {
    if (!idSet.has(source) || !idSet.has(target) || source === target) continue;
    outgoing.get(source)?.push(target);
    indegree.set(target, (indegree.get(target) ?? 0) + 1);
  }

  const depth = new Map(ids.map((id) => [id, 0]));
  const queue = ids.filter((id) => (indegree.get(id) ?? 0) === 0);

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const source = queue[cursor];
    for (const target of outgoing.get(source) ?? []) {
      depth.set(target, Math.max(depth.get(target) ?? 0, (depth.get(source) ?? 0) + 1));
      const next = (indegree.get(target) ?? 1) - 1;
      indegree.set(target, next);
      if (next === 0) queue.push(target);
    }
  }

  // Cycles are kept visible in the first lane instead of breaking layout.
  ids.forEach((id) => {
    if ((indegree.get(id) ?? 0) > 0) depth.set(id, 0);
  });

  return depth;
}

function positionsByDepth(
  ids: string[],
  relations: Array<[string, string]>,
  columnGap: number,
  rowGap: number,
) {
  const depth = topologicalDepth(ids, relations);
  const lanes = new Map<number, string[]>();

  ids.forEach((id) => {
    const lane = depth.get(id) ?? 0;
    const bucket = lanes.get(lane) ?? [];
    bucket.push(id);
    lanes.set(lane, bucket);
  });

  const positions = new Map<string, { x: number; y: number }>();
  [...lanes.entries()]
    .sort(([a], [b]) => a - b)
    .forEach(([lane, bucket]) => {
      const offset = -((bucket.length - 1) * rowGap) / 2;
      bucket.forEach((id, row) => {
        positions.set(id, {
          x: lane * columnGap,
          y: offset + row * rowGap,
        });
      });
    });

  return positions;
}

function ChapterNode({ data, selected }: NodeProps) {
  const value = data as unknown as ChapterNodeData;
  return (
    <article className={"knowledge-chapter-node " + (selected ? "selected" : "")}>
      <Handle type="target" position={Position.Left} className="knowledge-handle" />
      <div className="knowledge-node-kicker">
        <span>CHAPTER {value.number}</span>
        <small>{value.topicCount} TOPICS</small>
      </div>
      <strong>{value.title}</strong>
      <div className="knowledge-node-stats">
        <span>{value.readyCount}/{value.topicCount} ready</span>
        <b>{value.progress}%</b>
      </div>
      <div className="knowledge-progress">
        <i style={{ width: value.progress + "%" }} />
      </div>
      <button
        className="nodrag nopan"
        onClick={(event) => {
          event.stopPropagation();
          value.onOpen(value.chapterId);
        }}
      >
        Открыть ветку →
      </button>
      <Handle type="source" position={Position.Right} className="knowledge-handle" />
    </article>
  );
}

function TopicNode({ data, selected }: NodeProps) {
  const value = data as unknown as TopicNodeData;
  return (
    <article className={"knowledge-topic-node " + (selected ? "selected" : "")}>
      <Handle type="target" position={Position.Left} className="knowledge-handle" />
      <div className="knowledge-node-kicker">
        <span>§ {value.number}</span>
        <small>{value.prerequisiteCount} PRE · {value.nextCount} NEXT</small>
      </div>
      <strong>{value.title}</strong>
      <p>{value.summary}</p>
      <div className="knowledge-progress">
        <i style={{ width: value.progress + "%" }} />
        <b>{value.progress}%</b>
      </div>
      <button
        className="nodrag nopan"
        onClick={(event) => {
          event.stopPropagation();
          value.onOpen(value.topicId);
        }}
      >
        Открыть тему →
      </button>
      <Handle type="source" position={Position.Right} className="knowledge-handle" />
    </article>
  );
}

const nodeTypes = {
  chapter: ChapterNode,
  topic: TopicNode,
};

function CourseMapInner() {
  const [mode, setMode] = useState<GraphMode>({ kind: "overview" });
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

  const snapshot = useMemo(
    () => getLearningSnapshot(),
    [progressVersion],
  );

  const openTopic = useCallback((topicId: string) => {
    window.location.hash = topicId;
  }, []);

  const openChapter = useCallback((chapterId: string) => {
    setSelectedId(null);
    setMode({ kind: "chapter", chapterId });
  }, []);

  const chapterRelations = useMemo(() => {
    const seen = new Set<string>();
    const relations: Array<[string, string]> = [];

    topicListMeta.forEach((topic) => {
      topic.prerequisites.forEach((prerequisiteId) => {
        const sourceChapter = topicMeta[prerequisiteId]?.chapterId;
        if (!sourceChapter || sourceChapter === topic.chapterId) return;
        const key = sourceChapter + "->" + topic.chapterId;
        if (seen.has(key)) return;
        seen.add(key);
        relations.push([sourceChapter, topic.chapterId]);
      });
    });

    return relations;
  }, []);

  const chapterDependents = useMemo(() => {
    const map = new Map<string, Set<string>>();
    chapterRelations.forEach(([source, target]) => {
      const next = map.get(source) ?? new Set<string>();
      next.add(target);
      map.set(source, next);
    });
    return map;
  }, [chapterRelations]);

  const currentChapter = mode.kind === "chapter"
    ? chapters.find((chapter) => chapter.id === mode.chapterId) ?? null
    : null;

  const topicRelations = useMemo(() => {
    if (!currentChapter) return [] as Array<[string, string]>;
    const visible = new Set(currentChapter.topicIds);
    const relations: Array<[string, string]> = [];

    currentChapter.topicIds.forEach((topicId) => {
      const topic = topicMeta[topicId];
      topic?.prerequisites.forEach((source) => {
        if (visible.has(source)) relations.push([source, topicId]);
      });
    });
    return relations;
  }, [currentChapter]);

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

  const graph = useMemo(() => {
    if (mode.kind === "overview") {
      const ids = chapters.map((chapter) => chapter.id);
      const positions = positionsByDepth(ids, chapterRelations, 410, 190);

      const nodes: Node[] = chapters.map((chapter) => ({
        id: "chapter:" + chapter.id,
        type: "chapter",
        position: positions.get(chapter.id) ?? { x: 0, y: 0 },
        width: CHAPTER_WIDTH,
        selected: selectedId === "chapter:" + chapter.id,
        data: {
          chapterId: chapter.id,
          number: chapter.number,
          title: chapter.title,
          topicCount: chapter.topicIds.length,
          readyCount: chapter.topicIds.filter((id) => !topicMeta[id]?.isStub).length,
          progress: getChapterProgress(chapter.id, snapshot),
          onOpen: openChapter,
        } satisfies ChapterNodeData,
      }));

      const edges: Edge[] = chapterRelations.map(([source, target]) => {
        const sourceId = "chapter:" + source;
        const targetId = "chapter:" + target;
        const active = selectedId === sourceId || selectedId === targetId;
        return {
          id: sourceId + "->" + targetId,
          source: sourceId,
          target: targetId,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
          className:
            selectedId === null
              ? "knowledge-edge"
              : active
                ? "knowledge-edge active"
                : "knowledge-edge dimmed",
        };
      });

      return { nodes, edges };
    }

    const chapter = chapters.find((item) => item.id === mode.chapterId);
    if (!chapter) return { nodes: [] as Node[], edges: [] as Edge[] };

    const positions = positionsByDepth(chapter.topicIds, topicRelations, 370, 210);
    const nodes: Node[] = chapter.topicIds.map((topicId) => {
      const topic = topicMeta[topicId];
      return {
        id: topicId,
        type: "topic",
        position: positions.get(topicId) ?? { x: 0, y: 0 },
        width: NODE_WIDTH,
        selected: selectedId === topicId,
        data: {
          topicId,
          number: topic.number,
          title: topic.title,
          summary: topic.summary,
          progress: getTopicProgress(topicId, snapshot),
          prerequisiteCount: topic.prerequisites.length,
          nextCount: topicDependents.get(topicId)?.length ?? 0,
          onOpen: openTopic,
        } satisfies TopicNodeData,
      };
    });

    const edges: Edge[] = topicRelations.map(([source, target]) => {
      const active = selectedId === source || selectedId === target;
      return {
        id: source + "->" + target,
        source,
        target,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        className:
          selectedId === null
            ? "knowledge-edge"
            : active
              ? "knowledge-edge active"
              : "knowledge-edge dimmed",
      };
    });

    return { nodes, edges };
  }, [
    mode,
    selectedId,
    snapshot,
    chapterRelations,
    topicRelations,
    topicDependents,
    openChapter,
    openTopic,
  ]);

  const focusedNodeIds = useMemo(() => {
    if (!selectedId) return null;
    const result = new Set([selectedId]);

    graph.edges.forEach((edge) => {
      if (edge.source === selectedId) result.add(edge.target);
      if (edge.target === selectedId) result.add(edge.source);
    });

    return result;
  }, [graph.edges, selectedId]);

  const renderedNodes = useMemo(
    () =>
      graph.nodes.map((node) => ({
        ...node,
        className:
          !focusedNodeIds
            ? ""
            : focusedNodeIds.has(node.id)
              ? "knowledge-node-focused"
              : "knowledge-node-dimmed",
      })),
    [graph.nodes, focusedNodeIds],
  );

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
    <section className={"knowledge-map-page " + (fullscreen ? "knowledge-map-fullscreen" : "")}>
      <header className="knowledge-map-header">
        <div>
          <div className="eyebrow">
            KNOWLEDGE MAP / {mode.kind === "overview" ? "23 CHAPTERS" : "CHAPTER " + currentChapter?.number}
          </div>
          <h1>{currentChapter?.title ?? "Карта высшей математики"}</h1>
          <p>
            {mode.kind === "overview"
              ? "Карта строится из реальных prerequisite-связей. Чем правее раздел, тем больше предыдущих идей он использует."
              : "Темы автоматически расположены по зависимостям. Выбери карточку, чтобы подсветить только её prerequisite и следующие шаги."}
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
        <div><span>COURSE</span><strong>{courseProgress}%</strong></div>
        <div><span>NODES</span><strong>{graph.nodes.length}</strong></div>
        <div><span>DEPENDENCIES</span><strong>{graph.edges.length}</strong></div>
        <div><span>MODE</span><strong>{mode.kind === "overview" ? "OVERVIEW" : "TOPICS"}</strong></div>
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

      <div className="knowledge-map-workspace">
        <div className="knowledge-map-canvas">
          <ReactFlow
            key={mode.kind === "overview" ? "overview" : mode.chapterId}
            nodes={renderedNodes}
            edges={graph.edges}
            nodeTypes={nodeTypes}
            onNodeClick={(_event, node) => setSelectedId(node.id)}
            onNodeDoubleClick={(_event, node) => {
              if (mode.kind === "overview") {
                openChapter(node.id.replace("chapter:", ""));
              } else {
                openTopic(node.id);
              }
            }}
            onPaneClick={() => setSelectedId(null)}
            fitView
            fitViewOptions={{ padding: 0.2, maxZoom: 0.95 }}
            minZoom={0.12}
            maxZoom={1.65}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            panOnDrag
            zoomOnScroll
            zoomOnPinch
            selectionOnDrag={false}
          >
            <Background gap={30} size={1} />
            <MiniMap
              pannable
              zoomable
              nodeStrokeWidth={2}
              maskColor="color-mix(in srgb, var(--bg) 76%, transparent)"
            />
            <Controls showInteractive={false} />
          </ReactFlow>

          <div className="knowledge-map-canvas-hint">
            <span>drag canvas</span>
            <span>wheel / pinch = zoom</span>
            <span>click = inspect</span>
            <span>double click = open</span>
          </div>
        </div>

        <aside className="knowledge-map-inspector">
          {selectedTopic ? (
            <>
              <div className="knowledge-inspector-kicker">SELECTED / § {selectedTopic.number}</div>
              <h2>{selectedTopic.title}</h2>
              <p>{selectedTopic.summary}</p>

              <div className="knowledge-inspector-progress">
                <span>MASTERY</span>
                <strong>{getTopicProgress(selectedTopic.id, snapshot)}%</strong>
                <i><b style={{ width: getTopicProgress(selectedTopic.id, snapshot) + "%" }} /></i>
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
                            if (prerequisite.chapterId === selectedTopic.chapterId) {
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
                  Есть prerequisites из других разделов — клик по ним переключит ветку карты.
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
                {mode.kind === "overview" ? "SELECTED CHAPTER" : "CURRENT BRANCH"}
              </div>
              <h2>{selectedChapter.title}</h2>
              <p>
                {selectedChapter.topicIds.length} тем. Карта показывает только реальные
                зависимости, а не искусственную линейную последовательность.
              </p>
              <div className="knowledge-inspector-progress">
                <span>CHAPTER MASTERY</span>
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
                    <span>LEADS TO</span>
                    <div className="knowledge-inspector-links">
                      {[...(chapterDependents.get(selectedChapter.id) ?? [])].map((id) => {
                        const chapter = chapters.find((item) => item.id === id);
                        return chapter ? (
                          <button key={id} onClick={() => setSelectedId("chapter:" + id)}>
                            <small>{chapter.number}</small>
                            <strong>{chapter.title}</strong>
                          </button>
                        ) : null;
                      })}
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
                Карта больше не является редактором карточек. Никаких rotate, scale и
                сохранённых ручных раскладок: только структура курса и зависимости.
              </p>
              <div className="knowledge-inspector-empty">
                <span>01</span><strong>Click</strong><small>подсветить локальную сеть</small>
                <span>02</span><strong>Inspect</strong><small>увидеть prerequisites и next</small>
                <span>03</span><strong>Open</strong><small>перейти в учебный материал</small>
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}

export function CourseMap() {
  return (
    <ReactFlowProvider>
      <CourseMapInner />
    </ReactFlowProvider>
  );
}
