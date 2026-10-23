# MathMaMath Profile + Map 30th-Century Implementation Plan

**Goal:** Redesign Account and Course Map to match the 30th-century home experience without changing their data semantics or graph engine.

### Task 1 - Profile experience
- Create feature-owned account stylesheet.
- Rewrite AccountPage composition around Identity Core, Activity Matrix, Signal Waveform and Sector Matrix.
- Preserve profile edit/storage, real stats, charts and navigation.
- Remove old account page styles from global CSS while preserving topbar account button styles.

### Task 2 - Map shell
- Rewrite CourseMap visual composition into Navigation Core.
- Preserve all graph state, inspector behavior, tabs, fullscreen and navigation.
- Replace course-map stylesheet with the new HUD/spatial viewport visual system.

### Task 3 - G6 skin
- Upgrade native G6 nodes/edges/badges/minimap styling using current theme variables.
- Do not change graph model or layout semantics.
- Keep node/edge geometry fully owned by G6.

### Task 4 - Responsive/motion cleanup
- Add mobile/tablet adaptations.
- Disable decorative motion under motion=off and prefers-reduced-motion.
- Remove obsolete visual rules.

### Task 5 - Verification
- Run tests and production build.
- Inspect diff for unrelated changes.
- Merge only when CI is green.


### Task 6 - Sidebar modes + settings
- Upgrade Linear Academy styling into LINEAR LAB.
- Upgrade Review styling into REVIEW ARCHIVE.
- Upgrade Settings overlay into SYSTEM CONFIG.
- Distinguish Academy and Review entries in the sidebar.
- Preserve all existing behavior and storage keys.
