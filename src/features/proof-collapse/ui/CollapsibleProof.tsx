import { useState, type ReactNode } from "react";
import { isLongProofText } from "@/features/proof-collapse/model/proofCollapse";

export function CollapsibleProof({
  body,
  formula,
  children,
}: {
  body: string;
  formula?: string;
  children: ReactNode;
}) {
  const collapsible = isLongProofText(body, formula);
  const [expanded, setExpanded] = useState(false);

  if (!collapsible) {
    return <>{children}</>;
  }

  return (
    <section className={"collapsible-proof " + (expanded ? "expanded" : "collapsed")}>
      <div className="collapsible-proof-content">{children}</div>
      <button
        type="button"
        className="collapsible-proof-toggle"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <span aria-hidden="true">{expanded ? "↑" : "↓"}</span>
        <strong>{expanded ? "Свернуть доказательство" : "Развернуть доказательство"}</strong>
      </button>
    </section>
  );
}
