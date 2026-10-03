import type { ContentBlock } from "@/entities/course/model/types";

export interface AcademySpec {
  core: string;
  theoremTitle: string;
  theoremBody: string;
  theoremFormula?: string;
  proof: string;
  exampleTitle: string;
  exampleBody: string;
  exampleFormula?: string;
  visual: string;
  visualBody: string;
}

export function buildAcademyBlocks(spec: AcademySpec): ContentBlock[] {
  return [
    {
      source: "academy",
      kind: "concepts",
      title: "Концептуальная модель",
      body: spec.core,
    },
    {
      source: "academy",
      kind: "theorem",
      title: spec.theoremTitle,
      body: spec.theoremBody,
      formula: spec.theoremFormula,
      proofs: [
        {
          label: "Доказательство",
          body: spec.proof,
        },
      ],
      workedExamples: [
        {
          body: spec.exampleBody,
          formula: spec.exampleFormula,
        },
      ],
    },
    {
      source: "academy",
      kind: "example",
      title: spec.exampleTitle,
      body: spec.exampleBody,
      formula: spec.exampleFormula,
    },
    {
      source: "academy",
      kind: "geometry",
      title: "Визуализация · " + spec.visual,
      body: spec.visualBody,
    },
  ];
}

export function buildPitfallBlocks(body: string): ContentBlock[] {
  return [
    {
      source: "academy",
      kind: "note",
      title: "Контрпример / типичная ошибка",
      body,
    },
  ];
}
