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

    if (block.kind === "theorem" && !block.proofs?.length) {
      issues.push({
        blockIndex,
        title: block.title,
        reason: "theorem has no explicit proof",
      });
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
