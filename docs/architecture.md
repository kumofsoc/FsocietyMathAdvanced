# Frontend architecture

MathMaMath uses a layered frontend structure. New code is placed by responsibility and runtime ownership rather than in generic `components`, `utils` or `lib` dumping grounds.

## Runtime layers

```
src/
  app/                    # application composition and global shell state
  pages/                  # route-level screens
  features/               # user-facing behavior grouped by feature
  entities/               # domain models and domain-only helpers
  shared/                 # generic infrastructure and reusable primitives
  visualizations/         # mathematics visualizations grouped by domain
  data/                   # curriculum, metadata and task datasets
  styles/                 # global/feature styles and ordered legacy slices
```

Dependency direction should stay downward:

- `app` may compose every lower layer.
- `pages` compose features, entities, visualizations and shared modules.
- `features` own behavior such as learning progress, personalization, navigation and background music.
- `entities` contain domain concepts without page orchestration.
- `shared` contains generic infrastructure such as API and browser-storage primitives.
- `visualizations` are grouped by mathematical domain.
- `data` contains content, not page behavior.

Use the `@/` alias for cross-layer imports. Zustand is reserved for genuine cross-component application state; local UI state stays local.

## Curriculum architecture

The theory is no longer stored in one monolithic `course.ts`.

```
src/data/course/
  chapters.ts
  index.ts
  enrichments.ts
  topicLoaders.ts
  topics/
    linear/
      matrices.ts
      determinants.ts
      inverse-rank.ts
      linear-systems.ts
      index.ts
    vectors/
      ...
    ...
```

### One topic = one module

Every complete topic owns one `Topic` object. A topic module contains only its theory/content blocks and metadata required by the domain model.

Example:

```ts
import type { Topic } from "@/entities/course/model/types";

const topic: Topic = {
  id: "example-topic",
  number: "81",
  title: "Example",
  chapterId: "example-chapter",
  summary: "...",
  prerequisites: [],
  blocks: [],
};

export default topic;
```

Do not append a new topic to a giant registry file.

### Chapter aggregators

Each chapter directory has a small `index.ts` that combines only the topics belonging to that chapter. The root `topics/index.ts` combines chapter registries for bulk tooling and integrity checks.

### Full registry vs lazy loader

There are intentionally two access paths.

- `@/data/course` exposes the full synchronous registry for integrity checks, review/bulk tooling and compatibility.
- `loadCourseTopic(topicId)` from `@/data/course/topicLoaders` is the UI path for a single topic.

Normal topic rendering must prefer the lazy loader. This keeps theory code-split by topic instead of downloading the whole curriculum.

The public `src/data/course.ts` file is only a compatibility facade. Do not put theory back into it.

## Practice architecture

Practice follows the same rule:

```
src/data/practice/
  index.ts
  enrichments.ts
  loaders.ts
  topics/
    linear/
      matrices.ts
      determinants.ts
      ...
    ...
```

- one topic owns one base task-bank module;
- `@/data/practice` exposes the full registry for integrity/bulk tooling;
- `loadPracticeForTopic(topicId)` is the UI path;
- academy/exam/proof banks are loaded only for topics that actually have them.

Do not import the full `practiceByTopic` registry from interactive topic UI.

## Lightweight metadata

Navigation must not require loading full theory.

`courseMeta.ts` and `practiceMeta.ts` are lightweight metadata contracts used by:

- sidebar navigation;
- progress calculation;
- course map;
- route decisions;
- topic neighbors;
- task-count progress.

Heavy theory/task bodies stay in lazy modules.

The integrity suite verifies that metadata and full content stay synchronized.

## Content enrichment

Academy and supplemental content is applied through explicit composition functions rather than mutating base topic modules.

- `enrichTopic` composes one loaded topic.
- `enrichCourseTopics` builds the full enriched registry.
- `composeTopicWithSupplements` handles supplemental curriculum layers.

This keeps the base topic files independently understandable and makes future content packs possible.

## Styles

The old ~221 KB stylesheet is retained byte-for-byte but physically split into ordered modules:

```
src/styles.css                  # import manifest only
src/styles/legacy/
  00-core.css
  01-learning-shell.css
  ...
  11-navigation-account.css
```

The import order is part of the compatibility contract. Do not reorder these files casually.

New feature styling should live next to the feature or in a named domain stylesheet, not be appended to the legacy slices. The legacy directory exists to make progressive ownership migration safe.

## Compatibility facades

These paths intentionally remain stable while architecture evolves:

- `@/data/course`
- `@/data/practice`
- old `src/lib/*` re-exports
- old `src/types/*` re-exports

New code should prefer canonical modules:

- learning: `@/features/learning/model/*`
- background music: `@/features/background-music/model/*`
- API: `@/shared/api/*`
- browser storage: `@/shared/lib/browserStorage`
- course domain: `@/entities/course/*`
- lazy theory: `@/data/course/topicLoaders`
- lazy practice: `@/data/practice/loaders`

A compatibility facade may be removed only after repository-wide imports no longer depend on it.

## Invariants enforced by tests

Architecture changes must preserve these contracts:

1. Every chapter topic ID resolves to a topic.
2. Every topic's `chapterId` agrees with its chapter.
3. Every prerequisite resolves to a real topic.
4. READY topics do not depend on PLANNED topics.
5. Task IDs are unique.
6. Course metadata matches theory metadata.
7. Practice metadata matches actual task IDs.
8. Search-index blocks match theory blocks.
9. Lazy topic loaders cover exactly the metadata topic IDs.
10. Lazy practice loaders return exactly the task IDs recorded in practice metadata.
11. Core linear-mathematics theorem/property blocks satisfy the rigor audit.

CI runs tests before the production build, so a content-architecture regression must fail before merge.

## Adding a new topic

The normal extension path is:

1. Add the topic ID to the correct chapter in `chapters.ts` and lightweight metadata.
2. Create `topics/<chapter>/<topic-id>.ts`.
3. Register it in that chapter's `index.ts`.
4. Add its dynamic loader.
5. Add the base practice module under `practice/topics/<chapter>/`.
6. Register practice and its lazy loader.
7. Update generated/lightweight search and practice metadata.
8. Add visualization registration only if the concept benefits from one.
9. Run `pnpm test` and `pnpm build`.

Do not solve extension problems by growing a global monolith.

## Persistence contract

Existing localStorage/IndexedDB keys are user-data contracts and must not be renamed casually. Access to browser storage should go through resilient helpers where possible so restricted/private browser modes do not crash initial rendering.

## Current structural targets

The biggest curriculum and stylesheet monoliths have been removed. Remaining candidates should be split only when ownership or runtime loading improves:

- `courseSearchIndex.ts`: keep lazy and eventually generate/split by chapter if search grows substantially.
- `topic-enrichments.ts`: split by owning mathematical domain when more supplement packs are added.
- large visualization files: split by independent laboratory, not by arbitrary line count.
- legacy `src/lib/*` and `src/types/*`: delete after compatibility imports are fully migrated.

The rule is not "small files at any cost". The rule is one responsibility, clear ownership, stable public contracts and loading only what the current screen needs.
