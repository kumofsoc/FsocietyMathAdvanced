import { useMemo, useState } from "react";
import "@/styles/linear-academy.css";

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
        <div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / ЛИНЕЙНЫЙ ОПЕРАТОР</div>
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
        <div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / ВЕКТОРНАЯ ГЕОМЕТРИЯ</div>
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
            <line className="academy-vector-a" x1={CX} y1={CY} x2={a.x} y2={a.y} />
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
            <span>ПРОЕКЦИЯ</span>
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
        <div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / ПОДПРОСТРАНСТВО И ПРОЕКЦИЯ</div>
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
        <div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / КВАДРАТИЧНАЯ ГЕОМЕТРИЯ</div>
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
        <div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / АФФИННЫЕ ПРЕОБРАЗОВАНИЯ</div>
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
        <div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / ГЕОМЕТРИЯ В ℝ³</div>
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
        <div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / ТЕНЗОРЫ И БАЗИС</div>
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



function LinearSystemGeometryLab() {
  const [m1, setM1] = useState(.7);
  const [b1, setB1] = useState(.45);
  const [m2, setM2] = useState(-.55);
  const [b2, setB2] = useState(-.2);

  const denom = m1 - m2;
  const parallel = Math.abs(denom) < .035;
  const x = parallel ? 0 : (b2 - b1) / denom;
  const y = m1 * x + b1;
  const coincident = parallel && Math.abs(b1 - b2) < .06;

  const linePoints = (m:number,b:number) => {
    const x1=-2.7,x2=2.7;
    return [p(x1,m*x1+b),p(x2,m*x2+b)];
  };
  const [a1,a2]=linePoints(m1,b1);
  const [c1,c2]=linePoints(m2,b2);
  const qi=p(x,y);

  return (
    <section className="academy-lab">
      <header>
        <div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / ГЕОМЕТРИЯ СИСТЕМ</div>
        <h2>Rank видно как геометрию пересечения ограничений.</h2>
        <p>
          Две строки системы задают две прямые. Независимые ограничения пересекаются
          в одной точке; параллельные несовместимы, совпадающие дают бесконечно много решений.
        </p>
      </header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W-18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H-18}/>
            <line className="academy-system-line one" x1={a1.x} y1={a1.y} x2={a2.x} y2={a2.y}/>
            <line className="academy-system-line two" x1={c1.x} y1={c1.y} x2={c2.x} y2={c2.y}/>
            {!parallel && Math.abs(x)<3.1 && Math.abs(y)<3.1 && <circle className="academy-intersection" cx={qi.x} cy={qi.y} r="6"/>}
          </svg>
          <div className="academy-stage-badges">
            <span>{coincident ? "∞ solutions" : parallel ? "no solution" : "unique solution"}</span>
            {!parallel && <span>x={x.toFixed(2)}, y={y.toFixed(2)}</span>}
            <span>rank logic ↔ intersection geometry</span>
          </div>
        </div>
        <aside className="academy-controls">
          <label><span>m₁</span><input type="range" min="-1.8" max="1.8" step=".05" value={m1} onChange={e=>setM1(Number(e.target.value))}/><b>{m1.toFixed(2)}</b></label>
          <label><span>b₁</span><input type="range" min="-1.5" max="1.5" step=".05" value={b1} onChange={e=>setB1(Number(e.target.value))}/><b>{b1.toFixed(2)}</b></label>
          <label><span>m₂</span><input type="range" min="-1.8" max="1.8" step=".05" value={m2} onChange={e=>setM2(Number(e.target.value))}/><b>{m2.toFixed(2)}</b></label>
          <label><span>b₂</span><input type="range" min="-1.5" max="1.5" step=".05" value={b2} onChange={e=>setB2(Number(e.target.value))}/><b>{b2.toFixed(2)}</b></label>
          <div className="academy-equation"><span>RANK TEST</span><strong>rank A = rank[A|b]</strong><small>совместность = отсутствие нового независимого ограничения от b</small></div>
        </aside>
      </div>
    </section>
  );
}

