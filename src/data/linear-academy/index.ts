import type { ContentBlock } from "@/entities/course/model/types";
import type { AcademySpec } from "./model";
import * as topic01 from "./topics/matrices";
import * as topic02 from "./topics/determinants";
import * as topic03 from "./topics/inverse-rank";
import * as topic04 from "./topics/linear-systems";
import * as topic05 from "./topics/vectors";
import * as topic06 from "./topics/dot-product";
import * as topic07 from "./topics/cross-product";
import * as topic08 from "./topics/mixed-product";
import * as topic09 from "./topics/plane-coordinates";
import * as topic10 from "./topics/plane-lines";
import * as topic11 from "./topics/conics";
import * as topic12 from "./topics/space-lines-planes";
import * as topic13 from "./topics/quadrics";
import * as topic14 from "./topics/mappings-transformations";
import * as topic15 from "./topics/linear-transformations";
import * as topic16 from "./topics/affine-transformations";
import * as topic17 from "./topics/linear-spaces";
import * as topic18 from "./topics/subspaces";
import * as topic19 from "./topics/linear-maps";
import * as topic20 from "./topics/eigenproblem";
import * as topic21 from "./topics/linear-functionals";
import * as topic22 from "./topics/quadratic-forms";
import * as topic23 from "./topics/jordan-form";
import * as topic24 from "./topics/euclidean-spaces";
import * as topic25 from "./topics/euclidean-operators";
import * as topic26 from "./topics/euclidean-functions";
import * as topic27 from "./topics/unitary-spaces";
import * as topic28 from "./topics/affine-spaces";
import * as topic29 from "./topics/quadric-invariants";
import * as topic30 from "./topics/tensor-linear";
import * as topic31 from "./topics/tensor-euclidean";
import * as topic32 from "./topics/exterior-algebra";

export const linearAcademySpecs: Record<string, AcademySpec> = {
  "matrices": topic01.academySpec,
  "determinants": topic02.academySpec,
  "inverse-rank": topic03.academySpec,
  "linear-systems": topic04.academySpec,
  "vectors": topic05.academySpec,
  "dot-product": topic06.academySpec,
  "cross-product": topic07.academySpec,
  "mixed-product": topic08.academySpec,
  "plane-coordinates": topic09.academySpec,
  "plane-lines": topic10.academySpec,
  "conics": topic11.academySpec,
  "space-lines-planes": topic12.academySpec,
  "quadrics": topic13.academySpec,
  "mappings-transformations": topic14.academySpec,
  "linear-transformations": topic15.academySpec,
  "affine-transformations": topic16.academySpec,
  "linear-spaces": topic17.academySpec,
  "subspaces": topic18.academySpec,
  "linear-maps": topic19.academySpec,
  "eigenproblem": topic20.academySpec,
  "linear-functionals": topic21.academySpec,
  "quadratic-forms": topic22.academySpec,
  "jordan-form": topic23.academySpec,
  "euclidean-spaces": topic24.academySpec,
  "euclidean-operators": topic25.academySpec,
  "euclidean-functions": topic26.academySpec,
  "unitary-spaces": topic27.academySpec,
  "affine-spaces": topic28.academySpec,
  "quadric-invariants": topic29.academySpec,
  "tensor-linear": topic30.academySpec,
  "tensor-euclidean": topic31.academySpec,
  "exterior-algebra": topic32.academySpec,
};

export const linearAcademyBlocks: Record<string, ContentBlock[]> = {
  "matrices": topic01.academyBlocks,
  "determinants": topic02.academyBlocks,
  "inverse-rank": topic03.academyBlocks,
  "linear-systems": topic04.academyBlocks,
  "vectors": topic05.academyBlocks,
  "dot-product": topic06.academyBlocks,
  "cross-product": topic07.academyBlocks,
  "mixed-product": topic08.academyBlocks,
  "plane-coordinates": topic09.academyBlocks,
  "plane-lines": topic10.academyBlocks,
  "conics": topic11.academyBlocks,
  "space-lines-planes": topic12.academyBlocks,
  "quadrics": topic13.academyBlocks,
  "mappings-transformations": topic14.academyBlocks,
  "linear-transformations": topic15.academyBlocks,
  "affine-transformations": topic16.academyBlocks,
  "linear-spaces": topic17.academyBlocks,
  "subspaces": topic18.academyBlocks,
  "linear-maps": topic19.academyBlocks,
  "eigenproblem": topic20.academyBlocks,
  "linear-functionals": topic21.academyBlocks,
  "quadratic-forms": topic22.academyBlocks,
  "jordan-form": topic23.academyBlocks,
  "euclidean-spaces": topic24.academyBlocks,
  "euclidean-operators": topic25.academyBlocks,
  "euclidean-functions": topic26.academyBlocks,
  "unitary-spaces": topic27.academyBlocks,
  "affine-spaces": topic28.academyBlocks,
  "quadric-invariants": topic29.academyBlocks,
  "tensor-linear": topic30.academyBlocks,
  "tensor-euclidean": topic31.academyBlocks,
  "exterior-algebra": topic32.academyBlocks,
};

export const linearAcademyPitfallBlocks: Record<string, ContentBlock[]> = {
  "matrices": topic01.pitfallBlocks,
  "determinants": topic02.pitfallBlocks,
  "inverse-rank": topic03.pitfallBlocks,
  "linear-systems": topic04.pitfallBlocks,
  "vectors": topic05.pitfallBlocks,
  "dot-product": topic06.pitfallBlocks,
  "cross-product": topic07.pitfallBlocks,
  "mixed-product": topic08.pitfallBlocks,
  "plane-coordinates": topic09.pitfallBlocks,
  "plane-lines": topic10.pitfallBlocks,
  "conics": topic11.pitfallBlocks,
  "space-lines-planes": topic12.pitfallBlocks,
  "quadrics": topic13.pitfallBlocks,
  "mappings-transformations": topic14.pitfallBlocks,
  "linear-transformations": topic15.pitfallBlocks,
  "affine-transformations": topic16.pitfallBlocks,
  "linear-spaces": topic17.pitfallBlocks,
  "subspaces": topic18.pitfallBlocks,
  "linear-maps": topic19.pitfallBlocks,
  "eigenproblem": topic20.pitfallBlocks,
  "linear-functionals": topic21.pitfallBlocks,
  "quadratic-forms": topic22.pitfallBlocks,
  "jordan-form": topic23.pitfallBlocks,
  "euclidean-spaces": topic24.pitfallBlocks,
  "euclidean-operators": topic25.pitfallBlocks,
  "euclidean-functions": topic26.pitfallBlocks,
  "unitary-spaces": topic27.pitfallBlocks,
  "affine-spaces": topic28.pitfallBlocks,
  "quadric-invariants": topic29.pitfallBlocks,
  "tensor-linear": topic30.pitfallBlocks,
  "tensor-euclidean": topic31.pitfallBlocks,
  "exterior-algebra": topic32.pitfallBlocks,
};
