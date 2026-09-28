import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useCallback, useMemo } from "react";
import { chapters, topicList, topics } from "../data/course";
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

function TopicNodeCard({ id, data }: NodeProps) {
  const value = data as unknown as GraphNodeData;

  const rotate = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.altKey) return;
    event.preventDefault();

    const layout = readLayout();
    const current = layout[id]?.rotation ?? value.rotation ?? 0;
    const next = Math.round((current + Math.sign(event.deltaY) * 3) * 10) / 10;

    layout[id] = {
      x: layout[id]?.x ?? 0,
      y: layout[id]?.y ?? 0,
      rotation: next,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    value.onRotate(id, next - current);
  };

  return (
    <div
      className="map-topic-card"
      onWheel={rotate}
      style={{ transform: `rotate(${value.rotation ?? 0}deg)` }}
      data-cursor="active"
    >
      <div className="map-topic-meta">
        <span>§ {value.number}</span>
        <span>{value.chapter}</span>
      </div>
      <strong>{value.label}</strong>
      <p>{value.summary}</p>
      <button onClick={() => value.onOpen(id)}>Открыть тему →</button>
      <div className="map-node-hint">drag · alt + wheel = rotate</div>
    </div>
  );
}

function InnerCourseMap() {
  const stored = useMemo(() => readLayout(), []);

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
              x: chapterIndex * 330 + (localIndex % 2) * 55,
              y: localIndex * 175 + (chapterIndex % 3) * 55,
            },
        data: {
          label: topic.title,
          number: topic.number,
          chapter: chapter?.title ?? "",
          summary: topic.summary,
          rotation: saved?.rotation ?? 0,
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
            id: `${dependency}->${topic.id}`,
            source: dependency,
            target: topic.id,
            animated: topic.chapterId === "linear",
            className: topic.chapterId === "linear" ? "edge-hot" : "edge-normal",
          })),
      ),
    [],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

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
    <section className="course-map-page">
      <header className="map-header">
        <div>
          <div className="eyebrow">KNOWLEDGE GRAPH / 18 CHAPTERS</div>
          <h1>Карта курса</h1>
          <p>
            Связи — это prerequisites. Узлы можно свободно таскать по полотну; рёбра остаются
            прикреплёнными. Зажми Alt и крути колесо над карточкой, чтобы повернуть её.
          </p>
        </div>
        <button className="ghost-button" onClick={resetLayout}>Сбросить расположение</button>
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
          minZoom={0.12}
          maxZoom={1.8}
          nodesDraggable
          panOnDrag
          zoomOnScroll
          selectionOnDrag
        >
          <Background gap={26} size={1} />
          <MiniMap pannable zoomable />
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
