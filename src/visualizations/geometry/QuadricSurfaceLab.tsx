import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useState } from "react";

type Mode =
  | "ellipsoid"
  | "cone"
  | "one-sheet"
  | "two-sheet"
  | "elliptic-paraboloid"
  | "hyperbolic-paraboloid"
  | "elliptic-cylinder"
  | "hyperbolic-cylinder"
  | "parabolic-cylinder";

type Point3 = [number, number, number];

const MODES: Array<{ id: Mode; label: string; short: string }> = [
  { id: "ellipsoid", label: "Эллипсоид", short: "EL" },
  { id: "cone", label: "Конус", short: "CO" },
  { id: "one-sheet", label: "1-полостный гиперболоид", short: "H1" },
  { id: "two-sheet", label: "2-полостный гиперболоид", short: "H2" },
  { id: "elliptic-paraboloid", label: "Эллиптический параболоид", short: "EP" },
  { id: "hyperbolic-paraboloid", label: "Гиперболический параболоид", short: "HP" },
  { id: "elliptic-cylinder", label: "Эллиптический цилиндр", short: "EC" },
  { id: "hyperbolic-cylinder", label: "Гиперболический цилиндр", short: "HC" },
  { id: "parabolic-cylinder", label: "Параболический цилиндр", short: "PC" },
];

const EQUATIONS: Record<Mode, string> = {
  ellipsoid: "x²/a² + y²/b² + z²/c² = 1",
  cone: "x²/a² + y²/b² − z²/c² = 0",
  "one-sheet": "x²/a² + y²/b² − z²/c² = 1",
  "two-sheet": "z²/c² − x²/a² − y²/b² = 1",
  "elliptic-paraboloid": "x²/a² + y²/b² = 2z",
  "hyperbolic-paraboloid": "x²/a² − y²/b² = 2z",
  "elliptic-cylinder": "x²/a² + y²/b² = 1",
  "hyperbolic-cylinder": "x²/a² − y²/b² = 1",
  "parabolic-cylinder": "y² = 2px",
};

function makeGridGeometry(
  rows: number,
  cols: number,
  point: (u: number, v: number) => Point3,
) {
  const vertices: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= rows; i += 1) {
    const u = i / rows;
    for (let j = 0; j <= cols; j += 1) {
      const v = j / cols;
      const [x, y, z] = point(u, v);
      vertices.push(x, y, z);
    }
  }

  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      const a = i * (cols + 1) + j;
      const b = a + 1;
      const c = (i + 1) * (cols + 1) + j;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function surfaceGeometries(mode: Mode, a: number, b: number, c: number) {
  if (mode === "ellipsoid") {
    return [
      makeGridGeometry(42, 48, (u, v) => {
        const phi = u * Math.PI;
        const theta = v * Math.PI * 2;
        return [
          a * Math.sin(phi) * Math.cos(theta),
          b * Math.sin(phi) * Math.sin(theta),
          c * Math.cos(phi),
        ];
      }),
    ];
  }

  if (mode === "cone") {
    return [
      makeGridGeometry(42, 48, (u, v) => {
        const t = -1.55 + u * 3.1;
        const theta = v * Math.PI * 2;
        const r = Math.abs(t);
        return [a * r * Math.cos(theta), b * r * Math.sin(theta), c * t];
      }),
    ];
  }

  if (mode === "one-sheet") {
    return [
      makeGridGeometry(42, 48, (u, v) => {
        const t = -1.28 + u * 2.56;
        const theta = v * Math.PI * 2;
        const ch = Math.cosh(t);
        return [a * ch * Math.cos(theta), b * ch * Math.sin(theta), c * Math.sinh(t)];
      }),
    ];
  }

  if (mode === "two-sheet") {
    const sheet = (sign: number) =>
      makeGridGeometry(26, 48, (u, v) => {
        const t = u * 1.28;
        const theta = v * Math.PI * 2;
        return [
          a * Math.sinh(t) * Math.cos(theta),
          b * Math.sinh(t) * Math.sin(theta),
          sign * c * Math.cosh(t),
        ];
      });
    return [sheet(1), sheet(-1)];
  }

  if (mode === "elliptic-paraboloid") {
    return [
      makeGridGeometry(34, 48, (u, v) => {
        const r = u * 2.1;
        const theta = v * Math.PI * 2;
        return [a * r * Math.cos(theta), b * r * Math.sin(theta), (r * r) / 2];
      }),
    ];
  }

  if (mode === "hyperbolic-paraboloid") {
    return [
      makeGridGeometry(38, 38, (u, v) => {
        const x = (u - 0.5) * 5.2;
        const y = (v - 0.5) * 5.2;
        const z = 0.5 * ((x * x) / (a * a) - (y * y) / (b * b));
        return [x, y, z];
      }),
    ];
  }

  if (mode === "elliptic-cylinder") {
    return [
      makeGridGeometry(34, 48, (u, v) => {
        const z = -3 + u * 6;
        const theta = v * Math.PI * 2;
        return [a * Math.cos(theta), b * Math.sin(theta), z];
      }),
    ];
  }

  if (mode === "hyperbolic-cylinder") {
    const branch = (sign: number) =>
      makeGridGeometry(34, 34, (u, v) => {
        const t = -1.35 + u * 2.7;
        const z = -3 + v * 6;
        return [sign * a * Math.cosh(t), b * Math.sinh(t), z];
      });
    return [branch(1), branch(-1)];
  }

  const branch = (sign: number) =>
    makeGridGeometry(32, 34, (u, v) => {
      const y = sign * u * 3.1;
      const x = (y * y) / (2 * Math.max(0.35, a));
      const z = -3 + v * 6;
      return [x, y, z];
    });

  return [branch(1), branch(-1)];
}

