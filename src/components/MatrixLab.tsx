import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";

type Matrix3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
];

type ControlTab = "scale" | "shear" | "rotate" | "projection" | "reflection";

interface TransformState {
  sx: number;
  sy: number;
  sz: number;
  shearXY: number;
  shearXZ: number;
  shearYZ: number;
  angleDeg: number;
  projectionZ: number;
  reflectX: boolean;
  reflectY: boolean;
  reflectZ: boolean;
}

const DEFAULTS: TransformState = {
  sx: 1,
  sy: 1,
  sz: 1,
  shearXY: 0.55,
  shearXZ: 0,
  shearYZ: 0.2,
  angleDeg: 0,
  projectionZ: 1,
  reflectX: false,
  reflectY: false,
  reflectZ: false,
};

const vertices: [number, number, number][] = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
];

const edges = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
] as const;

const identity = (): Matrix3 => [[1,0,0],[0,1,0],[0,0,1]];

function multiply(a: Matrix3, b: Matrix3): Matrix3 {
  const result = identity();
  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      result[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j];
    }
  }
  return result;
}

function matrixFromState(state: TransformState): Matrix3 {
  const angle = state.angleDeg * Math.PI / 180;

  const scale: Matrix3 = [
    [state.sx, 0, 0],
    [0, state.sy, 0],
    [0, 0, state.sz],
  ];

  const shear: Matrix3 = [
    [1, state.shearXY, state.shearXZ],
    [0, 1, state.shearYZ],
    [0, 0, 1],
  ];

  const rotate: Matrix3 = [
    [Math.cos(angle), -Math.sin(angle), 0],
    [Math.sin(angle), Math.cos(angle), 0],
    [0, 0, 1],
  ];

  const projection: Matrix3 = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, state.projectionZ],
  ];

  const reflection: Matrix3 = [
    [state.reflectX ? -1 : 1, 0, 0],
    [0, state.reflectY ? -1 : 1, 0],
    [0, 0, state.reflectZ ? -1 : 1],
  ];

  return multiply(scale, multiply(rotate, multiply(shear, multiply(projection, reflection))));
}

function transform(matrix: Matrix3, point: [number, number, number]): [number, number, number] {
  return [
    matrix[0][0] * point[0] + matrix[0][1] * point[1] + matrix[0][2] * point[2],
    matrix[1][0] * point[0] + matrix[1][1] * point[1] + matrix[1][2] * point[2],
    matrix[2][0] * point[0] + matrix[2][1] * point[1] + matrix[2][2] * point[2],
  ];
}

function determinant(m: Matrix3) {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

function rank(matrix: Matrix3) {
  const a = matrix.map((row) => [...row]);
  let r = 0;
  const eps = 1e-7;

  for (let col = 0; col < 3 && r < 3; col += 1) {
    let pivot = r;
    while (pivot < 3 && Math.abs(a[pivot][col]) < eps) pivot += 1;
    if (pivot === 3) continue;

    [a[r], a[pivot]] = [a[pivot], a[r]];
    const divisor = a[r][col];
    for (let j = col; j < 3; j += 1) a[r][j] /= divisor;

    for (let i = 0; i < 3; i += 1) {
      if (i === r) continue;
      const factor = a[i][col];
      for (let j = col; j < 3; j += 1) a[i][j] -= factor * a[r][j];
    }
    r += 1;
  }

  return r;
}

function CubeLines({ matrix }: { matrix?: Matrix3 }) {
  const points = matrix ? vertices.map((point) => transform(matrix, point)) : vertices;
  return (
    <>
      {edges.map(([a, b], index) => (
        <Line
          key={index}
          points={[points[a], points[b]]}
          color={matrix ? "#9b8cff" : "#777786"}
          lineWidth={matrix ? 2.2 : 1}
          transparent
          opacity={matrix ? 0.95 : 0.34}
        />
      ))}
    </>
  );
}

function Basis({ matrix }: { matrix: Matrix3 }) {
  const origin: [number, number, number] = [0, 0, 0];
  return (
    <>
      <Line points={[origin, transform(matrix, [1.8, 0, 0])]} color="#ff7b86" lineWidth={3} />
      <Line points={[origin, transform(matrix, [0, 1.8, 0])]} color="#63df9b" lineWidth={3} />
      <Line points={[origin, transform(matrix, [0, 0, 1.8])]} color="#65a8ff" lineWidth={3} />
    </>
  );
}

function Scene({ matrix }: { matrix: Matrix3 }) {
  return (
    <>
      <gridHelper args={[12, 12, "#30303b", "#1b1b22"]} rotation={[Math.PI / 2, 0, 0]} />
      <axesHelper args={[2.2]} />
      <CubeLines />
      <CubeLines matrix={matrix} />
      <Basis matrix={matrix} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
    </>
  );
}

function geometryCopy(det: number, matrixRank: number) {
  if (matrixRank === 0) {
    return {
      title: "Всё пространство схлопнулось в точку",
      body: "rank(A)=0: любой входной вектор превращается в нулевой.",
    };
  }
  if (matrixRank === 1) {
    return {
      title: "Образ стал прямой",
      body: "rank(A)=1: после преобразования остаётся только одно независимое направление.",
    };
  }
  if (matrixRank === 2) {
    return {
      title: "Образ стал плоскостью",
      body: "rank(A)=2: объём исчез, но два независимых направления сохранились.",
    };
  }
  if (det < 0) {
    return {
      title: "Трёхмерность сохранена, но ориентация перевёрнута",
      body: "rank(A)=3, поэтому пространство не схлопнулось. det(A)<0 означает зеркальное изменение ориентации базиса.",
    };
  }
  return {
    title: "Трёхмерность сохранена",
    body: "rank(A)=3: три независимых направления остались независимыми. |det(A)| показывает, во сколько раз изменился объём.",
  };
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="transform-control">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <b>{value.toFixed(step < 0.1 ? 2 : 1)}</b>
    </label>
  );
}

