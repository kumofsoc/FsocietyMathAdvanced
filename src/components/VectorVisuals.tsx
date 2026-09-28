import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useState } from "react";

type V2 = [number, number];
type V3 = [number, number, number];

function clampVector([x, y]: V2, scale = 34) {
  return [220 + x * scale, 170 - y * scale] as const;
}

function Arrow2D({
  vector,
  label,
  className,
  scale = 34,
  origin = [220, 170],
}: {
  vector: V2;
  label: string;
  className: string;
  scale?: number;
  origin?: V2;
}) {
  const [ox, oy] = origin;
  const x = ox + vector[0] * scale;
  const y = oy - vector[1] * scale;
  const angle = Math.atan2(y - oy, x - ox) * 180 / Math.PI;

  return (
    <g className={className}>
      <line x1={ox} y1={oy} x2={x} y2={y} />
      <polygon
        points="-10,-5 0,0 -10,5"
        transform={"translate(" + x + " " + y + ") rotate(" + angle + ")"}
      />
      <text x={x + 10} y={y - 9}>{label}</text>
    </g>
  );
}

function Axes2D() {
  return (
    <g className="vector-axes">
      <line x1="24" y1="170" x2="416" y2="170" />
      <line x1="220" y1="24" x2="220" y2="316" />
      <text x="404" y="160">x</text>
      <text x="230" y="34">y</text>
    </g>
  );
}