function LevelSetLab() {
  const [cx, setCx] = useState(1.2);
  const [cy, setCy] = useState(.8);
  const [radius, setRadius] = useState(1.45);
  const [theta, setTheta] = useState(45);
  const t = theta * Math.PI / 180;
  const x = cx + radius * Math.cos(t);
  const y = cy + radius * Math.sin(t);
  const point = p(x,y);
  const center = p(cx,cy);
  const grad = {x:2*(x-cx),y:2*(y-cy)};
  const gnorm=Math.max(.001,Math.hypot(grad.x,grad.y));
  const normalEnd=p(x+grad.x/gnorm*.85,y+grad.y/gnorm*.85);
  const tangent={x:-grad.y/gnorm,y:grad.x/gnorm};
  const t1=p(x-tangent.x*.95,y-tangent.y*.95);
  const t2=p(x+tangent.x*.95,y+tangent.y*.95);

  return (
    <section className="academy-lab">
      <header><div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / УРОВЕНЬ И ГРАДИЕНТ</div><h2>Неявное уравнение превращается в кривую, а ∇F — в её нормаль.</h2><p>Для F=(x−cₓ)²+(y−cᵧ)²−R²=0 выбери точку на уровне и наблюдай: касательная всегда ортогональна градиенту.</p></header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W-18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H-18}/>
            <circle className="academy-level-circle" cx={center.x} cy={center.y} r={radius*54}/>
            <line className="academy-gradient" x1={point.x} y1={point.y} x2={normalEnd.x} y2={normalEnd.y}/>
            <line className="academy-tangent" x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y}/>
            <circle className="academy-point" cx={point.x} cy={point.y} r="6"/>
          </svg>
          <div className="academy-stage-badges"><span>F=0</span><span>∇F=({grad.x.toFixed(2)}, {grad.y.toFixed(2)})</span><span>∇F·t=0</span></div>
        </div>
        <aside className="academy-controls">
          <label><span>cₓ</span><input type="range" min="-1.2" max="1.2" step=".05" value={cx} onChange={e=>setCx(Number(e.target.value))}/><b>{cx.toFixed(2)}</b></label>
          <label><span>cᵧ</span><input type="range" min="-1.2" max="1.2" step=".05" value={cy} onChange={e=>setCy(Number(e.target.value))}/><b>{cy.toFixed(2)}</b></label>
          <label><span>R</span><input type="range" min=".45" max="2.1" step=".05" value={radius} onChange={e=>setRadius(Number(e.target.value))}/><b>{radius.toFixed(2)}</b></label>
          <label><span>point</span><input type="range" min="0" max="360" step="1" value={theta} onChange={e=>setTheta(Number(e.target.value))}/><b>{theta}°</b></label>
        </aside>
      </div>
    </section>
  );
}

