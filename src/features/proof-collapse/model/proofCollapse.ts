export const LONG_PROOF_CHAR_THRESHOLD = 820;
export const LONG_PROOF_LINE_THRESHOLD = 8;

export function isLongProofText(body: string, formula?: string) {
  const normalizedBody = body.replace(/\s+/g, " ").trim();
  const meaningfulLines = body
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean).length;
  const formulaWeight = (formula ?? "").replace(/\s+/g, "").length;

  return (
    normalizedBody.length + Math.min(formulaWeight, 260) >= LONG_PROOF_CHAR_THRESHOLD ||
    meaningfulLines >= LONG_PROOF_LINE_THRESHOLD
  );
}
