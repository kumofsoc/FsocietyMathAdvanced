# MathMaMath 30th-Century Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the MathMaMath home page into a cinematic post-modern “30th-century mathematics interface” while preserving the real product actions, progress data, growth data and motion-profile contracts.

**Architecture:** `HomePage.tsx` becomes a thin scene composer. Each major scene lives in `features/home-experience/ui`, 3D lives in `visual`, shared scene metadata/state in `model`, and all new presentation styles live in one feature-owned stylesheet rather than adding more rules to the global CSS monolith. GSAP owns scroll orchestration; CSS owns cheap ambient texture; Three.js is limited to two major scenes.

**Tech Stack:** React 19, TypeScript, GSAP/ScrollTrigger, React Three Fiber/Three.js, CSS, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-02-home-30th-century-design.md`

## Global Constraints

- Preserve real actions: continue/start learning, open map, profile/account access where surfaced.
- Preserve real course progress and the current mock user-growth data with explicit `DEMO DATA` labelling.
- Do not present decorative future telemetry as real analytics.
- Full/balanced get the cinematic experience; eco/off, touch and reduced-motion get simplified variants.
- Do not reintroduce scrubbed opacity flicker.
- Do not let reveal/parallax/ambient loops compete for the same transform owner.
- Keep mobile usable and text readable.
- Heavy Three.js content is limited to the hero and one additional major scene.
- No new large visual dependency unless existing GSAP/Three/CSS cannot satisfy the design.
- New home-specific styles must not be appended to `src/styles.css`.

## Review Focus

- WebGL unavailable or slow: hero and motion scene still render coherent CSS/SVG fallbacks.
- Motion profile changes while home is mounted: decorative loops and pointer effects follow the current profile.
- Reduced-motion/touch/mobile: no pointer-reactive or aggressive parallax behavior remains active.
- Scroll snapping: short wheel gestures still advance predictably without over-aggressive transitions.
- Theme changes: CSS-variable-driven canvases and decorative surfaces refresh without stale colors.

---

### Task 1: Establish the home-experience module and scene contract

**Files:**
- Create: `src/features/home-experience/model/homeScenes.ts`
- Create: `src/features/home-experience/model/homeExperience.ts`
- Test: `src/features/home-experience/model/homeExperience.test.ts`
- Create: `src/pages/home/home.data.ts`
- Modify: `src/pages/home/HomePage.tsx`

**Interfaces:**
- Produces: `HOME_SCENES`, `HomeSceneId`, `getHomeMotionMode()`, `shouldUsePointerDepth()`
- Consumes: existing `progress` and `resumeTopic` props.

- [ ] **Step 1: Write failing tests for motion-mode capability decisions**
  - full/balanced desktop => cinematic
  - eco => reduced
  - off/reduced-motion => static
  - touch/mobile => no pointer depth

- [ ] **Step 2: Run `pnpm test src/features/home-experience/model/homeExperience.test.ts` and verify RED**

- [ ] **Step 3: Implement the pure capability helpers and scene metadata**

- [ ] **Step 4: Run the targeted test and verify GREEN**

- [ ] **Step 5: Refactor `HomePage.tsx` into a thin scene composer without changing visible output yet**

- [ ] **Step 6: Run `pnpm test && pnpm build`**

---

### Task 2: Build the arrival scene and global cinematic shell

**Files:**
- Create: `src/features/home-experience/ui/HomeHeroScene.tsx`
- Create: `src/features/home-experience/ui/HomeSectionRail.tsx`
- Create: `src/features/home-experience/ui/HomeFormulaTicker.tsx`
- Create: `src/features/home-experience/visual/HomeCore3D.tsx`
- Create: `src/features/home-experience/styles/home-experience.css`
- Modify: `src/pages/home/HomePage.tsx`

**Interfaces:**
- `HomeHeroScene` receives `progress`, `resumeTopic`, CTA callbacks.
- `HomeSectionRail` receives active scene index/id.
- `HomeCore3D` receives a motion tier and renders a CSS fallback when cinematic 3D is disabled.

- [ ] **Step 1: Build the full-screen arrival scene with giant typography, spatial grid, formula orbit, progress module and real CTAs**
- [ ] **Step 2: Add a single R3F hero core with low-cost fallback**
- [ ] **Step 3: Add fixed section rail and decorative formula ticker**
- [ ] **Step 4: Add cursor spotlight/depth only for capable desktop profiles**
- [ ] **Step 5: Verify keyboard access and no text overlap at 1440px, 1024px and 390px breakpoints through responsive CSS rules**
- [ ] **Step 6: Run `pnpm test && pnpm build`**

---

### Task 3: Build the information scenes

**Files:**
- Create: `src/features/home-experience/ui/HomeSystemStatus.tsx`
- Create: `src/features/home-experience/ui/HomeCourseUniverse.tsx`
- Create: `src/features/home-experience/ui/HomeGrowthScene.tsx`
- Create: `src/features/home-experience/ui/HomeInterfaceDNA.tsx`
- Modify: `src/features/home-experience/styles/home-experience.css`
- Modify: `src/pages/home/HomePage.tsx`

**Interfaces:**
- `HomeSystemStatus` consumes real progress/resume data plus explicitly decorative telemetry.
- `HomeGrowthScene` consumes the existing mock growth dataset and keeps `DEMO DATA` visible.
- `HomeCourseUniverse` is decorative only and links to the real G6 map.

- [ ] **Step 1: Build SYSTEM STATUS with labelled real data and clearly decorative telemetry**
- [ ] **Step 2: Build Course Universe as an abstract non-G6 constellation teaser**
- [ ] **Step 3: Redesign user growth into a full visual trajectory scene while keeping labels attached to every number**
- [ ] **Step 4: Build Interface DNA with 4-6 large perspective modules instead of tiny cards**
- [ ] **Step 5: Add scene-specific GSAP reveals/parallax wrappers without transform ownership conflicts**
- [ ] **Step 6: Run `pnpm test && pnpm build`**

---

### Task 4: Build the experimental future scenes

**Files:**
- Create: `src/features/home-experience/ui/HomeMotionLab.tsx`
- Create: `src/features/home-experience/visual/HomeMathField3D.tsx`
- Create: `src/features/home-experience/ui/HomeArchiveScene.tsx`
- Create: `src/features/home-experience/ui/HomePersonalSystem.tsx`
- Create: `src/features/home-experience/ui/HomePortalScene.tsx`
- Modify: `src/features/home-experience/styles/home-experience.css`
- Modify: `src/pages/home/HomePage.tsx`

**Interfaces:**
- `HomeMathField3D` receives motion tier and renders only in cinematic modes.
- `HomePersonalSystem` consumes course progress and routes to `#account`.
- `HomePortalScene` receives start/continue and map callbacks.

