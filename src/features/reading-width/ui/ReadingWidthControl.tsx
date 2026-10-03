import type { ReadingWidth } from "@/features/reading-width/model/readingWidth";
import { readingWidthOptions } from "@/features/reading-width/model/readingWidth";

export function ReadingWidthControl({
  value,
  onChange,
}: {
  value: ReadingWidth;
  onChange: (value: ReadingWidth) => void;
}) {
  return (
    <div className="reading-width-control" role="group" aria-label="Ширина чтения">
      <span className="reading-width-label">ШИРИНА</span>
      <div className="reading-width-options">
        {readingWidthOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={value === option.id ? "active" : ""}
            onClick={() => onChange(option.id)}
            aria-pressed={value === option.id}
            title={option.description}
          >
            <span aria-hidden="true">
              {option.id === "narrow" ? "▥" : option.id === "wide" ? "▰" : "▤"}
            </span>
            <strong>{option.label}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
