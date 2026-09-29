import {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getSmoothStepPath,
  useNodesState,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { chapters, topicList, topics } from "../data/course";
import { practiceByTopic } from "../data/practice";
import { LEARNING_EVENT, loadSet, SOLVED_KEY, THEORY_KEY } from "../lib/learning";
import type { GraphNodeData } from "../types/course";

const STORAGE_KEY = "fsociety-course-map-layout-v2";

type StoredLayout = Record<string, { x: number; y: number; rotation: number; scale?: number }>;

type GroupNodeData = {
  chapterId: string;
  number: string;
  title: string;
  topicCount: number;
  progress: number;
  rotation: number;
  scale: number;
  onOpen: (id: string) => void;
  onRotate: (id: string, delta: number) => void;
  onScale: (id: string, scale: number) => void;
};

type DependencyEdgeData = {
  sourceLabel: string;
  targetLabel: string;
  sourceNumber?: string;
  targetNumber?: string;
  relationLabel: string;
  onOpenTarget?: () => void;
};

function readLayout(): StoredLayout {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function progressForTopic(id: string) {
  const chapterId = topics[id]?.chapterId;
  if (!["linear", "vectors", "plane-geometry", "space-geometry", "plane-transformations", "abstract-linear", "euclidean", "affine-general", "tensor-algebra", "analysis-intro", "indef-integral", "def-integral"].includes(chapterId ?? "")) return 0;
  const theory = loadSet(THEORY_KEY).has(id) ? 50 : 0;
  const tasks = practiceByTopic[id] ?? [];
  if (!tasks.length) return theory;

  const solved = loadSet(SOLVED_KEY);
  const solvedCount = tasks.filter((task) => solved.has(task.id)).length;
  return Math.round(theory + (solvedCount / tasks.length) * 50);
}

function progressForChapter(chapterId: string) {
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter || !["linear", "vectors", "plane-geometry", "space-geometry", "plane-transformations", "abstract-linear", "euclidean", "affine-general", "tensor-algebra", "analysis-intro", "indef-integral", "def-integral"].includes(chapter.id)) return 0;
  const values = chapter.topicIds.map(progressForTopic);
  return values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : 0;
}

function DependencyEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    style,
    data,
  } = props;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 18,
    offset: 34,
  });

  const meta = (data ?? {}) as DependencyEdgeData;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
        interactionWidth={34}
      />

      <EdgeLabelRenderer>
        <button
          className="map-edge-label nodrag nopan"
          style={{
            transform:
              "translate(-50%, -50%) translate(" + labelX + "px, " + labelY + "px)",
          }}
          onClick={(event) => {
            event.stopPropagation();
            meta.onOpenTarget?.();
          }}
          title={
            meta.sourceLabel && meta.targetLabel
              ? meta.sourceLabel + " → " + meta.targetLabel
              : undefined
          }
        >
          <span className="map-edge-route">
            {meta.sourceNumber && <b>{meta.sourceNumber}</b>}
            <i>→</i>
            {meta.targetNumber && <b>{meta.targetNumber}</b>}
          </span>
          <span className="map-edge-names">
            <strong>{meta.sourceLabel}</strong>
            <i>→</i>
            <strong>{meta.targetLabel}</strong>
          </span>
          <small>{meta.relationLabel}</small>
        </button>
      </EdgeLabelRenderer>
    </>
  );
}

