import { describe, expect, it } from "vitest";
import { auditRigorousBlocks } from "./rigor";

describe("rigor audit", () => {
  it("requires a proof for every theorem", () => {
    const issues = auditRigorousBlocks([
      { kind: "theorem", title: "T", body: "Statement" },
    ]);
    expect(issues.map((issue) => issue.reason)).toEqual([
      "theorem has no explicit proof",
      "theorem has no worked example",
    ]);
  });

  it("accepts a theorem with proof and worked example", () => {
    const issues = auditRigorousBlocks([
      {
        kind: "theorem",
        title: "T",
        body: "Statement",
        proofs: [{ label: "Proof", body: "Reason." }],
        workedExamples: [{ body: "Concrete example." }],
      },
    ]);
    expect(issues).toEqual([]);
  });

  it("accepts a property whose statements each have proof and example", () => {
    const issues = auditRigorousBlocks([
      {
        kind: "property",
        title: "P",
        body: "Properties",
        statements: [
          {
            id: "p1",
            claim: "x+0=x",
            proof: { label: "Proof", body: "By the neutral element axiom." },
            example: { body: "For x=3, 3+0=3." },
          },
        ],
      },
    ]);
    expect(issues).toEqual([]);
  });

  it("promotes adjacent legacy proof and example blocks without removing them", async () => {
    const { promoteLegacyRigor } = await import("./rigor");
    const blocks = promoteLegacyRigor([
      { kind: "theorem", title: "T", body: "Statement" },
      { kind: "proof", title: "Proof T", body: "Specific proof" },
      { kind: "example", title: "Example T", body: "Concrete example" },
      { kind: "summary", title: "End", body: "Done" },
    ]);

    expect(blocks).toHaveLength(4);
    expect(blocks[0].proofs?.[0].body).toBe("Specific proof");
    expect(blocks[0].workedExamples?.[0].body).toBe("Concrete example");
  });

  it("reports an incomplete statement", () => {
    const issues = auditRigorousBlocks([
      {
        kind: "property",
        title: "P",
        body: "Properties",
        statements: [
          {
            id: "p1",
            claim: "claim",
            proof: { label: "Proof", body: "" },
            example: { body: "" },
          },
        ],
      },
    ]);
    expect(issues.map((issue) => issue.reason)).toEqual([
      "p1: missing proof",
      "p1: missing example",
    ]);
  });
});
