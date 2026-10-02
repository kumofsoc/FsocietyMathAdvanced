import { useMemo, useState } from "react";

type P2 = [number, number];
type M2 = [[number, number], [number, number]];

const CX = 240;
const CY = 185;
const SCALE = 42;

function screen([x, y]: P2): P2 {
  return [CX + x * SCALE, CY - y * SCALE];
}

function apply(A: M2, p: P2, t: P2 = [0, 0]): P2 {
  return [
    A[0][0] * p[0] + A[0][1] * p[1] + t[0],
    A[1][0] * p[0] + A[1][1] * p[1] + t[1],
  ];
}

function det(A: M2) {
  return A[0][0] * A[1][1] - A[0][1] * A[1][0];
}

function multiply(A: M2, B: M2): M2 {
  return [
    [
      A[0][0] * B[0][0] + A[0][1] * B[1][0],
      A[0][0] * B[0][1] + A[0][1] * B[1][1],
    ],
    [
      A[1][0] * B[0][0] + A[1][1] * B[1][0],
      A[1][0] * B[0][1] + A[1][1] * B[1][1],
    ],
  ];
}

function rotation(angle: number): M2 {
  const r = (angle * Math.PI) / 180;
  return [
    [Math.cos(r), -Math.sin(r)],
    [Math.sin(r), Math.cos(r)],
  ];
}

function pointsAttr(points: P2[]) {
  return points.map((point) => screen(point).join(",")).join(" ");
}

function Axes() {
  return (
    <g className="transform-axes">
      <line x1="20" y1={CY} x2="460" y2={CY} />
      <line x1={CX} y1="18" x2={CX} y2="352" />
      <text x="448" y={CY - 8}>x</text>
      <text x={CX + 9} y="28">y</text>
    </g>
  );
}

function Grid({
  transform,
  className,
}: {
  transform?: (point: P2) => P2;
  className: string;
}) {
  const lines = [];
  for (let i = -5; i <= 5; i += 1) {
    const vertical: P2[] = [
      [i, -4],
      [i, 4],
    ];
    const horizontal: P2[] = [
      [-5, i],
      [5, i],
    ];
    lines.push(vertical, horizontal);
  }

  return (
    <g className={className}>
      {lines.map((line, index) => {
        const points = transform ? line.map(transform) : line;
        const a = screen(points[0]);
        const b = screen(points[1]);
        return <line key={index} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
      })}
    </g>
  );
}

function Shape({
  points,
  className,
  label,
}: {
  points: P2[];
  className: string;
  label?: string;
}) {
  const center: P2 = [
    points.reduce((sum, point) => sum + point[0], 0) / points.length,
    points.reduce((sum, point) => sum + point[1], 0) / points.length,
  ];
  const sc = screen(center);

  return (
    <g className={className}>
      <polygon points={pointsAttr(points)} />
      {label && <text x={sc[0]} y={sc[1]}>{label}</text>}
    </g>
  );
}

function Arrow({
  vector,
  className,
  label,
}: {
  vector: P2;
  className: string;
  label: string;
}) {
  const origin = screen([0, 0]);
  const end = screen(vector);
  const angle = (Math.atan2(end[1] - origin[1], end[0] - origin[0]) * 180) / Math.PI;

  return (
    <g className={className}>
      <line x1={origin[0]} y1={origin[1]} x2={end[0]} y2={end[1]} />
      <polygon
        points="-9,-4 0,0 -9,4"
        transform={"translate(" + end[0] + " " + end[1] + ") rotate(" + angle + ")"}
      />
      <text x={end[0] + 8} y={end[1] - 8}>{label}</text>
    </g>
  );
}

