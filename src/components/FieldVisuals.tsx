import { useMemo, useState } from "react";
import "../styles/field.css";

type V2 = [number, number];
type ScalarMode = "radial" | "plane";
type VectorMode = "radial" | "rotation" | "saddle" | "constant";

const W = 560;
const H = 360;
const SCALE = 48;
const CX = W / 2;
const CY = H / 2;

function screen([x, y]: V2): V2 {
  return [CX + x * SCALE, CY - y * SCALE];
}

function norm([x, y]: V2) {
  return Math.hypot(x, y);
}

function normalize(v: V2): V2 {
  const length = norm(v);
  return length < 1e-9 ? [0, 0] : [v[0] / length, v[1] / length];
}

function Arrow({
  origin,
  vector,
  className,
  label,
  scale = 1,
}: {
  origin: V2;
  vector: V2;
  className: string;
  label?: string;
  scale?: number;
}) {
  const start = screen(origin);
  const end = screen([
    origin[0] + vector[0] * scale,
    origin[1] + vector[1] * scale,
  ]);
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI;

  return (
    <g className={className}>
      <line x1={start[0]} y1={start[1]} x2={end[0]} y2={end[1]} />
      <polygon
        points="-9,-4 0,0 -9,4"
        transform={"translate(" + end[0] + " " + end[1] + ") rotate(" + angle + ")"}
      />
      {label && (
        <text x={end[0] + 8} y={end[1] - 8}>
          {label}
        </text>
      )}
    </g>
  );
}

function Axes() {
  return (
    <g className="field-axes">
      <line x1="24" y1={CY} x2={W - 24} y2={CY} />
      <line x1={CX} y1="24" x2={CX} y2={H - 24} />
      <text x={W - 36} y={CY - 9}>x</text>
      <text x={CX + 10} y="34">y</text>
    </g>
  );
}

function scalarValue(mode: ScalarMode, [x, y]: V2) {
  return mode === "radial" ? x * x + y * y : x + 0.6 * y;
}

function scalarGradient(mode: ScalarMode, [x, y]: V2): V2 {
  return mode === "radial" ? [2 * x, 2 * y] : [1, 0.6];
}

function ScalarContours({ mode }: { mode: ScalarMode }) {
  if (mode === "radial") {
    return (
      <g className="scalar-contours">
        {[0.75, 1.35, 1.95, 2.55, 3.15].map((radius) => (
          <circle
            key={radius}
            cx={CX}
            cy={CY}
            r={radius * SCALE}
          />
        ))}
      </g>
    );
  }

  return (
    <g className="scalar-contours scalar-contours-linear">
      {[-3, -1.5, 0, 1.5, 3].map((level) => {
        const a = screen([-4.4, (level + 4.4) / 0.6]);
        const b = screen([4.4, (level - 4.4) / 0.6]);
        return <line key={level} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
      })}
    </g>
  );
}

