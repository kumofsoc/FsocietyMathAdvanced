import { describe, expect, it } from "vitest";
import { auditRigorousBlocks } from "./rigor";

describe("rigor audit", () => {
  it("requires a proof for every theorem", () => {
    const issues = auditRigorousBlocks([
      { kind: "theorem", title: "T", body: "Statement" },
    ]);
    expect(issues[0]?.reason).toContain("no explicit proof");
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