function LineDistanceLab() {
  const [A,setA]=useState(1.1);
  const [B,setB]=useState(.8);
  const [C,setC]=useState(-.4);
  const [px,setPx]=useState(1.4);
  const [py,setPy]=useState(1.15);
  const denom=Math.max(.001,A*A+B*B);
  const signed=(A*px+B*py+C)/Math.sqrt(denom);
  const foot={
    x:px-A*(A*px+B*py+C)/denom,
    y:py-B*(A*px+B*py+C)/denom,
  };
  const lineEndpoints=()=>{
    const x1=-2.8,x2=2.8;
    if(Math.abs(B)>.08) return [p(x1,(-A*x1-C)/B),p(x2,(-A*x2-C)/B)];
    const x=-C/(Math.abs(A)<.01?.01:A);return [p(x,-2.7),p(x,2.7)];
  };
  const [l1,l2]=lineEndpoints();
  const q=p(px,py), f=p(foot.x,foot.y);

  return (
    <section className="academy-lab">
      <header><div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / РАССТОЯНИЕ ДО ПРЯМОЙ</div><h2>Кратчайший путь к прямой всегда идёт по нормали.</h2><p>Меняй коэффициенты Ax+By+C=0 и точку P. Проекция P на прямую напрямую визуализирует формулу расстояния.</p></header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W-18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H-18}/>
            <line className="academy-main-line" x1={l1.x} y1={l1.y} x2={l2.x} y2={l2.y}/>
            <line className="academy-distance" x1={q.x} y1={q.y} x2={f.x} y2={f.y}/>
            <circle className="academy-point" cx={q.x} cy={q.y} r="6"/>
            <circle className="academy-projection-point" cx={f.x} cy={f.y} r="5"/>
          </svg>
          <div className="academy-stage-badges"><span>d={Math.abs(signed).toFixed(3)}</span><span>normal=({A.toFixed(2)},{B.toFixed(2)})</span></div>
        </div>
        <aside className="academy-controls">
          <label><span>A</span><input type="range" min="-2" max="2" step=".05" value={A} onChange={e=>setA(Number(e.target.value))}/><b>{A.toFixed(2)}</b></label>
          <label><span>B</span><input type="range" min="-2" max="2" step=".05" value={B} onChange={e=>setB(Number(e.target.value))}/><b>{B.toFixed(2)}</b></label>
          <label><span>C</span><input type="range" min="-1.5" max="1.5" step=".05" value={C} onChange={e=>setC(Number(e.target.value))}/><b>{C.toFixed(2)}</b></label>
          <label><span>Pₓ</span><input type="range" min="-2.2" max="2.2" step=".05" value={px} onChange={e=>setPx(Number(e.target.value))}/><b>{px.toFixed(2)}</b></label>
          <label><span>Pᵧ</span><input type="range" min="-2.2" max="2.2" step=".05" value={py} onChange={e=>setPy(Number(e.target.value))}/><b>{py.toFixed(2)}</b></label>
        </aside>
      </div>
    </section>
  );
}

function CrossProductLab({ volume = false }: { volume?: boolean }) {
  const [angle,setAngle]=useState(55);
  const [height,setHeight]=useState(1.15);
  const r=angle*Math.PI/180;
  const a={x:1.7,y:0};
  const b={x:1.35*Math.cos(r),y:1.35*Math.sin(r)};
  const signedArea=a.x*b.y-a.y*b.x;
  const o=p(0,0), pa=p(a.x,a.y), pb=p(b.x,b.y), pab=p(a.x+b.x,a.y+b.y);
  const lift=Math.max(24,height*44);
  const top=[o,pa,pab,pb].map(q=>({x:q.x+30,y:q.y-lift}));
  const base=[o,pa,pab,pb];

  return (
    <section className="academy-lab">
      <header><div className="eyebrow">{volume?"ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / СМЕШАННОЕ ПРОИЗВЕДЕНИЕ":"ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / ВЕКТОРНОЕ ПРОИЗВЕДЕНИЕ"}</div><h2>{volume?"Площадь основания × высота = ориентированный объём.":"a×b кодирует площадь и ориентацию одновременно."}</h2><p>{volume?"Смешанное произведение измеряет проекцию третьего направления на нормаль к основанию.":"Угол между a и b меняет площадь параллелограмма; перестановка векторов меняет знак ориентации."}</p></header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W-18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H-18}/>
            <polygon className="academy-cross-area" points={base.map(q=>q.x+","+q.y).join(" ")}/>
            <line className="academy-e1" x1={o.x} y1={o.y} x2={pa.x} y2={pa.y}/>
            <line className="academy-e2" x1={o.x} y1={o.y} x2={pb.x} y2={pb.y}/>
            {volume && <>
              <polygon className="academy-volume-top" points={top.map(q=>q.x+","+q.y).join(" ")}/>
              {base.map((q,i)=><line key={i} className="academy-volume-edge" x1={q.x} y1={q.y} x2={top[i].x} y2={top[i].y}/>)}
            </>}
          </svg>
          <div className="academy-stage-badges"><span>area={Math.abs(signedArea).toFixed(3)}</span><span>orientation={signedArea>=0?"+":"−"}</span>{volume&&<span>volume≈{(Math.abs(signedArea)*height).toFixed(3)}</span>}</div>
        </div>
        <aside className="academy-controls">
          <label><span>angle</span><input type="range" min="-170" max="170" step="1" value={angle} onChange={e=>setAngle(Number(e.target.value))}/><b>{angle}°</b></label>
          {volume&&<label><span>height</span><input type="range" min=".1" max="2.2" step=".05" value={height} onChange={e=>setHeight(Number(e.target.value))}/><b>{height.toFixed(2)}</b></label>}
          <div className="academy-equation"><span>{volume?"СМЕШАННОЕ ПРОИЗВЕДЕНИЕ":"ВЕКТОРНОЕ ПРОИЗВЕДЕНИЕ"}</span><strong>{volume?"V=|a·(b×c)|":"||a×b||=||a||||b||sinθ"}</strong><small>ноль означает вырождение соответствующего ориентированного объёма</small></div>
        </aside>
      </div>
    </section>
  );
}

