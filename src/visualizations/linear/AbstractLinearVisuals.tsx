import { useMemo, useState, type ReactElement } from "react";

type V2 = [number, number];
type M2 = [[number, number], [number, number]];

const CX = 240;
const CY = 180;
const SCALE = 46;

function screen([x, y]: V2): V2 {
  return [CX + x * SCALE, CY - y * SCALE];
}

function apply(A: M2, [x, y]: V2): V2 {
  return [A[0][0] * x + A[0][1] * y, A[1][0] * x + A[1][1] * y];
}

function determinant(A: M2) {
  return A[0][0] * A[1][1] - A[0][1] * A[1][0];
}

function norm([x, y]: V2) {
  return Math.hypot(x, y);
}

function normalize(v: V2): V2 {
  const n = norm(v);
  return n < 1e-9 ? [1, 0] : [v[0] / n, v[1] / n];
}

function Axes() {
  return (
    <g className="abs-axes">
      <line x1="18" y1={CY} x2="462" y2={CY} />
      <line x1={CX} y1="18" x2={CX} y2="342" />
      <text x="450" y={CY - 8}>x</text>
      <text x={CX + 9} y="28">y</text>
    </g>
  );
}

function Grid({ A }: { A?: M2 }) {
  const lines: Array<[V2, V2]> = [];
  for (let i = -5; i <= 5; i += 1) {
    lines.push([[i, -4], [i, 4]]);
    lines.push([[-5, i], [5, i]]);
  }
  return (
    <g className={A ? "abs-grid-image" : "abs-grid-original"}>
      {lines.map(([p, q], index) => {
        const p1 = screen(A ? apply(A, p) : p);
        const q1 = screen(A ? apply(A, q) : q);
        return <line key={index} x1={p1[0]} y1={p1[1]} x2={q1[0]} y2={q1[1]} />;
      })}
    </g>
  );
}

function Arrow({ vector, className, label, origin = [0, 0] }: { vector: V2; className: string; label: string; origin?: V2 }) {
  const a = screen(origin);
  const b = screen([origin[0] + vector[0], origin[1] + vector[1]]);
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  return (
    <g className={className}>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
      <polygon points="-9,-4 0,0 -9,4" transform={"translate(" + b[0] + " " + b[1] + ") rotate(" + angle + ")"} />
      <text x={b[0] + 8} y={b[1] - 8}>{label}</text>
    </g>
  );
}

function InfiniteLine({ direction, className }: { direction: V2; className: string }) {
  const u = normalize(direction);
  const p = screen([-u[0] * 7, -u[1] * 7]);
  const q = screen([u[0] * 7, u[1] * 7]);
  return <line className={className} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} />;
}