function sectionData(mode: Mode, a: number, b: number, c: number, h: number) {
  const ellipse = (rx: number, ry: number) =>
    Array.from({ length: 121 }, (_, i): Point3 => {
      const t = (i / 120) * Math.PI * 2;
      return [rx * Math.cos(t), ry * Math.sin(t), h];
    });

  if (mode === "ellipsoid") {
    const k = 1 - (h * h) / (c * c);
    return k >= 0
      ? { label: k < 0.02 ? "точка / вырожденное сечение" : "эллипс", lines: [ellipse(a * Math.sqrt(k), b * Math.sqrt(k))] }
      : { label: "пустое сечение", lines: [] as Point3[][] };
  }

  if (mode === "cone") {
    const scale = Math.abs(h / c);
    return { label: scale < 0.02 ? "точка — вершина" : "эллипс", lines: [ellipse(a * scale, b * scale)] };
  }

  if (mode === "one-sheet") {
    const k = 1 + (h * h) / (c * c);
    return { label: "эллипс", lines: [ellipse(a * Math.sqrt(k), b * Math.sqrt(k))] };
  }

  if (mode === "two-sheet") {
    const k = (h * h) / (c * c) - 1;
    return k >= 0
      ? { label: k < 0.02 ? "точка — вершина полости" : "эллипс", lines: [ellipse(a * Math.sqrt(k), b * Math.sqrt(k))] }
      : { label: "пустое сечение между полостями", lines: [] as Point3[][] };
  }

  if (mode === "elliptic-paraboloid") {
    return h >= 0
      ? { label: h < 0.02 ? "точка — вершина" : "эллипс", lines: [ellipse(a * Math.sqrt(2 * h), b * Math.sqrt(2 * h))] }
      : { label: "пустое сечение ниже вершины", lines: [] as Point3[][] };
  }

  if (mode === "hyperbolic-paraboloid") {
    if (Math.abs(h) < 0.03) {
      const k = b / a;
      const d = 3;
      return {
        label: "две пересекающиеся прямые",
        lines: [
          [[-d, -k * d, h], [d, k * d, h]],
          [[-d, k * d, h], [d, -k * d, h]],
        ] as Point3[][],
      };
    }
    const sign = h > 0 ? 1 : -1;
    const branches: Point3[][] = [];
    for (const branchSign of [-1, 1]) {
      const points: Point3[] = [];
      for (let i = 0; i <= 90; i += 1) {
        const t = -1.5 + (i / 90) * 3;
        if (sign > 0) {
          points.push([
            branchSign * a * Math.sqrt(2 * h) * Math.cosh(t),
            b * Math.sqrt(2 * h) * Math.sinh(t),
            h,
          ]);
        } else {
          const q = Math.sqrt(-2 * h);
          points.push([
            a * q * Math.sinh(t),
            branchSign * b * q * Math.cosh(t),
            h,
          ]);
        }
      }
      branches.push(points);
    }
    return { label: "гипербола", lines: branches };
  }

  if (mode === "elliptic-cylinder") {
    return { label: "эллипс — одинаковый на любой высоте", lines: [ellipse(a, b)] };
  }

  if (mode === "hyperbolic-cylinder") {
    const lines: Point3[][] = [];
    for (const branchSign of [-1, 1]) {
      lines.push(
        Array.from({ length: 91 }, (_, i): Point3 => {
          const t = -1.45 + (i / 90) * 2.9;
          return [branchSign * a * Math.cosh(t), b * Math.sinh(t), h];
        }),
      );
    }
    return { label: "гипербола — одинаковая на любой высоте", lines };
  }

  const parabola: Point3[] = Array.from({ length: 101 }, (_, i) => {
    const y = -3 + (i / 100) * 6;
    return [(y * y) / (2 * Math.max(0.35, a)), y, h];
  });
  return { label: "парабола — одинаковая на любой высоте", lines: [parabola] };
}

