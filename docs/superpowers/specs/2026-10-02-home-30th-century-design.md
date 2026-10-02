# VisualMath 30th-Century Home Design

## Goal

Rebuild the VisualMath home page as a post-modern mathematical interface from the 30th century: dense, cinematic, strange, highly animated and visually memorable, while preserving the actual product actions and keeping the experience usable on desktop, mobile and reduced-motion profiles.

The home page is allowed to change section order, section count and visual composition completely. The existing functional destinations remain intact: resume/start learning, open the course map, show course progress and show public user-growth data.

## Product principles

1. The page must feel designed as one visual system, not as a collection of random cyberpunk effects.
2. Every section may use a different visual language, but recurring geometry, typography, motion and accent colors must make the page feel continuous.
3. Decorative modules may be intentionally fictional or non-functional if they increase atmosphere, but they must be visibly secondary to real actions.
4. The design must be futuristic without falling into generic neon-dashboard aesthetics.
5. Large typography, negative space, asymmetry, perspective and motion should carry more of the visual impact than tiny explanatory copy.
6. The current motion profile contract remains respected:
   - full: maximum motion and visual density
   - balanced: default cinematic experience
   - eco: reduced decorative motion and lower animation frequency
   - off: static composition with no automatic decorative movement
7. Mobile keeps the same visual identity but drops expensive or unreadable layers.
8. prefers-reduced-motion disables non-essential loops and cinematic transitions.

## Visual direction

The recommended direction is a hybrid of a futuristic mathematics museum and cinematic sci-fi interface.

It combines:
- monumental editorial typography
- asymmetrical layouts
- 3D mathematical objects
- HUD-like overlays used sparingly
- noisy optical textures
- scanlines and interference
- clipped panels and non-rectangular masks
- chromatic separation on selected display text
- oversized coordinate systems
- layered perspective grids
- metallic/glass surfaces
- pseudo-terminal telemetry
- formula ribbons and ticker bands
- orbiting labels
- giant numeric artefacts
- spatial depth and parallax
- data visualizations treated as visual objects rather than dashboard widgets

The page must not look like a generic SaaS landing page.

## Core scene sequence

### 1. Arrival / Mathematical Core

The hero becomes a full-screen cinematic arrival scene.

Content:
- VisualMath identity
- primary action: continue/start
- secondary action: open map
- course progress
- 3D mathematical core
- orbital formula fragments
- spatial grid
- large VM monogram
- system status line
- section index / scroll indicator

The 3D core should use existing Three.js infrastructure and remain lazy enough to avoid blocking initial interactivity. The composition should still look intentional if WebGL is unavailable.

### 2. SYSTEM STATUS

A highly stylized system-status section containing a mix of real and atmospheric data.

Real data:
- course mastery
- resume topic
- available course-map access

Atmospheric data examples:
- KNOWLEDGE SIGNAL
- SYNTHESIS RATE
- VECTOR FIELD
- ARCHIVE STATUS
- MEMORY INDEX

Atmospheric values are explicitly decorative UI and are not presented as user analytics.

### 3. Course Universe

A visual preview of the knowledge map without embedding the full G6 engine on the home page.

Use:
- abstract constellation nodes
- mathematical domain labels
- animated connection traces
- depth layers
- a clear CTA to open the real course map

This scene is a teaser, not a second functional graph implementation.

### 4. User Growth / Signal Expansion

Preserve the public user-growth mock data, but redesign it from a normal card/chart into a full visual scene.

Elements:
- oversized years
- animated trajectory
- large user-count typography
- floating delta values
- abstract signal field
- a clearly visible DEMO DATA marker until backend statistics exist

The meaning of every numeric metric remains labelled.

### 5. Interface DNA

Explain the product through a small number of large cards/modules, not many tiny boxes.

Real concepts:
- context/history
- map
- personalization
- interactive mathematics
- progress/account
- music/settings

Cards may have:
- perspective tilt
- metallic/glass surfaces
- animated border scans
- internal micro-grids
- clipped corners
- changing technical-style identifiers

Explanatory card text stays concise and readable.

### 6. Mathematical Motion Lab

A cinematic section where algebra, analysis and geometry become visual objects.

Possible objects:
- rotating vector basis
- deforming surface
- matrix lattice
- orbiting complex-plane markers
- parametric curves
- coordinate frames
- tensor-like lattice

This is decorative/educational ambience only. It must not duplicate full topic labs.

### 7. Archive 3026

A deliberately fictional future-archive section.

Purpose:
- strengthen the post-modern 30th-century identity
- allow visually dense experimental modules without confusing them with current product data

Examples:
- "ARCHIVE / 3026"
- fictitious mathematical document identifiers
- fragmented formula tape
- rotated catalog labels
- vertical typography
- pseudo-scanned cards
- glitch/reveal transitions

This section must visually signal that it is an artistic future archive, not factual historical content.

### 8. Personal System

A visual teaser for the account/profile system.

Real content:
- course progress
- activity concept
- saved knowledge
- customizable themes
- local music playlist

The home page should not duplicate the full account page. It should present the personal system as a visual module and CTA.

### 9. Portal / Final Scene

The final scene becomes a large transition into the product.

