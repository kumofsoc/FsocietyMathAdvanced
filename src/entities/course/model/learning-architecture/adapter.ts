import type { BlockKind, ContentBlock, PracticeTask } from "@/entities/course/model/types";
import type {
  LayeredTopic,
  LayeredTopicBlueprint,
  LayeredTopicInput,
  LearningLayer,
  LearningLayerKind,
  LearningUnit,
  PracticeSkillKind,
  PracticeUnit,
} from "./types";

export const DEFAULT_LAYER_ORDER: LearningLayerKind[] = [
  "intuition",
  "notation",
  "formal",
  "properties",
  "theorem",
  "proof",
  "derivation",
  "law",
  "model",
  "observation",
  "experiment",
  "measurement",
  "simulation",
  "example",
  "counterexample",
  "visualization",
  "connection",
  "application",
  "history",
  "extension",
  "research",
];

const layerMeta: Record<LearningLayerKind, { title: string; purpose: string }> = {
  intuition: {
    title: "Сначала понять",
    purpose: "Интуитивная модель объекта до формализма.",
  },
  notation: {
    title: "Язык и обозначения",
    purpose: "Символы, запись и чтение формул.",
  },
  formal: {
    title: "Строгое определение",
    purpose: "Формальная математическая постановка.",
  },
  properties: {
    title: "Свойства",
    purpose: "Факты, которыми можно пользоваться дальше.",
  },
  theorem: {
    title: "Теоремы",
    purpose: "Ключевые утверждения и условия их применимости.",
  },
  proof: {
    title: "Почему это верно",
    purpose: "Полные доказательства: шаг за шагом, без пропусков.",
  },
  derivation: {
    title: "Как это выводится",
    purpose: "Пошаговый вывод формулы или закона из исходных принципов.",
  },
  law: {
    title: "Законы",
    purpose: "Фундаментальные зависимости и условия их применимости.",
  },
  model: {
    title: "Модель",
    purpose: "Как реальный объект или процесс переводится в формальную модель.",
  },
  observation: {
    title: "Наблюдение",
    purpose: "Что именно наблюдается и как это интерпретируется.",
  },
  experiment: {
    title: "Эксперимент",
    purpose: "Как проверить гипотезу или зависимость экспериментально.",
  },
  measurement: {
    title: "Измерение",
    purpose: "Величины, единицы, погрешности и процедура измерения.",
  },
  simulation: {
    title: "Симуляция",
    purpose: "Численное или интерактивное моделирование поведения системы.",
  },
  example: {
    title: "Разобранные примеры",
    purpose: "Пошаговое применение определения и метода.",
  },
  counterexample: {
    title: "Границы метода",
    purpose: "Контрпримеры, ошибки и случаи, где утверждение ломается.",
  },
  visualization: {
    title: "Увидеть объект",
    purpose: "Геометрические и интерактивные представления.",
  },
  connection: {
    title: "Связи",
    purpose: "Связи с prerequisites и соседними темами.",
  },
  application: {
    title: "Применения",
    purpose: "Где конструкция используется внутри и вне математики.",
  },
  history: {
    title: "Контекст",
    purpose: "Дополнительный исторический или концептуальный контекст.",
  },
  extension: {
    title: "Глубже",
    purpose: "Усиленная теория за пределами базового маршрута.",
  },
  research: {
    title: "Дальше курса",
    purpose: "Исследовательские вопросы и дальнейшие направления.",
  },
};

function legacyLayerForBlock(block: ContentBlock): LearningLayerKind {
  const mapping: Partial<Record<BlockKind, LearningLayerKind>> = {
    concepts: "intuition",
    definition: "formal",
    property: "properties",
    theorem: "theorem",
    proof: "proof",
    corollary: "theorem",
    example: "example",
    solution: "example",
    geometry: "visualization",
    note: "connection",
    summary: "connection",
    formula: "notation",
    algorithm: "application",
  };
  return mapping[block.kind] ?? "extension";
}

