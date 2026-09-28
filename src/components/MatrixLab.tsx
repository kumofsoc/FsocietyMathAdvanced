import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { useMemo, useState } from "react";

type Matrix3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
];

type Mode = "scale" | "shear" | "rotate" | "projection";

const vertices: [number, number, number][] = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
];

const edges = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
] as const;

function matrixFor(mode: Mode, strength: number): Matrix3 {
  if (mode === "scale") {
    return [
      [1 + strength * 0.9, 0, 0],
      [0, 1 - strength * 0.35, 0],
      [0, 0, 1 + strength * 0.45],
    ];
  }

  if (mode === "shear") {
    return [
      [1, strength * 1.15, 0],
      [0, 1, strength * 0.45],
      [0, 0, 1],
    ];
  }

  if (mode === "rotate") {
    const angle = strength * Math.PI * 1.4;
    return [
      [Math.cos(angle), -Math.sin(angle), 0],
      [Math.sin(angle), Math.cos(angle), 0],
      [0, 0, 1],
    ];
  }

  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, Math.max(0, 1 - strength)],
  ];
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
          opacity={matrix ? 0.95 : 0.36}
        />
      ))}
    </>
  );
}

function Basis({ matrix }: { matrix: Matrix3 }) {
  const origin: [number, number, number] = [0, 0, 0];
  const e1 = transform(matrix, [1.8, 0, 0]);
  const e2 = transform(matrix, [0, 1.8, 0]);
  const e3 = transform(matrix, [0, 0, 1.8]);

  return (
    <>
      <Line points={[origin, e1]} color="#ff7b86" lineWidth={3} />
      <Line points={[origin, e2]} color="#63df9b" lineWidth={3} />
      <Line points={[origin, e3]} color="#65a8ff" lineWidth={3} />
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

export function MatrixLab() {
  const [mode, setMode] = useState<Mode>("shear");
  const [strength, setStrength] = useState(0.55);
  const matrix = useMemo(() => matrixFor(mode, strength), [mode, strength]);
  const det = determinant(matrix);
  const matrixRank = rank(matrix);

  const label =
    det > 1e-7 ? "ориентация сохранена" :
    det < -1e-7 ? "ориентация перевёрнута" :
    "объём схлопнулся";

  return (
    <section className="matrix-lab">
      <div className="lab-copy">
        <div className="eyebrow">ЛАБОРАТОРИЯ / THREE.JS</div>
        <h2>Матрица как преобразование ℝ³ → ℝ³</h2>
        <p>
          Серый куб — исходное пространство. Цветной — результат применения одной и той же
          линейной функции ко всем вершинам. Красная, зелёная и синяя линии — образы базисных
          векторов e₁, e₂, e₃; именно они являются столбцами матрицы.
        </p>

        <div className="lab-modes">
          {(["scale", "shear", "rotate", "projection"] as Mode[]).map((item) => (
            <button
              key={item}
              className={mode === item ? "active" : ""}
              onClick={() => setMode(item)}
            >
              {item === "scale" && "Масштаб"}
              {item === "shear" && "Сдвиг слоёв / shear"}
              {item === "rotate" && "Поворот"}
              {item === "projection" && "Проекция"}
            </button>
          ))}
        </div>

        <label className="lab-slider">
          <span>Сила преобразования</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={strength}
            onChange={(event) => setStrength(Number(event.target.value))}
          />
          <b>{strength.toFixed(2)}</b>
        </label>

        <div className="matrix-readout">
          {matrix.map((row, index) => (
            <div key={index}>[ {row.map((value) => value.toFixed(2)).join("   ")} ]</div>
          ))}
        </div>

        <div className="lab-stats">
          <div><span>det(A)</span><strong>{det.toFixed(3)}</strong></div>
          <div><span>rank(A)</span><strong>{matrixRank}</strong></div>
          <div><span>геометрия</span><strong>{label}</strong></div>
        </div>

        <div className="lab-note">
          <strong>Почему здесь нет обычного переноса?</strong>
          <p>
            Перенос x ↦ x+b не является линейным преобразованием, потому что обычно не оставляет
            начало координат на месте. Для него нужны аффинные/однородные координаты. Поэтому
            лаборатория не смешивает translation с 3×3 линейными операторами.
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