Content:
- giant masked typography
- distorted grid/halo
- start/continue
- open course map

The section should feel like entering the system rather than reaching a normal footer.

## Persistent visual systems

### Section rail

Desktop gets a slim fixed visual rail showing:
- current scene index
- total scene count
- current scene code/name
- animated progress indicator

It must not compete with the existing application sidebar.

### Cursor spotlight

On capable desktop devices, pointer movement can influence:
- radial lighting
- noise mask position
- subtle perspective depth

It must be disabled for eco/off, touch devices and reduced-motion users.

### Formula ticker

One or two sections may use a horizontal formula ticker or code-like mathematical ribbon.

Rules:
- content is decorative
- no important information is only available in the ticker
- motion pauses or disables under reduced-motion/off

### Surface language

Recurring surface rules:
- thin technical borders
- clipped corner accents
- subtle noise
- controlled glow
- layered gradients
- occasional high-contrast monochrome blocks
- sparse accent color rather than every element glowing

## Motion system

GSAP remains the main orchestration layer.

Motion families:
- scroll-linked parallax
- section reveal
- section snapping
- pinned scene fragments only where they materially improve composition
- orbital loops
- slow rotations
- mask reveals
- perspective drift
- number counters
- line drawing
- optical noise translation
- cursor-reactive depth

Important:
- avoid multiple transform owners on the same DOM node
- wrappers must separate reveal, parallax and ambient-loop transforms
- opacity must not be scrubbed in ways that recreate the previous blink bug
- section snapping stays responsive but not abrupt

Recommended snap target behavior:
- directional snapping
- low trigger threshold
- transition duration approximately 0.18–0.42s
- no aggressive inertia

## 3D

Use React Three Fiber / Three.js only for hero and one additional major scene at most.

Do not create independent WebGL canvases for every section.

3D must:
- pause or simplify offscreen where practical
- reduce detail on eco/mobile
- have a CSS/SVG visual fallback
- avoid blocking normal navigation

## Typography

Use the existing product font stack unless a deliberate display-face decision is made later.

Typography behavior:
- giant headings may overlap backgrounds and decorative objects
- important copy must never overlap other readable copy
- very small UI text is decorative only
- functional labels and card descriptions keep readable minimum sizes
- no long explanatory paragraphs on the home page

## Responsiveness

Desktop:
- full cinematic composition
- pointer-reactive effects
- wider asymmetry
- complex spatial depth

Tablet:
- reduce perspective offsets
- simplify overlapping modules
- preserve section hierarchy

Mobile:
- no pointer effects
- no heavy layered parallax
- 3D reduced or replaced by CSS/SVG fallback
- single-column content where needed
- giant typography remains but is constrained to viewport
- decorative modules may be hidden if they do not add meaning

## Accessibility and resilience

- All real actions remain keyboard accessible.
- Decorative elements are aria-hidden.
- Text contrast remains readable in every theme.
- Important meaning is not encoded only by color.
- Motion profiles and prefers-reduced-motion are respected.
- If WebGL fails, the page remains navigable and visually coherent.
- Decorative fake metrics are not presented as real user/account data.

## Performance

- Home remains route-lazy as today.
- Heavy 3D modules are split into their own lazy chunk where practical.
- Avoid adding large new third-party visual libraries unless existing GSAP/Three/Framer cannot do the job.
- Reuse existing dependencies first.
- Expensive observers/listeners must be scoped to the home page and cleaned up on unmount.
- Avoid dozens of independent infinite animations; group ambience where possible.
- Use CSS for cheap texture/scanline/noise effects and GSAP only where orchestration matters.

## Code structure

The redesign should not turn HomePage.tsx into another monolith.

Target structure:

```
src/pages/home/
  HomePage.tsx
  home.data.ts
  home.types.ts

src/features/home-experience/
  model/
    homeScenes.ts
  ui/
    HomeHeroScene.tsx
    HomeSystemStatus.tsx
    HomeCourseUniverse.tsx
    HomeGrowthScene.tsx
    HomeInterfaceDNA.tsx
    HomeMotionLab.tsx
    HomeArchiveScene.tsx
    HomePersonalSystem.tsx
    HomePortalScene.tsx
    HomeSectionRail.tsx
  visual/
    HomeCore3D.tsx
    HomeMathField3D.tsx
  styles/
    home-experience.css
```

HomePage.tsx composes scenes and owns shared orchestration refs only.

## Testing and verification

Automated:
- TypeScript build
- Vite production build
- existing tests
- targeted tests for pure scene/data helpers if added

Manual/browser checks:
- desktop full/balanced
- desktop eco/off
- mobile layout
- reduced-motion
- theme switching
- scroll snapping
- all CTAs
- no text overlap
- no persistent transform conflicts
- no WebGL crash breaking the page

## Success criteria

The redesign is successful when:
- the home page no longer resembles a conventional SaaS landing page
- the first screen is immediately recognizable as VisualMath
- every major scene has a distinct visual identity
- the page still communicates where the real product actions are
- decorative futuristic content cannot be mistaken for real account metrics
- motion feels cinematic rather than chaotic
- mobile remains usable
- the page builds cleanly and does not regress existing routes
