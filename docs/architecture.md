# Frontend architecture

VisualMath uses a layered frontend structure. New code should be placed by responsibility, not dumped into a generic `components` or `lib` directory.

## Layers

```
src/
  app/                    # application composition, global shell state
  pages/                  # route-level screens
  features/               # user-facing behavior grouped by feature
  entities/               # domain models and domain-only helpers
  shared/                 # infrastructure and reusable application primitives
  visualizations/         # math visualization domains
    algebra/
    analysis/
    geometry/
    linear/
    registry/
  data/                   # course/content datasets
  styles/                 # global and feature stylesheets
```

## Rules

- `app` composes the application and may import from every lower layer.
- `pages` compose features, entities, visualizations and shared modules.
- `features` own behavior such as learning progress, personalization, navigation and background music.
- `entities` contain domain concepts without page/UI orchestration.
- `shared` contains generic infrastructure such as API primitives and error boundaries.
- `visualizations` are grouped by mathematical domain instead of living in one component directory.
- Use the `@/` alias for cross-layer imports.
- Do not create a new catch-all `components`, `utils` or `helpers` dumping ground.
- Zustand is reserved for genuine cross-component application state. Local UI state stays local.
- Existing localStorage keys must not be renamed casually because they are part of the browser persistence contract.

## Transitional compatibility facades

The old `src/lib/*` and `src/types/*` files are intentionally thin re-export facades while the large course datasets are migrated. New application code should import from the real modules:

- learning: `@/features/learning/model/*`
- background music: `@/features/background-music/model/*`
- API: `@/shared/api/*`
- course domain: `@/entities/course/*`

Once the large data modules stop importing the legacy paths, the facades can be deleted.

## Next structural targets

The two remaining intentionally deferred monoliths are `src/data/course.ts` and `src/styles.css`. They should be split by course/domain and style ownership in dedicated migrations, because changing them at the same time as the component move would make regression review unnecessarily difficult.
