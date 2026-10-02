# VisualMath Learning Architecture v2 — Implementation Plan

## 1. Course architecture foundation
- Add v2 domain types for layers, units, skill categories and authored topics.
- Add legacy adapter.
- Add reference layered metadata for matrices, determinants and inverse-rank.
- Add tests proving stable IDs, ordering and legacy fallback.

## 2. Navigation cleanup
- Remove duplicated “Все разделы”.
- Render HistoryDock only on home.
- Add global history hotkeys with editable-target guard.
- Make logo navigate home + scroll top.

## 3. Home composition
- Fix Interface DNA responsive grid.
- Disable text selection only inside home.
- Add “Что такое VisualMath” scene and scene rail entry.
- Link overview modules to map, academy, review and account.

## 4. Map comprehension
- Add legend, search, breadcrumb and edge-mode controls.
- Extend G6 graph component to render filtered edges without changing layout semantics.
- Add Map Focus graph-first fullscreen overlay.
- Preserve current fullscreen behavior.

## 5. Music safety
- Add destructive clear-playlist modal with keyboard/backdrop behavior and focus restoration.

## 6. Responsive polish
- Desktop, wide, tablet and mobile CSS.
- Keep content readable and map workspace useful on ultrawide screens.

## 7. Verification
- Unit tests for v2 course adapter and navigation helpers.
- Existing tests.
- TypeScript + Vite production build.
- Diff audit.
- Merge automatically to main after green CI.


## 8. Academic rigor and science-ready platform
- Add discipline/course catalog.
- Keep mathematics active; register physics as planned without empty public content.
- Extend layer kinds for scientific models, laws, derivations, experiments, measurements and simulations.
- Add per-property proof/example schema and rigor audit.
- Add vector-space and linear-space supplemental modules outside the legacy monolith.
- Render rigorous statements and theorem proofs directly in topic UI.
- Add practice filters by learning skill.