function MappingCompositionLab() {
  const [angle, setAngle] = useState(42);
  const [dx, setDx] = useState(1.8);
  const [dy, setDy] = useState(0.8);

  const R = rotation(angle);
  const triangle: P2[] = [[-1.3, -0.8], [1.1, -0.8], [-0.3, 1.3]];

  const f = (p: P2) => apply(R, p);
  const g = (p: P2): P2 => [p[0] + dx, p[1] + dy];

  const gf = triangle.map((point) => g(f(point)));
  const fg = triangle.map((point) => f(g(point)));

  const probe: P2 = [1, 0.6];
  const gfProbe = g(f(probe));
  const fgProbe = f(g(probe));

  return (
    <section className="transform-lab composition-lab">
      <header>
        <div className="eyebrow">КОМПОЗИЦИЯ / ПОРЯДОК ИМЕЕТ ЗНАЧЕНИЕ</div>
        <h2>Сначала выполняется то, что написано справа.</h2>
        <p>
          Здесь f — поворот вокруг начала координат, g — перенос. Сравни
          g(f(A)) и f(g(A)): обе операции простые, но порядок почти всегда меняет результат.
        </p>
      </header>

      <div className="transform-grid">
        <div className="transform-stage">
          <svg viewBox="0 0 480 370">
            <Grid className="transform-grid-original" />
            <Axes />
            <Shape points={triangle} className="transform-shape-original" label="A" />
            <Shape points={gf} className="transform-shape-gf" label="g∘f" />
            <Shape points={fg} className="transform-shape-fg" label="f∘g" />
            <circle className="transform-probe-gf" cx={screen(gfProbe)[0]} cy={screen(gfProbe)[1]} r="6" />
            <circle className="transform-probe-fg" cx={screen(fgProbe)[0]} cy={screen(fgProbe)[1]} r="6" />
          </svg>
          <div className="transform-legend">
            <span><i className="original-dot" /> исходная фигура</span>
            <span><i className="gf-dot" /> g∘f</span>
            <span><i className="fg-dot" /> f∘g</span>
          </div>
        </div>

        <aside className="transform-controls">
          <label>
            <span>поворот f</span>
            <input type="range" min="-150" max="150" step="1" value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
            <b>{angle}°</b>
          </label>
          <label>
            <span>перенос gₓ</span>
            <input type="range" min="-3" max="3" step=".05" value={dx} onChange={(e) => setDx(Number(e.target.value))} />
            <b>{dx.toFixed(2)}</b>
          </label>
          <label>
            <span>перенос gᵧ</span>
            <input type="range" min="-3" max="3" step=".05" value={dy} onChange={(e) => setDy(Number(e.target.value))} />
            <b>{dy.toFixed(2)}</b>
          </label>

          <div className="transform-order-cards">
            <div>
              <span>g∘f</span>
              <strong>сначала f, затем g</strong>
              <code>A → f(A) → g(f(A))</code>
            </div>
            <div>
              <span>f∘g</span>
              <strong>сначала g, затем f</strong>
              <code>A → g(A) → f(g(A))</code>
            </div>
          </div>

          <div className="transform-live">
            <span>РАССТОЯНИЕ МЕЖДУ ДВУМЯ РЕЗУЛЬТАТАМИ</span>
            <strong>{Math.hypot(gfProbe[0] - fgProbe[0], gfProbe[1] - fgProbe[1]).toFixed(3)}</strong>
            <small>0 означает, что на выбранной точке композиции совпали.</small>
          </div>
        </aside>
      </div>
    </section>
  );
}

type LinearPreset = "custom" | "rotate" | "reflect" | "shear" | "stretch" | "projection";

