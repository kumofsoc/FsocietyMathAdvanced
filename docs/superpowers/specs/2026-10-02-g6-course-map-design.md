# AntV G6 Course Map Design

## Goal

Replace the MathMaMath course knowledge map renderer completely with AntV G6 5.1.1 so node geometry, automatic layout, edge routing, zoom and pan are owned by one graph engine. The rewrite must preserve the existing course-map product flow while eliminating React Flow coordinate/measurement drift.

## Scope

- Keep the existing page header, chapter tabs, progress summary, inspector, fullscreen control and topic navigation.
- Replace every React Flow node, edge, layout helper, handle, minimap and canvas behavior inside the course map.
- Use built-in G6 rect nodes rather than React-node rendering.
- Use AntV Dagre for left-to-right hierarchical layout.
- Use polyline edges with orthogonal routing and arrows.
- Keep two edge semantics: prerequisite and study-flow.
- Preserve overview and chapter modes.
- Keep chapter/topic selection and double-click navigation.
- Use G6 built-in canvas drag/zoom and minimap.
- React owns page state; G6 owns graph geometry.

## Architecture

`CourseMap.tsx` remains the route-level screen. Pure graph-model construction moves to `features/course-map/model/courseMapGraph.ts`. G6 lifecycle, events and viewport behavior live in `features/course-map/ui/G6CourseGraph.tsx`.

The pure model is the only source of nodes and edges. The G6 renderer never invents layout relationships. React selection state is passed into the renderer and reflected through G6 element states.

## Rendering

- Overview nodes represent chapters.
- Chapter nodes represent topics.
- Node labels show title; badges show section/topic identity and mastery.
- G6 AntV Dagre runs `rankdir: LR`.
- Prerequisite edges are solid.
- Study-flow edges are dashed and visually weaker.
- Orthogonal edge routing is enabled.
- View fits after render and after data/mode changes.
- A ResizeObserver resizes the G6 canvas when the workspace/fullscreen dimensions change.

## Invariants

1. Every edge source and target must exist in the same model's node set.
2. Overview cross-chapter edges are deduplicated.
3. Chapter prerequisite edges only connect topics visible in that chapter.
4. Study-flow edges never duplicate prerequisite edges and never create a reverse cycle.
5. Renderer coordinates are never authored by React/CSS.
6. No `@xyflow/react` code or stylesheet remains in the course map.

## Testing

Unit tests cover graph-model endpoint integrity, overview aggregation, chapter prerequisite filtering and study-flow fallback ordering. CI runs tests before the TypeScript/Vite build.