function RankNullityLab() {
  const [sx, setSx] = useState(1.35);
  const [sy, setSy] = useState(0.35);
  const [angle, setAngle] = useState(22);
  const r = angle * Math.PI / 180;
  const circle = Array.from({ length: 129 }, (_, i) => {
    const t = (i / 128) * Math.PI * 2;
    const x = Math.cos(t);
    const y = Math.sin(t);
    const tx = sx * x;
    const ty = sy * y;
    return p(
      tx * Math.cos(r) - ty * Math.sin(r),
      tx * Math.sin(r) + ty * Math.cos(r),
    );
  });
  const d = circle.map((q,i)=>(i?"L":"M")+q.x+" "+q.y).join(" ");
  const numericalRank = Math.abs(sx) < .04 && Math.abs(sy) < .04 ? 0 : Math.abs(sx) < .04 || Math.abs(sy) < .04 ? 1 : 2;
  const nullity = 2 - numericalRank;

  return (
    <section className="academy-lab">
      <header>
        <div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / РАНГ И ЯДРО</div>
        <h2>Смотри, как оператор физически теряет размерность.</h2>
        <p>
          Единичная окружность превращается в эллипс, отрезок или точку.
          Rank — размерность образа, nullity — число независимых направлений, уничтоженных оператором.
        </p>
      </header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W-18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H-18}/>
            <circle className="academy-unit-circle" cx={CX} cy={CY} r="54"/>
            <path className="academy-image-ellipse" d={d}/>
            {numericalRank < 2 && <line className="academy-kernel-line" x1={CX-150*Math.cos(r)} y1={CY-150*Math.sin(r)} x2={CX+150*Math.cos(r)} y2={CY+150*Math.sin(r)}/>}
          </svg>
          <div className="academy-stage-badges">
            <span>rank = {numericalRank}</span>
            <span>nullity = {nullity}</span>
            <span>rank + nullity = 2</span>
          </div>
        </div>
        <aside className="academy-controls">
          <label><span>σ₁</span><input type="range" min="0" max="2" step=".02" value={sx} onChange={e=>setSx(Number(e.target.value))}/><b>{sx.toFixed(2)}</b></label>
          <label><span>σ₂</span><input type="range" min="0" max="2" step=".02" value={sy} onChange={e=>setSy(Number(e.target.value))}/><b>{sy.toFixed(2)}</b></label>
          <label><span>angle</span><input type="range" min="-80" max="80" step="1" value={angle} onChange={e=>setAngle(Number(e.target.value))}/><b>{angle}°</b></label>
          <div className="academy-equation"><span>THEOREM</span><strong>dim V = rank T + nullity T</strong><small>kernel = потерянные направления · image = достижимые направления</small></div>
        </aside>
      </div>
    </section>
  );
}