export function MatrixLab() {
  const [tab, setTab] = useState<ControlTab>("shear");
  const [state, setState] = useState<TransformState>(DEFAULTS);
  const [fullscreen, setFullscreen] = useState(false);

  const matrix = useMemo(() => matrixFromState(state), [state]);
  const det = determinant(matrix);
  const matrixRank = rank(matrix);
  const geometry = geometryCopy(det, matrixRank);

  useEffect(() => {
    document.body.classList.toggle("lab-overlay-open", fullscreen);
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.classList.remove("lab-overlay-open");
      window.removeEventListener("keydown", close);
    };
  }, [fullscreen]);

  const patch = <K extends keyof TransformState>(key: K, value: TransformState[K]) => {
    setState((current) => ({ ...current, [key]: value }));
  };

  const preset = (name: "identity" | "rotation" | "projection" | "reflection" | "chaos") => {
    if (name === "identity") setState(DEFAULTS);
    if (name === "rotation") setState({ ...DEFAULTS, shearXY: 0, shearYZ: 0, angleDeg: 38 });
    if (name === "projection") setState({ ...DEFAULTS, shearXY: 0, shearYZ: 0, projectionZ: 0 });
    if (name === "reflection") setState({ ...DEFAULTS, shearXY: 0, shearYZ: 0, reflectX: true });
    if (name === "chaos") setState({
      sx: 1.3, sy: 0.75, sz: 1.15,
      shearXY: 0.6, shearXZ: -0.25, shearYZ: 0.35,
      angleDeg: 28, projectionZ: 0.82,
      reflectX: false, reflectY: true, reflectZ: false,
    });
  };

  return (
    <section className={"matrix-lab " + (fullscreen ? "is-fullscreen" : "")}>
      <button
        className="lab-fullscreen-button"
        onClick={() => setFullscreen((value) => !value)}
      >
        {fullscreen ? "× Закрыть" : "⛶ Full screen"}
      </button>

      <div className="lab-copy">
        <div className="eyebrow">ЛАБОРАТОРИЯ / THREE.JS</div>
        <h2>Матрица как преобразование ℝ³ → ℝ³</h2>

        <div className="lab-explainer">
          <strong>Что означает ℝ³ → ℝ³?</strong>
          <p>
            ℝ³ — множество всех векторов (x,y,z). Запись A:ℝ³→ℝ³ означает, что
            матрица 3×3 получает трёхмерный вектор x и возвращает другой трёхмерный
            вектор Ax.
          </p>
          <p>
            Красный, зелёный и синий векторы — Ae₁, Ae₂, Ae₃. Их координаты — три
            столбца матрицы A, поэтому по ним можно восстановить действие A на любой x.
          </p>
        </div>

        <div className="lab-presets">
          <span>Presets</span>
          <button onClick={() => preset("identity")}>Base</button>
          <button onClick={() => preset("rotation")}>Rotate</button>
          <button onClick={() => preset("projection")}>Rank 2</button>
          <button onClick={() => preset("reflection")}>Reflect</button>
          <button onClick={() => preset("chaos")}>Mixed</button>
        </div>

        <div className="lab-modes">
          {(["scale", "shear", "rotate", "projection", "reflection"] as ControlTab[]).map((item) => (
            <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
              {item === "scale" && "Масштаб"}
              {item === "shear" && "Shear"}
              {item === "rotate" && "Поворот"}
              {item === "projection" && "Схлопывание"}
              {item === "reflection" && "Отражение"}
            </button>
          ))}
        </div>

        <div className="transform-controls">
          {tab === "scale" && (
            <>
              <RangeControl label="scale X" value={state.sx} min={0} max={2} step={0.05} onChange={(value) => patch("sx", value)} />
              <RangeControl label="scale Y" value={state.sy} min={0} max={2} step={0.05} onChange={(value) => patch("sy", value)} />
              <RangeControl label="scale Z" value={state.sz} min={0} max={2} step={0.05} onChange={(value) => patch("sz", value)} />
            </>
          )}
          {tab === "shear" && (
            <>
              <RangeControl label="X от Y" value={state.shearXY} min={-1.5} max={1.5} step={0.05} onChange={(value) => patch("shearXY", value)} />
              <RangeControl label="X от Z" value={state.shearXZ} min={-1.5} max={1.5} step={0.05} onChange={(value) => patch("shearXZ", value)} />
              <RangeControl label="Y от Z" value={state.shearYZ} min={-1.5} max={1.5} step={0.05} onChange={(value) => patch("shearYZ", value)} />
            </>
          )}
          {tab === "rotate" && (
            <RangeControl label="угол вокруг Z" value={state.angleDeg} min={-180} max={180} step={1} onChange={(value) => patch("angleDeg", value)} />
          )}
          {tab === "projection" && (
            <RangeControl label="коэффициент Z" value={state.projectionZ} min={0} max={1} step={0.01} onChange={(value) => patch("projectionZ", value)} />
          )}
          {tab === "reflection" && (
            <div className="reflection-controls">
              {[
                ["reflectX", "Отразить X"],
                ["reflectY", "Отразить Y"],
                ["reflectZ", "Отразить Z"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={state[key as keyof TransformState] ? "active" : ""}
                  onClick={() => patch(key as "reflectX" | "reflectY" | "reflectZ", !state[key as "reflectX" | "reflectY" | "reflectZ"])}
                >
                  <span>{state[key as "reflectX" | "reflectY" | "reflectZ"] ? "−1" : "+1"}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lab-pipeline">
          <span>Все параметры работают одновременно и не сбрасываются при переключении вкладок.</span>
          <code>S · R · H · P · F</code>
        </div>

        <div className="matrix-readout">
          {matrix.map((row, index) => (
            <div key={index}>[ {row.map((value) => value.toFixed(2)).join("   ")} ]</div>
          ))}
        </div>

        <div className="lab-stats">
          <div className="stat-tooltip">
            <span>det(A)</span>
            <strong>{det.toFixed(3)}</strong>
            <small>Во сколько раз меняется ориентированный объём.</small>
          </div>

          <button className="stat-tooltip stat-link" onClick={() => (window.location.hash = "inverse-rank")}>
            <span>rank(A) ↗</span>
            <strong>{matrixRank}</strong>
            <small>Число независимых направлений в образе. Нажми, чтобы открыть тему ранга.</small>
          </button>

          <div className="stat-tooltip geometry-stat">
            <span>геометрический результат</span>
            <strong>{geometry.title}</strong>
            <small>{geometry.body}</small>
          </div>
        </div>

        <div className="lab-note">
          <strong>Порядок преобразований имеет значение.</strong>
          <p>
            Матрицы в композиции обычно не коммутируют. Поэтому сначала отразить, потом
            сдвинуть слои и повернуть — не то же самое, что выполнить эти операции в другом порядке.
          </p>
        </div>
      </div>

      <div className="lab-canvas">
        <Canvas camera={{ position: [5.2, 4.1, 5.4], fov: 46 }} dpr={[1, 1.5]}>
          <Scene matrix={matrix} />
        </Canvas>
        <div className="canvas-hint">drag = orbit · wheel = zoom</div>
      </div>
    </section>
  );
}