function VectorBasicsLab() {
  const [a, setA] = useState<V2>([3, 2]);
  const [b, setB] = useState<V2>([-1, 2.5]);
  const [k, setK] = useState(1.4);
  const sum: V2 = [a[0] + b[0], a[1] + b[1]];
  const scaled: V2 = [a[0] * k, a[1] * k];
  const aEnd = clampVector(a);

  return (
    <section className="vector-visual vector-basics-lab">
      <header>
        <div className="eyebrow">ИНТЕРАКТИВ / ЛИНЕЙНЫЕ ОПЕРАЦИИ</div>
        <h2>Вектор — это направление и длина, а не место на рисунке.</h2>
        <p>
          Меняй координаты двух векторов и коэффициент k. Сумма строится правилом
          треугольника, а k·a сохраняет коллинеарность с a.
        </p>
      </header>

      <div className="vector-visual-grid">
        <div className="vector-stage vector-stage-2d">
          <svg viewBox="0 0 440 340" role="img" aria-label="Сложение и масштабирование векторов">
            <Axes2D />
            <Arrow2D vector={a} label="a" className="vector-a" />
            <Arrow2D vector={b} label="b" className="vector-b" origin={[aEnd[0], aEnd[1]]} />
            <Arrow2D vector={sum} label="a+b" className="vector-sum" />
            <Arrow2D vector={scaled} label="k·a" className="vector-scaled" />
            <line className="vector-guide" x1={aEnd[0]} y1={aEnd[1]} x2={clampVector(sum)[0]} y2={clampVector(sum)[1]} />
          </svg>
          <div className="vector-stage-caption">
            <span><i className="dot-a" />a</span>
            <span><i className="dot-b" />b, перенесённый к концу a</span>
            <span><i className="dot-sum" />a+b</span>
            <span><i className="dot-scaled" />k·a</span>
          </div>
        </div>

        <div className="vector-controls">
          {[
            ["aₓ", a[0], (value: number) => setA([value, a[1]])],
            ["aᵧ", a[1], (value: number) => setA([a[0], value])],
            ["bₓ", b[0], (value: number) => setB([value, b[1]])],
            ["bᵧ", b[1], (value: number) => setB([b[0], value])],
          ].map(([label, value, change]) => (
            <label key={String(label)}>
              <span>{String(label)}</span>
              <input
                type="range"
                min="-4"
                max="4"
                step="0.1"
                value={Number(value)}
                onChange={(event) => (change as (value: number) => void)(Number(event.target.value))}
              />
              <b>{Number(value).toFixed(1)}</b>
            </label>
          ))}

          <label>
            <span>k</span>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.05"
              value={k}
              onChange={(event) => setK(Number(event.target.value))}
            />
            <b>{k.toFixed(2)}</b>
          </label>

          <div className="vector-live-values">
            <div><span>a+b</span><strong>({sum[0].toFixed(1)}, {sum[1].toFixed(1)})</strong></div>
            <div><span>k·a</span><strong>({scaled[0].toFixed(1)}, {scaled[1].toFixed(1)})</strong></div>
            <div><span>|a|</span><strong>{Math.hypot(...a).toFixed(3)}</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DependenceBasisLab() {
  const [lambda, setLambda] = useState(1.6);
  const [tilt, setTilt] = useState(0.8);
  const a: V2 = [2.6, 1.2];
  const b: V2 = [a[0] * lambda, a[1] * lambda];
  const e1: V2 = [2.5, 0];
  const e2: V2 = [tilt, 2.4];
  const determinant = e1[0] * e2[1] - e1[1] * e2[0];

  return (
    <section className="vector-visual vector-dual-lab">
      <article>
        <div className="eyebrow">ЛИНЕЙНАЯ ЗАВИСИМОСТЬ</div>
        <h3>b = λa</h3>
        <svg viewBox="0 0 440 300">
          <Axes2D />
          <Arrow2D vector={a} label="a" className="vector-a" />
          <Arrow2D vector={b} label="b=λa" className="vector-b" />
        </svg>
        <label className="single-vector-control">
          <span>λ</span>
          <input type="range" min="-2" max="2" step="0.05" value={lambda} onChange={(e) => setLambda(Number(e.target.value))} />
          <b>{lambda.toFixed(2)}</b>
        </label>
        <p>Два ненулевых вектора линейно зависимы ровно тогда, когда они коллинеарны.</p>
      </article>

      <article>
        <div className="eyebrow">БАЗИС НА ПЛОСКОСТИ</div>
        <h3>Два неколлинеарных направления</h3>
        <svg viewBox="0 0 440 300">
          <Axes2D />
          <Arrow2D vector={e1} label="e₁" className="vector-a" />
          <Arrow2D vector={e2} label="e₂" className="vector-b" />
          <polygon
            className="basis-parallelogram"
            points={
              "220,170 " +
              clampVector(e1).join(",") + " " +
              clampVector([e1[0]+e2[0], e1[1]+e2[1]]).join(",") + " " +
              clampVector(e2).join(",")
            }
          />
        </svg>
        <label className="single-vector-control">
          <span>наклон e₂</span>
          <input type="range" min="-2.5" max="2.5" step="0.05" value={tilt} onChange={(e) => setTilt(Number(e.target.value))} />
          <b>{tilt.toFixed(2)}</b>
        </label>
        <p>Площадь базисного параллелограмма здесь равна |det| = {Math.abs(determinant).toFixed(2)}. Пока она не ноль, базис не вырожден.</p>
      </article>
    </section>
  );
}

function CoordinatesLab() {
  const [mode, setMode] = useState<"cartesian" | "polar" | "cylindrical" | "spherical">("cartesian");
  const [radius, setRadius] = useState(3);
  const [angle, setAngle] = useState(42);
  const [z, setZ] = useState(1.8);
  const rad = angle * Math.PI / 180;
  const x = radius * Math.cos(rad);
  const y = radius * Math.sin(rad);
  const point = clampVector([x, y], 30);

  const description = {
    cartesian: "Точка задаётся независимыми координатами x, y, z вдоль базисных осей.",
    polar: "На плоскости точку можно задать расстоянием r от начала и углом φ.",
    cylindrical: "Цилиндрические координаты добавляют высоту z к полярным (r, φ).",
    spherical: "Сферические координаты используют радиус и два угла для положения в пространстве.",
  }[mode];

  return (
    <section className="vector-visual coordinates-lab">
      <header>
        <div className="eyebrow">СИСТЕМЫ КООРДИНАТ</div>
        <h2>Одна точка — разные способы задать положение.</h2>
        <p>{description}</p>
      </header>

      <div className="coordinate-tabs">
        {(["cartesian","polar","cylindrical","spherical"] as const).map((item) => (
          <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>
            {item === "cartesian" ? "Декартова" : item === "polar" ? "Полярная" : item === "cylindrical" ? "Цилиндрическая" : "Сферическая"}
          </button>
        ))}
      </div>

      <div className="vector-visual-grid">
        <div className="vector-stage vector-stage-2d coordinate-stage">
          <svg viewBox="0 0 440 340">
            <Axes2D />
            <circle className="coordinate-orbit" cx="220" cy="170" r={radius * 30} />
            <line className="coordinate-radius" x1="220" y1="170" x2={point[0]} y2={point[1]} />
            <line className="coordinate-projection" x1={point[0]} y1={point[1]} x2={point[0]} y2="170" />
            <circle className="coordinate-point" cx={point[0]} cy={point[1]} r="6" />
            <text x={point[0]+10} y={point[1]-8}>M</text>
            <path className="coordinate-angle" d={"M250 170 A30 30 0 0 0 " + (220+30*Math.cos(rad)) + " " + (170-30*Math.sin(rad))} />
          </svg>
          <div className="coordinate-readout">
            <span>x = {x.toFixed(2)}</span>
            <span>y = {y.toFixed(2)}</span>
            <span>r = {radius.toFixed(2)}</span>
            <span>φ = {angle.toFixed(0)}°</span>
            {(mode === "cylindrical" || mode === "spherical") && <span>z = {z.toFixed(2)}</span>}
          </div>
        </div>

        <div className="vector-controls">
          <label>
            <span>r</span>
            <input type="range" min="0.6" max="4.6" step="0.05" value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
            <b>{radius.toFixed(2)}</b>
          </label>
          <label>
            <span>φ</span>
            <input type="range" min="0" max="360" step="1" value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
            <b>{angle.toFixed(0)}°</b>
          </label>
          {(mode === "cylindrical" || mode === "spherical") && (
            <label>
              <span>z</span>
              <input type="range" min="-3" max="3" step="0.05" value={z} onChange={(e) => setZ(Number(e.target.value))} />
              <b>{z.toFixed(2)}</b>
            </label>
          )}
        </div>
      </div>
    </section>
  );
}

function BasisChangeLab() {
  const [angle, setAngle] = useState(28);
  const [stretch, setStretch] = useState(1.25);
  const vector: V2 = [2.7, 2.1];
  const rad = angle * Math.PI / 180;
  const e1: V2 = [stretch * Math.cos(rad), stretch * Math.sin(rad)];
  const e2: V2 = [-Math.sin(rad), Math.cos(rad)];
  const det = e1[0] * e2[1] - e1[1] * e2[0];
  const alpha = (vector[0] * e2[1] - vector[1] * e2[0]) / det;
  const beta = (e1[0] * vector[1] - e1[1] * vector[0]) / det;

  return (
    <section className="vector-visual basis-change-lab">
      <header>
        <div className="eyebrow">ЗАМЕНА БАЗИСА</div>
        <h2>Сам вектор не меняется. Меняются числа, которыми мы его описываем.</h2>
      </header>

      <div className="vector-visual-grid">
        <div className="vector-stage vector-stage-2d">
          <svg viewBox="0 0 440 340">
            <Axes2D />
            <Arrow2D vector={e1} label="e′₁" className="vector-a" />
            <Arrow2D vector={e2} label="e′₂" className="vector-b" />
            <Arrow2D vector={vector} label="v" className="vector-sum" />
            <polygon
              className="basis-parallelogram"
              points={
                "220,170 " +
                clampVector([e1[0]*alpha, e1[1]*alpha]).join(",") + " " +
                clampVector(vector).join(",") + " " +
                clampVector([e2[0]*beta, e2[1]*beta]).join(",")
              }
            />
          </svg>
        </div>

        <div className="vector-controls">
          <label>
            <span>поворот базиса</span>
            <input type="range" min="-70" max="70" step="1" value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
            <b>{angle}°</b>
          </label>
          <label>
            <span>масштаб e′₁</span>
            <input type="range" min="0.55" max="1.8" step="0.05" value={stretch} onChange={(e) => setStretch(Number(e.target.value))} />
            <b>{stretch.toFixed(2)}</b>
          </label>
          <div className="vector-live-values">
            <div><span>старые координаты v</span><strong>(2.70, 2.10)</strong></div>
            <div><span>новые координаты</span><strong>({alpha.toFixed(2)}, {beta.toFixed(2)})</strong></div>
            <div><span>det базиса</span><strong>{det.toFixed(2)}</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DotProductLab() {
  const [angle, setAngle] = useState(58);
  const [aLength, setALength] = useState(3);
  const [bLength, setBLength] = useState(2.4);
  const rad = angle * Math.PI / 180;
  const a: V2 = [aLength, 0];
  const b: V2 = [bLength * Math.cos(rad), bLength * Math.sin(rad)];
  const dot = aLength * bLength * Math.cos(rad);
  const projection = bLength * Math.cos(rad);
  const bEnd = clampVector(b);
  const projectionEnd = clampVector([projection, 0]);

  const sign = Math.abs(dot) < 0.001 ? "zero" : dot > 0 ? "positive" : "negative";

  return (
    <section className={"vector-visual dot-product-lab sign-" + sign}>
      <header>
        <div className="eyebrow">СКАЛЯРНОЕ ПРОИЗВЕДЕНИЕ / УГОЛ / ПРОЕКЦИЯ</div>
        <h2>Знак произведения сразу показывает геометрию угла.</h2>
        <p>Острый угол → положительное произведение; прямой → ноль; тупой → отрицательное.</p>
      </header>

      <div className="vector-visual-grid">
        <div className="vector-stage vector-stage-2d">
          <svg viewBox="0 0 440 340">
            <Axes2D />
            <Arrow2D vector={a} label="a" className="vector-a" />
            <Arrow2D vector={b} label="b" className="vector-b" />
            <line className="projection-line" x1={bEnd[0]} y1={bEnd[1]} x2={projectionEnd[0]} y2={projectionEnd[1]} />
            <line className="projection-base" x1="220" y1="170" x2={projectionEnd[0]} y2={projectionEnd[1]} />
            <path className="angle-arc" d={"M270 170 A50 50 0 0 " + (angle > 180 ? 1 : 0) + " 0 " + (220+50*Math.cos(rad)) + " " + (170-50*Math.sin(rad))} />
            <text className="angle-label" x="274" y="145">{angle}°</text>
          </svg>
          <div className="dot-sign-badge">
            <span>a·b</span>
            <strong>{dot.toFixed(3)}</strong>
            <small>{sign === "positive" ? "угол острый" : sign === "negative" ? "угол тупой" : "векторы ортогональны"}</small>
          </div>
        </div>

        <div className="vector-controls">
          <label>
            <span>φ</span>
            <input type="range" min="0" max="180" step="1" value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
            <b>{angle}°</b>
          </label>
          <label>
            <span>|a|</span>
            <input type="range" min="0.6" max="4.5" step="0.05" value={aLength} onChange={(e) => setALength(Number(e.target.value))} />
            <b>{aLength.toFixed(2)}</b>
          </label>
          <label>
            <span>|b|</span>
            <input type="range" min="0.6" max="4.5" step="0.05" value={bLength} onChange={(e) => setBLength(Number(e.target.value))} />
            <b>{bLength.toFixed(2)}</b>
          </label>
          <div className="vector-live-values">
            <div><span>a·b</span><strong>{dot.toFixed(3)}</strong></div>
            <div><span>cos φ</span><strong>{Math.cos(rad).toFixed(3)}</strong></div>
            <div><span>скалярная проекция b на a</span><strong>{projection.toFixed(3)}</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function cross(a: V3, b: V3): V3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dot3(a: V3, b: V3) {
  return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

function length3(v: V3) {
  return Math.hypot(v[0],v[1],v[2]);
}

function Arrow3D({ vector, color }: { vector: V3; color: string }) {
  const helper = useMemo(() => {
    const end = new THREE.Vector3(...vector);
    const len = Math.max(0.0001, end.length());
    return new THREE.ArrowHelper(end.clone().normalize(), new THREE.Vector3(0,0,0), len, color, Math.min(.32, len*.16), Math.min(.18, len*.1));
  }, [vector[0], vector[1], vector[2], color]);

  return <primitive object={helper} />;
}

function CrossScene({ a, b }: { a: V3; b: V3 }) {
  const c = cross(a,b);
  const ab: V3 = [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
  return (
    <>
      <gridHelper args={[10,10,"#30303b","#1a1a22"]} />
      <axesHelper args={[2.2]} />
      <Arrow3D vector={a} color="#ff7585" />
      <Arrow3D vector={b} color="#58dca2" />
      <Arrow3D vector={c} color="#7f8cff" />
      <Line points={[[0,0,0],a,ab,b,[0,0,0]]} color="#ffcb6b" transparent opacity={.56} />
      <OrbitControls makeDefault enableDamping dampingFactor={.08} />
    </>
  );
}

function CrossProductLab() {
  const [a, setA] = useState<V3>([2.4,.5,.3]);
  const [b, setB] = useState<V3>([.4,2.1,1.1]);
  const c = cross(a,b);
  const area = length3(c);

  const set = (which: "a" | "b", index: number, value: number) => {
    const current = which === "a" ? a : b;
    const next = [...current] as V3;
    next[index] = value;
    which === "a" ? setA(next) : setB(next);
  };

  return (
    <section className="vector-visual vector-3d-lab">
      <header>
        <div className="eyebrow">ВЕКТОРНОЕ ПРОИЗВЕДЕНИЕ / 3D</div>
        <h2>a×b перпендикулярен обоим векторам.</h2>
        <p>Его длина равна площади параллелограмма, построенного на a и b; направление выбирается ориентацией пространства.</p>
      </header>

      <div className="vector-visual-grid">
        <div className="vector-stage vector-stage-3d">
          <Canvas camera={{ position:[5,4,5], fov:48 }} dpr={[1,1.5]}>
            <CrossScene a={a} b={b} />
          </Canvas>
          <div className="vector-3d-legend">
            <span><i className="dot-a" />a</span>
            <span><i className="dot-b" />b</span>
            <span><i className="dot-sum" />a×b</span>
            <span><i className="dot-area" />параллелограмм</span>
          </div>
        </div>

        <div className="vector-controls compact">
          {(["a","b"] as const).flatMap((which) =>
            [0,1,2].map((index) => (
              <label key={which+index}>
                <span>{which}{["ₓ","ᵧ","𝓏"][index]}</span>
                <input type="range" min="-3" max="3" step="0.1" value={(which==="a"?a:b)[index]} onChange={(e) => set(which,index,Number(e.target.value))} />
                <b>{(which==="a"?a:b)[index].toFixed(1)}</b>
              </label>
            )),
          )}
          <div className="vector-live-values">
            <div><span>a×b</span><strong>({c.map((v) => v.toFixed(2)).join(", ")})</strong></div>
            <div><span>|a×b|</span><strong>{area.toFixed(3)}</strong></div>
            <div><span>(a×b)·a</span><strong>{dot3(c,a).toFixed(3)}</strong></div>
            <div><span>(a×b)·b</span><strong>{dot3(c,b).toFixed(3)}</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BoxEdges({ a, b, c }: { a: V3; b: V3; c: V3 }) {
  const o: V3 = [0,0,0];
  const ab: V3 = [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
  const ac: V3 = [a[0]+c[0],a[1]+c[1],a[2]+c[2]];
  const bc: V3 = [b[0]+c[0],b[1]+c[1],b[2]+c[2]];
  const abc: V3 = [a[0]+b[0]+c[0],a[1]+b[1]+c[1],a[2]+b[2]+c[2]];
  const lines: [V3,V3][] = [
    [o,a],[o,b],[o,c],[a,ab],[a,ac],[b,ab],[b,bc],[c,ac],[c,bc],[ab,abc],[ac,abc],[bc,abc],
  ];

  return <>{lines.map((line,index)=><Line key={index} points={line} color="#ffcb6b" transparent opacity={.72} />)}</>;
}

function MixedScene({ a,b,c }: { a:V3;b:V3;c:V3 }) {
  return (
    <>
      <gridHelper args={[10,10,"#30303b","#1a1a22"]} />
      <axesHelper args={[2.2]} />
      <Arrow3D vector={a} color="#ff7585" />
      <Arrow3D vector={b} color="#58dca2" />
      <Arrow3D vector={c} color="#7f8cff" />
      <BoxEdges a={a} b={b} c={c} />
      <OrbitControls makeDefault enableDamping dampingFactor={.08} />
    </>
  );
}

function MixedProductLab() {
  const a: V3 = [2.2,0,0];
  const b: V3 = [.6,1.8,0];
  const [c,setC] = useState<V3>([.4,.5,1.6]);
  const mixed = dot3(a,cross(b,c));

  return (
    <section className="vector-visual vector-3d-lab mixed-product-lab">
      <header>
        <div className="eyebrow">СМЕШАННОЕ ПРОИЗВЕДЕНИЕ / ОБЪЁМ</div>
        <h2>Число превращается в объём параллелепипеда.</h2>
        <p>Когда c попадает в плоскость a и b, объём исчезает и смешанное произведение становится нулём.</p>
      </header>

      <div className="vector-visual-grid">
        <div className="vector-stage vector-stage-3d">
          <Canvas camera={{ position:[5,4,5], fov:48 }} dpr={[1,1.5]}>
            <MixedScene a={a} b={b} c={c} />
          </Canvas>
          <div className={"mixed-volume-badge " + (Math.abs(mixed)<0.03 ? "flat" : "")}>
            <span>(a,b,c)</span>
            <strong>{mixed.toFixed(3)}</strong>
            <small>{Math.abs(mixed)<0.03 ? "компланарность: объём 0" : "ориентированный объём"}</small>
          </div>
        </div>

        <div className="vector-controls">
          {[0,1,2].map((index)=>(
            <label key={index}>
              <span>c{["ₓ","ᵧ","𝓏"][index]}</span>
              <input type="range" min="-2.5" max="2.5" step="0.05" value={c[index]} onChange={(e)=>{
                const next=[...c] as V3; next[index]=Number(e.target.value); setC(next);
              }} />
              <b>{c[index].toFixed(2)}</b>
            </label>
          ))}
          <button className="vector-preset-button" onClick={()=>setC([1.1,.7,0])}>Сделать c компланарным</button>
          <button className="vector-preset-button" onClick={()=>setC([.4,.5,1.6])}>Вернуть объём</button>
          <div className="vector-live-values">
            <div><span>(a,b,c)</span><strong>{mixed.toFixed(3)}</strong></div>
            <div><span>V</span><strong>{Math.abs(mixed).toFixed(3)}</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VectorVisualInsert({ topicId, index }: { topicId: string; index: number }) {
  if (topicId === "vectors" && index === 1) return <VectorBasicsLab />;
  if (topicId === "vectors" && index === 6) return <DependenceBasisLab />;
  if (topicId === "vectors" && index === 10) return <CoordinatesLab />;
  if (topicId === "vectors" && index === 13) return <BasisChangeLab />;
  if (topicId === "dot-product" && index === 2) return <DotProductLab />;
  if (topicId === "cross-product" && index === 3) return <CrossProductLab />;
  if (topicId === "mixed-product" && index === 2) return <MixedProductLab />;
  return null;
}