function EigenDynamicsLab({ jordan = false }: { jordan?: boolean }) {
  const [lambda1, setLambda1] = useState(1.35);
  const [lambda2, setLambda2] = useState(.72);
  const [steps, setSteps] = useState(4);
  const [theta, setTheta] = useState(28);
  const r = theta * Math.PI / 180;
  const rotate = (x:number,y:number,a:number) => ({
    x:x*Math.cos(a)-y*Math.sin(a),
    y:x*Math.sin(a)+y*Math.cos(a),
  });
  const apply = (x:number,y:number) => {
    if (jordan) return { x: lambda1*x + .55*y, y: lambda1*y };
    const local=rotate(x,y,-r);
    return rotate(lambda1*local.x,lambda2*local.y,r);
  };
  const trajectory=[{x:1.15,y:.82}];
  for(let i=0;i<steps;i++) trajectory.push(apply(trajectory.at(-1)!.x,trajectory.at(-1)!.y));
  const e1=rotate(1.5,0,r), e2=rotate(0,1.5,r);

  return (
    <section className="academy-lab">
      <header>
        <div className="eyebrow">{jordan ? "ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / ЖОРДАНОВА ФОРМА" : "ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / СОБСТВЕННЫЕ НАПРАВЛЕНИЯ"}</div>
        <h2>{jordan ? "Одно λ, но нильпотентная часть создаёт drift." : "Собственные направления переживают действие оператора без поворота."}</h2>
        <p>
          {jordan
            ? "Повторяй J=λI+N: даже при λ=1 координаты могут расти полиномиально из-за N."
            : "Разложи произвольный вектор по собственным направлениям: каждое масштабируется своим λ, поэтому долгосрочная динамика становится прозрачной."}
        </p>
      </header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W-18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H-18}/>
            {!jordan && <>
              <line className="academy-eigen-line one" x1={p(-e1.x,-e1.y).x} y1={p(-e1.x,-e1.y).y} x2={p(e1.x,e1.y).x} y2={p(e1.x,e1.y).y}/>
              <line className="academy-eigen-line two" x1={p(-e2.x,-e2.y).x} y1={p(-e2.x,-e2.y).y} x2={p(e2.x,e2.y).x} y2={p(e2.x,e2.y).y}/>
            </>}
            <polyline className="academy-trajectory" points={trajectory.map(q=>p(q.x,q.y)).map(q=>q.x+","+q.y).join(" ")}/>
            {trajectory.map((q,i)=><circle key={i} className={i===0?"academy-dynamic-point start":"academy-dynamic-point"} cx={p(q.x,q.y).x} cy={p(q.x,q.y).y} r={i===0?6:4}/>)}
          </svg>
          <div className="academy-stage-badges">
            <span>steps={steps}</span>
            <span>λ₁={lambda1.toFixed(2)}</span>
            {!jordan && <span>λ₂={lambda2.toFixed(2)}</span>}
            {jordan && <span>N ≠ 0</span>}
          </div>
        </div>
        <aside className="academy-controls">
          <label><span>λ₁</span><input type="range" min="-.4" max="1.7" step=".05" value={lambda1} onChange={e=>setLambda1(Number(e.target.value))}/><b>{lambda1.toFixed(2)}</b></label>
          {!jordan && <label><span>λ₂</span><input type="range" min="-.4" max="1.7" step=".05" value={lambda2} onChange={e=>setLambda2(Number(e.target.value))}/><b>{lambda2.toFixed(2)}</b></label>}
          {!jordan && <label><span>basis</span><input type="range" min="-80" max="80" step="1" value={theta} onChange={e=>setTheta(Number(e.target.value))}/><b>{theta}°</b></label>}
          <label><span>n</span><input type="range" min="1" max="9" step="1" value={steps} onChange={e=>setSteps(Number(e.target.value))}/><b>{steps}</b></label>
        </aside>
      </div>
    </section>
  );
}