function LinearTransformationLab() {
  const [A, setA] = useState<M2>([[1.15, 0.55], [-0.25, 1.05]]);
  const [t, setT] = useState<P2>([0.45, -0.25]);
  const [preset, setPreset] = useState<LinearPreset>("custom");

  const d = det(A);
  const e1 = apply(A, [1, 0]);
  const e2 = apply(A, [0, 1]);
  const square: P2[] = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const transformedSquare = square.map((point) => apply(A, point));

  const distanceBefore = Math.hypot(2.4 - (-1.1), 1.1 - (-0.7));
  const p1 = apply(A, [-1.1, -0.7], t);
  const p2 = apply(A, [2.4, 1.1], t);
  const distanceAfter = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);

  const choosePreset = (next: LinearPreset) => {
    setPreset(next);
    if (next === "rotate") {
      setA(rotation(32));
      setT([0.6, -0.35]);
    } else if (next === "reflect") {
      setA([[1, 0], [0, -1]]);
      setT([0.4, 0.2]);
    } else if (next === "shear") {
      setA([[1, 0.85], [0, 1]]);
      setT([0, 0]);
    } else if (next === "stretch") {
      setA([[1.65, 0], [0, 0.65]]);
      setT([0, 0]);
    } else if (next === "projection") {
      setA([[1, 0], [0, 0]]);
      setT([0, 0]);
    }
  };

  const setEntry = (row: number, col: number, value: number) => {
    const next: M2 = [[...A[0]], [...A[1]]] as M2;
    next[row][col] = value;
    setA(next);
    setPreset("custom");
  };

  return (
    <section className="transform-lab linear-transform-lab">
      <header>
        <div className="eyebrow">МАТРИЦА ПРЕОБРАЗОВАНИЯ / ЖИВАЯ СЕТКА</div>
        <h2>Столбцы матрицы показывают, куда ушли базисные направления.</h2>
        <p>
          Серое — исходная плоскость, цветное — её образ. При det=0 сетка схлопывается:
          преобразование перестаёт быть взаимно однозначным.
        </p>
      </header>

      <div className="transform-preset-row">
        {(["rotate", "reflect", "shear", "stretch", "projection"] as LinearPreset[]).map((item) => (
          <button key={item} className={preset === item ? "active" : ""} onClick={() => choosePreset(item)}>
            {item === "rotate" ? "Поворот" : item === "reflect" ? "Отражение" : item === "shear" ? "Сдвиг слоёв" : item === "stretch" ? "Сжатие" : "Проекция"}
          </button>
        ))}
      </div>

      <div className="transform-grid">
        <div className="transform-stage">
          <svg viewBox="0 0 480 370">
            <Grid className="transform-grid-original" />
            <Grid className="transform-grid-image" transform={(point) => apply(A, point, t)} />
            <Axes />
            <Shape points={square} className="transform-unit-square" />
            <Shape points={transformedSquare} className="transform-area-square" />
            <Arrow vector={e1} className="transform-e1" label="A e₁" />
            <Arrow vector={e2} className="transform-e2" label="A e₂" />
          </svg>

          <div className="transform-stage-badges">
            <span className={Math.abs(d) < 0.02 ? "danger" : ""}>
              det A = {d.toFixed(3)}
            </span>
            <span>площадь × {Math.abs(d).toFixed(3)}</span>
            <span>{d > 0 ? "ориентация сохранена" : d < 0 ? "ориентация обращена" : "плоскость схлопнута"}</span>
          </div>
        </div>

        <aside className="transform-controls">
          <div className="matrix-control">
            <span>ЛИНЕЙНАЯ ЧАСТЬ A</span>
            <div>
              {[0, 1].flatMap((row) =>
                [0, 1].map((col) => (
                  <label key={row + "-" + col}>
                    <small>a{row + 1}{col + 1}</small>
                    <input
                      type="number"
                      step=".05"
                      value={A[row][col]}
                      onChange={(e) => setEntry(row, col, Number(e.target.value))}
                    />
                  </label>
                )),
              )}
            </div>
          </div>

          <div className="matrix-control">
            <span>ПЕРЕНОС t</span>
            <div>
              <label>
                <small>tₓ</small>
                <input type="number" step=".05" value={t[0]} onChange={(e) => setT([Number(e.target.value), t[1]])} />
              </label>
              <label>
                <small>tᵧ</small>
                <input type="number" step=".05" value={t[1]} onChange={(e) => setT([t[0], Number(e.target.value)])} />
              </label>
            </div>
          </div>

          <div className="transform-live-list">
            <div><span>det A</span><strong>{d.toFixed(4)}</strong></div>
            <div><span>взаимно однозначно</span><strong>{Math.abs(d) > 0.0001 ? "да" : "нет"}</strong></div>
            <div><span>|P₁P₂| до</span><strong>{distanceBefore.toFixed(3)}</strong></div>
            <div><span>|f(P₁)f(P₂)|</span><strong>{distanceAfter.toFixed(3)}</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function sampleCircle(count = 120): P2[] {
  return Array.from({ length: count }, (_, index) => {
    const t = (index / count) * Math.PI * 2;
    return [Math.cos(t), Math.sin(t)];
  });
}

function AffineTransformationLab() {
  const [angle, setAngle] = useState(28);
  const [sx, setSx] = useState(1.75);
  const [sy, setSy] = useState(0.68);
  const [reflect, setReflect] = useState(false);
  const [translation, setTranslation] = useState<P2>([0.7, -0.35]);

  const A = useMemo<M2>(() => {
    const R = rotation(angle);
    const D: M2 = [[sx, 0], [0, sy * (reflect ? -1 : 1)]];
    return multiply(R, D);
  }, [angle, sx, sy, reflect]);

  const d = det(A);
  const circle = sampleCircle();
  const imageCircle = circle.map((point) => apply(A, point, translation));
  const square: P2[] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const imageSquare = square.map((point) => apply(A, point, translation));

  const horizontal1: P2[] = [[-4, 2.1], [4, 2.1]];
  const horizontal2: P2[] = [[-4, 2.8], [4, 2.8]];
  const line1 = horizontal1.map((point) => apply(A, point, translation));
  const line2 = horizontal2.map((point) => apply(A, point, translation));

  return (
    <section className="transform-lab affine-lab">
      <header>
        <div className="eyebrow">АФФИННАЯ ЛАБОРАТОРИЯ / РАЗЛОЖЕНИЕ</div>
        <h2>Сначала два независимых масштаба. Потом ортогональное движение.</h2>
        <p>
          Это интерактивная модель разложения из главы: два взаимно перпендикулярных
          сжатия формируют эллипс из окружности, а поворот/отражение меняют положение и ориентацию.
        </p>
      </header>

      <div className="transform-grid">
        <div className="transform-stage affine-stage">
          <svg viewBox="0 0 480 370">
            <Grid className="transform-grid-original" />
            <Axes />
            <polyline className="affine-circle-original" points={pointsAttr([...circle, circle[0]])} />
            <polyline className="affine-circle-image" points={pointsAttr([...imageCircle, imageCircle[0]])} />
            <Shape points={square} className="transform-unit-square" />
            <Shape points={imageSquare} className="transform-area-square" />
            <line className="affine-parallel-line" x1={screen(line1[0])[0]} y1={screen(line1[0])[1]} x2={screen(line1[1])[0]} y2={screen(line1[1])[1]} />
            <line className="affine-parallel-line second" x1={screen(line2[0])[0]} y1={screen(line2[0])[1]} x2={screen(line2[1])[0]} y2={screen(line2[1])[1]} />
          </svg>

          <div className="affine-decomposition-strip">
            <span>исходная фигура</span>
            <i>→</i>
            <span>сжатие ×{sx.toFixed(2)}</span>
            <i>→</i>
            <span>сжатие ×{sy.toFixed(2)}</span>
            <i>→</i>
            <span>{reflect ? "отражение +" : ""} поворот {angle}°</span>
            <i>→</i>
            <span>перенос</span>
          </div>
        </div>

        <aside className="transform-controls">
          <label>
            <span>сжатие 1</span>
            <input type="range" min=".25" max="2.4" step=".05" value={sx} onChange={(e) => setSx(Number(e.target.value))} />
            <b>{sx.toFixed(2)}</b>
          </label>
          <label>
            <span>сжатие 2</span>
            <input type="range" min=".25" max="2.4" step=".05" value={sy} onChange={(e) => setSy(Number(e.target.value))} />
            <b>{sy.toFixed(2)}</b>
          </label>
          <label>
            <span>поворот</span>
            <input type="range" min="-180" max="180" step="1" value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
            <b>{angle}°</b>
          </label>
          <label>
            <span>перенос x</span>
            <input type="range" min="-2.5" max="2.5" step=".05" value={translation[0]} onChange={(e) => setTranslation([Number(e.target.value), translation[1]])} />
            <b>{translation[0].toFixed(2)}</b>
          </label>
          <label>
            <span>перенос y</span>
            <input type="range" min="-2.5" max="2.5" step=".05" value={translation[1]} onChange={(e) => setTranslation([translation[0], Number(e.target.value)])} />
            <b>{translation[1].toFixed(2)}</b>
          </label>

          <button className={"transform-reflect-button " + (reflect ? "active" : "")} onClick={() => setReflect((value) => !value)}>
            {reflect ? "✓" : "○"} Осевая симметрия
          </button>

          <div className="transform-live-list">
            <div><span>det A</span><strong>{d.toFixed(3)}</strong></div>
            <div><span>площадь</span><strong>× {Math.abs(d).toFixed(3)}</strong></div>
            <div><span>окружность</span><strong>→ эллипс</strong></div>
            <div><span>параллельные</span><strong>→ параллельные</strong></div>
            <div><span>ориентация</span><strong>{d > 0 ? "сохранена" : "изменена"}</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function TransformationVisualInsert({
  topicId,
  index,
}: {
  topicId: string;
  index: number;
}) {
  if (topicId === "mappings-transformations" && index === 4) {
    return <MappingCompositionLab />;
  }

  if (topicId === "linear-transformations" && index === 3) {
    return <LinearTransformationLab />;
  }

  if (topicId === "affine-transformations" && index === 2) {
    return <AffineTransformationLab />;
  }

  return null;
}