function generatorLines(mode: Mode, a: number, b: number, c: number) {
  const result: Array<{ points: Point3[]; color: string }> = [];

  if (mode === "one-sheet") {
    const angles = Array.from({ length: 7 }, (_, i) => (i / 7) * Math.PI * 2);
    for (const u of angles) {
      const first: Point3[] = [];
      const second: Point3[] = [];
      for (let i = 0; i <= 40; i += 1) {
        const t = -1.65 + (i / 40) * 3.3;
        first.push([
          a * (Math.cos(u) - t * Math.sin(u)),
          b * (Math.sin(u) + t * Math.cos(u)),
          c * t,
        ]);
        second.push([
          a * (Math.cos(u) + t * Math.sin(u)),
          b * (Math.sin(u) - t * Math.cos(u)),
          c * t,
        ]);
      }
      result.push({ points: first, color: "#58dca2" });
      result.push({ points: second, color: "#ff7585" });
    }
  }

  if (mode === "hyperbolic-paraboloid") {
    const constants = [-2.2, -1.4, -0.75, 0.75, 1.4, 2.2];

    for (const lambda of constants) {
      const familyA: Point3[] = [];
      const familyB: Point3[] = [];

      for (let i = 0; i <= 36; i += 1) {
        const z = -2 + (i / 36) * 4;

        familyA.push([
          (a / 2) * (lambda + (2 * z) / lambda),
          (b / 2) * (lambda - (2 * z) / lambda),
          z,
        ]);

        familyB.push([
          (a / 2) * ((2 * z) / lambda + lambda),
          (b / 2) * ((2 * z) / lambda - lambda),
          z,
        ]);
      }

      result.push({ points: familyA, color: "#58dca2" });
      result.push({ points: familyB, color: "#ff7585" });
    }
  }

  return result;
}