function GramSchmidtLab() {
  const [bx, setBx] = useState(.65);
  const [by, setBy] = useState(1.55);
  const a={x:1.45,y:.45};
  const aa=a.x*a.x+a.y*a.y;
  const coeff=(bx*a.x+by*a.y)/aa;
  const proj={x:coeff*a.x,y:coeff*a.y};
  const orth={x:bx-proj.x,y:by-proj.y};
  const pa=p(a.x,a.y), pb=p(bx,by), pp=p(proj.x,proj.y), po=p(orth.x,orth.y);

  return (
    <section className="academy-lab">
      <header><div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / ГРАМ — ШМИДТ</div><h2>Ортогональный базис строится вычитанием уже объяснённых направлений.</h2><p>b раскладывается на проекцию вдоль a и новый компонент u₂⊥a. Нормирование превращает их в ортонормированный базис и напрямую ведёт к QR.</p></header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W-18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H-18}/>
            <line className="academy-vector-a" x1={CX} y1={CY} x2={pa.x} y2={pa.y}/>
            <line className="academy-vector-v" x1={CX} y1={CY} x2={pb.x} y2={pb.y}/>
            <line className="academy-vector-proj" x1={CX} y1={CY} x2={pp.x} y2={pp.y}/>
            <line className="academy-residual" x1={pp.x} y1={pp.y} x2={pb.x} y2={pb.y}/>
            <line className="academy-e2" x1={CX} y1={CY} x2={po.x} y2={po.y}/>
          </svg>
          <div className="academy-stage-badges"><span>proj coefficient={coeff.toFixed(3)}</span><span>a·u₂={(a.x*orth.x+a.y*orth.y).toFixed(3)}</span><span>||u₂||={Math.hypot(orth.x,orth.y).toFixed(3)}</span></div>
        </div>
        <aside className="academy-controls">
          <label><span>bₓ</span><input type="range" min="-2" max="2" step=".05" value={bx} onChange={e=>setBx(Number(e.target.value))}/><b>{bx.toFixed(2)}</b></label>
          <label><span>bᵧ</span><input type="range" min="-2" max="2" step=".05" value={by} onChange={e=>setBy(Number(e.target.value))}/><b>{by.toFixed(2)}</b></label>
          <div className="academy-equation"><span>STEP</span><strong>u₂ = b − projₐb</strong><small>после нормирования q₁,q₂ формируют Q в QR</small></div>
        </aside>
      </div>
    </section>
  );
}

function SVDLab() {
  const [sigma1, setSigma1] = useState(1.65);
  const [sigma2, setSigma2] = useState(.65);
  const [angle, setAngle] = useState(27);
  const r=angle*Math.PI/180;
  const circle=Array.from({length:129},(_,i)=>{
    const t=(i/128)*Math.PI*2;
    const x=sigma1*Math.cos(t), y=sigma2*Math.sin(t);
    return p(x*Math.cos(r)-y*Math.sin(r),x*Math.sin(r)+y*Math.cos(r));
  });
  const d=circle.map((q,i)=>(i?"L":"M")+q.x+" "+q.y).join(" ");
  return (
    <section className="academy-lab">
      <header><div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / SVD</div><h2>Любой оператор = rotate → stretch → rotate.</h2><p>Сингулярные значения — полуоси эллипса-образа единичной окружности. Они устойчивее собственных значений для анализа общего прямоугольного оператора.</p></header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W-18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H-18}/>
            <circle className="academy-unit-circle" cx={CX} cy={CY} r="54"/>
            <path className="academy-svd-ellipse" d={d}/>
          </svg>
          <div className="academy-stage-badges"><span>σ₁={sigma1.toFixed(2)}</span><span>σ₂={sigma2.toFixed(2)}</span><span>condition≈{(sigma1/Math.max(.01,sigma2)).toFixed(2)}</span></div>
        </div>
        <aside className="academy-controls">
          <label><span>σ₁</span><input type="range" min=".2" max="2.2" step=".05" value={sigma1} onChange={e=>setSigma1(Number(e.target.value))}/><b>{sigma1.toFixed(2)}</b></label>
          <label><span>σ₂</span><input type="range" min=".1" max="2" step=".05" value={sigma2} onChange={e=>setSigma2(Number(e.target.value))}/><b>{sigma2.toFixed(2)}</b></label>
          <label><span>U angle</span><input type="range" min="-80" max="80" step="1" value={angle} onChange={e=>setAngle(Number(e.target.value))}/><b>{angle}°</b></label>
          <div className="academy-equation"><span>SVD</span><strong>A = UΣVᵀ</strong><small>σᵢ² — собственные значения AᵀA</small></div>
        </aside>
      </div>
    </section>
  );
}

