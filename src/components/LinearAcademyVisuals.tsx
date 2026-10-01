import { useMemo, useState } from "react";
import "../styles/linear-academy.css";

type Props = { topicId: string; index: number };

const MATRIX_TOPICS = new Set([
  "matrices","determinants","inverse-rank","linear-systems",
  "linear-transformations","linear-maps","eigenproblem",
  "quadratic-forms","jordan-form","euclidean-operators",
]);
const VECTOR_TOPICS = new Set([
  "vectors","dot-product","cross-product","mixed-product",
  "plane-coordinates","plane-lines","linear-functionals","euclidean-functions",
]);
const SUBSPACE_TOPICS = new Set([
  "linear-spaces","subspaces","euclidean-spaces","unitary-spaces","affine-spaces",
]);
const CONIC_TOPICS = new Set([
  "conics","quadrics","quadric-invariants",
]);
const TRANSFORM_TOPICS = new Set([
  "mappings-transformations","affine-transformations",
]);
const TENSOR_TOPICS = new Set([
  "tensor-linear","tensor-euclidean","exterior-algebra",
]);

const W = 620;
const H = 330;
const CX = W / 2;
const CY = H / 2;

function p(x: number, y: number) {
  return { x: CX + x * 54, y: CY - y * 54 };
}

function arrowPath(x: number, y: number) {
  const q = p(x, y);
  return `M ${CX} ${CY} L ${q.x} ${q.y}`;
}

function MatrixOperatorLab({ topicId }: { topicId: string }) {
  const [a, setA] = useState(1.25);
  const [b, setB] = useState(0.65);
  const [c, setC] = useState(-0.25);
  const [d, setD] = useState(1.05);

  const det = a * d - b * c;
  const trace = a + d;
  const discr = trace * trace - 4 * det;
  const rank = Math.abs(det) < 0.03 ? 1 : 2;

  const transform = (x: number, y: number) => p(a * x + b * y, c * x + d * y);
  const e1 = transform(1, 0);
  const e2 = transform(0, 1);
  const poly = [
    transform(0, 0),
    transform(1, 0),
    transform(1, 1),
    transform(0, 1),
  ].map((q) => `${q.x},${q.y}`).join(" ");

  const grid = useMemo(
    () => Array.from({ length: 9 }, (_, i) => -2 + i * 0.5),
    [],
  );

  return (
    <section className="academy-lab">
      <header>
        <div className="eyebrow">ACADEMY LAB / LINEAR OPERATOR</div>
        <h2>Матрица действует на всю геометрию сразу.</h2>
        <p>
          Меняй коэффициенты A. Сетка, базис и единичный квадрат показывают
          determinant, rank и направление деформации без вычислительной магии.
        </p>
      </header>

      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <g className="academy-grid">
              {grid.map((v) => {
                const x1 = transform(v, -2);
                const x2 = transform(v, 2);
                const y1 = transform(-2, v);
                const y2 = transform(2, v);
                return (
                  <g key={v}>
                    <line x1={x1.x} y1={x1.y} x2={x2.x} y2={x2.y} />
                    <line x1={y1.x} y1={y1.y} x2={y2.x} y2={y2.y} />
                  </g>
                );
              })}
            </g>
            <line className="academy-axis" x1="18" y1={CY} x2={W - 18} y2={CY} />
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H - 18} />
            <polygon className="academy-area" points={poly} />
            <line className="academy-e1" x1={CX} y1={CY} x2={e1.x} y2={e1.y} />
            <line className="academy-e2" x1={CX} y1={CY} x2={e2.x} y2={e2.y} />
            <circle className="academy-origin" cx={CX} cy={CY} r="4" />
          </svg>
          <div className="academy-stage-badges">
            <span>det A = {det.toFixed(3)}</span>
            <span>rank ≈ {rank}</span>
            <span>tr A = {trace.toFixed(3)}</span>
            <span>{discr >= 0 ? "real eigen-directions possible" : "complex spectrum"}</span>
          </div>
        </div>

        <aside className="academy-controls">
          {[
            ["a", a, setA],
            ["b", b, setB],
            ["c", c, setC],
            ["d", d, setD],
          ].map(([label, value, setter]) => (
            <label key={label as string}>
              <span>{label as string}</span>
              <input
                type="range"
                min="-2"
                max="2"
                step=".05"
                value={value as number}
                onChange={(event) => (setter as (n: number) => void)(Number(event.target.value))}
              />
              <b>{(value as number).toFixed(2)}</b>
            </label>
          ))}

          <div className="academy-equation">
            <span>MATRIX</span>
            <strong>
              [{a.toFixed(2)} {b.toFixed(2)}; {c.toFixed(2)} {d.toFixed(2)}]
            </strong>
            <small>{topicId === "eigenproblem" ? "следи за неизменными направлениями" : "столбцы = образы e₁,e₂"}</small>
          </div>
        </aside>
      </div>
    </section>
  );
}

