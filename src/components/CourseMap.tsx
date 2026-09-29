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
  useMemo,
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
  isActive?: boolean;
  isDimmed?: boolean;
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
  if (!["linear", "vectors", "plane-geometry", "space-geometry", "plane-transformations", "abstract-linear", "euclidean", "affine-general", "tensor-algebra", "analysis-intro", "indef-integral", "def-integral", "multivariable", "ode"].includes(chapterId ?? "")) return 0;
  const theory = loadSet(THEORY_KEY).has(id) ? 50 : 0;
  const tasks = practiceByTopic[id] ?? [];
  if (!tasks.length) return theory;

  const solved = loadSet(SOLVED_KEY);
  const solvedCount = tasks.filter((task) => solved.has(task.id)).length;
  return Math.round(theory + (solvedCount / tasks.length) * 50);
}

function progressForChapter(chapterId: string) {
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter || !["linear", "vectors", "plane-geometry", "space-geometry", "plane-transformations", "abstract-linear", "euclidean", "affine-general", "tensor-algebra", "analysis-intro", "indef-integral", "def-integral", "multivariable", "ode"].includes(chapter.id)) return 0;
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
          className={
            "map-edge-label nodrag nopan " +
            (meta.isActive ? "is-active " : "") +
            (meta.isDimmed ? "is-dimmed" : "")
          }
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

function MapTransformControls({
  rotation,
  scale,
  onRotate,
  onScale,
}: {
  rotation: number;
  scale: number;
  onRotate: (delta: number) => void;
  onScale: (scale: number) => void;
}) {
  const changeScale = (delta: number) => {
    const next = Math.min(1.45, Math.max(0.75, scale + delta));
    onScale(Number(next.toFixed(2)));
  };

  const reset = () => {
    if (rotation !== 0) onRotate(-rotation);
    if (scale !== 1) onScale(1);
  };

  return (
    <div className="map-transform-toolbar nodrag nopan" onPointerDown={(event) => event.stopPropagation()}>
      <div className="map-transform-group" aria-label="Поворот карточки">
        <span>ROTATE</span>
        <button onClick={() => onRotate(-15)} title="Повернуть на 15° влево">↺</button>
        <b>{Math.round(rotation)}°</b>
        <button onClick={() => onRotate(15)} title="Повернуть на 15° вправо">↻</button>
      </div>

      <div className="map-transform-divider" />

      <div className="map-transform-group" aria-label="Масштаб карточки">
        <span>SCALE</span>
        <button onClick={() => changeScale(-0.1)} title="Уменьшить">−</button>
        <b>{Math.round(scale * 100)}%</b>
        <button onClick={() => changeScale(0.1)} title="Увеличить">+</button>
      </div>

      <button className="map-transform-reset" onClick={reset} title="Сбросить поворот и размер">
        RESET
      </button>
    </div>
  );
}

function TopicNodeCard({ id, data, selected }: NodeProps) {
  const value = data as unknown as GraphNodeData;
  const scale = value.scale ?? 1;

  return (
    <div
      className={"map-node-shell map-topic-shell " + (selected ? "is-selected" : "")}
      style={{ width: Math.round(260 * scale) }}
    >
      {selected && (
        <MapTransformControls
          rotation={value.rotation ?? 0}
          scale={scale}
          onRotate={(delta) => value.onRotate(id, delta)}
          onScale={(nextScale) => value.onScale?.(id, nextScale)}
        />
      )}

      <Handle
        id="in"
        type="target"
        position={Position.Left}
        className="map-handle map-handle-target"
        isConnectable={false}
      />
      <span className="map-port-caption map-port-caption-in">НУЖНО ДО</span>

      <div
        className="map-topic-card map-card-visual"
        style={{ transform: "rotate(" + (value.rotation ?? 0) + "deg)" }}
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
          <button className="nodrag nopan" onClick={() => value.onOpen(id)}>
            Открыть тему →
          </button>
        </div>
        <div className="map-node-hint">
          click = edit · drag = move · toolbar = rotate / scale
        </div>
      </div>

      <span className="map-port-caption map-port-caption-out">ВЕДЁТ К</span>
      <Handle
        id="out"
        type="source"
        position={Position.Right}
        className="map-handle map-handle-source"
        isConnectable={false}
      />
    </div>
  );
}