function FunctionalLevelLab() {
  const [a,setA]=useState(1.2);
  const [b,setB]=useState(-.7);
  const norm=Math.max(.001,Math.hypot(a,b));
  const levels=[-1.5,-.75,0,.75,1.5];
  const lineFor=(k:number)=>{
    const x1=-2.7,x2=2.7;
    if(Math.abs(b)>.08) return [p(x1,(k-a*x1)/b),p(x2,(k-a*x2)/b)];
    const x=k/a; return [p(x,-2.5),p(x,2.5)];
  };
  const n=p(a/norm*1.4,b/norm*1.4);

  return (
    <section className="academy-lab">
      <header><div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / КОВЕКТОР</div><h2>Функционал режет пространство параллельными уровнями.</h2><p>φ(x)=ax+by. Все уровни φ=c параллельны ker φ, а представляющий вектор (a,b) перпендикулярен им в евклидовой метрике.</p></header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W-18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H-18}/>
            {levels.map(k=>{const [u,v]=lineFor(k);return <line key={k} className={k===0?"academy-level kernel":"academy-level"} x1={u.x} y1={u.y} x2={v.x} y2={v.y}/>;})}
            <line className="academy-normal" x1={CX} y1={CY} x2={n.x} y2={n.y}/>
          </svg>
          <div className="academy-stage-badges"><span>ker φ: ax+by=0</span><span>||φ||≈{norm.toFixed(2)}</span></div>
        </div>
        <aside className="academy-controls">
          <label><span>a</span><input type="range" min="-2" max="2" step=".05" value={a} onChange={e=>setA(Number(e.target.value))}/><b>{a.toFixed(2)}</b></label>
          <label><span>b</span><input type="range" min="-2" max="2" step=".05" value={b} onChange={e=>setB(Number(e.target.value))}/><b>{b.toFixed(2)}</b></label>
          <div className="academy-equation"><span>RIESZ</span><strong>φ(x)=⟨n,x⟩</strong><small>dual coordinates are linear measurements</small></div>
        </aside>
      </div>
    </section>
  );
}

function UnitaryPhaseLab() {
  const [phase,setPhase]=useState(45);
  const [r,setR]=useState(1.4);
  const a=phase*Math.PI/180;
  const q=p(r*Math.cos(a),r*Math.sin(a));
  return (
    <section className="academy-lab">
      <header><div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / УНИТАРНАЯ ФАЗА</div><h2>Фаза меняется, норма остаётся.</h2><p>Умножение на exp(iθ) — простейший унитарный оператор: это чистый поворот комплексной плоскости без изменения внутреннего произведения.</p></header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W-18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H-18}/>
            <circle className="academy-unit-circle" cx={CX} cy={CY} r={r*54}/>
            <line className="academy-vector-v" x1={CX} y1={CY} x2={q.x} y2={q.y}/>
            <circle className="academy-dynamic-point" cx={q.x} cy={q.y} r="6"/>
          </svg>
          <div className="academy-stage-badges"><span>|z|={r.toFixed(2)}</span><span>arg z={phase}°</span><span>|exp(iθ)z| = |z|</span></div>
        </div>
        <aside className="academy-controls">
          <label><span>phase</span><input type="range" min="-180" max="180" step="1" value={phase} onChange={e=>setPhase(Number(e.target.value))}/><b>{phase}°</b></label>
          <label><span>|z|</span><input type="range" min=".2" max="2.2" step=".05" value={r} onChange={e=>setR(Number(e.target.value))}/><b>{r.toFixed(2)}</b></label>
          <div className="academy-equation"><span>UNITARY</span><strong>U*U = I</strong><small>norm and Hermitian product are preserved</small></div>
        </aside>
      </div>
    </section>
  );
}

