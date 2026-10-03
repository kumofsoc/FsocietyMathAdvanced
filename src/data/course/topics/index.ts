import type { Topic } from "@/entities/course/model/types";
import { linearTopics } from "./linear";
import { vectorsTopics } from "./vectors";
import { planeGeometryTopics } from "./plane-geometry";
import { spaceGeometryTopics } from "./space-geometry";
import { planeTransformationsTopics } from "./plane-transformations";
import { abstractLinearTopics } from "./abstract-linear";
import { euclideanTopics } from "./euclidean";
import { affineGeneralTopics } from "./affine-general";
import { tensorAlgebraTopics } from "./tensor-algebra";
import { analysisIntroTopics } from "./analysis-intro";
import { complexTopics } from "./complex";
import { indefIntegralTopics } from "./indef-integral";
import { defIntegralTopics } from "./def-integral";
import { multivariableTopics } from "./multivariable";
import { odeTopics } from "./ode";
import { multipleIntegralsTopics } from "./multiple-integrals";
import { lineSurfaceIntegralsTopics } from "./line-surface-integrals";
import { seriesTopics } from "./series";
import { powerSeriesTopics } from "./power-series";
import { fourierTopics } from "./fourier";
import { fieldTheoryTopics } from "./field-theory";
import { complexAnalysisTopics } from "./complex-analysis";
import { operationalTopics } from "./operational";

export const baseTopics: Record<string, Topic> = {
  ...linearTopics,
  ...vectorsTopics,
  ...planeGeometryTopics,
  ...spaceGeometryTopics,
  ...planeTransformationsTopics,
  ...abstractLinearTopics,
  ...euclideanTopics,
  ...affineGeneralTopics,
  ...tensorAlgebraTopics,
  ...analysisIntroTopics,
  ...complexTopics,
  ...indefIntegralTopics,
  ...defIntegralTopics,
  ...multivariableTopics,
  ...odeTopics,
  ...multipleIntegralsTopics,
  ...lineSurfaceIntegralsTopics,
  ...seriesTopics,
  ...powerSeriesTopics,
  ...fourierTopics,
  ...fieldTheoryTopics,
  ...complexAnalysisTopics,
  ...operationalTopics,
};
