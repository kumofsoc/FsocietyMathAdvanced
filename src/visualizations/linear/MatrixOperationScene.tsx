import type { MatrixOperationVisual } from "@/entities/course/model/types";
import { InlineMatrix } from "@/visualizations/linear/MatrixNotation";

export function MatrixOperationScene({
  visual,
}: {
  visual: MatrixOperationVisual;
}) {
  return (
    <div className="matrix-operation-scene" aria-label={visual.operation}>
      <div className="matrix-operation-stage">
        <div className="matrix-operation-matrix">
          <span>ДО</span>
          <InlineMatrix
            raw={visual.before}
            highlightRows={visual.beforeHighlightRows}
            size="large"
          />
        </div>

        <div className="matrix-operation-arrow">
          <code>{visual.operation}</code>
          <i aria-hidden="true">
            <b />
            <span>→</span>
          </i>
        </div>

        <div className="matrix-operation-matrix">
          <span>ПОСЛЕ</span>
          <InlineMatrix
            raw={visual.after}
            highlightRows={visual.afterHighlightRows}
            size="large"
          />
        </div>
      </div>

      <div className="matrix-operation-explanation">
        <span>ЗАЧЕМ ЭТО НУЖНО</span>
        <p>{visual.explanation}</p>
      </div>
    </div>
  );
}