function VectorProjectionLab({ topicId }: { topicId: string }) {
  const [vx, setVx] = useState(1.65);
  const [vy, setVy] = useState(1.05);
  const [ax, setAx] = useState(1.3);
  const [ay, setAy] = useState(-0.2);

  const aa = ax * ax + ay * ay;
  const coeff = aa < 1e-6 ? 0 : (vx * ax + vy * ay) / aa;
  const px = coeff * ax;
  const py = coeff * ay;
  const rx = vx - px;
  const ry = vy - py;
  const dot = vx * ax + vy * ay;
  const area = vx * ay - vy * ax;

  const v = p(vx, vy);
  const a = p(ax, ay);
  const proj = p(px, py);

  return (
    <section className="academy-lab">
      <header>
        <div className="eyebrow">ACADEMY LAB / VECTOR GEOMETRY</div>
        <h2>Dot, projection и oriented area на одной сцене.</h2>
        <p>
          Вектор v раскладывается на компоненту вдоль a и ортогональный остаток.
          В 2D signed area играет роль z-компоненты cross product.
        </p>
      </header>

      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W - 18} y2={CY} />
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H - 18} />
            <line className="academy-vector-a" d="" x1={CX} y1={CY} x2={a.x} y2={a.y} />
            <path className="academy-vector-v" d={arrowPath(vx, vy)} />
            <path className="academy-vector-proj" d={arrowPath(px, py)} />
            <line className="academy-residual" x1={proj.x} y1={proj.y} x2={v.x} y2={v.y} />
            <polygon
              className="academy-parallelogram"
              points={[
                p(0,0), p(vx,vy), p(vx+ax,vy+ay), p(ax,ay)
              ].map(q => q.x + "," + q.y).join(" ")}
            />
            <circle className="academy-origin" cx={CX} cy={CY} r="4" />
          </svg>
          <div className="academy-stage-badges">
            <span>v·a = {dot.toFixed(3)}</span>
            <span>signed area = {area.toFixed(3)}</span>
            <span>||residual|| = {Math.hypot(rx, ry).toFixed(3)}</span>
            <span>{topicId}</span>
          </div>
        </div>

        <aside className="academy-controls">
          {[
            ["vₓ", vx, setVx], ["vᵧ", vy, setVy],
            ["aₓ", ax, setAx], ["aᵧ", ay, setAy],
          ].map(([label, value, setter]) => (
            <label key={label as string}>
              <span>{label as string}</span>
              <input
                type="range" min="-2.4" max="2.4" step=".05"
                value={value as number}
                onChange={(e) => (setter as (n:number)=>void)(Number(e.target.value))}
              />
              <b>{(value as number).toFixed(2)}</b>
            </label>
          ))}
          <div className="academy-equation">
            <span>PROJECTION</span>
            <strong>projₐv = ({px.toFixed(2)}, {py.toFixed(2)})</strong>
            <small>v = projₐv + r, где r ⟂ a</small>
          </div>
        </aside>
      </div>
    </section>
  );
}