function Scene({
  mode,
  a,
  b,
  c,
  h,
  showSection,
  showGenerators,
  wireframe,
}: {
  mode: Mode;
  a: number;
  b: number;
  c: number;
  h: number;
  showSection: boolean;
  showGenerators: boolean;
  wireframe: boolean;
}) {
  const geometries = useMemo(() => surfaceGeometries(mode, a, b, c), [mode, a, b, c]);
  const section = useMemo(() => sectionData(mode, a, b, c, h), [mode, a, b, c, h]);
  const generators = useMemo(() => generatorLines(mode, a, b, c), [mode, a, b, c]);

  return (
    <>
      <ambientLight intensity={1.25} />
      <directionalLight position={[4, 6, 5]} intensity={1.35} />
      <directionalLight position={[-4, -2, -3]} intensity={0.55} />
      <gridHelper args={[12, 12, "#343440", "#202028"]} rotation={[Math.PI / 2, 0, 0]} />
      <axesHelper args={[3]} />

      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshStandardMaterial
            color={index % 2 ? "#58dca2" : "#7f8cff"}
            transparent
            opacity={wireframe ? 0.22 : 0.34}
            wireframe={wireframe}
            side={THREE.DoubleSide}
            roughness={0.55}
            metalness={0.05}
          />
        </mesh>
      ))}

      {showSection && (
        <>
          <mesh position={[0, 0, h]}>
            <planeGeometry args={[8, 8]} />
            <meshBasicMaterial
              color="#ffcb6b"
              transparent
              opacity={0.065}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {section.lines.map((points, index) => (
            <Line
              key={index}
              points={points}
              color="#ffcb6b"
              lineWidth={3}
              transparent
              opacity={0.96}
            />
          ))}
        </>
      )}

      {showGenerators &&
        generators.map((generator, index) => (
          <Line
            key={"generator-" + index}
            points={generator.points}
            color={generator.color}
            lineWidth={1.35}
            transparent
            opacity={0.74}
          />
        ))}

      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
    </>
  );
}

function explain(mode: Mode) {
  switch (mode) {
    case "ellipsoid":
      return "Замкнутая ограниченная поверхность. Координатные плоскости — плоскости симметрии, начало координат — центр.";
    case "cone":
      return "Однородное уравнение: если точка лежит на поверхности, вся прямая через вершину в её направлении тоже лежит на конусе.";
    case "one-sheet":
      return "Связная поверхность с «талией». Через каждую её точку проходят две прямолинейные образующие.";
    case "two-sheet":
      return "Две несвязанные полости. Между ними существует диапазон высот, где горизонтальное сечение пусто.";
    case "elliptic-paraboloid":
      return "Чаша: горизонтальные сечения выше вершины — эллипсы, в вершине эллипс схлопывается в точку.";
    case "hyperbolic-paraboloid":
      return "Седло: горизонтальные сечения — гиперболы, а при z=0 получается пара пересекающихся прямых.";
    case "elliptic-cylinder":
      return "Один и тот же эллипс переносится вдоль свободной оси. Координата z в уравнение не входит.";
    case "hyperbolic-cylinder":
      return "Одна и та же гипербола переносится вдоль свободной оси.";
    case "parabolic-cylinder":
      return "Парабола переносится вдоль свободной оси, образуя цилиндрическую поверхность.";
  }
}

