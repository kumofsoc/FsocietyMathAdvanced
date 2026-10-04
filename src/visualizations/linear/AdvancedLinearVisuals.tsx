import { useMemo, useState } from "react";

type V2 = [number, number];
type M2 = [[number, number], [number, number]];

const CX = 240;
const CY = 180;
const SCALE = 45;

function screen([x, y]: V2): V2 {
  return [CX + x * SCALE, CY - y * SCALE];
}

function dot(a: V2, b: V2) {
  return a[0] * b[0] + a[1] * b[1];
}

function len(v: V2) {
  return Math.hypot(v[0], v[1]);
}

function normalize(v: V2): V2 {
  const n = len(v);
  return n < 1e-9 ? [1, 0] : [v[0] / n, v[1] / n];
}

function add(a: V2, b: V2): V2 {
  return [a[0] + b[0], a[1] + b[1]];
}

function scale(v: V2, k: number): V2 {
  return [v[0] * k, v[1] * k];
}

function rotation(deg: number): M2 {
  const a = deg * Math.PI / 180;
  return [[Math.cos(a), -Math.sin(a)], [Math.sin(a), Math.cos(a)]];
}

function transpose(A: M2): M2 {
  return [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];
}

function mul(A: M2, B: M2): M2 {
  return [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ];
}

function apply(A: M2, p: V2): V2 {
  return [A[0][0] * p[0] + A[0][1] * p[1], A[1][0] * p[0] + A[1][1] * p[1]];
}

function Axes({ cx = CX, cy = CY, width = 440, height = 320 }: { cx?: number; cy?: number; width?: number; height?: number }) {
  return (
    <g className="advanced-axes">
      <line x1={cx - width / 2} y1={cy} x2={cx + width / 2} y2={cy} />
      <line x1={cx} y1={cy - height / 2} x2={cx} y2={cy + height / 2} />
    </g>
  );
}

function Arrow({ vector, origin = [0, 0], className, label }: { vector: V2; origin?: V2; className: string; label: string }) {
  const a = screen(origin);
  const b = screen(add(origin, vector));
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  return (
    <g className={className}>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
      <polygon points="-9,-4 0,0 -9,4" transform={"translate(" + b[0] + " " + b[1] + ") rotate(" + angle + ")"} />
      <text x={b[0] + 8} y={b[1] - 8}>{label}</text>
    </g>
  );
}

function Matrix2({ A, title }: { A: M2; title: string }) {
  return (
    <div className="advanced-matrix">
      <span>{title}</span>
      <div>
        <b>{A[0][0].toFixed(2)}</b><b>{A[0][1].toFixed(2)}</b>
        <b>{A[1][0].toFixed(2)}</b><b>{A[1][1].toFixed(2)}</b>
      </div>
    </div>
  );
}