- [ ] **Step 1: Build Mathematical Motion Lab with one additional R3F scene and CSS fallback**
- [ ] **Step 2: Build Archive 3026 with explicit artistic/future framing**
- [ ] **Step 3: Build Personal System teaser with real progress and account CTA**
- [ ] **Step 4: Build final portal scene with giant masked type, halo/grid and real CTAs**
- [ ] **Step 5: Run `pnpm test && pnpm build`**

---

### Task 5: Orchestrate scroll, snapping and performance modes

**Files:**
- Create: `src/features/home-experience/model/useHomeExperience.ts`
- Modify: `src/pages/home/HomePage.tsx`
- Modify: `src/features/home-experience/styles/home-experience.css`

**Interfaces:**
- Produces one orchestration hook that owns ScrollTrigger setup/cleanup and active-scene tracking.
- Scenes expose `data-home-scene`, `data-reveal`, `data-parallax`, `data-ambient` wrappers only.

- [ ] **Step 1: Implement active scene tracking and fixed rail updates**
- [ ] **Step 2: Implement directional snap with ~0.18–0.42s transition duration**
- [ ] **Step 3: Implement reveal/parallax/ambient motion by separate transform wrappers**
- [ ] **Step 4: Disable loops/pointer depth under eco/off/reduced-motion/touch**
- [ ] **Step 5: Refresh ScrollTrigger after fonts/layout and clean all triggers/listeners on unmount**
- [ ] **Step 6: Run `pnpm test && pnpm build`**

---

### Task 6: Remove the old landing implementation and verify the whole product

**Files:**
- Modify: `src/pages/home/HomePage.tsx`
- Modify: `src/styles.css`
- Modify: `src/features/home-experience/styles/home-experience.css`

**Interfaces:**
- No new public interfaces.

- [ ] **Step 1: Remove obsolete old-home JSX and home-only legacy style blocks that are no longer referenced**
- [ ] **Step 2: Confirm no new home styles were added to the global stylesheet**
- [ ] **Step 3: Run `pnpm test` and verify 0 failures**
- [ ] **Step 4: Run `pnpm build` and verify exit 0**
- [ ] **Step 5: Inspect the final diff for changes outside home-experience/home-page scope**
- [ ] **Step 6: Verify main product routes still compile: home, map, account, topic**
- [ ] **Step 7: Only then mark the PR ready for review**
