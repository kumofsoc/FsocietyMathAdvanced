import { describe, expect, it } from "vitest";
import { extractMatrixLiterals } from "./MatrixNotation";

describe("extractMatrixLiterals", () => {
  it("extracts unique matrix literals in reading order", () => {
    expect(
      extractMatrixLiterals(
        "A=[[1,2],[3,4]], B=[[0,1],[1,0]], снова A=[[1,2],[3,4]]",
      ),
    ).toEqual(["[[1,2],[3,4]]", "[[0,1],[1,0]]"]);
  });

  it("returns an empty list when the example has no literal matrix", () => {
    expect(extractMatrixLiterals("A — матрица 3×2.")).toEqual([]);
  });
});
