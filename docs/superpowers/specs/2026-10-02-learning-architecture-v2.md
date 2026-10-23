# MathMaMath Learning Architecture v2

Date: 2026-10-02
Status: approved and executing

## Product thesis

MathMaMath should become arbitrarily deep academically without becoming arbitrarily hard to understand.

**Clarity is mandatory. Depth is layered.**

Every topic starts with a human-readable conceptual model and only then exposes stricter layers: notation, formal definitions, properties, theorems, proofs, examples, counterexamples, visual models, connections, applications, proof practice, advanced problems and research extensions.

## Course architecture

The target hierarchy is:

```
Chapter
  Topic
    LearningLayer
      LearningUnit
    PracticeBank
      PracticeSkill
      Exercise
```

### Learning layers

Canonical layer kinds:

- intuition — what the object is and why it exists;
- notation — symbols and language;
- formal — strict definitions;
- properties — reusable facts and identities;
- theorem — theorem statements;
- proof — proofs and proof ideas;
- example — worked examples;
- counterexample — boundaries and failure modes;
- visualization — interactive/geometric views;
- connection — prerequisite and cross-topic connections;
- application — mathematical and applied use;
- history — optional conceptual/historical context;
- extension — deeper/advanced material;
- research — open-ended or near-research extensions.

A topic can have many units per layer. Units have stable IDs independent of displayed titles.

### Practice decomposition

Practice is not one undifferentiated task list. Exercise metadata can classify skills:

- recall-definition;
- recognize-object;
- compute;
- choose-method;
- explain;
- construct-example;
- construct-counterexample;
- prove;
- repair-proof;
- mixed;
- challenge;
- research.

Progress can later aggregate by skill instead of only solved-count.

### Compatibility

No big-bang migration.

Current `Topic.blocks`, practice arrays, IDs, progress keys, map IDs and routes keep working.

A compatibility adapter exposes legacy topics as layered topics. New topics can be authored natively in v2. Existing topics can be migrated one by one.

Initial reference migrations: matrices, determinants, inverse-rank.

## Home

- Feature DNA cards must all fit visibly.
- Desktop grid: 3 cards + 2 wider cards.
- Medium: 2 + 2 + 1.
- Mobile: one column.
- Remove vertical transforms that push later cards outside the viewport.
- Add a new “Что такое MathMaMath” product overview scene covering:
  - understandable higher mathematics;
  - layered academic depth;
  - knowledge map;
  - visualizations;
  - theory + practice;
  - progress;
  - profile/personalization;
  - concise review;
  - deep linear mathematics.
- The overview links directly to real product surfaces.
- Home text/decorative content is non-selectable. Learning pages remain selectable.

## Sidebar and navigation

- Remove duplicated “Все разделы”.
- Keep “Прогресс по курсу” as the canonical chapter/topic list.
- HistoryDock buttons render only on home.
- Keyboard navigation remains global:
  - Ctrl/Cmd+Z => previous app location;
  - Ctrl/Cmd+Shift+Z => next app location.
- Do not hijack undo inside editable fields.
- Logo click always goes to home and top.
- Clicking logo while already on home scrolls smoothly to top.

## Knowledge map

G6 remains the only graph renderer and geometry owner.

Improvements:

- human-readable legend;
- topic search;
- breadcrumb/current branch;
- edge visibility modes:
  - all;
  - prerequisites only;
  - study route only;
- clearer inspector copy;
- normal fullscreen keeps full map page UI;
- new Map Focus mode opens a true graph-first fullscreen overlay:
  - graph fills almost the whole viewport;
  - minimal floating toolbar;
  - collapsible inspector;
  - Escape exits focus mode;
  - no second graph renderer.

## Music destructive modal

“Очистить весь плейлист” never deletes immediately.

Modal:

- states how many tracks will be deleted;
- explains files are local to this browser;
- Cancel;
- destructive “Удалить все песни”;
- Escape closes;
- backdrop closes;
- focus returns to trigger;
- confirm performs the existing clear operation.

## Responsive requirements

Test layout intent at:

- narrow mobile (~390px);
- tablet (~768–1024px);
- desktop (~1280–1600px);
- wide (~1920–2560px).

Wide screens should gain usable canvas/content area, not merely stretch paragraphs.

## Non-goals

- no backend migration in this pass;
- no replacement of G6;
- no deletion of current course content;
- no forced migration of all topics;
- no removal of keyboard history;
- no disabling text selection on educational content.


## Multi-discipline platform direction

The architecture is intentionally not mathematics-only.

Target hierarchy:

```
Discipline
  Course
    Chapter
      Topic
        LearningLayer
          LearningUnit
```

Mathematics is the first active discipline. Physics is registered as planned, but no fake or empty user-facing physics course is exposed.

Scientific disciplines can extend the canonical learning layers with:

- model;
- law;
- derivation;
- observation;
- experiment;
- measurement;
- simulation.

Practice skills can likewise extend beyond mathematical proof/computation into:

- derive;
- model;
- estimate;
- analyze-data;
- design-experiment;
- simulate.

This keeps the same learning engine useful for mathematics, physics and later fundamental sciences.

## Rigor contract

New authored rigorous content follows a structural rule:

- every theorem has an explicit proof;
- every property is either a single proved statement or a set of independent statements;
- every independent property statement contains:
  - the claim;
  - conditions when relevant;
  - its own proof;
  - its own example;
  - optional failure mode when assumptions are removed.

A content audit utility rejects new rigorous modules that omit the required proof/example structure.

Existing legacy content remains compatible and can be migrated incrementally.

## Vector and linear-space foundation expansion

The first v2 supplemental content modules strengthen:

- geometric vector spaces;
- zero vector and zero-dimensional space;
- subspaces;
- uniqueness of decomposition;
- geometric meaning of linear dependence;
- basis and dimension;
- elementary consequences of vector-space axioms;
- span and finite-dimensional basis theory.

These supplements live outside the legacy monolithic `course.ts` and are composed at runtime so existing deep links and block indexes remain stable.
