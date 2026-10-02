const formulas = [
  "∫ e^{-x²} dx",
  "A·v = λv",
  "∇ × F",
  "det(A − λI) = 0",
  "Σ aₙxⁿ",
  "∂²f/∂x∂y",
  "limₙ→∞ aₙ",
  "e^{iπ} + 1 = 0",
];

export function HomeFormulaTicker() {
  const stream = [...formulas, ...formulas];

  return (
    <div className="future-formula-ticker" aria-hidden="true">
      <div className="future-formula-track" data-ambient="ticker">
        {stream.map((formula, index) => (
          <span key={formula + index}>
            <i>{String(index % formulas.length).padStart(2, "0")}</i>
            {formula}
          </span>
        ))}
      </div>
    </div>
  );
}