function BasisLab() {
  const [angle, setAngle] = useState(62);
  const [s1, setS1] = useState(1.7);
  const [s2, setS2] = useState(1.35);
  const [x, setX] = useState<V2>([2.4, 1.7]);
  const rad = angle * Math.PI / 180;
  const e1: V2 = [s1, 0];
  const e2: V2 = [s2 * Math.cos(rad), s2 * Math.sin(rad)];
  const D = e1[0] * e2[1] - e1[1] * e2[0];

  const coords = Math.abs(D) > 0.03
    ? [
        (x[0] * e2[1] - x[1] * e2[0]) / D,
        (e1[0] * x[1] - e1[1] * x[0]) / D,
      ]
    : null;

  const parallelogram: V2[] = [[0, 0], e1, [e1[0] + e2[0], e1[1] + e2[1]], e2];

  return (
    <section className="abs-lab">
      <header>
        <div className="eyebrow">БАЗИС / КООРДИНАТЫ / РАЗМЕРНОСТЬ</div>
        <h2>Базис — это система независимых направлений, а координаты — рецепт сборки вектора.</h2>
        <p>Сближай e₁ и e₂. Когда det→0, параллелограмм схлопывается и двумерный базис перестаёт существовать.</p>
      </header>
      <div className="abs-layout">
        <div className="abs-stage">
          <svg viewBox="0 0 480 360">
            <Grid />
            <Axes />
            <polygon className="basis-area" points={parallelogram.map(screen).map((p) => p.join(",")).join(" ")} />
            <Arrow vector={e1} className="abs-vector-a" label="e₁" />
            <Arrow vector={e2} className="abs-vector-b" label="e₂" />
            {coords && <>
              <Arrow vector={[e1[0] * coords[0], e1[1] * coords[0]]} className="abs-component-a" label="ξ¹e₁" />
              <Arrow vector={[e2[0] * coords[1], e2[1] * coords[1]]} origin={[e1[0] * coords[0], e1[1] * coords[0]]} className="abs-component-b" label="ξ²e₂" />
            </>}
            <Arrow vector={x} className="abs-vector-x" label="x" />
          </svg>
          <div className="abs-stage-badges">
            <span className={Math.abs(D) < .08 ? "danger" : ""}>det[e₁ e₂] = {D.toFixed(3)}</span>
            <span>{Math.abs(D) < .08 ? "линейная зависимость" : "базис ℝ²"}</span>
          </div>
        </div>
        <aside className="abs-controls">
          <label><span>угол e₂</span><input type="range" min="0" max="180" step="1" value={angle} onChange={(e) => setAngle(Number(e.target.value))}/><b>{angle}°</b></label>
          <label><span>|e₁|</span><input type="range" min=".5" max="2.7" step=".05" value={s1} onChange={(e) => setS1(Number(e.target.value))}/><b>{s1.toFixed(2)}</b></label>
          <label><span>|e₂|</span><input type="range" min=".5" max="2.7" step=".05" value={s2} onChange={(e) => setS2(Number(e.target.value))}/><b>{s2.toFixed(2)}</b></label>
          <label><span>x₁</span><input type="range" min="-3" max="3" step=".05" value={x[0]} onChange={(e) => setX([Number(e.target.value), x[1]])}/><b>{x[0].toFixed(2)}</b></label>
          <label><span>x₂</span><input type="range" min="-3" max="3" step=".05" value={x[1]} onChange={(e) => setX([x[0], Number(e.target.value)])}/><b>{x[1].toFixed(2)}</b></label>
          <div className="abs-readout">
            <div><span>[x]ₑ</span><strong>{coords ? "(" + coords[0].toFixed(2) + ", " + coords[1].toFixed(2) + ")" : "не определены"}</strong></div>
            <div><span>dim span(e₁,e₂)</span><strong>{Math.abs(D) < .08 ? "1" : "2"}</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function SubspaceLab() {
  const [angle, setAngle] = useState(47);
  const rad = angle * Math.PI / 180;
  const u: V2 = [1, 0];
  const v: V2 = [Math.cos(rad), Math.sin(rad)];
  const same = Math.abs(Math.sin(rad)) < .045;
  const intersection = same ? 1 : 0;
  const sum = 1 + 1 - intersection;

  return (
    <section className="abs-lab subspace-lab">
      <header>
        <div className="eyebrow">СУММА / ПЕРЕСЕЧЕНИЕ ПОДПРОСТРАНСТВ</div>
        <h2>Размерности не просто складываются: общая часть должна быть вычтена.</h2>
      </header>
      <div className="abs-layout">
        <div className="abs-stage">
          <svg viewBox="0 0 480 360">
            <Axes />
            {!same && <rect className="subspace-plane-fill" x="20" y="20" width="440" height="320" rx="12" />}
            <InfiniteLine direction={u} className="subspace-u" />
            <InfiniteLine direction={v} className="subspace-v" />
            <circle className="subspace-origin" cx={CX} cy={CY} r="6" />
            <text className="subspace-label-u" x="390" y={CY - 10}>L₁</text>
            <text className="subspace-label-v" x={screen([2.7 * v[0],2.7 * v[1]])[0]} y={screen([2.7 * v[0],2.7 * v[1]])[1] - 8}>L₂</text>
          </svg>
          <div className="abs-stage-badges">
            <span>dim L₁=1</span><span>dim L₂=1</span><span>dim(L₁∩L₂)={intersection}</span><span>dim(L₁+L₂)={sum}</span>
          </div>
        </div>
        <aside className="abs-controls">
          <label><span>угол L₂</span><input type="range" min="0" max="180" step="1" value={angle} onChange={(e)=>setAngle(Number(e.target.value))}/><b>{angle}°</b></label>
          <div className="dimension-equation">
            <span>ТЕОРЕМА О РАЗМЕРНОСТИ СУММЫ</span>
            <strong>{sum} = 1 + 1 − {intersection}</strong>
          </div>
          <div className="abs-readout">
            <div><span>пересечение</span><strong>{same ? "одна и та же прямая" : "{0}"}</strong></div>
            <div><span>сумма</span><strong>{same ? "прямая" : "вся плоскость ℝ²"}</strong></div>
            <div><span>прямая сумма</span><strong>{same ? "нет" : "да"}</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function rank2(A: M2) {
  const d = determinant(A);
  if (Math.abs(d) > .03) return 2;
  const max = Math.max(...A.flat().map(Math.abs));
  return max < .03 ? 0 : 1;
}

function kernelDirection(A: M2): V2 | null {
  const r = rank2(A);
  if (r === 2) return null;
  if (r === 0) return [1, 0];
  const [a,b] = A[0];
  const [c,d] = A[1];
  if (Math.hypot(a,b) > .03) return normalize([-b,a]);
  return normalize([-d,c]);
}

function imageDirection(A: M2): V2 | null {
  const r = rank2(A);
  if (r !== 1) return null;
  const c1: V2 = [A[0][0], A[1][0]];
  const c2: V2 = [A[0][1], A[1][1]];
  return norm(c1) > .03 ? normalize(c1) : normalize(c2);
}

function LinearMapLab() {
  const [A,setA] = useState<M2>([[1,1],[.5,.5]]);
  const r = rank2(A);
  const ker = kernelDirection(A);
  const im = imageDirection(A);

  const setEntry=(row:number,col:number,value:number)=>{
    const next:M2=[[...A[0]],[...A[1]]] as M2;
    next[row][col]=value; setA(next);
  };

  const preset=(kind:"identity"|"projection"|"rank1"|"zero")=>{
    if(kind==="identity") setA([[1,0],[0,1]]);
    if(kind==="projection") setA([[1,0],[0,0]]);
    if(kind==="rank1") setA([[1,1],[.5,.5]]);
    if(kind==="zero") setA([[0,0],[0,0]]);
  };

  return (
    <section className="abs-lab map-lab">
      <header>
        <div className="eyebrow">KER / IM / RANK–NULLITY</div>
        <h2>Ядро показывает, что исчезает. Образ — что остаётся достижимым.</h2>
      </header>
      <div className="abs-preset-row">
        <button onClick={()=>preset("identity")}>Изоморфизм</button>
        <button onClick={()=>preset("projection")}>Проекция</button>
        <button onClick={()=>preset("rank1")}>Rank 1</button>
        <button onClick={()=>preset("zero")}>Нулевое</button>
      </div>
      <div className="abs-layout">
        <div className="abs-stage">
          <svg viewBox="0 0 480 360">
            <Grid />
            <Grid A={A} />
            <Axes />
            {ker && r === 1 && <InfiniteLine direction={ker} className="kernel-line" />}
            {im && <InfiniteLine direction={im} className="image-line" />}
            {r === 0 && <circle className="map-zero-image" cx={CX} cy={CY} r="8" />}
          </svg>
          <div className="abs-stage-badges">
            <span>rank A = {r}</span>
            <span>dim Ker A = {2-r}</span>
            <span>{r} + {2-r} = 2</span>
          </div>
        </div>
        <aside className="abs-controls">
          <div className="abs-matrix-input">
            <span>A</span>
            <div>
              {[0,1].flatMap(row=>[0,1].map(col=><input key={row+"-"+col} type="number" step=".1" value={A[row][col]} onChange={(e)=>setEntry(row,col,Number(e.target.value))}/>))}
            </div>
          </div>
          <div className="abs-readout">
            <div><span>det A</span><strong>{determinant(A).toFixed(3)}</strong></div>
            <div><span>Ker A</span><strong>{r===2 ? "{0}" : r===0 ? "ℝ²" : "прямая"}</strong></div>
            <div><span>Im A</span><strong>{r===2 ? "ℝ²" : r===0 ? "{0}" : "прямая"}</strong></div>
            <div><span>инъективно</span><strong>{r===2 ? "да" : "нет"}</strong></div>
            <div><span>сюръективно</span><strong>{r===2 ? "да" : "нет"}</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function symmetricEigen(A: M2) {
  const a=A[0][0], b=A[0][1], d=A[1][1];
  const mid=(a+d)/2;
  const rad=Math.sqrt(((a-d)/2)**2+b*b);
  const l1=mid+rad, l2=mid-rad;
  const v1=normalize(Math.abs(b)>.0001 ? [b,l1-a] : (a>=d ? [1,0] : [0,1]));
  const v2:V2=[-v1[1],v1[0]];
  return {l1,l2,v1,v2};
}

function polyline(points: V2[]) {
  return points.map(screen).map(p=>p.join(",")).join(" ");
}

function EigenLab() {
  const [a,setA]=useState(2);
  const [b,setB]=useState(.75);
  const [d,setD]=useState(.4);
  const A:M2=[[a,b],[b,d]];
  const {l1,l2,v1,v2}=symmetricEigen(A);
  const circle=Array.from({length:121},(_,i):V2=>[Math.cos(i/120*Math.PI*2),Math.sin(i/120*Math.PI*2)]);
  const image=circle.map(p=>apply(A,p));
  const generic:V2=[1.1,.8];
  const imageGeneric=apply(A,generic);

  return (
    <section className="abs-lab eigen-lab">
      <header>
        <div className="eyebrow">СОБСТВЕННЫЕ НАПРАВЛЕНИЯ</div>
        <h2>Большинство векторов поворачивается. Собственный остаётся на своей прямой.</h2>
        <p>Для наглядности лаборатория использует симметричную матрицу 2×2, поэтому оба собственных направления вещественны и взаимно перпендикулярны.</p>
      </header>
      <div className="abs-layout">
        <div className="abs-stage">
          <svg viewBox="0 0 480 360">
            <Grid />
            <Axes />
            <polyline className="eigen-circle" points={polyline([...circle,circle[0]])}/>
            <polyline className="eigen-image" points={polyline([...image,image[0]])}/>
            <InfiniteLine direction={v1} className="eigen-line-1"/>
            <InfiniteLine direction={v2} className="eigen-line-2"/>
            <Arrow vector={generic} className="abs-vector-x" label="x"/>
            <Arrow vector={imageGeneric} className="abs-vector-image" label="Ax"/>
            <Arrow vector={[v1[0]*1.45,v1[1]*1.45]} className="abs-vector-a" label="v₁"/>
            <Arrow vector={[v2[0]*1.45,v2[1]*1.45]} className="abs-vector-b" label="v₂"/>
          </svg>
          <div className="abs-stage-badges"><span>λ₁={l1.toFixed(3)}</span><span>λ₂={l2.toFixed(3)}</span><span>det={determinant(A).toFixed(3)}</span><span>tr={(a+d).toFixed(3)}</span></div>
        </div>
        <aside className="abs-controls">
          <label><span>a₁₁</span><input type="range" min="-2.5" max="3" step=".05" value={a} onChange={(e)=>setA(Number(e.target.value))}/><b>{a.toFixed(2)}</b></label>
          <label><span>a₁₂=a₂₁</span><input type="range" min="-2.5" max="2.5" step=".05" value={b} onChange={(e)=>setB(Number(e.target.value))}/><b>{b.toFixed(2)}</b></label>
          <label><span>a₂₂</span><input type="range" min="-2.5" max="3" step=".05" value={d} onChange={(e)=>setD(Number(e.target.value))}/><b>{d.toFixed(2)}</b></label>
          <div className="characteristic-box">
            <span>ХАРАКТЕРИСТИЧЕСКОЕ УРАВНЕНИЕ</span>
            <code>λ² − {(a+d).toFixed(2)}λ + {determinant(A).toFixed(2)} = 0</code>
          </div>
          <div className="abs-readout">
            <div><span>Av₁</span><strong>= {l1.toFixed(2)}v₁</strong></div>
            <div><span>Av₂</span><strong>= {l2.toFixed(2)}v₂</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function FunctionalLab() {
  const [p,setP]=useState(1.2);
  const [q,setQ]=useState(-.8);
  const [point,setPoint]=useState<V2>([1.4,1.1]);
  const value=p*point[0]+q*point[1];
  const lines=[-3,-2,-1,0,1,2,3];

  return (
    <section className="abs-lab functional-lab">
      <header>
        <div className="eyebrow">ЛИНЕЙНЫЙ ФУНКЦИОНАЛ / УРОВНИ</div>
        <h2>Функционал превращает вектор в число. Геометрически его уровни — параллельные прямые.</h2>
      </header>
      <div className="abs-layout">
        <div className="abs-stage">
          <svg viewBox="0 0 480 360">
            <Grid/><Axes/>
            {lines.map(c=>{
              const n2=p*p+q*q || 1;
              const base:V2=[p*c/n2,q*c/n2];
              const dir:V2=[-q,p];
              const u=normalize(dir);
              const a=screen([base[0]-u[0]*7,base[1]-u[1]*7]);
              const b=screen([base[0]+u[0]*7,base[1]+u[1]*7]);
              return <line key={c} className={c===0?"functional-zero":"functional-level"} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}/>;
            })}
            <Arrow vector={[p,q]} className="functional-normal" label="φ"/>
            <circle className="functional-point" cx={screen(point)[0]} cy={screen(point)[1]} r="6"/>
            <text className="functional-point-label" x={screen(point)[0]+9} y={screen(point)[1]-8}>x</text>
          </svg>
          <div className="abs-stage-badges"><span>f(x)=px+qy</span><span>f(x)={value.toFixed(3)}</span></div>
        </div>
        <aside className="abs-controls">
          <label><span>p</span><input type="range" min="-2.5" max="2.5" step=".05" value={p} onChange={(e)=>setP(Number(e.target.value))}/><b>{p.toFixed(2)}</b></label>
          <label><span>q</span><input type="range" min="-2.5" max="2.5" step=".05" value={q} onChange={(e)=>setQ(Number(e.target.value))}/><b>{q.toFixed(2)}</b></label>
          <label><span>x₁</span><input type="range" min="-3" max="3" step=".05" value={point[0]} onChange={(e)=>setPoint([Number(e.target.value),point[1]])}/><b>{point[0].toFixed(2)}</b></label>
          <label><span>x₂</span><input type="range" min="-3" max="3" step=".05" value={point[1]} onChange={(e)=>setPoint([point[0],Number(e.target.value)])}/><b>{point[1].toFixed(2)}</b></label>
          <div className="abs-readout">
            <div><span>строка φ</span><strong>({p.toFixed(2)}, {q.toFixed(2)})</strong></div>
            <div><span>ядро f</span><strong>уровень 0</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function contourPath(B:M2, sign:1|-1) {
  const segments:string[]=[];
  let current:string[]=[];
  for(let i=0;i<=360;i++){
    const t=i/360*Math.PI*2;
    const u:V2=[Math.cos(t),Math.sin(t)];
    const q=u[0]*(B[0][0]*u[0]+B[0][1]*u[1])+u[1]*(B[1][0]*u[0]+B[1][1]*u[1]);
    if(q*sign>.025){
      const r=Math.min(4.8,1/Math.sqrt(Math.abs(q)));
      const s=screen([r*u[0],r*u[1]]);
      current.push((current.length?"L":"M")+s[0].toFixed(1)+" "+s[1].toFixed(1));
    } else if(current.length){
      segments.push(current.join(" ")); current=[];
    }
  }
  if(current.length) segments.push(current.join(" "));
  return segments;
}

function QuadraticFormLab() {
  const [a,setA]=useState(1.4);
  const [b,setB]=useState(.55);
  const [c,setC]=useState(.7);
  const B:M2=[[a,b],[b,c]];
  const {l1,l2,v1,v2}=symmetricEigen(B);
  const d=determinant(B);
  const positive=l2>0.001;
  const negative=l1<-.001;
  const semidef=!positive&&!negative&&Math.abs(d)<.01;
  const type=positive?"положительно определена":negative?"отрицательно определена":semidef?"полуопределена":"неопределена";
  const posPaths=contourPath(B,1);
  const negPaths=contourPath(B,-1);

  const samples: ReactElement[]=[];
  for(let ix=-5;ix<=5;ix++){
    for(let iy=-4;iy<=4;iy++){
      const x=ix*.7,y=iy*.7;
      const qv=a*x*x+2*b*x*y+c*y*y;
      const s=screen([x,y]);
      samples.push(<circle key={ix+"-"+iy} className={qv>=0?"q-sample-positive":"q-sample-negative"} cx={s[0]} cy={s[1]} r={2.2+Math.min(4,Math.abs(qv)*.25)}/>);
    }
  }

  return (
    <section className="abs-lab quadratic-lab">
      <header>
        <div className="eyebrow">КВАДРАТИЧНАЯ ФОРМА / ЗНАК / КАНОНИЧЕСКИЕ НАПРАВЛЕНИЯ</div>
        <h2>Матрица меняется с базисом, но число плюсов и минусов — нет.</h2>
      </header>
      <div className="abs-layout">
        <div className="abs-stage">
          <svg viewBox="0 0 480 360">
            <Axes/>
            <g className="q-sign-field">{samples}</g>
            {posPaths.map((path,i)=><path key={"p"+i} className="q-contour-positive" d={path}/>)}
            {negPaths.map((path,i)=><path key={"n"+i} className="q-contour-negative" d={path}/>)}
            <InfiniteLine direction={v1} className="q-eigen-line-1"/>
            <InfiniteLine direction={v2} className="q-eigen-line-2"/>
          </svg>
          <div className="abs-stage-badges"><span>{type}</span><span>det B={d.toFixed(3)}</span><span>λ₁={l1.toFixed(2)}</span><span>λ₂={l2.toFixed(2)}</span></div>
        </div>
        <aside className="abs-controls">
          <label><span>b₁₁</span><input type="range" min="-2.5" max="2.5" step=".05" value={a} onChange={(e)=>setA(Number(e.target.value))}/><b>{a.toFixed(2)}</b></label>
          <label><span>b₁₂=b₂₁</span><input type="range" min="-2" max="2" step=".05" value={b} onChange={(e)=>setB(Number(e.target.value))}/><b>{b.toFixed(2)}</b></label>
          <label><span>b₂₂</span><input type="range" min="-2.5" max="2.5" step=".05" value={c} onChange={(e)=>setC(Number(e.target.value))}/><b>{c.toFixed(2)}</b></label>
          <div className="characteristic-box">
            <span>ФОРМА</span>
            <code>k(x,y) = {a.toFixed(2)}x² + {(2*b).toFixed(2)}xy + {c.toFixed(2)}y²</code>
          </div>
          <div className="abs-readout">
            <div><span>Δ₁</span><strong>{a.toFixed(3)}</strong></div>
            <div><span>Δ₂</span><strong>{d.toFixed(3)}</strong></div>
            <div><span>Сильвестр</span><strong>{a>0&&d>0?"Δ₁,Δ₂>0 ✓":"условие не выполнено"}</strong></div>
            <div><span>индексы (+,−)</span><strong>({[l1,l2].filter(v=>v>.001).length}, {[l1,l2].filter(v=>v<-.001).length})</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function AbstractLinearVisualInsert({topicId,index}:{topicId:string;index:number}) {
  if(topicId==="linear-spaces" && index===5) return <BasisLab/>;
  if(topicId==="subspaces" && index===6) return <SubspaceLab/>;
  if(topicId==="linear-maps" && index===6) return <LinearMapLab/>;
  if(topicId==="eigenproblem" && index===5) return <EigenLab/>;
  if(topicId==="linear-functionals" && index===2) return <FunctionalLab/>;
  if(topicId==="quadratic-forms" && index===5) return <QuadraticFormLab/>;
  return null;
}
