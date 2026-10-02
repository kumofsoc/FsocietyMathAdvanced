import { useMemo, useState } from "react";
import "@/styles/power-series.css";

const W = 620;
const H = 300;
const PAD = 34;

function polyline(values: number[], min: number, max: number) {
  const span = Math.max(1e-9, max - min);
  return values
    .map((value, index) => {
      const x = PAD + (index / Math.max(1, values.length - 1)) * (W - PAD * 2);
      const y = H - PAD - ((value - min) / span) * (H - PAD * 2);
      return (index === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
    })
    .join(" ");
}

function PowerRadiusLab() {
  const [x, setX] = useState(0.72);
  const [count, setCount] = useState(24);

  const sums = useMemo(() => {
    let sum = 0;
    return Array.from({ length: count }, (_, index) => {
      sum += Math.pow(x, index);
      return sum;
    });
  }, [x, count]);

  const target = Math.abs(x) < 1 ? 1 / (1 - x) : null;
  const min = Math.min(0, ...sums, target ?? 0);
  const max = Math.max(1, ...sums, target ?? 0);
  const pad = Math.max(.2, (max - min) * .15);
  const yMin = min - pad;
  const yMax = max + pad;

  return (
    <section className="power-lab">
      <header>
        <div className="eyebrow">POWER SERIES / RADIUS</div>
        <h2>Одна точка x меняет траекторию всех частичных сумм.</h2>
        <p>
          Модель ∑xⁿ имеет R=1. Внутри |x|&lt;1 частичные суммы стабилизируются;
          на границе и снаружи характер меняется.
        </p>
      </header>

      <div className="power-layout">
        <div className="power-stage">
          <svg viewBox={"0 0 " + W + " " + H}>
            <line className="power-axis" x1={PAD} y1={H - PAD} x2={W - 12} y2={H - PAD} />
            <line className="power-axis" x1={PAD} y1={12} x2={PAD} y2={H - PAD} />
            {target !== null && (
              <line
                className="power-target"
                x1={PAD}
                x2={W - 12}
                y1={H - PAD - ((target - yMin) / (yMax - yMin)) * (H - PAD * 2)}
                y2={H - PAD - ((target - yMin) / (yMax - yMin)) * (H - PAD * 2)}
              />
            )}
            <path className="power-curve" d={polyline(sums, yMin, yMax)} />
          </svg>
          <div className="power-badges">
            <span>|x| {Math.abs(x) < 1 ? "<" : Math.abs(x) === 1 ? "=" : ">"} R</span>
            <span>S_N={(sums.at(-1) ?? 0).toFixed(5)}</span>
            <span>{target === null ? "нет конечной суммы" : "S=" + target.toFixed(5)}</span>
          </div>
        </div>

        <aside className="power-controls">
          <label>
            <span>x</span>
            <input
              type="range"
              min="-1.2"
              max="1.2"
              step=".01"
              value={x}
              onChange={(event) => setX(Number(event.target.value))}
            />
            <b>{x.toFixed(2)}</b>
          </label>
          <label>
            <span>N</span>
            <input
              type="range"
              min="4"
              max="60"
              step="1"
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
            <b>{count}</b>
          </label>
          <div className="power-state">
            <span>RADIUS</span>
            <strong>R = 1</strong>
            <small>
              {Math.abs(x) < 1
                ? "абсолютная сходимость"
                : Math.abs(x) === 1
                  ? "граничная точка"
                  : "расходимость"}
            </small>
          </div>
        </aside>
      </div>
    </section>
  );
}

type TaylorMode = "exp" | "sin" | "cos";

function factorial(n: number) {
  let result = 1;
  for (let k = 2; k <= n; k += 1) result *= k;
  return result;
}

function exact(mode: TaylorMode, x: number) {
  if (mode === "sin") return Math.sin(x);
  if (mode === "cos") return Math.cos(x);
  return Math.exp(x);
}

function approx(mode: TaylorMode, x: number, degree: number) {
  let sum = 0;
  for (let n = 0; n <= degree; n += 1) {
    if (mode === "exp") sum += Math.pow(x, n) / factorial(n);
    if (mode === "sin" && n % 2 === 1) {
      const k = (n - 1) / 2;
      sum += Math.pow(-1, k) * Math.pow(x, n) / factorial(n);
    }
    if (mode === "cos" && n % 2 === 0) {
      const k = n / 2;
      sum += Math.pow(-1, k) * Math.pow(x, n) / factorial(n);
    }
  }
  return sum;
}

function TaylorLab() {
  const [mode, setMode] = useState<TaylorMode>("exp");
  const [degree, setDegree] = useState(5);
  const [probe, setProbe] = useState(1.2);

  const xs = useMemo(
    () => Array.from({ length: 100 }, (_, index) => -3 + (6 * index) / 99),
    [],
  );
  const exactValues = xs.map((value) => exact(mode, value));
  const approxValues = xs.map((value) => approx(mode, value, degree));
  const all = [...exactValues, ...approxValues].filter((value) => Number.isFinite(value));
  const min = Math.min(...all);
  const max = Math.max(...all);
  const pad = Math.max(.4, (max - min) * .08);
  const yMin = min - pad;
  const yMax = max + pad;

  return (
    <section className="power-lab taylor-lab">
      <header>
        <div className="eyebrow">TAYLOR / LOCAL → GLOBAL</div>
        <h2>Смотри, как многочлен догоняет функцию.</h2>
        <p>
          Увеличивай степень и наблюдай, как локальная информация о производных
          расширяет область хорошего приближения.
        </p>
      </header>

      <div className="power-mode-row">
        {(["exp", "sin", "cos"] as TaylorMode[]).map((id) => (
          <button key={id} className={mode === id ? "active" : ""} onClick={() => setMode(id)}>
            {id === "exp" ? "eˣ" : id}
          </button>
        ))}
      </div>

      <div className="power-layout">
        <div className="power-stage">
          <svg viewBox={"0 0 " + W + " " + H}>
            <line className="power-axis" x1={PAD} y1={H / 2} x2={W - 12} y2={H / 2} />
            <path className="power-curve exact" d={polyline(exactValues, yMin, yMax)} />
            <path className="power-curve approx" d={polyline(approxValues, yMin, yMax)} />
          </svg>
          <div className="power-badges">
            <span>exact={exact(mode, probe).toFixed(6)}</span>
            <span>P_{degree}={approx(mode, probe, degree).toFixed(6)}</span>
            <span>error={Math.abs(exact(mode, probe)-approx(mode, probe, degree)).toExponential(2)}</span>
          </div>
        </div>

        <aside className="power-controls">
          <label>
            <span>degree</span>
            <input type="range" min="1" max="16" step="1" value={degree} onChange={(e) => setDegree(Number(e.target.value))} />
            <b>{degree}</b>
          </label>
          <label>
            <span>x</span>
            <input type="range" min="-3" max="3" step=".05" value={probe} onChange={(e) => setProbe(Number(e.target.value))} />
            <b>{probe.toFixed(2)}</b>
          </label>
          <div className="power-state">
            <span>ERROR AT x</span>
            <strong>{Math.abs(exact(mode, probe)-approx(mode, probe, degree)).toExponential(3)}</strong>
            <small>точность растёт неравномерно по оси x</small>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function PowerSeriesVisualInsert({ topicId, index }: { topicId: string; index: number }) {
  if (topicId === "power-convergence" && index === 1) return <PowerRadiusLab />;
  if (topicId === "taylor-series" && index === 4) return <TaylorLab />;
  return null;
}
