import type { PracticeTask } from "@/entities/course/model/types";
import { abstractLinearPractice } from "./abstract-linear";
import { affineGeneralPractice } from "./affine-general";
import { analysisIntroPractice } from "./analysis-intro";
import { complexAnalysisPractice } from "./complex-analysis";
import { complexPractice } from "./complex";
import { defIntegralPractice } from "./def-integral";
import { euclideanPractice } from "./euclidean";
import { fieldTheoryPractice } from "./field-theory";
import { fourierPractice } from "./fourier";
import { indefIntegralPractice } from "./indef-integral";
import { lineSurfaceIntegralsPractice } from "./line-surface-integrals";
import { linearPractice } from "./linear";
import { multipleIntegralsPractice } from "./multiple-integrals";
import { multivariablePractice } from "./multivariable";
import { odePractice } from "./ode";
import { operationalPractice } from "./operational";
import { planeGeometryPractice } from "./plane-geometry";
import { planeTransformationsPractice } from "./plane-transformations";
import { powerSeriesPractice } from "./power-series";
import { seriesPractice } from "./series";
import { spaceGeometryPractice } from "./space-geometry";
import { tensorAlgebraPractice } from "./tensor-algebra";
import { vectorsPractice } from "./vectors";

export const basePracticeByTopic: Record<string, PracticeTask[]> = {
  ...abstractLinearPractice,
  ...affineGeneralPractice,
  ...analysisIntroPractice,
  ...complexAnalysisPractice,
  ...complexPractice,
  ...defIntegralPractice,
  ...euclideanPractice,
  ...fieldTheoryPractice,
  ...fourierPractice,
  ...indefIntegralPractice,
  ...lineSurfaceIntegralsPractice,
  ...linearPractice,
  ...multipleIntegralsPractice,
  ...multivariablePractice,
  ...odePractice,
  ...operationalPractice,
  ...planeGeometryPractice,
  ...planeTransformationsPractice,
  ...powerSeriesPractice,
  ...seriesPractice,
  ...spaceGeometryPractice,
  ...tensorAlgebraPractice,
  ...vectorsPractice,
};