function SubspaceLab({ topicId }: { topicId: string }) {
  const [angle, setAngle] = useState(25);
  const [offset, setOffset] = useState(topicId === "affine-spaces" ? 0.8 : 0);
  const rad = (angle * Math.PI) / 180;
  const ux = Math.cos(rad);
  const uy = Math.sin(rad);
  const nx = -uy;
  const ny = ux;
  const target = { x: 1.4, y: 1.35 };
  const signed = target.x * nx + target.y * ny - offset;
  const proj = {
    x: target.x - signed * nx,
    y: target.y - signed * ny,
  };
  const p1 = p(-3 * ux + offset * nx, -3 * uy + offset * ny);
  const p2 = p(3 * ux + offset * nx, 3 * uy + offset * ny);
  const q = p(target.x, target.y);
  const qp = p(proj.x, proj.y);

  return (
    <section className="academy-lab">
      <header>
        <div className="eyebrow">ACADEMY LAB / SUBSPACE + PROJECTION</div>
        <h2>{topicId === "affine-spaces" ? "Линейное подпространство и его аффинный сдвиг." : "Подпространство как геометрия допустимых направлений."}</h2>
        <p>
          Меняй направление. Точка раскладывается на проекцию и ортогональный остаток;
          для affine-space добавляется независимый сдвиг от начала координат.
        </p>
      </header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W - 18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H - 18}/>
            <line className="academy-subspace" x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}/>
            <line className="academy-residual" x1={q.x} y1={q.y} x2={qp.x} y2={qp.y}/>
            <circle className="academy-point" cx={q.x} cy={q.y} r="6"/>
            <circle className="academy-projection-point" cx={qp.x} cy={qp.y} r="5"/>
          </svg>
          <div className="academy-stage-badges">
            <span>angle = {angle}°</span>
            <span>distance = {Math.abs(signed).toFixed(3)}</span>
            <span>{topicId === "affine-spaces" ? "affine translate" : "linear through 0"}</span>
          </div>
        </div>
        <aside className="academy-controls">
          <label>
            <span>angle</span>
            <input type="range" min="-80" max="80" step="1" value={angle} onChange={(e)=>setAngle(Number(e.target.value))}/>
            <b>{angle}°</b>
          </label>
          {topicId === "affine-spaces" && (
            <label>
              <span>offset</span>
              <input type="range" min="-1.6" max="1.6" step=".05" value={offset} onChange={(e)=>setOffset(Number(e.target.value))}/>
              <b>{offset.toFixed(2)}</b>
            </label>
          )}
          <div className="academy-equation">
            <span>DECOMPOSITION</span>
            <strong>x = P_Ux + r</strong>
            <small>r ортогонален направляющему пространству</small>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ConicLab({ topicId }: { topicId: string }) {
  const [a, setA] = useState(1.7);
  const [b, setB] = useState(1.05);
  const [mode, setMode] = useState<"ellipse"|"hyperbola">(
    topicId === "quadrics" ? "hyperbola" : "ellipse",
  );

  const points = Array.from({ length: 181 }, (_, i) => {
    const t = (i / 180) * Math.PI * 2;
    if (mode === "ellipse") return p(a * Math.cos(t), b * Math.sin(t));
    const u = -1.6 + (i / 180) * 3.2;
    const x = a * Math.cosh(u);
    const y = b * Math.sinh(u);
    return p(x, y);
  });
  const second = mode === "hyperbola"
    ? points.map(q => ({x:2*CX-q.x,y:q.y}))
    : [];
  const path = (arr:{x:number;y:number}[]) => arr.map((q,i)=>(i?"L":"M")+q.x+" "+q.y).join(" ");
  const c = mode === "ellipse"
    ? Math.sqrt(Math.max(0, a*a-b*b))
    : Math.sqrt(a*a+b*b);

  return (
    <section className="academy-lab">
      <header>
        <div className="eyebrow">ACADEMY LAB / QUADRATIC GEOMETRY</div>
        <h2>Коэффициенты формы превращаются в геометрию.</h2>
        <p>
          Полуоси и знаки квадратичных членов определяют фокусы, эксцентриситет
          и тип кривой. Это 2D-сечение той же спектральной идеи, что работает для квадрик.
        </p>
      </header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W-18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H-18}/>
            <path className="academy-conic" d={path(points)}/>
            {second.length > 0 && <path className="academy-conic" d={path(second)}/>}
            <circle className="academy-focus" cx={p(c,0).x} cy={CY} r="5"/>
            <circle className="academy-focus" cx={p(-c,0).x} cy={CY} r="5"/>
          </svg>
          <div className="academy-stage-badges">
            <span>{mode}</span>
            <span>a={a.toFixed(2)}</span>
            <span>b={b.toFixed(2)}</span>
            <span>c={c.toFixed(2)}</span>
          </div>
        </div>
        <aside className="academy-controls">
          <div className="academy-toggle">
            <button className={mode==="ellipse"?"active":""} onClick={()=>setMode("ellipse")}>ellipse</button>
            <button className={mode==="hyperbola"?"active":""} onClick={()=>setMode("hyperbola")}>hyperbola</button>
          </div>
          <label><span>a</span><input type="range" min=".6" max="2.4" step=".05" value={a} onChange={e=>setA(Number(e.target.value))}/><b>{a.toFixed(2)}</b></label>
          <label><span>b</span><input type="range" min=".5" max="2" step=".05" value={b} onChange={e=>setB(Number(e.target.value))}/><b>{b.toFixed(2)}</b></label>
          <div className="academy-equation">
            <span>CANONICAL</span>
            <strong>{mode==="ellipse" ? "x²/a² + y²/b² = 1" : "x²/a² − y²/b² = 1"}</strong>
            <small>{topicId}</small>
          </div>
        </aside>
      </div>
    </section>
  );
}

