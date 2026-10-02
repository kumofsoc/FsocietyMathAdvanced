# AntV G6 Course Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing React Flow course map with an AntV G6 knowledge graph without changing the surrounding product flow.

**Architecture:** A pure graph-model builder feeds a dedicated G6 renderer. The route page owns React UI state and inspector content; G6 owns node layout, edge routing and viewport behavior.

**Tech Stack:** React 19, TypeScript, AntV G6 5.1.1, Vitest 5.0.3.

**Spec:** `docs/superpowers/specs/2026-10-02-g6-course-map-design.md`

## Global Constraints

- No intentional changes outside the course-map feature.
- Keep overview/chapter tabs, inspector, progress, fullscreen and navigation behavior.
- Do not use React Flow for the course map.
- G6 must own layout coordinates and edge routing.
- Preserve prerequisite and study-flow semantics.

## Review Focus

- Chapters with one topic still render and fit.
- Chapters with no internal prerequisites still get a stable study-flow chain.
- Cross-chapter prerequisites do not leak into chapter edges.
- Duplicate prerequisite metadata cannot create duplicate edges.
- StrictMode mount/unmount does not leave stale G6 instances.

---

### Task 1: Pure graph model

**Files:**
- Create: `src/features/course-map/model/courseMapGraph.ts`
- Test: `src/features/course-map/model/courseMapGraph.test.ts`

**Interfaces:**
- Produces: `buildCourseMapGraph(input): CourseMapGraphModel`

- [ ] Write failing tests for overview aggregation, chapter edges and endpoint integrity.
- [ ] Run `pnpm test` and verify RED.
- [ ] Implement graph-model construction.
- [ ] Run `pnpm test` and verify GREEN.

### Task 2: G6 renderer

**Files:**
- Create: `src/features/course-map/ui/G6CourseGraph.tsx`
- Create: `src/features/course-map/ui/g6-course-graph.css`

**Interfaces:**
- Consumes: `CourseMapGraphModel`
- Produces: controlled selection/open callbacks.

- [ ] Instantiate/destroy G6 safely under React StrictMode.
- [ ] Configure AntV Dagre, rect nodes, polyline orthogonal edges, drag/zoom and minimap.
- [ ] Add node click, node double-click and canvas click events.
- [ ] Reflect controlled selection through G6 states.
- [ ] Resize and refit on container changes.

### Task 3: Route integration and React Flow removal

**Files:**
- Rewrite: `src/pages/course-map/CourseMap.tsx`
- Modify: `src/main.tsx`
- Modify: `src/styles/course-map.css`
- Modify: `package.json`

- [ ] Keep page chrome and inspector while switching graph canvas to `G6CourseGraph`.
- [ ] Delete all React Flow imports/layout helpers from the map.
- [ ] Remove global React Flow stylesheet import.
- [ ] Remove `@xyflow/react` dependency if unused.
- [ ] Run `pnpm test` and `pnpm build`.

### Task 4: Integration verification

- [ ] Verify CI test step passes.
- [ ] Verify CI build step passes.
- [ ] Inspect diff for accidental non-map UI changes.
- [ ] Merge only after green verification.