function ScalarFieldLab() {
  const [mode, setMode] = useState<ScalarMode>("radial");
  const [point, setPoint] = useState<V2>([1.35, 1.05]);
  const [angle, setAngle] = useState(35);

  const value = scalarValue(mode, point);
  const gradient = scalarGradient(mode, point);
  const gradLength = norm(gradient);
  const e: V2 = [
    Math.cos(angle * Math.PI / 180),
    Math.sin(angle * Math.PI / 180),
  ];
  const directional = gradient[0] * e[0] + gradient[1] * e[1];
  const pointScreen = screen(point);

  return (
    <section className="field-lab scalar-field-lab">
      <header>
        <div className="eyebrow">SCALAR FIELD / LEVELS + GRADIENT</div>
        <h2>Линии уровня не показывают направление роста. Градиент — показывает.</h2>
        <p>
          Перемещай точку и направление e. Градиент остаётся нормалью к уровню,
          а Dₑf — его проекцией на выбранное направление.
        </p>
      </header>

      <div className="field-mode-row">
        <button className={mode === "radial" ? "active" : ""} onClick={() => setMode("radial")}>
          f=x²+y²
        </button>
        <button className={mode === "plane" ? "active" : ""} onClick={() => setMode("plane")}>
          f=x+0.6y
        </button>
      </div>

      <div className="field-layout">
        <div className="field-stage">
          <svg viewBox={"0 0 " + W + " " + H}>
            <Axes />
            <ScalarContours mode={mode} />
            <Arrow
              origin={point}
              vector={normalize(gradient)}
              className="field-gradient-arrow"
              label="∇f"
              scale={1.25}
            />
            <Arrow
              origin={point}
              vector={e}
              className="field-direction-arrow"
              label="e"
              scale={1.05}
            />
            <circle className="field-probe-point" cx={pointScreen[0]} cy={pointScreen[1]} r="6" />
          </svg>

          <div className="field-stage-badges">
            <span>f={value.toFixed(3)}</span>
            <span>|∇f|={gradLength.toFixed(3)}</span>
            <span>Dₑf={directional.toFixed(3)}</span>
          </div>
        </div>

        <aside className="field-controls">
          <label>
            <span>x</span>
            <input
              type="range"
              min="-2.8"
              max="2.8"
              step="0.05"
              value={point[0]}
              onChange={(event) => setPoint([Number(event.target.value), point[1]])}
            />
            <b>{point[0].toFixed(2)}</b>
          </label>
          <label>
            <span>y</span>
            <input
              type="range"
              min="-2.8"
              max="2.8"
              step="0.05"
              value={point[1]}
              onChange={(event) => setPoint([point[0], Number(event.target.value)])}
            />
            <b>{point[1].toFixed(2)}</b>
          </label>
          <label>
            <span>arg e</span>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={angle}
              onChange={(event) => setAngle(Number(event.target.value))}
            />
            <b>{angle}°</b>
          </label>

          <div className="field-readout">
            <div>
              <span>∇f</span>
              <strong>({gradient[0].toFixed(2)}, {gradient[1].toFixed(2)})</strong>
            </div>
            <div>
              <span>e</span>
              <strong>({e[0].toFixed(2)}, {e[1].toFixed(2)})</strong>
            </div>
            <div>
              <span>геометрия</span>
              <strong>∇f ⟂ level</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function vectorAt(mode: VectorMode, [x, y]: V2): V2 {
  if (mode === "radial") return [x, y];
  if (mode === "rotation") return [-y, x];
  if (mode === "saddle") return [x, -y];
  return [1, 0.35];
}

function traceDirection(
  mode: VectorMode,
  seed: V2,
  direction: 1 | -1,
): V2[] {
  const points: V2[] = [seed];
  let current: V2 = [...seed];

  for (let index = 0; index < 95; index += 1) {
    const velocity = normalize(vectorAt(mode, current));
    if (norm(velocity) < 1e-7) break;
    const step = 0.075 * direction;
    current = [
      current[0] + velocity[0] * step,
      current[1] + velocity[1] * step,
    ];
    if (Math.abs(current[0]) > 4.6 || Math.abs(current[1]) > 3.5) break;
    points.push(current);
  }

  return points;
}

function polyline(points: V2[]) {
  return points.map(screen).map((point) => point.join(",")).join(" ");
}

function VectorFieldLab() {
  const [mode, setMode] = useState<VectorMode>("rotation");
  const [seed, setSeed] = useState<V2>([1.65, 0.65]);

  const arrows = useMemo(() => {
    const result: Array<{ origin: V2; vector: V2 }> = [];
    for (let x = -4; x <= 4; x += 1) {
      for (let y = -3; y <= 3; y += 1) {
        const vector = normalize(vectorAt(mode, [x, y]));
        result.push({ origin: [x, y], vector });
      }
    }
    return result;
  }, [mode]);

  const trajectory = useMemo(() => {
    const backward = traceDirection(mode, seed, -1).reverse();
    const forward = traceDirection(mode, seed, 1);
    return [...backward.slice(0, -1), ...forward];
  }, [mode, seed]);

  const current = vectorAt(mode, seed);
  const conservative = mode !== "rotation";
  const seedScreen = screen(seed);

  return (
    <section className="field-lab vector-field-lab">
      <header>
        <div className="eyebrow">VECTOR FIELD / INTEGRAL CURVE</div>
        <h2>Локальные стрелки складываются в глобальную траекторию.</h2>
        <p>
          Поле задаёт направление в каждой точке. Белая кривая строится
          численно так, чтобы её касательная всё время шла по F.
        </p>
      </header>

      <div className="field-mode-row">
        {([
          ["rotation", "Вращение"],
          ["radial", "Радиальное"],
          ["saddle", "Седло"],
          ["constant", "Постоянное"],
        ] as Array<[VectorMode, string]>).map(([id, label]) => (
          <button key={id} className={mode === id ? "active" : ""} onClick={() => setMode(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="field-layout">
        <div className="field-stage">
          <svg viewBox={"0 0 " + W + " " + H}>
            <Axes />
            <g className="vector-field-arrows">
              {arrows.map((arrow, index) => (
                <Arrow
                  key={index}
                  origin={arrow.origin}
                  vector={arrow.vector}
                  className="field-grid-arrow"
                  scale={0.48}
                />
              ))}
            </g>
            <polyline className="field-trajectory" points={polyline(trajectory)} />
            <circle className="field-seed" cx={seedScreen[0]} cy={seedScreen[1]} r="6" />
            <Arrow
              origin={seed}
              vector={normalize(current)}
              className="field-current-arrow"
              label="F"
              scale={0.95}
            />
          </svg>

          <div className="field-stage-badges">
            <span>F=({current[0].toFixed(2)}, {current[1].toFixed(2)})</span>
            <span>|F|={norm(current).toFixed(3)}</span>
            <span>{conservative ? "potential-compatible" : "rotation / non-potential"}</span>
          </div>
        </div>

        <aside className="field-controls">
          <label>
            <span>x₀</span>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.05"
              value={seed[0]}
              onChange={(event) => setSeed([Number(event.target.value), seed[1]])}
            />
            <b>{seed[0].toFixed(2)}</b>
          </label>
          <label>
            <span>y₀</span>
            <input
              type="range"
              min="-2.5"
              max="2.5"
              step="0.05"
              value={seed[1]}
              onChange={(event) => setSeed([seed[0], Number(event.target.value)])}
            />
            <b>{seed[1].toFixed(2)}</b>
          </label>

          <div className="field-readout">
            <div>
              <span>модель</span>
              <strong>
                {mode === "rotation"
                  ? "F=(-y,x)"
                  : mode === "radial"
                    ? "F=(x,y)"
                    : mode === "saddle"
                      ? "F=(x,-y)"
                      : "F=(1,0.35)"}
              </strong>
            </div>
            <div>
              <span>r′(t)</span>
              <strong>= F(r(t))</strong>
            </div>
            <div>
              <span>потенциальность</span>
              <strong>{conservative ? "да для этой модели" : "нет"}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}


function linearField(a: number, b: number, omega: number, [x, y]: V2): V2 {
  return [a * x - omega * y, omega * x + b * y];
}

function DivCurlLab() {
  const [a, setA] = useState(0.65);
  const [b, setB] = useState(0.65);
  const [omega, setOmega] = useState(0.7);

  const divergence = a + b;
  const curl = 2 * omega;

  const arrows = useMemo(() => {
    const result: Array<{ origin: V2; vector: V2; strength: number }> = [];
    let maxStrength = 0;

    for (let x = -4; x <= 4; x += 1) {
      for (let y = -3; y <= 3; y += 1) {
        const raw = linearField(a, b, omega, [x, y]);
        const strength = norm(raw);
        maxStrength = Math.max(maxStrength, strength);
        result.push({ origin: [x, y], vector: raw, strength });
      }
    }

    return result.map((item) => ({
      ...item,
      vector: normalize(item.vector),
      strength: maxStrength > 0 ? item.strength / maxStrength : 0,
    }));
  }, [a, b, omega]);

  return (
    <section className="field-lab div-curl-lab">
      <header>
        <div className="eyebrow">NABLA LAB / DIV ↔ ROT</div>
        <h2>Источник и вращение — независимые локальные характеристики поля.</h2>
        <p>
          Используем семейство F=(ax−ωy, ωx+by). Параметры a и b управляют
          растяжением и div, а ω добавляет чистое вращение и меняет rot.
        </p>
      </header>

      <div className="field-layout">
        <div className="field-stage">
          <svg viewBox={"0 0 " + W + " " + H}>
            <Axes />
            <g className="vector-field-arrows">
              {arrows.map((arrow, index) => (
                <g key={index} opacity={0.28 + arrow.strength * 0.68}>
                  <Arrow
                    origin={arrow.origin}
                    vector={arrow.vector}
                    className="field-grid-arrow"
                    scale={0.48}
                  />
                </g>
              ))}
            </g>

            <circle className="div-curl-probe-ring" cx={CX} cy={CY} r="58" />
            {Math.abs(curl) > 0.02 && (
              <path
                className={curl > 0 ? "curl-indicator positive" : "curl-indicator negative"}
                d={
                  curl > 0
                    ? "M 252 143 A 58 58 0 0 1 325 180"
                    : "M 308 143 A 58 58 0 0 0 235 180"
                }
              />
            )}
          </svg>

          <div className="field-stage-badges">
            <span>div F = {divergence.toFixed(2)}</span>
            <span>rot_z F = {curl.toFixed(2)}</span>
            <span>
              {Math.abs(divergence) < 0.02
                ? "solenoidal"
                : divergence > 0
                  ? "source-like"
                  : "sink-like"}
            </span>
          </div>
        </div>

        <aside className="field-controls">
          <label>
            <span>a</span>
            <input type="range" min="-1.4" max="1.4" step="0.05" value={a}
              onChange={(event) => setA(Number(event.target.value))} />
            <b>{a.toFixed(2)}</b>
          </label>
          <label>
            <span>b</span>
            <input type="range" min="-1.4" max="1.4" step="0.05" value={b}
              onChange={(event) => setB(Number(event.target.value))} />
            <b>{b.toFixed(2)}</b>
          </label>
          <label>
            <span>ω</span>
            <input type="range" min="-1.4" max="1.4" step="0.05" value={omega}
              onChange={(event) => setOmega(Number(event.target.value))} />
            <b>{omega.toFixed(2)}</b>
          </label>

          <div className="field-preset-row">
            <button onClick={() => { setA(0.8); setB(0.8); setOmega(0); }}>
              Чистый источник
            </button>
            <button onClick={() => { setA(-0.8); setB(-0.8); setOmega(0); }}>
              Чистый сток
            </button>
            <button onClick={() => { setA(0); setB(0); setOmega(0.85); }}>
              Чистый вихрь
            </button>
            <button onClick={() => { setA(0.8); setB(-0.8); setOmega(0); }}>
              div=0 седло
            </button>
          </div>

          <div className="field-readout">
            <div><span>div F</span><strong>a+b = {divergence.toFixed(2)}</strong></div>
            <div><span>rot_z F</span><strong>2ω = {curl.toFixed(2)}</strong></div>
            <div>
              <span>класс</span>
              <strong>
                {Math.abs(divergence) < 0.02 ? "соленоидальное" : "с div≠0"}
                {" · "}
                {Math.abs(curl) < 0.02 ? "безвихревое" : "вихревое"}
              </strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function FieldVisualInsert({
  topicId,
  index,
}: {
  topicId: string;
  index: number;
}) {
  if (topicId === "scalar-field" && index === 2) return <ScalarFieldLab />;
  if (topicId === "vector-field" && index === 1) return <VectorFieldLab />;
  if (topicId === "hamilton-operator" && index === 4) return <DivCurlLab />;
  return null;
}