function AffineTransformLab({ topicId }: { topicId: string }) {
  const [shear, setShear] = useState(.55);
  const [tx, setTx] = useState(.55);
  const [ty, setTy] = useState(-.3);
  const base = [[-1,-.7],[1,-.7],[0,1.2]] as const;
  const tr = ([x,y]: readonly [number,number]) => p(x + shear*y + tx, y + ty);
  const original = base.map(([x,y])=>p(x,y));
  const moved = base.map(tr);
  const centroid = (pts:{x:number;y:number}[]) => ({
    x: pts.reduce((s,q)=>s+q.x,0)/pts.length,
    y: pts.reduce((s,q)=>s+q.y,0)/pts.length,
  });

  return (
    <section className="academy-lab">
      <header>
        <div className="eyebrow">ACADEMY LAB / AFFINE PIPELINE</div>
        <h2>Прямые остаются прямыми, углы — не обязаны.</h2>
        <p>
          Shear + translation деформируют треугольник, но центроид остаётся
          той же барицентрической комбинацией его вершин.
        </p>
      </header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W-18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H-18}/>
            <polygon className="academy-triangle original" points={original.map(q=>q.x+","+q.y).join(" ")}/>
            <polygon className="academy-triangle transformed" points={moved.map(q=>q.x+","+q.y).join(" ")}/>
            {(() => {
              const g1=centroid(original), g2=centroid(moved);
              return <><circle className="academy-centroid" cx={g1.x} cy={g1.y} r="5"/><circle className="academy-centroid transformed" cx={g2.x} cy={g2.y} r="5"/></>;
            })()}
          </svg>
          <div className="academy-stage-badges"><span>{topicId}</span><span>parallelism preserved</span><span>centroid preserved affinely</span></div>
        </div>
        <aside className="academy-controls">
          <label><span>shear</span><input type="range" min="-1.2" max="1.2" step=".05" value={shear} onChange={e=>setShear(Number(e.target.value))}/><b>{shear.toFixed(2)}</b></label>
          <label><span>tₓ</span><input type="range" min="-1.4" max="1.4" step=".05" value={tx} onChange={e=>setTx(Number(e.target.value))}/><b>{tx.toFixed(2)}</b></label>
          <label><span>tᵧ</span><input type="range" min="-1.4" max="1.4" step=".05" value={ty} onChange={e=>setTy(Number(e.target.value))}/><b>{ty.toFixed(2)}</b></label>
        </aside>
      </div>
    </section>
  );
}