export function practiceSkillForTask(task: PracticeTask): PracticeSkillKind {
  if (task.type === "proof") return "prove";
  if (task.difficulty === "hard") return "challenge";
  if (task.type === "choice") return "recognize-object";
  if (task.type === "number") return "compute";
  return "explain";
}

function makeLegacyUnits(input: LayeredTopicInput): LearningUnit[] {
  return input.topic.blocks.map((block, index) => ({
    id: input.topic.id + "::legacy::" + index,
    layer: legacyLayerForBlock(block),
    title: block.title,
    summary: block.body,
    legacyBlockIndex: index,
    block,
  }));
}

function makeBlueprintUnits(
  input: LayeredTopicInput,
  blueprint: LayeredTopicBlueprint,
): LearningUnit[] {
  const explicit = (blueprint.units ?? []).map((unit, index) => {
    const block =
      unit.legacyBlockIndex === undefined
        ? unit.block
        : input.topic.blocks[unit.legacyBlockIndex];

    return {
      ...unit,
      id: unit.id ?? input.topic.id + "::v2::" + index,
      block,
    } satisfies LearningUnit;
  });

  const referenced = new Set(
    explicit
      .map((unit) => unit.legacyBlockIndex)
      .filter((index): index is number => index !== undefined),
  );

  const unclaimed = input.topic.blocks
    .map((block, index) => ({ block, index }))
    .filter(({ index }) => !referenced.has(index))
    .map(({ block, index }) => ({
      id: input.topic.id + "::legacy::" + index,
      layer: legacyLayerForBlock(block),
      title: block.title,
      summary: block.body,
      legacyBlockIndex: index,
      block,
    }) satisfies LearningUnit);

  return [...explicit, ...unclaimed];
}

function groupLayers(
  units: LearningUnit[],
  order: LearningLayerKind[],
): LearningLayer[] {
  const grouped = new Map<LearningLayerKind, LearningUnit[]>();
  units.forEach((unit) => {
    const list = grouped.get(unit.layer) ?? [];
    list.push(unit);
    grouped.set(unit.layer, list);
  });

  const extraKinds = [...grouped.keys()].filter((kind) => !order.includes(kind));
  return [...order, ...extraKinds]
    .filter((kind) => grouped.has(kind))
    .map((kind) => ({
      id: "layer::" + kind,
      kind,
      title: layerMeta[kind].title,
      purpose: layerMeta[kind].purpose,
      units: grouped.get(kind) ?? [],
    }));
}

function practiceFromInput(
  tasks: PracticeTask[],
  blueprint?: LayeredTopicBlueprint,
): PracticeUnit[] {
  const explicit = new Map((blueprint?.practice ?? []).map((item) => [item.taskId, item]));
  return tasks.map((task) => explicit.get(task.id) ?? {
    taskId: task.id,
    skill: practiceSkillForTask(task),
  });
}

export function toLayeredTopic(input: LayeredTopicInput): LayeredTopic {
  const { topic, blueprint } = input;
  const disciplineId = blueprint?.disciplineId ?? input.disciplineId ?? "mathematics";
  const courseId = blueprint?.courseId ?? input.courseId ?? "higher-mathematics";
  const units = blueprint
    ? makeBlueprintUnits(input, blueprint)
    : makeLegacyUnits(input);

  const order = blueprint?.layerOrder ?? DEFAULT_LAYER_ORDER;

  return {
    topic,
    disciplineId,
    courseId,
    clarityGoal:
      blueprint?.clarityGoal ??
      "Сначала понять смысл темы простым языком, затем перейти к строгой математической записи.",
    learningGoals:
      blueprint?.learningGoals ?? [
        "Понимать основные определения и обозначения.",
        "Уметь применять свойства на типовых задачах.",
      ],
    layers: groupLayers(units, order),
    practice: practiceFromInput(input.practiceTasks ?? [], blueprint),
    source: blueprint ? "native-v2" : "legacy-adapter",
  };
}
