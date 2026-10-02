import type { ReactNode } from "react";

function parseMatrix(raw: string) {
  const inner = raw.slice(2, -2);
  return inner
    .split(/\]\s*,\s*\[/)
    .map((row) => row.split(",").map((value) => value.trim()));
}

export function InlineMatrix({ raw }: { raw: string }) {
  const rows = parseMatrix(raw);
  const columns = Math.max(1, rows[0]?.length ?? 1);

  return (
    <span className="inline-matrix" aria-label={"Матрица " + raw}>
      <i className="inline-matrix-bracket left" />
      <span
        className="inline-matrix-grid"
        style={{ gridTemplateColumns: "repeat(" + columns + ", auto)" }}
      >
        {rows.flatMap((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <span key={rowIndex + "-" + columnIndex}>{value}</span>
          )),
        )}
      </span>
      <i className="inline-matrix-bracket right" />
    </span>
  );
}

export function RichMatrixText({ text }: { text: string }) {
  const regex = /\[\[(?:[^\]]|\](?!\]))*\]\]/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    nodes.push(<InlineMatrix key={"matrix-" + index++} raw={match[0]} />);
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}