export function QuadricSurfaceLab() {
  const [mode, setMode] = useState<Mode>("ellipsoid");
  const [a, setA] = useState(1.8);
  const [b, setB] = useState(1.25);
  const [c, setC] = useState(1.55);
  const [h, setH] = useState(0.6);
  const [showSection, setShowSection] = useState(true);
  const [showGenerators, setShowGenerators] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("quadric-fullscreen-open", fullscreen);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("quadric-fullscreen-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [fullscreen]);

  const section = useMemo(() => sectionData(mode, a, b, c, h), [mode, a, b, c, h]);
  const current = MODES.find((item) => item.id === mode)!;

  return (
    <section className={"quadric-lab " + (fullscreen ? "quadric-fullscreen" : "")}>
      <header className="quadric-head">
        <div>
          <div className="eyebrow">3D LAB / ПОВЕРХНОСТИ ВТОРОГО ПОРЯДКА</div>
          <h2>Не запоминай форму. Режь поверхность плоскостью.</h2>
          <p>
            Вращай сцену, меняй параметры и двигай плоскость z=h.
            Цветная линия — реальное сечение поверхности этой плоскостью.
          </p>
        </div>
        <div className="quadric-live">
          <span>{current.short}</span>
          <strong>{current.label}</strong>
          <code>{EQUATIONS[mode]}</code>
        </div>
      </header>

      <div className="quadric-mode-grid">
        {MODES.map((item) => (
          <button
            key={item.id}
            className={mode === item.id ? "active" : ""}
            onClick={() => {
              setMode(item.id);
              setH(item.id === "elliptic-paraboloid" ? 0.8 : 0.35);
            }}
          >
            <span>{item.short}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>

      <div className="quadric-layout">
        <div className="quadric-stage">
          <Canvas camera={{ position: [5.8, 4.8, 6.6], fov: 47 }} dpr={[1, 1.5]}>
            <Scene
              mode={mode}
              a={a}
              b={b}
              c={c}
              h={h}
              showSection={showSection}
              showGenerators={showGenerators}
              wireframe={wireframe}
            />
          </Canvas>

          <div className="quadric-section-badge">
            <span>z = {h.toFixed(2)}</span>
            <strong>{showSection ? section.label : "сечение скрыто"}</strong>
          </div>

          <button
            className="quadric-fullscreen-button"
            onClick={() => setFullscreen((value) => !value)}
          >
            {fullscreen ? "× Закрыть" : "⛶ Full screen"}
          </button>

          <div className="quadric-legend">
            <span><i className="surface-dot" /> поверхность</span>
            <span><i className="section-dot" /> сечение z=h</span>
            {(mode === "one-sheet" || mode === "hyperbolic-paraboloid") && (
              <>
                <span><i className="generator-a-dot" /> образующие I</span>
                <span><i className="generator-b-dot" /> образующие II</span>
              </>
            )}
            <span>drag = rotate</span>
            <span>wheel = zoom</span>
          </div>
        </div>

        <aside className="quadric-controls">
          <div className="quadric-control-title">
            <span>PARAMETERS</span>
            <strong>{current.label}</strong>
          </div>

          {[
            ["a", a, setA],
            ["b", b, setB],
            ["c", c, setC],
          ].map(([label, value, setter]) => (
            <label key={String(label)}>
              <span>{String(label)}</span>
              <input
                type="range"
                min="0.65"
                max="2.6"
                step="0.05"
                value={Number(value)}
                onChange={(event) => (setter as (value: number) => void)(Number(event.target.value))}
              />
              <b>{Number(value).toFixed(2)}</b>
            </label>
          ))}

          <label className="section-slider">
            <span>h</span>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.05"
              value={h}
              onChange={(event) => setH(Number(event.target.value))}
            />
            <b>{h.toFixed(2)}</b>
          </label>

          <div className="quadric-toggle-row">
            <button className={showSection ? "active" : ""} onClick={() => setShowSection((value) => !value)}>
              {showSection ? "✓" : "○"} Сечение
            </button>
            <button className={wireframe ? "active" : ""} onClick={() => setWireframe((value) => !value)}>
              {wireframe ? "✓" : "○"} Каркас
            </button>
            {(mode === "one-sheet" || mode === "hyperbolic-paraboloid") && (
              <button className={showGenerators ? "active" : ""} onClick={() => setShowGenerators((value) => !value)}>
                {showGenerators ? "✓" : "○"} Образующие
              </button>
            )}
          </div>

          <div className="quadric-equation">
            <span>КАНОНИЧЕСКОЕ УРАВНЕНИЕ</span>
            <code>{EQUATIONS[mode]}</code>
          </div>

          <div className="quadric-explain">
            <span>ЧТО ВИДНО</span>
            <p>{explain(mode)}</p>
          </div>

          <div className="quadric-section-info">
            <span>СЕЧЕНИЕ ПЛОСКОСТЬЮ z=h</span>
            <strong>{section.label}</strong>
            <small>
              h = {h.toFixed(2)}. Двигай ползунок и следи, как меняется тип или размер сечения.
            </small>
          </div>
        </aside>
      </div>
    </section>
  );
}