function WedgeLab() {
  const [angle,setAngle]=useState(58);
  const [length,setLength]=useState(1.45);
  const r=angle*Math.PI/180;
  const u={x:1.5,y:0};
  const v={x:length*Math.cos(r),y:length*Math.sin(r)};
  const area=u.x*v.y-u.y*v.x;
  const pts=[p(0,0),p(u.x,u.y),p(u.x+v.x,u.y+v.y),p(v.x,v.y)];
  return (
    <section className="academy-lab">
      <header><div className="eyebrow">ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ / ВНЕШНЯЯ АЛГЕБРА</div><h2>u∧v — ориентированная площадь, не “ещё один вектор”.</h2><p>При совпадении направлений площадь схлопывается в ноль; перестановка u и v меняет ориентацию и знак wedge-product.</p></header>
      <div className="academy-layout">
        <div className="academy-stage">
          <svg viewBox={`0 0 ${W} ${H}`}>
            <line className="academy-axis" x1="18" y1={CY} x2={W-18} y2={CY}/>
            <line className="academy-axis" x1={CX} y1="18" x2={CX} y2={H-18}/>
            <polygon className="academy-wedge" points={pts.map(q=>q.x+","+q.y).join(" ")}/>
            <line className="academy-e1" x1={CX} y1={CY} x2={p(u.x,u.y).x} y2={p(u.x,u.y).y}/>
            <line className="academy-e2" x1={CX} y1={CY} x2={p(v.x,v.y).x} y2={p(v.x,v.y).y}/>
          </svg>
          <div className="academy-stage-badges"><span>u∧v={area.toFixed(3)}</span><span>{Math.abs(area)<.03?"dependent":"independent"}</span></div>
        </div>
        <aside className="academy-controls">
          <label><span>angle</span><input type="range" min="-175" max="175" step="1" value={angle} onChange={e=>setAngle(Number(e.target.value))}/><b>{angle}°</b></label>
          <label><span>|v|</span><input type="range" min=".2" max="2.2" step=".05" value={length} onChange={e=>setLength(Number(e.target.value))}/><b>{length.toFixed(2)}</b></label>
          <div className="academy-equation"><span>DEPENDENCE</span><strong>u∧v=0 ⇔ u,v dependent</strong><small>v∧u = −u∧v</small></div>
        </aside>
      </div>
    </section>
  );
}

export function LinearAcademyVisualInsert({ topicId }: Props) {
  if (topicId === "linear-systems") return <LinearSystemGeometryLab />;
  if (topicId === "plane-coordinates") return <LevelSetLab />;
  if (topicId === "plane-lines") return <LineDistanceLab />;
  if (topicId === "cross-product") return <CrossProductLab />;
  if (topicId === "mixed-product") return <CrossProductLab volume />;
  if (topicId === "inverse-rank" || topicId === "linear-maps") {
    return <RankNullityLab />;
  }
  if (topicId === "eigenproblem") return <EigenDynamicsLab />;
  if (topicId === "jordan-form") return <EigenDynamicsLab jordan />;
  if (topicId === "euclidean-spaces") return <GramSchmidtLab />;
  if (topicId === "euclidean-operators") return <SVDLab />;
  if (topicId === "linear-functionals" || topicId === "euclidean-functions") return <FunctionalLevelLab />;
  if (topicId === "unitary-spaces") return <UnitaryPhaseLab />;
  if (topicId === "exterior-algebra") return <WedgeLab />;
  if (topicId === "quadratic-forms") return <ConicLab topicId={topicId} />;
  if (MATRIX_TOPICS.has(topicId)) return <MatrixOperatorLab topicId={topicId} />;
  if (VECTOR_TOPICS.has(topicId)) return <VectorProjectionLab topicId={topicId} />;
  if (SUBSPACE_TOPICS.has(topicId)) return <SubspaceLab topicId={topicId} />;
  if (CONIC_TOPICS.has(topicId)) return <ConicLab topicId={topicId} />;
  if (TRANSFORM_TOPICS.has(topicId)) return <AffineTransformLab topicId={topicId} />;
  if (topicId === "space-lines-planes") return <SpacePlaneLab />;
  if (TENSOR_TOPICS.has(topicId)) return <TensorLab topicId={topicId} />;
  return <MatrixOperatorLab topicId={topicId} />;
}
