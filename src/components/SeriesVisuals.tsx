import { useMemo, useState } from "react";
import "../styles/series.css";

type Point = [number, number];

const W = 560;
const H = 310;
const PAD_X = 42;
const PAD_Y = 34;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pathFor(
  values: number[],
  yMin: number,
  yMax: number,
): string {
  if (!values.length) return "";
  const span = Math.max(1e-9, yMax - yMin);
  return values
    .map((value, index) => {
      const x =
        PAD_X +
        (index / Math.max(1, values.length - 1)) * (W - PAD_X * 2);
      const y =
        H -
        PAD_Y -
        ((value - yMin) / span) * (H - PAD_Y * 2);
      return (index === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
    })
    .join(" ");
}

function DotPlot({
  values,
  yMin,
  yMax,
  className,
}: {
  values: number[];
  yMin: number;
  yMax: number;
  className: string;
}) {
  const span = Math.max(1e-9, yMax - yMin);
  return (
    <>
      {values.map((value, index) => {
        const x =
          PAD_X +
          (index / Math.max(1, values.length - 1)) * (W - PAD_X * 2);
        const y =
          H -
          PAD_Y -
          ((value - yMin) / span) * (H - PAD_Y * 2);
        return (
          <circle
            key={index}
            className={className}
            cx={x}
            cy={y}
            r={index === values.length - 1 ? 4.4 : 2.1}
          />
        );
      })}
    </>
  );
}

function Axes({ yMin, yMax }: { yMin: number; yMax: number }) {
  const ticks = 4;
  return (
    <g className="series-axes">
      <line x1={PAD_X} y1={H - PAD_Y} x2={W - 12} y2={H - PAD_Y} />
      <line x1={PAD_X} y1={12} x2={PAD_X} y2={H - PAD_Y} />
      {Array.from({ length: ticks + 1 }, (_, index) => {
        const ratio = index / ticks;
        const y = H - PAD_Y - ratio * (H - PAD_Y * 2);
        const value = yMin + ratio * (yMax - yMin);
        return (
          <g key={index}>
            <line x1={PAD_X - 4} y1={y} x2={W - 12} y2={y} />
            <text x={PAD_X - 8} y={y + 3} textAnchor="end">
              {value.toFixed(2)}
            </text>
          </g>
        );
      })}
      <text x={W - 18} y={H - PAD_Y - 8} textAnchor="end">n</text>
      <text x={PAD_X + 8} y={20}>Sₙ</text>
    </g>
  );
}

type BasicMode = "geometric" | "harmonic" | "telescoping";

function buildBasic(mode: BasicMode, count: number, q: number) {
  const values: number[] = [];
  let sum = 0;
  for (let n = 1; n <= count; n += 1) {
    const term =
      mode === "geometric"
        ? Math.pow(q, n - 1)
        : mode === "harmonic"
          ? 1 / n
          : 1 / (n * (n + 1));
    sum += term;
    values.push(sum);
  }
  return values;
}

function PartialSumsLab() {
  const [mode, setMode] = useState<BasicMode>("geometric");
  const [count, setCount] = useState(36);
  const [q, setQ] = useState(0.62);

  const values = useMemo(
    () => buildBasic(mode, count, q),
    [mode, count, q],
  );
  const last = values.at(-1) ?? 0;
  const target =
    mode === "geometric" && Math.abs(q) < 1
      ? 1 / (1 - q)
      : mode === "telescoping"
        ? 1
        : null;
  const min = Math.min(0, ...values, target ?? Infinity);
  const max = Math.max(...values, target ?? -Infinity, 1);
  const pad = Math.max(0.15, (max - min) * 0.12);
  const yMin = min - pad;
  const yMax = max + pad;

  return (
    <section className="series-lab">
      <header>
        <div className="eyebrow">PARTIAL SUMS / Sₙ</div>
        <h2>Ряд существует только через траекторию его частичных сумм.</h2>
        <p>
          Переключай модели и смотри не на отдельные aₙ, а на то, стабилизируется
          ли Sₙ. Именно это и есть определение сходимости.
        </p>
      </header>

      <div className="series-mode-row">
        {([
          ["geometric", "Геометрический"],
          ["harmonic", "Гармонический"],
          ["telescoping", "Телескопический"],
        ] as Array<[BasicMode, string]>).map(([id, label]) => (
          <button
            key={id}
            className={mode === id ? "active" : ""}
            onClick={() => setMode(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="series-layout">
        <div className="series-stage">
          <svg viewBox={"0 0 " + W + " " + H}>
            <Axes yMin={yMin} yMax={yMax} />
            {target !== null && (
              <line
                className="series-target"
                x1={PAD_X}
                y1={
                  H -
                  PAD_Y -
                  ((target - yMin) / (yMax - yMin)) * (H - PAD_Y * 2)
                }
                x2={W - 12}
                y2={
                  H -
                  PAD_Y -
                  ((target - yMin) / (yMax - yMin)) * (H - PAD_Y * 2)
                }
              />
            )}
            <path
              className="series-curve"
              d={pathFor(values, yMin, yMax)}
            />
            <DotPlot
              values={values}
              yMin={yMin}
              yMax={yMax}
              className="series-dot"
            />
          </svg>

          <div className="series-stage-badges">
            <span>N={count}</span>
            <span>Sₙ={last.toFixed(6)}</span>
            <span>
              {target === null
                ? "предел не фиксирован"
                : "|S−Sₙ|=" + Math.abs(target - last).toExponential(2)}
            </span>
          </div>
        </div>

        <aside className="series-controls">
          <label>
            <span>N</span>
            <input
              type="range"
              min="4"
              max="100"
              step="1"
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
            <b>{count}</b>
          </label>

          {mode === "geometric" && (
            <label>
              <span>q</span>
              <input
                type="range"
                min="-1.25"
                max="1.25"
                step="0.01"
                value={q}
                onChange={(event) => setQ(Number(event.target.value))}
              />
              <b>{q.toFixed(2)}</b>
            </label>
          )}

          <div className="series-readout">
            <div>
              <span>модель</span>
              <strong>
                {mode === "geometric"
                  ? "aₙ=qⁿ⁻¹"
                  : mode === "harmonic"
                    ? "aₙ=1/n"
                    : "aₙ=1/[n(n+1)]"}
              </strong>
            </div>
            <div>
              <span>характер</span>
              <strong>
                {mode === "harmonic"
                  ? "расходится"
                  : mode === "telescoping"
                    ? "сходится к 1"
                    : Math.abs(q) < 1
                      ? "сходится"
                      : "расходится"}
              </strong>
            </div>
            {target !== null && (
              <div>
                <span>точная сумма</span>
                <strong>{target.toFixed(6)}</strong>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function pPartialSums(p: number, count: number) {
  const values: number[] = [];
  let sum = 0;
  for (let n = 1; n <= count; n += 1) {
    sum += 1 / Math.pow(n, p);
    values.push(sum);
  }
  return values;
}

function PSeriesLab() {
  const [p, setP] = useState(1.35);
  const [count, setCount] = useState(80);
  const values = useMemo(() => pPartialSums(p, count), [p, count]);
  const max = Math.max(...values, 1);
  const yMin = 0;
  const yMax = max * 1.12;
  const last = values.at(-1) ?? 0;

  const nextBlock =
    p > 1
      ? Math.pow(count, 1 - p) / (p - 1)
      : null;

  return (
    <section className="series-lab p-series-lab">
      <header>
        <div className="eyebrow">P-SERIES / THRESHOLD p=1</div>
        <h2>Один параметр p меняет всё.</h2>
        <p>
          Подведи p к единице с обеих сторон. При p&gt;1 хвост имеет конечную
          интегральную оценку, а при p≤1 частичные суммы продолжают расти.
        </p>
      </header>

      <div className="series-layout">
        <div className="series-stage">
          <svg viewBox={"0 0 " + W + " " + H}>
            <Axes yMin={yMin} yMax={yMax} />
            <path className="series-curve" d={pathFor(values, yMin, yMax)} />
            <DotPlot
              values={values}
              yMin={yMin}
              yMax={yMax}
              className="series-dot"
            />
          </svg>
          <div className="series-threshold">
            <span className={p > 1 ? "good" : "bad"}>
              {p > 1 ? "p > 1 / CONVERGENT" : "p ≤ 1 / DIVERGENT"}
            </span>
          </div>
        </div>

        <aside className="series-controls">
          <label>
            <span>p</span>
            <input
              type="range"
              min="0.45"
              max="2.5"
              step="0.01"
              value={p}
              onChange={(event) => setP(Number(event.target.value))}
            />
            <b>{p.toFixed(2)}</b>
          </label>
          <label>
            <span>N</span>
            <input
              type="range"
              min="10"
              max="160"
              step="1"
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
            <b>{count}</b>
          </label>

          <div className="series-readout">
            <div><span>S_N</span><strong>{last.toFixed(6)}</strong></div>
            <div>
              <span>интегральный хвост</span>
              <strong>
                {nextBlock === null
                  ? "неограничен"
                  : "≤≈ " + nextBlock.toFixed(4)}
              </strong>
            </div>
            <div>
              <span>эталон</span>
              <strong>Σ 1/n^{p.toFixed(2)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function alternatingSums(p: number, count: number) {
  const values: number[] = [];
  let sum = 0;
  for (let n = 1; n <= count; n += 1) {
    sum += (n % 2 === 1 ? 1 : -1) / Math.pow(n, p);
    values.push(sum);
  }
  return values;
}

function AlternatingLab() {
  const [p, setP] = useState(1);
  const [count, setCount] = useState(25);
  const values = useMemo(() => alternatingSums(p, count), [p, count]);
  const even = values.filter((_, index) => (index + 1) % 2 === 0);
  const odd = values.filter((_, index) => (index + 1) % 2 === 1);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(0.08, (max - min) * 0.2);
  const yMin = min - pad;
  const yMax = max + pad;
  const errorBound = 1 / Math.pow(count + 1, p);
  const absolute = p > 1;

  return (
    <section className="series-lab alternating-lab">
      <header>
        <div className="eyebrow">LEIBNIZ / EVEN ↔ ODD</div>
        <h2>Предел зажат между двумя лестницами частичных сумм.</h2>
        <p>
          Чётные и нечётные Sₙ подходят к одной точке с разных сторон. Из этого
          же рисунка возникает оценка остатка через первый отброшенный член.
        </p>
      </header>

      <div className="series-layout">
        <div className="series-stage">
          <svg viewBox={"0 0 " + W + " " + H}>
            <Axes yMin={yMin} yMax={yMax} />
            <path className="series-curve alternating" d={pathFor(values, yMin, yMax)} />
            <DotPlot values={values} yMin={yMin} yMax={yMax} className="series-dot alternating" />
          </svg>
          <div className="series-stage-badges">
            <span>odd steps: {odd.length}</span>
            <span>even steps: {even.length}</span>
            <span>|R_N| ≤ {errorBound.toExponential(2)}</span>
          </div>
        </div>

        <aside className="series-controls">
          <label>
            <span>p</span>
            <input
              type="range"
              min="0.2"
              max="2"
              step="0.01"
              value={p}
              onChange={(event) => setP(clamp(Number(event.target.value), 0.2, 2))}
            />
            <b>{p.toFixed(2)}</b>
          </label>
          <label>
            <span>N</span>
            <input
              type="range"
              min="3"
              max="80"
              step="1"
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
            <b>{count}</b>
          </label>

          <div className="series-readout">
            <div>
              <span>Лейбниц</span>
              <strong>сходится при p&gt;0</strong>
            </div>
            <div>
              <span>тип</span>
              <strong>{absolute ? "абсолютная" : "условная"}</strong>
            </div>
            <div>
              <span>последний S_N</span>
              <strong>{(values.at(-1) ?? 0).toFixed(7)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function SeriesVisualInsert({
  topicId,
  index,
}: {
  topicId: string;
  index: number;
}) {
  if (topicId === "numeric-series" && index === 1) return <PartialSumsLab />;
  if (topicId === "positive-series" && index === 8) return <PSeriesLab />;
  if (topicId === "alternating-series" && index === 3) return <AlternatingLab />;
  return null;
}