function JordanChainLab() {
  const [size, setSize] = useState(3);
  const [lambda, setLambda] = useState(2);
  const [power, setPower] = useState(1);
  const k = Math.min(power, size);

  return (
    <section className="advanced-lab jordan-lab">
      <header>
        <div className="eyebrow">ВИЗУАЛИЗАЦИЯ / ЖОРДАНОВА ЦЕПОЧКА</div>
        <h2>Недостающие собственные векторы заменяются присоединёнными.</h2>
        <p>
          Для одной клетки Jₘ(λ) оператор N=A−λI нильпотентен. Он сдвигает
          цепочку на один шаг к собственному вектору и в конце отправляет его в 0.
        </p>
      </header>

      <div className="jordan-layout">
        <div className="jordan-stage">
          <div className="jordan-chain">
            {Array.from({ length: size }, (_, i) => size - i).map((index) => (
              <div className="jordan-chain-fragment" key={index}>
                <div className={"jordan-node " + (index === 1 ? "eigen" : "")}>
                  <small>{index === 1 ? "СОБСТВЕННЫЙ" : "ПРИСОЕДИНЁННЫЙ"}</small>
                  <strong>e{index}</strong>
                  <span>height {index}</span>
                </div>
                <div className="jordan-arrow">
                  <b>N</b>
                  <i>→</i>
                </div>
              </div>
            ))}
            <div className="jordan-node zero">
              <small>НУЛЬ</small>
              <strong>0</strong>
            </div>
          </div>

          <div className="jordan-kernel-growth">
            {Array.from({ length: size }, (_, i) => i + 1).map((index) => (
              <div key={index} className={index <= k ? "active" : ""}>
                <span>Ker N^{index}</span>
                <strong>dim = {Math.min(index, size)}</strong>
              </div>
            ))}
          </div>
        </div>

        <aside className="advanced-controls">
          <label>
            <span>размер клетки m</span>
            <input type="range" min="2" max="5" step="1" value={size} onChange={(e) => { const v = Number(e.target.value); setSize(v); setPower((p) => Math.min(p, v)); }} />
            <b>{size}</b>
          </label>
          <label>
            <span>λ</span>
            <input type="range" min="-3" max="3" step=".25" value={lambda} onChange={(e) => setLambda(Number(e.target.value))} />
            <b>{lambda.toFixed(2)}</b>
          </label>
          <label>
            <span>степень Nᵏ</span>
            <input type="range" min="1" max={size} step="1" value={power} onChange={(e) => setPower(Number(e.target.value))} />
            <b>{power}</b>
          </label>

          <div className="jordan-matrix">
            <span>Jₘ(λ)</span>
            <div className="jordan-matrix-grid" style={{ gridTemplateColumns: "repeat(" + size + ", 1fr)" }}>
              {Array.from({ length: size * size }, (_, idx) => {
                const row = Math.floor(idx / size);
                const col = idx % size;
                const value = row === col ? lambda : col === row + 1 ? 1 : 0;
                return <b key={idx} className={value === 1 && row !== col ? "superdiag" : row === col ? "diag" : ""}>{value}</b>;
              })}
            </div>
          </div>

          <div className="advanced-readout">
            <div><span>алгебраическая кратность λ</span><strong>{size}</strong></div>
            <div><span>геометрическая кратность λ</span><strong>1</strong></div>
            <div><span>dim Ker N^{power}</span><strong>{Math.min(power, size)}</strong></div>
            <div><span>N^{size}</span><strong>= 0</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function GramSchmidtLab() {
  const [angle, setAngle] = useState(54);
  const [length2, setLength2] = useState(2.15);
  const f1: V2 = [2.2, .7];
  const rad = angle * Math.PI / 180;
  const f2: V2 = [length2 * Math.cos(rad), length2 * Math.sin(rad)];

  const q1 = normalize(f1);
  const r11 = len(f1);
  const r12 = dot(q1, f2);
  const proj = scale(q1, r12);
  const h2 = [f2[0] - proj[0], f2[1] - proj[1]] as V2;
  const r22 = len(h2);
  const q2 = normalize(h2);
  const Q: M2 = [[q1[0], q2[0]], [q1[1], q2[1]]];
  const R: M2 = [[r11, r12], [0, r22]];

  return (
    <section className="advanced-lab gram-lab">
      <header>
        <div className="eyebrow">GRAM–SCHMIDT / QR</div>
        <h2>Вычти проекцию — получишь новое ортогональное направление.</h2>
        <p>Смотри одновременно геометрию алгоритма и матричное разложение A=QR.</p>
      </header>

      <div className="advanced-layout">
        <div className="advanced-stage">
          <svg viewBox="0 0 480 360">
            <Axes />
            <Arrow vector={f1} className="advanced-vector-a" label="f₁" />
            <Arrow vector={f2} className="advanced-vector-b" label="f₂" />
            <Arrow vector={proj} className="advanced-projection" label="proj₍f₁₎ f₂" />
            <Arrow vector={h2} origin={proj} className="advanced-orthogonal" label="h₂" />
            <line
              className="advanced-right-angle"
              x1={screen(proj)[0] - 6 * q1[0]}
              y1={screen(proj)[1] + 6 * q1[1]}
              x2={screen(proj)[0] - 6 * q1[0] + 8 * q2[0]}
              y2={screen(proj)[1] + 6 * q1[1] - 8 * q2[1]}
            />
          </svg>
          <div className="advanced-stage-badges">
            <span>h₁·h₂ = {dot(f1, h2).toFixed(4)}</span>
            <span>q₁·q₂ = {dot(q1, q2).toFixed(4)}</span>
            <span>det Q = {(Q[0][0] * Q[1][1] - Q[0][1] * Q[1][0]).toFixed(3)}</span>
          </div>
        </div>

        <aside className="advanced-controls">
          <label><span>угол f₂</span><input type="range" min="8" max="172" step="1" value={angle} onChange={(e) => setAngle(Number(e.target.value))}/><b>{angle}°</b></label>
          <label><span>|f₂|</span><input type="range" min=".6" max="3" step=".05" value={length2} onChange={(e) => setLength2(Number(e.target.value))}/><b>{length2.toFixed(2)}</b></label>

          <div className="advanced-matrices-row">
            <Matrix2 A={Q} title="Q" />
            <Matrix2 A={R} title="R" />
          </div>

          <div className="advanced-readout">
            <div><span>h₁</span><strong>f₁</strong></div>
            <div><span>h₂</span><strong>f₂ − proj f₂</strong></div>
            <div><span>QᵀQ</span><strong>≈ I</strong></div>
            <div><span>A</span><strong>= QR</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ellipsePoints(A: M2, radius = 1.55, count = 121) {
  return Array.from({ length: count }, (_, i): V2 => {
    const t = i / (count - 1) * Math.PI * 2;
    return apply(A, [radius * Math.cos(t), radius * Math.sin(t)]);
  });
}

function pointsAttr(points: V2[]) {
  return points.map(screen).map((p) => p.join(",")).join(" ");
}

function SvdPolarLab() {
  const [thetaIn, setThetaIn] = useState(28);
  const [thetaOut, setThetaOut] = useState(-22);
  const [s1, setS1] = useState(2);
  const [s2, setS2] = useState(.65);

  const Q = rotation(thetaIn);
  const P = rotation(thetaOut);
  const D: M2 = [[s1, 0], [0, s2]];
  const A = useMemo(() => mul(mul(P, D), transpose(Q)), [thetaIn, thetaOut, s1, s2]);
  const U = useMemo(() => mul(P, transpose(Q)), [thetaIn, thetaOut]);
  const S = useMemo(() => mul(mul(Q, D), transpose(Q)), [thetaIn, s1, s2]);

  const circle = ellipsePoints([[1,0],[0,1]]);
  const afterD = ellipsePoints(D);
  const final = ellipsePoints(A);
  const polarStretch = ellipsePoints(S);

  return (
    <section className="advanced-lab svd-lab">
      <header>
        <div className="eyebrow">SVD / POLAR DECOMPOSITION</div>
        <h2>Любое растяжение можно разложить на ортогональные направления, независимые масштабы и поворот.</h2>
      </header>

      <div className="advanced-layout">
        <div className="advanced-stage">
          <svg viewBox="0 0 480 360">
            <Axes />
            <polyline className="svd-circle" points={pointsAttr(circle)} />
            <polyline className="svd-after-d" points={pointsAttr(afterD)} />
            <polyline className="svd-polar-stretch" points={pointsAttr(polarStretch)} />
            <polyline className="svd-final" points={pointsAttr(final)} />
          </svg>
          <div className="svd-legend">
            <span><i className="svd-circle-dot"/>единичная окружность</span>
            <span><i className="svd-d-dot"/>D: полуоси σ₁,σ₂</span>
            <span><i className="svd-s-dot"/>S=QDQᵀ</span>
            <span><i className="svd-final-dot"/>A=PDQᵀ</span>
          </div>
        </div>

        <aside className="advanced-controls">
          <label><span>угол Q</span><input type="range" min="-180" max="180" step="1" value={thetaIn} onChange={(e)=>setThetaIn(Number(e.target.value))}/><b>{thetaIn}°</b></label>
          <label><span>σ₁</span><input type="range" min=".25" max="2.8" step=".05" value={s1} onChange={(e)=>setS1(Number(e.target.value))}/><b>{s1.toFixed(2)}</b></label>
          <label><span>σ₂</span><input type="range" min=".25" max="2.8" step=".05" value={s2} onChange={(e)=>setS2(Number(e.target.value))}/><b>{s2.toFixed(2)}</b></label>
          <label><span>угол P</span><input type="range" min="-180" max="180" step="1" value={thetaOut} onChange={(e)=>setThetaOut(Number(e.target.value))}/><b>{thetaOut}°</b></label>

          <div className="svd-pipeline">
            <div><span>Qᵀ</span><strong>выбрать входные сингулярные направления</strong></div>
            <i>→</i>
            <div><span>D</span><strong>растянуть на σ₁ и σ₂</strong></div>
            <i>→</i>
            <div><span>P</span><strong>повернуть выход</strong></div>
          </div>

          <div className="advanced-readout">
            <div><span>SVD</span><strong>A = P D Qᵀ</strong></div>
            <div><span>polar</span><strong>A = U S</strong></div>
            <div><span>U angle</span><strong>{(thetaOut-thetaIn)}°</strong></div>
            <div><span>max stretch</span><strong>{Math.max(s1,s2).toFixed(2)}</strong></div>
            <div><span>min stretch</span><strong>{Math.min(s1,s2).toFixed(2)}</strong></div>
          </div>

          <details className="advanced-details">
            <summary>Матрицы A, U и S</summary>
            <div className="advanced-matrices-stack">
              <Matrix2 A={A} title="A" />
              <Matrix2 A={U} title="U" />
              <Matrix2 A={S} title="S" />
            </div>
          </details>
        </aside>
      </div>
    </section>
  );
}

function UnitaryPhaseLab() {
  const [phase, setPhase] = useState(70);
  const [radius, setRadius] = useState(2);
  const [arg, setArg] = useState(25);
  const zAngle = arg * Math.PI / 180;
  const wAngle = (arg + phase) * Math.PI / 180;
  const z: V2 = [radius * Math.cos(zAngle), radius * Math.sin(zAngle)];
  const w: V2 = [radius * Math.cos(wAngle), radius * Math.sin(wAngle)];

  return (
    <section className="advanced-lab unitary-lab">
      <header>
        <div className="eyebrow">UNITARY / COMPLEX PHASE</div>
        <h2>Умножение на число модуля 1 меняет фазу, но не длину.</h2>
        <p>Это одномерная комплексная модель унитарного преобразования.</p>
      </header>
      <div className="advanced-layout">
        <div className="advanced-stage">
          <svg viewBox="0 0 480 360">
            <Axes />
            <circle className="unitary-circle" cx={CX} cy={CY} r={radius*SCALE}/>
            <Arrow vector={z} className="advanced-vector-a" label="z"/>
            <Arrow vector={w} className="advanced-vector-b" label="Uz"/>
            <path
              className="unitary-phase-arc"
              d={"M " + screen(scale(normalize(z),.85))[0] + " " + screen(scale(normalize(z),.85))[1] +
                " A " + (.85*SCALE) + " " + (.85*SCALE) + " 0 0 " + (phase>=0?0:1) + " " +
                screen(scale(normalize(w),.85))[0] + " " + screen(scale(normalize(w),.85))[1]}
            />
          </svg>
          <div className="advanced-stage-badges">
            <span>|z|={radius.toFixed(2)}</span>
            <span>|Uz|={radius.toFixed(2)}</span>
            <span>|det U|=1</span>
          </div>
        </div>
        <aside className="advanced-controls">
          <label><span>arg z</span><input type="range" min="-180" max="180" step="1" value={arg} onChange={(e)=>setArg(Number(e.target.value))}/><b>{arg}°</b></label>
          <label><span>phase U</span><input type="range" min="-180" max="180" step="1" value={phase} onChange={(e)=>setPhase(Number(e.target.value))}/><b>{phase}°</b></label>
          <label><span>|z|</span><input type="range" min=".5" max="3" step=".05" value={radius} onChange={(e)=>setRadius(Number(e.target.value))}/><b>{radius.toFixed(2)}</b></label>
          <div className="characteristic-box">
            <span>УНИТАРНЫЙ МНОЖИТЕЛЬ</span>
            <code>U = e^(i·{phase}°)</code>
          </div>
          <div className="advanced-readout">
            <div><span>норма</span><strong>сохраняется</strong></div>
            <div><span>собственное значение</span><strong>|λ|=1</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function AdvancedLinearVisualInsert({ topicId, index }: { topicId: string; index: number }) {
  if (topicId === "jordan-form" && index === 7) return <JordanChainLab />;
  if (topicId === "euclidean-spaces" && index === 9) return <GramSchmidtLab />;
  if (topicId === "euclidean-operators" && index === 6) return <SvdPolarLab />;
  if (topicId === "unitary-spaces" && index === 2) return <UnitaryPhaseLab />;
  return null;
}
