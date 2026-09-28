import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { chapters, topicList, topics } from "../data/course";
import { practiceByTopic } from "../data/practice";
import { LEARNING_EVENT, loadSet, SOLVED_KEY, THEORY_KEY } from "../lib/learning";
import type { GraphNodeData } from "../types/course";

const STORAGE_KEY = "fsociety-course-map-layout-v1";

type StoredLayout = Record<string, { x: number; y: number; rotation: number }>;

function readLayout(): StoredLayout {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function progressForTopic(id: string) {
  const theory = loadSet(THEORY_KEY).has(id) ? 50 : 0;
  const tasks = practiceByTopic[id] ?? [];
  if (!tasks.length) return theory;

  const solved = loadSet(SOLVED_KEY);
  const solvedCount = tasks.filter((task) => solved.has(task.id)).length;
  return Math.round(theory + (solvedCount / tasks.length) * 50);
}

function TopicNodeCard({ id, data }: NodeProps) {
  const value = data as unknown as GraphNodeData;

  const rotate = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.altKey) return;
    event.preventDefault();
    value.onRotate(id, Math.sign(event.deltaY) * 3);
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="map-handle map-handle-target"
        isConnectable={false}
      />
      <div
        className="map-topic-card"
        onWheel={rotate}
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
          <button onClick={() => value.onOpen(id)}>Открыть тему →</button>
          <span>
            <button aria-label="Повернуть влево" onClick={() => value.onRotate(id, -6)}>↺</button>
            <button aria-label="Повернуть вправо" onClick={() => value.onRotate(id, 6)}>↻</button>
          </span>
        </div>
        <div className="map-node-hint">drag = move · alt + wheel / ↺↻ = rotate</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="map-handle map-handle-source"
        isConnectable={false}
      />
    </>
  );
}

function InnerCourseMap() {
  const stored = useMemo(() => readLayout(), []);
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

  const rotateNode = useCallback((_id: string, _delta: number) => undefined, []);
  const openTopic = useCallback((id: string) => {
    window.location.hash = id;
  }, []);

  const initialNodes = useMemo<Node[]>(() => {
    return topicList.map((topic) => {
      const chapterIndex = chapters.findIndex((chapter) => chapter.id === topic.chapterId);
      const chapter = chapters[chapterIndex];
      const localIndex = Math.max(0, chapter?.topicIds.indexOf(topic.id) ?? 0);
      const saved = stored[topic.id];

      return {
        id: topic.id,
        type: "topic",
        position: saved
          ? { x: saved.x, y: saved.y }
          : {
              x: chapterIndex * 360 + (localIndex % 2) * 70,
              y: localIndex * 190 + (chapterIndex % 4) * 48,
            },
        data: {
          label: topic.title,
          number: topic.number,
          chapter: chapter?.title ?? "",
          summary: topic.summary,
          rotation: saved?.rotation ?? 0,
          progress: progressForTopic(topic.id),
          onOpen: openTopic,
          onRotate: rotateNode,
        } satisfies GraphNodeData,
      };
    });
  }, [stored, openTopic, rotateNode]);

  const edges = useMemo<Edge[]>(
    () =>
      topicList.flatMap((topic) =>
        topic.prerequisites
          .filter((dependency) => Boolean(topics[dependency]))
          .map((dependency) => ({
            id: dependency + "->" + topic.id,
            source: dependency,
            target: topic.id,
            type: "smoothstep",
            animated: topic.chapterId === "linear",
            className: topic.chapterId === "linear" ? "edge-hot" : "edge-normal",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 16,
              height: 16,
            },
          })),
      ),
    [],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  useEffect(() => {
    setNodes((current) =>
      current.map((node) => ({
        ...node,
        data: {
          ...node.data,
          progress: progressForTopic(node.id),
        },
      })),
    );
  }, [progressVersion, setNodes]);

  const persist = useCallback(
    (nextNodes: Node[]) => {
      const layout: StoredLayout = {};
      nextNodes.forEach((node) => {
        const data = node.data as unknown as GraphNodeData;
        layout[node.id] = {
          x: node.position.x,
          y: node.position.y,
          rotation: data.rotation ?? 0,
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    },
    [],
  );

  const handleRotate = useCallback(
    (id: string, delta: number) => {
      setNodes((current) => {
        const next = current.map((node) => {
          if (node.id !== id) return node;
          const data = node.data as unknown as GraphNodeData;
          return {
            ...node,
            data: { ...data, rotation: (data.rotation ?? 0) + delta },
          };
        });
        persist(next);
        return next;
      });
    },
    [persist, setNodes],
  );

  const hydratedNodes = useMemo(
    () =>
      nodes.map((node) => {
        const data = node.data as unknown as GraphNodeData;
        return { ...node, data: { ...data, onRotate: handleRotate } };
      }),
    [nodes, handleRotate],
  );

  const resetLayout = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return (
    <section className={"course-map-page " + (fullscreen ? "map-fullscreen" : "")}>
      <header className="map-header">
        <div>
          <div className="eyebrow">KNOWLEDGE GRAPH / {edges.length} DEPENDENCY LINKS</div>
          <h1>Карта курса</h1>
          <p>
            Карточки можно свободно перемещать и вращать, но математические зависимости остаются
            привязанными к ним. Стрелка A → B означает: тему A полезно знать до B.
          </p>
        </div>
        <div className="map-header-actions">
          <button className="ghost-button" onClick={() => setFullscreen((value) => !value)}>
            {fullscreen ? "× Закрыть full screen" : "⛶ Full screen"}
          </button>
          <button className="ghost-button" onClick={resetLayout}>Сбросить расположение</button>
        </div>
      </header>

      <div className="map-stage">
        <ReactFlow
          nodes={hydratedNodes}
          edges={edges}
          nodeTypes={{ topic: TopicNodeCard }}
          onNodesChange={onNodesChange}
          onNodeDragStop={(_event, _node, nextNodes) => persist(nextNodes)}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.08}
          maxZoom={2.1}
          nodesDraggable
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          selectionOnDrag
          edgesFocusable={false}
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