function TransformGizmos({
  selector,
  rotation,
  scale,
  onRotate,
  onScale,
}: {
  selector: string;
  rotation: number;
  scale: number;
  onRotate: (delta: number) => void;
  onScale: (scale: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [anchors, setAnchors] = useState({
    rotateLeft: 0,
    rotateTop: 0,
    scaleLeft: 0,
    scaleTop: 0,
    ready: false,
  });

  const measure = useCallback(() => {
    const host = hostRef.current;
    const root = host?.parentElement;
    const card = root?.querySelector<HTMLElement>(selector);
    if (!host || !root || !card) return;

    const rootRect = root.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const gap = 13;

    setAnchors({
      rotateLeft: cardRect.right - rootRect.left + gap,
      rotateTop: cardRect.bottom - rootRect.top + gap,
      scaleLeft: cardRect.left - rootRect.left - gap,
      scaleTop: cardRect.bottom - rootRect.top + gap,
      ready: true,
    });
  }, [selector]);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(measure);
    const root = hostRef.current?.parentElement;
    const card = root?.querySelector<HTMLElement>(selector);
    const observer = new ResizeObserver(measure);
    if (card) observer.observe(card);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, rotation, scale]);

  const startRotate = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const root = hostRef.current?.parentElement;
    const card = root?.querySelector<HTMLElement>(selector);
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let lastAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX);

    const move = (pointer: PointerEvent) => {
      const nextAngle = Math.atan2(pointer.clientY - centerY, pointer.clientX - centerX);
      let delta = ((nextAngle - lastAngle) * 180) / Math.PI;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      lastAngle = nextAngle;
      onRotate(delta);
    };

    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  };

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const root = hostRef.current?.parentElement;
    const card = root?.querySelector<HTMLElement>(selector);
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startDistance = Math.max(
      24,
      Math.hypot(event.clientX - centerX, event.clientY - centerY),
    );
    const startScale = scale;

    const move = (pointer: PointerEvent) => {
      const distance = Math.max(
        24,
        Math.hypot(pointer.clientX - centerX, pointer.clientY - centerY),
      );
      const next = Math.min(
        1.55,
        Math.max(0.72, startScale * (distance / startDistance)),
      );
      onScale(Number(next.toFixed(3)));
    };

    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  };

  return (
    <div ref={hostRef} className={"map-transform-gizmos " + (anchors.ready ? "ready" : "")}>
      <button
        className="map-rotate-gizmo nodrag nopan"
        style={{ left: anchors.rotateLeft, top: anchors.rotateTop }}
        onPointerDown={startRotate}
        title="Потяни по окружности, чтобы повернуть карточку"
        aria-label="Повернуть карточку"
      >
        <span>↻</span>
        <i />
      </button>

      <button
        className="map-resize-gizmo nodrag nopan"
        style={{ left: anchors.scaleLeft, top: anchors.scaleTop }}
        onPointerDown={startResize}
        title="Потяни наружу или внутрь, чтобы изменить размер"
        aria-label="Изменить размер карточки"
      >
        <span>↘</span>
      </button>
    </div>
  );
}

function TopicNodeCard({ id, data }: NodeProps) {
  const value = data as unknown as GraphNodeData;

  return (
    <>
      <Handle
        id="in"
        type="target"
        position={Position.Left}
        className="map-handle map-handle-target"
        isConnectable={false}
      />
      <span className="map-port-caption map-port-caption-in">НУЖНО ДО</span>

      <div
        className="map-topic-card"
        style={{
          transform:
            "rotate(" + (value.rotation ?? 0) + "deg) scale(" + (value.scale ?? 1) + ")",
        }}
        data-cursor="active"
      >
        <div className="map-topic-meta">
          <span>§ {value.number}</span>
          <span>{value.chapter}</span>
        </div>
        <strong>{value.label}</strong>
        <p>{value.summary}</p>

        <div className="map-progress-mini">
          <i style={{ width: (value.progress ?? 0) + "%" }} />
          <span>{value.progress ?? 0}%</span>
        </div>

        <div className="map-card-actions">
          <button onClick={() => value.onOpen(id)}>Открыть тему →</button>
        </div>
        <div className="map-node-hint">drag = move · ↻ rotate · ↘ resize</div>
      </div>

      <TransformGizmos
        selector=".map-topic-card"
        rotation={value.rotation ?? 0}
        scale={value.scale ?? 1}
        onRotate={(delta) => value.onRotate(id, delta)}
        onScale={(nextScale) => value.onScale?.(id, nextScale)}
      />

      <span className="map-port-caption map-port-caption-out">ВЕДЁТ К</span>
      <Handle
        id="out"
        type="source"
        position={Position.Right}
        className="map-handle map-handle-source"
        isConnectable={false}
      />
    </>
  );
}

function ChapterGroupCard({ id, data }: NodeProps) {
  const value = data as unknown as GroupNodeData;

  return (
    <>
      <Handle
        id="in"
        type="target"
        position={Position.Left}
        className="map-handle group-handle"
        isConnectable={false}
      />
      <span className="map-port-caption map-port-caption-in">ЗАВИСИТ ОТ</span>

      <div
        className="map-group-card"
        style={{
          transform:
            "rotate(" + (value.rotation ?? 0) + "deg) scale(" + (value.scale ?? 1) + ")",
        }}
        data-cursor="active"
      >
        <div className="map-group-number">{value.number}</div>
        <div className="map-group-copy">
          <span>ГРУППА / {value.topicCount} ТЕМ</span>
          <strong>{value.title}</strong>
          <div className="map-progress-mini">
            <i style={{ width: value.progress + "%" }} />
            <span>{value.progress}%</span>
          </div>
          <button onClick={() => value.onOpen(value.chapterId)}>Войти в группу →</button>
        </div>
      </div>

      <TransformGizmos
        selector=".map-group-card"
        rotation={value.rotation ?? 0}
        scale={value.scale ?? 1}
        onRotate={(delta) => value.onRotate(id, delta)}
        onScale={(nextScale) => value.onScale(id, nextScale)}
      />

      <span className="map-port-caption map-port-caption-out">ВЕДЁТ К</span>
      <Handle
        id="out"
        type="source"
        position={Position.Right}
        className="map-handle group-handle"
        isConnectable={false}
      />
    </>
  );
}

