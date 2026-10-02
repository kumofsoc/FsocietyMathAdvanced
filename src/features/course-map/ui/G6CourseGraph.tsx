import {
  CanvasEvent,
  Graph,
  NodeEvent,
  type EdgeData,
  type NodeData,
} from "@antv/g6";
import { useEffect, useRef, useState } from "react";
import type { CourseMapGraphModel } from "../model/courseMapGraph";
import "./g6-course-graph.css";

interface G6CourseGraphProps {
  model: CourseMapGraphModel;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onOpen: (id: string) => void;
}

interface GraphTheme {
  bg: string;
  surface: string;
  elevated: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
}

function cssVar(style: CSSStyleDeclaration, name: string, fallback: string) {
  return style.getPropertyValue(name).trim() || fallback;
}

function readGraphTheme(): GraphTheme {
  const style = getComputedStyle(document.documentElement);
  return {
    bg: cssVar(style, "--bg", "#090a0e"),
    surface: cssVar(style, "--surface", "#111319"),
    elevated: cssVar(style, "--elevated", "#171a22"),
    border: cssVar(style, "--border", "#2a2d36"),
    text: cssVar(style, "--text", "#f4f5f7"),
    muted: cssVar(style, "--muted", "#8b909c"),
    accent: cssVar(style, "--accent", "#7c8cff"),
    accent2: cssVar(style, "--accent2", "#6ee7d8"),
  };
}

function toG6Data(model: CourseMapGraphModel) {
  const nodes: NodeData[] = model.nodes.map((node) => ({
    id: node.id,
    data: {
      entityId: node.entityId,
      kind: node.kind,
      title: node.title,
      kicker: node.kicker,
      meta: node.meta,
      progress: node.progress,
    },
  }));

  const edges: EdgeData[] = model.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    data: {
      kind: edge.kind,
    },
  }));

  return { nodes, edges };
}

function nodeKind(datum: NodeData) {
  return datum.data?.kind === "chapter" ? "chapter" : "topic";
}

async function applySelectionState(
  graph: Graph,
  model: CourseMapGraphModel,
  selectedId: string | null,
) {
  const nodeIds = model.nodes.map((node) => node.id);
  const edgeIds = model.edges.map((edge) => edge.id);
  const states: Record<string, string[]> = {};

  if (!selectedId || !nodeIds.includes(selectedId)) {
    nodeIds.forEach((id) => {
      states[id] = [];
    });
    edgeIds.forEach((id) => {
      states[id] = [];
    });
    await graph.setElementState(states, false);
    return;
  }

  const neighbors = new Set<string>([selectedId]);
  const activeEdges = new Set<string>();

  model.edges.forEach((edge) => {
    if (edge.source === selectedId) {
      neighbors.add(edge.target);
      activeEdges.add(edge.id);
    }
    if (edge.target === selectedId) {
      neighbors.add(edge.source);
      activeEdges.add(edge.id);
    }
  });

  nodeIds.forEach((id) => {
    states[id] =
      id === selectedId
        ? ["selected"]
        : neighbors.has(id)
          ? ["neighbor"]
          : ["inactive"];
  });
  edgeIds.forEach((id) => {
    states[id] = activeEdges.has(id) ? ["active"] : ["inactive"];
  });

  await graph.setElementState(states, false);
}

function graphNodeBadges(datum: NodeData, theme: GraphTheme) {
  const data = datum.data ?? {};
  return [
    {
      text: String(data.kicker ?? ""),
      placement: "top-left" as const,
      backgroundFill: theme.elevated,
      backgroundStroke: theme.border,
      fill: theme.accent,
      fontSize: 9,
      fontWeight: 700,
      padding: [4, 7],
      backgroundRadius: 7,
    },
    {
      text: String(data.progress ?? 0) + "%",
      placement: "top-right" as const,
      backgroundFill: theme.elevated,
      backgroundStroke: theme.border,
      fill: theme.text,
      fontSize: 9,
      fontWeight: 700,
      padding: [4, 7],
      backgroundRadius: 7,
    },
    {
      text: String(data.meta ?? ""),
      placement: "bottom-left" as const,
      backgroundFill: theme.elevated,
      backgroundStroke: theme.border,
      fill: theme.muted,
      fontSize: 9,
      padding: [4, 7],
      backgroundRadius: 7,
    },
  ];
}

