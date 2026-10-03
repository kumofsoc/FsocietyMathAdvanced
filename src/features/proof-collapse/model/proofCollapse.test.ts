import { describe, expect, it } from "vitest";
import {
  isLongProofText,
  LONG_PROOF_CHAR_THRESHOLD,
} from "./proofCollapse";

describe("proof collapse heuristic", () => {
  it("leaves short proofs fully visible", () => {
    expect(isLongProofText("Короткое доказательство в несколько предложений.")).toBe(false);
  });

  it("collapses genuinely long prose proofs", () => {
    expect(isLongProofText("a".repeat(LONG_PROOF_CHAR_THRESHOLD + 10))).toBe(true);
  });

  it("treats many meaningful lines as a long proof", () => {
    const proof = Array.from({ length: 8 }, (_, index) => "Шаг " + index).join("\n");
    expect(isLongProofText(proof)).toBe(true);
  });

  it("lets a substantial formula contribute without dominating the decision", () => {
    expect(isLongProofText("a".repeat(650), "x".repeat(220))).toBe(true);
  });
});