const nodeTypes = { topic: TopicNodeCard, group: ChapterGroupCard };
const edgeTypes = { dependency: DependencyEdge };

function chapterForTopic(topicId: string) {
  return topics[topicId]?.chapterId;
}

function InnerCourseMap() {
  const [fullscreen, setFullscreen] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState<string | null>("linear");
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

  const openTopic = useCallback((id: string) => {
    window.location.hash = id;
  }, []);

  const openChapter = useCallback((id: string) => {
    setActiveChapterId(id);
  }, []);

  const groupEdges = useMemo<Edge[]>(() => {
    const seen = new Set<string>();
    const result: Edge[] = [];

    for (const topic of topicList) {
      for (const dependency of topic.prerequisites) {
        const sourceChapterId = chapterForTopic(dependency);
        const targetChapterId = topic.chapterId;
        if (!sourceChapterId || sourceChapterId === targetChapterId) continue;

        const key = sourceChapterId + "->" + targetChapterId;
        if (seen.has(key)) continue;
        seen.add(key);

        const sourceChapter = chapters.find((chapter) => chapter.id === sourceChapterId);
        const targetChapter = chapters.find((chapter) => chapter.id === targetChapterId);
        if (!sourceChapter || !targetChapter) continue;

        result.push({
          id: "group:" + key,
          source: "group:" + sourceChapterId,
          target: "group:" + targetChapterId,
          sourceHandle: "out",
          targetHandle: "in",
          type: "dependency",
          animated: true,
          className: "edge-group",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
          data: {
            sourceLabel: sourceChapter.title,
            targetLabel: targetChapter.title,
            sourceNumber: sourceChapter.number,
            targetNumber: targetChapter.number,
            relationLabel: "эта группа нужна перед следующей",
            onOpenTarget: () => openChapter(targetChapterId),
          } satisfies DependencyEdgeData,
        });
      }
    }

    return result;
  }, [openChapter]);

  const buildNodes = useCallback((): Node[] => {
    const stored = readLayout();

    if (activeChapterId === null) {
      return chapters.map((chapter, index) => {
        const id = "group:" + chapter.id;
        const saved = stored[id];
        return {
          id,
          type: "group",
          position: saved
            ? { x: saved.x, y: saved.y }
            : { x: (index % 3) * 390, y: Math.floor(index / 3) * 240 },
          data: {
            chapterId: chapter.id,
            number: chapter.number,
            title: chapter.title,
            topicCount: chapter.topicIds.length,
            progress: progressForChapter(chapter.id),
            rotation: saved?.rotation ?? 0,
            scale: saved?.scale ?? 1,
            onOpen: openChapter,
            onRotate: () => undefined,
            onScale: () => undefined,
          } satisfies GroupNodeData,
        };
      });
    }

    const chapter = chapters.find((item) => item.id === activeChapterId);
    if (!chapter) return [];

    return chapter.topicIds
      .map((id) => topics[id])
      .filter(Boolean)
      .map((topic, index) => {
        const saved = stored[topic.id];
        return {
          id: topic.id,
          type: "topic",
          position: saved
            ? { x: saved.x, y: saved.y }
            : { x: (index % 2) * 430, y: Math.floor(index / 2) * 235 },
          data: {
            label: topic.title,
            number: topic.number,
            chapter: chapter.title,
            summary: topic.summary,
            rotation: saved?.rotation ?? 0,
            scale: saved?.scale ?? 1,
            progress: progressForTopic(topic.id),
            onOpen: openTopic,
            onRotate: () => undefined,
            onScale: () => undefined,
          } satisfies GraphNodeData,
        };
      });
  }, [activeChapterId, openChapter, openTopic, progressVersion]);

  const buildEdges = useCallback((): Edge[] => {
    if (activeChapterId === null) return groupEdges;

    const chapter = chapters.find((item) => item.id === activeChapterId);
    if (!chapter) return [];
    const visible = new Set(chapter.topicIds);

    return chapter.topicIds.flatMap((id) => {
      const topic = topics[id];
      if (!topic) return [];

      return topic.prerequisites
        .filter((dependency) => visible.has(dependency))
        .map((dependency) => {
          const sourceTopic = topics[dependency];
          if (!sourceTopic) return null;

          return {
            id: dependency + "->" + topic.id,
            source: dependency,
            target: topic.id,
            sourceHandle: "out",
            targetHandle: "in",
            type: "dependency",
            animated: chapter.id === "linear",
            className: chapter.id === "linear" ? "edge-hot" : "edge-normal",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
            },
            data: {
              sourceLabel: sourceTopic.title,
              targetLabel: topic.title,
              sourceNumber: "§ " + sourceTopic.number,
              targetNumber: "§ " + topic.number,
              relationLabel: "нужно знать перед этой темой",
              onOpenTarget: () => openTopic(topic.id),
            } satisfies DependencyEdgeData,
          } satisfies Edge;
        })
        .filter((edge): edge is Edge => edge !== null);
    });
  }, [activeChapterId, groupEdges, openTopic]);

  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes());

  useEffect(() => {
    setNodes(buildNodes());
  }, [activeChapterId, progressVersion, buildNodes, setNodes]);

  const persist = useCallback((nextNodes: Node[]) => {
    const existing = readLayout();
    nextNodes.forEach((node) => {
      const data = node.data as { rotation?: number; scale?: number };
      existing[node.id] = {
        x: node.position.x,
        y: node.position.y,
        rotation: data.rotation ?? 0,
        scale: data.scale ?? 1,
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }, []);

  const handleRotate = useCallback(
    (id: string, delta: number) => {
      setNodes((current) => {
        const next = current.map((node) => {
          if (node.id !== id) return node;
          const rotation = Number(
            (
              Number((node.data as { rotation?: number }).rotation ?? 0) + delta
            ).toFixed(2),
          );
          return { ...node, data: { ...node.data, rotation } };
        });
        persist(next);
        return next;
      });
    },
    [persist, setNodes],
  );

  const handleScale = useCallback(
    (id: string, scale: number) => {
      setNodes((current) => {
        const next = current.map((node) => {
          if (node.id !== id) return node;
          return { ...node, data: { ...node.data, scale } };
        });
        persist(next);
        return next;
      });
    },
    [persist, setNodes],
  );

  const hydratedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onRotate: (id: string, delta: number) => handleRotate(id, delta),
          onScale: (id: string, scale: number) => handleScale(id, scale),
        },
      })),
    [nodes, handleRotate, handleScale],
  );

  const edges = useMemo(() => buildEdges(), [buildEdges, progressVersion]);

  const resetLayout = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const activeChapter = activeChapterId
    ? chapters.find((item) => item.id === activeChapterId)
    : null;

  return (
    <section className={"course-map-page " + (fullscreen ? "map-fullscreen" : "")}>
      <header className="map-header">
        <div>
          <div className="eyebrow">
            {activeChapter
              ? "GROUP / " + activeChapter.number
              : "KNOWLEDGE GROUPS"}{" "}
            · {edges.length} LINKS
          </div>
          <h1>{activeChapter?.title ?? "Карта курса"}</h1>
          <p>
            {activeChapter
              ? "Каждая стрелка читается слева направо: от prerequisite к теме, которая на него опирается. На самой связи теперь прямо написано, какие две темы она соединяет; по подписи можно перейти в конечную тему."
              : "На обзорном уровне связи тоже читаются слева направо: от группы-предпосылки к группе, которая использует её материал. Подпись на линии показывает оба конца связи."}
          </p>
        </div>
        <div className="map-header-actions">
          <button className="ghost-button" onClick={() => setActiveChapterId(null)}>
            ◫ Обзор групп
          </button>
          <button
            className="ghost-button"
            onClick={() => setFullscreen((value) => !value)}
          >
            {fullscreen ? "× Закрыть full screen" : "⛶ Full screen"}
          </button>
          <button className="ghost-button" onClick={resetLayout}>
            Сбросить расположение
          </button>
        </div>
      </header>

      <div className="map-legend">
        <span><i className="legend-source" /> источник / prerequisite</span>
        <b>→</b>
        <span><i className="legend-target" /> тема, которая использует его</span>
        <small>нажми на подпись связи, чтобы открыть конечную тему</small>
      </div>

      <div className="map-group-tabs" aria-label="Группы карты">
        <button
          className={activeChapterId === null ? "active" : ""}
          onClick={() => setActiveChapterId(null)}
        >
          Все группы
        </button>
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            className={activeChapterId === chapter.id ? "active" : ""}
            onClick={() => setActiveChapterId(chapter.id)}
          >
            <span>{chapter.number}</span>
            {chapter.title}
          </button>
        ))}
      </div>

      <div className="map-stage">
        <ReactFlow
          key={activeChapterId ?? "overview"}
          nodes={hydratedNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onNodeDragStop={(_event, _node, nextNodes) => persist(nextNodes)}
          fitView
          fitViewOptions={{ padding: activeChapterId ? 0.32 : 0.14 }}
          minZoom={0.08}
          maxZoom={2.1}
          nodesDraggable
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          selectionOnDrag
          edgesFocusable
        >
          <Background gap={26} size={1} />
          <MiniMap pannable zoomable nodeStrokeWidth={2} />
          <Controls />
        </ReactFlow>
      </div>
    </section>
  );
}

export function CourseMap() {
  return (
    <ReactFlowProvider>
      <InnerCourseMap />
    </ReactFlowProvider>
  );
}