export function G6CourseGraph({
  model,
  selectedId,
  onSelect,
  onOpen,
}: G6CourseGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const graphReadyRef = useRef(false);
  const selectedIdRef = useRef<string | null>(selectedId);
  const callbacksRef = useRef({ onSelect, onOpen });
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    callbacksRef.current = { onSelect, onOpen };
  }, [onOpen, onSelect]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    const graph = graphRef.current;
    if (!graph || !graphReadyRef.current) return;
    void applySelectionState(graph, model, selectedId);
  }, [model, selectedId]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeVersion((version) => version + 1);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style", "class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const theme = readGraphTheme();
    const data = toG6Data(model);

    const graph = new Graph({
      container,
      autoResize: true,
      padding: 64,
      zoomRange: [0.16, 1.7],
      data,
      layout: {
        type: "antv-dagre",
        rankdir: "LR",
        align: "UL",
        nodesep: 62,
        ranksep: 128,
        controlPoints: true,
      },
      node: {
        type: "rect",
        style: {
          size: (datum) =>
            nodeKind(datum) === "chapter" ? [322, 154] : [286, 164],
          radius: 18,
          fill: theme.surface,
          stroke: theme.border,
          lineWidth: 1,
          cursor: "pointer",
          shadowColor: "rgba(0, 0, 0, 0.2)",
          shadowBlur: 18,
          labelText: (datum) => String(datum.data?.title ?? datum.id),
          labelPlacement: "center",
          labelFill: theme.text,
          labelFontSize: (datum) => (nodeKind(datum) === "chapter" ? 17 : 14),
          labelFontWeight: 650,
          labelLineHeight: 20,
          labelWordWrap: true,
          labelMaxWidth: (datum) => (nodeKind(datum) === "chapter" ? 248 : 218),
          labelMaxLines: 3,
          badges: (datum) => graphNodeBadges(datum, theme),
        },
        state: {
          selected: {
            stroke: theme.accent,
            lineWidth: 2.2,
            shadowColor: theme.accent,
            shadowBlur: 22,
          },
          neighbor: {
            stroke: theme.accent2,
            lineWidth: 1.7,
          },
          inactive: {
            opacity: 0.22,
          },
        },
      },
      edge: {
        type: "polyline",
        style: {
          stroke: (datum) =>
            datum.data?.kind === "study-flow" ? theme.muted : theme.accent2,
          strokeOpacity: (datum) =>
            datum.data?.kind === "study-flow" ? 0.34 : 0.52,
          lineWidth: (datum) =>
            datum.data?.kind === "study-flow" ? 1.1 : 1.45,
          lineDash: (datum) =>
            datum.data?.kind === "study-flow" ? [7, 7] : [],
          router: {
            type: "orth",
            padding: 20,
          },
          radius: 10,
          endArrow: true,
          endArrowType: "vee",
          endArrowSize: 8,
          endArrowFill: (datum) =>
            datum.data?.kind === "study-flow" ? theme.muted : theme.accent2,
          endArrowStroke: (datum) =>
            datum.data?.kind === "study-flow" ? theme.muted : theme.accent2,
        },
        state: {
          active: {
            stroke: theme.accent,
            strokeOpacity: 1,
            lineWidth: 2.4,
          },
          inactive: {
            opacity: 0.08,
          },
        },
      },
      behaviors: [
        {
          type: "drag-canvas",
          key: "drag-canvas",
        },
        {
          type: "zoom-canvas",
          key: "zoom-canvas",
          sensitivity: 1.15,
        },
      ],
      plugins: [
        {
          type: "minimap",
          key: "minimap",
          size: [184, 116],
        },
      ],
    });

    graphReadyRef.current = false;
    graphRef.current = graph;

    const nodeIdFromEvent = (event: unknown) =>
      String((event as { target: { id: string } }).target.id);

    graph.on(NodeEvent.CLICK, (event) => {
      callbacksRef.current.onSelect(nodeIdFromEvent(event));
    });
    graph.on(NodeEvent.DBLCLICK, (event) => {
      callbacksRef.current.onOpen(nodeIdFromEvent(event));
    });
    graph.on(CanvasEvent.CLICK, () => {
      callbacksRef.current.onSelect(null);
    });

    let destroyed = false;

    void graph.render().then(async () => {
      if (destroyed) return;
      graphReadyRef.current = true;
      await applySelectionState(graph, model, selectedIdRef.current);
      if (destroyed) return;
      await graph.fitView(
        { when: "always", direction: "both" },
        { duration: 260, easing: "ease-out" },
      );
    });

    const resizeObserver = new ResizeObserver(() => {
      if (destroyed) return;
      graph.resize();
    });
    resizeObserver.observe(container);

    return () => {
      destroyed = true;
      resizeObserver.disconnect();
      graphReadyRef.current = false;
      graphRef.current = null;
      graph.destroy();
    };
  }, [model, themeVersion]);

  return (
    <div className="g6-course-graph">
      <div ref={containerRef} className="g6-course-graph-canvas" />
      <div className="g6-course-graph-hint" aria-hidden="true">
        <span>drag = move</span>
        <span>wheel = zoom</span>
        <span>click = inspect</span>
        <span>double click = open</span>
      </div>
    </div>
  );
}
