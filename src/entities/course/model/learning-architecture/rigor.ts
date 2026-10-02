import type { ContentBlock } from "@/entities/course/model/types";

export interface RigorIssue {
  blockIndex: number;
  title: string;
  reason: string;
}

export function auditRigorousBlocks(blocks: ContentBlock[]): RigorIssue[] {
  const issues: RigorIssue[] = [];

  blocks.forEach((block, blockIndex) => {
    if (block.kind === "property") {
      if (block.statements?.length) {
        block.statements.forEach((statement) => {
          if (!statement.claim.trim()) {
            issues.push({ blockIndex, title: block.title, reason: "empty property claim" });
          }
          if (!statement.proof?.body?.trim()) {
            issues.push({ blockIndex, title: block.title, reason: statement.id + ": missing proof" });
          }
          if (!statement.example?.body?.trim()) {
            issues.push({ blockIndex, title: block.title, reason: statement.id + ": missing example" });
          }
        });
      } else if (!block.proofs?.length) {
        issues.push({
          blockIndex,
          title: block.title,
          reason: "property block has no per-statement structure or proof",
        });
      }
    }

    if (block.kind === "theorem") {
      if (!block.proofs?.length) {
        issues.push({
          blockIndex,
          title: block.title,
          reason: "theorem has no explicit proof",
        });
      }
      if (!block.workedExamples?.length) {
        issues.push({
          blockIndex,
          title: block.title,
          reason: "theorem has no worked example",
        });
      }
    }
  });

  return issues;
}

export function assertRigorousBlocks(blocks: ContentBlock[]) {
  const issues = auditRigorousBlocks(blocks);
  if (!issues.length) return;

  throw new Error(
    issues
      .map((issue) => `[${issue.blockIndex}] ${issue.title}: ${issue.reason}`)
      .join("\n"),
  );
}


export function promoteLegacyRigor(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((block, index) => {
    if (block.kind !== "theorem") return block;

    let proof = block.proofs?.[0];
    let workedExample = block.workedExamples?.[0];

    for (let cursor = index + 1; cursor < blocks.length; cursor += 1) {
      const candidate = blocks[cursor];

      if (
        candidate.kind === "theorem" ||
        candidate.kind === "property" ||
        candidate.kind === "definition" ||
        candidate.kind === "concepts"
      ) {
        break;
      }

      if (!proof && candidate.kind === "proof") {
        proof = {
          label: candidate.title,
          body: candidate.body,
          formula: candidate.formula,
        };
      }

      if (
        !workedExample &&
        (candidate.kind === "example" || candidate.kind === "solution")
      ) {
        workedExample = {
          body: candidate.body,
          formula: candidate.formula,
        };
      }

      if (proof && workedExample) break;
    }

    if (proof === block.proofs?.[0] && workedExample === block.workedExamples?.[0]) {
      return block;
    }

    return {
      ...block,
      proofs: proof ? [proof, ...(block.proofs?.slice(1) ?? [])] : block.proofs,
      workedExamples: workedExample
        ? [workedExample, ...(block.workedExamples?.slice(1) ?? [])]
        : block.workedExamples,
    };
  });
}