function ChapterGroupCard({ id, data, selected }: NodeProps) {
  const value = data as unknown as GroupNodeData;
  const scale = value.scale ?? 1;

  return (
    <div
      className={"map-node-shell map-group-shell " + (selected ? "is-selected" : "")}
      style={{ width: Math.round(330 * scale) }}
    >
      {selected && (
        <MapTransformControls
          rotation={value.rotation ?? 0}
          scale={scale}
          onRotate={(delta) => value.onRotate(id, delta)}
          onScale={(nextScale) => value.onScale(id, nextScale)}
        />
      )}

      <Handle
        id="in"
        type="target"
        position={Position.Left}
        className="map-handle group-handle"
        isConnectable={false}
      />
      <span className="map-port-caption map-port-caption-in">ЗАВИСИТ ОТ</span>

      <div
        className="map-group-card map-card-visual"
        style={{ transform: "rotate(" + (value.rotation ?? 0) + "deg)" }}
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
          <button className="nodrag nopan" onClick={() => value.onOpen(value.chapterId)}>
            Войти в группу →
          </button>
        </div>
      </div>

      <span className="map-port-caption map-port-caption-out">ВЕДЁТ К</span>
      <Handle
        id="out"
        type="source"
        position={Position.Right}
        className="map-handle group-handle"
        isConnectable={false}
      />
    </div>
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
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
    setSelectedNodeId(null);
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
            isActive:
              selectedNodeId === "group:" + sourceChapterId ||
              selectedNodeId === "group:" + targetChapterId,
            isDimmed:
              selectedNodeId !== null &&
              selectedNodeId !== "group:" + sourceChapterId &&
              selectedNodeId !== "group:" + targetChapterId,
            onOpenTarget: () => openChapter(targetChapterId),
          } satisfies DependencyEdgeData,
        });
      }
    }

    return result;
  }, [openChapter, selectedNodeId]);

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
              isActive:
                selectedNodeId === dependency || selectedNodeId === topic.id,
              isDimmed:
                selectedNodeId !== null &&
                selectedNodeId !== dependency &&
                selectedNodeId !== topic.id,
              onOpenTarget: () => openTopic(topic.id),
            } satisfies DependencyEdgeData,
          } satisfies Edge;
        })
        .filter((edge): edge is Edge => edge !== null);
    });
  }, [activeChapterId, groupEdges, openTopic, selectedNodeId]);

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
          const current = Number((node.data as { rotation?: number }).rotation ?? 0);
          const raw = current + delta;
          const rotation = Number((((raw + 180) % 360 + 360) % 360 - 180).toFixed(2));
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
      const safeScale = Math.min(1.45, Math.max(0.75, scale));
      setNodes((current) => {
        const next = current.map((node) => {
          if (node.id !== id) return node;
          return { ...node, data: { ...node.data, scale: safeScale } };
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
        className:
          selectedNodeId && node.id !== selectedNodeId
            ? "map-node-dimmed"
            : selectedNodeId === node.id
              ? "map-node-focused"
              : "",
        data: {
          ...node.data,
          onRotate: (id: string, delta: number) => handleRotate(id, delta),
          onScale: (id: string, scale: number) => handleScale(id, scale),
        },
      })),
    [nodes, handleRotate, handleScale, selectedNodeId],
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
              ? "Нажми на карточку, чтобы сфокусировать её связи и открыть локальные rotate / scale controls. Перетаскивание двигает узел, а кнопка внутри карточки открывает тему."
              : "Нажми на группу, чтобы сфокусировать её зависимости. Controls появляются только у выбранной карточки и больше не перемещаются по canvas при изменении размера или поворота."}
          </p>
        </div>
        <div className="map-header-actions">
          <button className="ghost-button" onClick={() => { setSelectedNodeId(null); setActiveChapterId(null); }}>
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
          onClick={() => { setSelectedNodeId(null); setActiveChapterId(null); }}
        >
          Все группы
        </button>
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            className={activeChapterId === chapter.id ? "active" : ""}
            onClick={() => { setSelectedNodeId(null); setActiveChapterId(chapter.id); }}
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
          onNodeClick={(_event, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
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