function SpacePlaneLab() {
  const [tilt, setTilt] = useState(18);
  const [line, setLine] = useState(34);
  const t = tilt * Math.PI / 180;
  const l = line * Math.PI / 180;
  const plane = [
    [CX-150,CY+60],[CX+110,CY+20],[CX+150,CY-55],[CX-105,CY-20],
  ].map(([x,y],i)=>[x,y + Math.sin(t)*(i%2?20:-20)]);
  const x1=CX-150*Math.cos(l), y1=CY+110*Math.sin(l);
  const x2=CX+150*Math.cos(l), y2=CY-110*Math.sin(l);

  return (
    <section className="academy-lab">
      <header>
        <div className="eyebrow">ACADEMY LAB / ℝ³ INCIDENCE</div>
        <h2>Прямая, плоскость и общая нормаль.</h2>
        <p>Сцена связывает параметрическое направление прямой, нормаль плоскости и формулы углов/расстояний.</p>
      </header>
      <div className="academy-layout">
        <div className="academy-stage academy-space-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <polygon className="academy-plane" points={plane.map(q=>q.join(",")).join(" ")}/>
            <line className="academy-space-line" x1={x1} y1={y1} x2={x2} y2={y2}/>
            <line className="academy-normal" x1={CX} y1={CY} x2={CX+45*Math.sin(t)} y2={CY-100*Math.cos(t)}/>
            <circle className="academy-origin" cx={CX} cy={CY} r="5"/>
          </svg>
          <div className="academy-stage-badges"><span>plane normal n</span><span>direction s</span><span>angle controlled by n·s</span></div>
        </div>
        <aside className="academy-controls">
          <label><span>plane</span><input type="range" min="-45" max="45" step="1" value={tilt} onChange={e=>setTilt(Number(e.target.value))}/><b>{tilt}°</b></label>
          <label><span>line</span><input type="range" min="-70" max="70" step="1" value={line} onChange={e=>setLine(Number(e.target.value))}/><b>{line}°</b></label>
          <div className="academy-equation"><span>ANGLE</span><strong>sin α = |s·n|/(||s||||n||)</strong><small>distance of skew lines uses common normal a×b</small></div>
        </aside>
      </div>
    </section>
  );
}

function TensorLab({ topicId }: { topicId: string }) {
  const [theta, setTheta] = useState(24);
  const r = theta * Math.PI / 180;
  const e1 = p(Math.cos(r), Math.sin(r));
  const e2 = p(-Math.sin(r), Math.cos(r));
  const wedge = Math.cos(r)*Math.cos(r) - (-Math.sin(r))*Math.sin(r);

  return (
    <section className="academy-lab">
      <header>
        <div className="eyebrow">ACADEMY LAB / TENSOR + BASIS</div>
        <h2>Объект остаётся, компоненты меняются.</h2>
        <p>
          Поворачивай базис. Вектор, ковектор и tensor-компоненты трансформируются
          по разным законам; ориентированная площадь wedge меняет координаты, но не геометрический объект.
        </p>
      </header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W-18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H-18}/>
            <line className="academy-e1" x1={CX} y1={CY} x2={e1.x} y2={e1.y}/>
            <line className="academy-e2" x1={CX} y1={CY} x2={e2.x} y2={e2.y}/>
            <polygon className="academy-area" points={[p(0,0),e1,p(Math.cos(r)-Math.sin(r),Math.sin(r)+Math.cos(r)),e2].map(q=>q.x+","+q.y).join(" ")}/>
          </svg>
          <div className="academy-stage-badges"><span>{topicId}</span><span>basis angle {theta}°</span><span>oriented area {wedge.toFixed(2)}</span></div>
        </div>
        <aside className="academy-controls">
          <label><span>basis</span><input type="range" min="-80" max="80" step="1" value={theta} onChange={e=>setTheta(Number(e.target.value))}/><b>{theta}°</b></label>
          <div className="academy-equation"><span>INDEX LOGIC</span><strong>upper ↔ inverse basis</strong><small>lower ↔ direct basis · metric couples both</small></div>
        </aside>
      </div>
    </section>
  );
}

export function LinearAcademyVisualInsert({ topicId }: Props) {
  if (MATRIX_TOPICS.has(topicId)) return <MatrixOperatorLab topicId={topicId} />;
  if (VECTOR_TOPICS.has(topicId)) return <VectorProjectionLab topicId={topicId} />;
  if (SUBSPACE_TOPICS.has(topicId)) return <SubspaceLab topicId={topicId} />;
  if (CONIC_TOPICS.has(topicId)) return <ConicLab topicId={topicId} />;
  if (TRANSFORM_TOPICS.has(topicId)) return <AffineTransformLab topicId={topicId} />;
  if (topicId === "space-lines-planes") return <SpacePlaneLab />;
  if (TENSOR_TOPICS.has(topicId)) return <TensorLab topicId={topicId} />;
  return <MatrixOperatorLab topicId={topicId} />;
}
