import { useMemo, useState } from "react";

type P2 = [number, number];

const CX = 240;
const CY = 180;
const SCALE = 44;

function screen([x, y]: P2): P2 {
  return [CX + x * SCALE, CY - y * SCALE];
}

function rotatePoint([x, y]: P2, angle: number): P2 {
  const a = angle * Math.PI / 180;
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
}

function transformPoint(point: P2, angle: number, tx: number, ty: number): P2 {
  const [x, y] = rotatePoint(point, angle);
  return [x + tx, y + ty];
}

function Axes() {
  return (
    <g className="affine-axes">
      <line x1="18" y1={CY} x2="462" y2={CY} />
      <line x1={CX} y1="18" x2={CX} y2="342" />
      <text x="450" y={CY - 8}>x</text>
      <text x={CX + 8} y="28">y</text>
    </g>
  );
}

function Arrow({ origin, vector, className, label }: { origin: P2; vector: P2; className: string; label: string }) {
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

function AffineSubspaceLab() {
  const [x0, setX0] = useState(1.35);
  const [y0, setY0] = useState(-.65);
  const [angle, setAngle] = useState(32);
  const [t, setT] = useState(1.4);

  const a = angle * Math.PI / 180;
  const dir: P2 = [Math.cos(a), Math.sin(a)];
  const point: P2 = [x0 + t * dir[0], y0 + t * dir[1]];
  const lineA = screen([x0 - 7 * dir[0], y0 - 7 * dir[1]]);
  const lineB = screen([x0 + 7 * dir[0], y0 + 7 * dir[1]]);
  const linearA = screen([-7 * dir[0], -7 * dir[1]]);
  const linearB = screen([7 * dir[0], 7 * dir[1]]);

  return (
    <section className="affine-lab">
      <header>
        <div className="eyebrow">AFFINE LAB / ТОЧКА + НАПРАВЛЕНИЕ</div>
        <h2>Аффинная прямая — это не векторное подпространство, пока она не проходит через ноль.</h2>
        <p>
          Пунктиром показано направляющее подпространство L через начало.
          Сплошная линия — его перенос A₀+L.
        </p>
      </header>

      <div className="affine-layout">
        <div className="affine-stage">
          <svg viewBox="0 0 480 360">
            <Axes />
            <line className="affine-linear-subspace" x1={linearA[0]} y1={linearA[1]} x2={linearB[0]} y2={linearB[1]} />
            <line className="affine-plane-line" x1={lineA[0]} y1={lineA[1]} x2={lineB[0]} y2={lineB[1]} />
            <circle className="affine-origin-point" cx={CX} cy={CY} r="5" />
            <text className="affine-origin-label" x={CX + 8} y={CY - 8}>0</text>
            <circle className="affine-base-point" cx={screen([x0,y0])[0]} cy={screen([x0,y0])[1]} r="6" />
            <text className="affine-base-label" x={screen([x0,y0])[0]+8} y={screen([x0,y0])[1]-8}>A₀</text>
            <circle className="affine-moving-point" cx={screen(point)[0]} cy={screen(point)[1]} r="6" />
            <text className="affine-moving-label" x={screen(point)[0]+8} y={screen(point)[1]-8}>P</text>
            <Arrow origin={[x0,y0]} vector={[t*dir[0],t*dir[1]]} className="affine-direction-vector" label="tη" />
          </svg>

          <div className="affine-stage-badges">
            <span>L = span(η)</span>
            <span>Π = A₀ + L</span>
            <span>P = A₀ + tη</span>
          </div>
        </div>

        <aside className="affine-controls">
          <label><span>A₀.x</span><input type="range" min="-3" max="3" step=".05" value={x0} onChange={(e)=>setX0(Number(e.target.value))}/><b>{x0.toFixed(2)}</b></label>
          <label><span>A₀.y</span><input type="range" min="-3" max="3" step=".05" value={y0} onChange={(e)=>setY0(Number(e.target.value))}/><b>{y0.toFixed(2)}</b></label>
          <label><span>направление</span><input type="range" min="0" max="180" step="1" value={angle} onChange={(e)=>setAngle(Number(e.target.value))}/><b>{angle}°</b></label>
          <label><span>параметр t</span><input type="range" min="-4" max="4" step=".05" value={t} onChange={(e)=>setT(Number(e.target.value))}/><b>{t.toFixed(2)}</b></label>

          <div className="affine-equation-box">
            <span>ПАРАМЕТРИЧЕСКАЯ ЗАПИСЬ</span>
            <code>ξ = ξ₀ + tη</code>
          </div>

          <div className="affine-readout">
            <div><span>начальная точка</span><strong>({x0.toFixed(2)}, {y0.toFixed(2)})</strong></div>
            <div><span>текущая точка P</span><strong>({point[0].toFixed(2)}, {point[1].toFixed(2)})</strong></div>
            <div><span>dim L</span><strong>1</strong></div>
            <div><span>проходит через 0</span><strong>{Math.abs(x0*dir[1]-y0*dir[0]) < .05 ? "да" : "нет"}</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

type ConicId =
  | "ellipse"
  | "imaginary-ellipse"
  | "imaginary-cross"
  | "hyperbola"
  | "cross"
  | "parabola"
  | "parallel"
  | "imaginary-parallel"
  | "coincident";

type ConicMeta = {
  id: ConicId;
  label: string;
  equation: string;
  r: number;
  R: number;
  sigma: number;
  Sigma: number;
  kind: "ellipse" | "hyperbola" | "parabola" | "cross" | "parallel" | "coincident" | "empty" | "point";
};

const CONICS: ConicMeta[] = [
  { id:"ellipse", label:"Эллипс", equation:"x²/a² + y²/b² = 1", r:2,R:3,sigma:2,Sigma:1,kind:"ellipse" },
  { id:"imaginary-ellipse", label:"Мнимый эллипс", equation:"x²/a² + y²/b² = −1", r:2,R:3,sigma:2,Sigma:3,kind:"empty" },
  { id:"imaginary-cross", label:"Пара мнимых пересекающихся прямых", equation:"x²/a² + y²/b² = 0", r:2,R:2,sigma:2,Sigma:2,kind:"point" },
  { id:"hyperbola", label:"Гипербола", equation:"x²/a² − y²/b² = 1", r:2,R:3,sigma:0,Sigma:1,kind:"hyperbola" },
  { id:"cross", label:"Пара пересекающихся прямых", equation:"x²/a² − y²/b² = 0", r:2,R:2,sigma:0,Sigma:0,kind:"cross" },
  { id:"parabola", label:"Парабола", equation:"y² = 2px", r:1,R:3,sigma:1,Sigma:1,kind:"parabola" },
  { id:"parallel", label:"Пара параллельных прямых", equation:"y² = a²", r:1,R:2,sigma:1,Sigma:0,kind:"parallel" },
  { id:"imaginary-parallel", label:"Пара мнимых параллельных прямых", equation:"y² = −a²", r:1,R:2,sigma:1,Sigma:2,kind:"empty" },
  { id:"coincident", label:"Две совпавшие прямые", equation:"y² = 0", r:1,R:1,sigma:1,Sigma:1,kind:"coincident" },
];

function transformCurve(points: P2[], angle: number, tx: number, ty: number) {
  return points.map((p)=>transformPoint(p,angle,tx,ty)).map(screen).map((p)=>p.join(",")).join(" ");
}

function ConicShape({ meta, angle, tx, ty }: { meta: ConicMeta; angle: number; tx: number; ty: number }) {
  if(meta.kind === "empty") {
    return (
      <g className="conic-imaginary">
        <circle cx={screen([tx,ty])[0]} cy={screen([tx,ty])[1]} r="42" />
        <line x1={screen([tx-.65,ty-.65])[0]} y1={screen([tx-.65,ty-.65])[1]} x2={screen([tx+.65,ty+.65])[0]} y2={screen([tx+.65,ty+.65])[1]} />
        <text x={screen([tx,ty])[0]} y={screen([tx,ty])[1]+68}>нет действительных точек</text>
      </g>
    );
  }

  if(meta.kind === "point") {
    const p=screen([tx,ty]);
    return <g className="conic-point-only"><circle cx={p[0]} cy={p[1]} r="7"/><text x={p[0]+10} y={p[1]-10}>единственная действительная точка</text></g>;
  }

  const a=1.8,b=1.15;
  const groups:P2[][]=[];

  if(meta.kind==="ellipse") {
    groups.push(Array.from({length:121},(_,i):P2=>{
      const t=i/120*Math.PI*2;
      return [a*Math.cos(t),b*Math.sin(t)];
    }));
  }
  if(meta.kind==="hyperbola") {
    for(const sign of [-1,1]) groups.push(Array.from({length:81},(_,i):P2=>{
      const t=-1.15+i/80*2.3;
      return [sign*a*Math.cosh(t),b*Math.sinh(t)];
    }));
  }
  if(meta.kind==="parabola") {
    groups.push(Array.from({length:101},(_,i):P2=>{
      const y=-2.6+i/100*5.2;
      return [y*y/2.2-1.2,y];
    }));
  }
  if(meta.kind==="cross") {
    groups.push([[-4,-2.55],[4,2.55]], [[-4,2.55],[4,-2.55]]);
  }
  if(meta.kind==="parallel") {
    groups.push([[-4,1],[4,1]],[[-4,-1],[4,-1]]);
  }
  if(meta.kind==="coincident") {
    groups.push([[-4,0],[4,0]]);
  }

  return <>{groups.map((points,index)=><polyline key={index} className="conic-invariant-curve" points={transformCurve(points,angle,tx,ty)}/>)}</>;
}

function ConicInvariantLab() {
  const [id,setId]=useState<ConicId>("ellipse");
  const [angle,setAngle]=useState(27);
  const [tx,setTx]=useState(.7);
  const [ty,setTy]=useState(-.35);
  const meta=useMemo(()=>CONICS.find((item)=>item.id===id)!,[id]);

  return (
    <section className="affine-lab conic-invariant-lab">
      <header>
        <div className="eyebrow">INVARIANTS LAB / r · R · σ · Σ</div>
        <h2>Двигай и вращай кривую. Класс меняет положение, но не свои четыре числа.</h2>
        <p>
          Здесь показаны девять аффинных классов линий второго порядка из классификации главы VIII.
        </p>
      </header>

      <div className="conic-selector">
        {CONICS.map((item)=>(
          <button key={item.id} className={id===item.id?"active":""} onClick={()=>setId(item.id)}>
            <span>{item.r}{item.R}{item.sigma}{item.Sigma}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>

      <div className="affine-layout">
        <div className="affine-stage">
          <svg viewBox="0 0 480 360">
            <Axes />
            <ConicShape meta={meta} angle={angle} tx={tx} ty={ty}/>
          </svg>
          <div className="affine-stage-badges invariant-badges">
            <span><b>r</b>{meta.r}</span>
            <span><b>R</b>{meta.R}</span>
            <span><b>σ</b>{meta.sigma}</span>
            <span><b>Σ</b>{meta.Sigma}</span>
          </div>
        </div>

        <aside className="affine-controls">
          <label><span>поворот</span><input type="range" min="-180" max="180" step="1" value={angle} onChange={(e)=>setAngle(Number(e.target.value))}/><b>{angle}°</b></label>
          <label><span>перенос x</span><input type="range" min="-2.5" max="2.5" step=".05" value={tx} onChange={(e)=>setTx(Number(e.target.value))}/><b>{tx.toFixed(2)}</b></label>
          <label><span>перенос y</span><input type="range" min="-2.5" max="2.5" step=".05" value={ty} onChange={(e)=>setTy(Number(e.target.value))}/><b>{ty.toFixed(2)}</b></label>

          <div className="affine-equation-box">
            <span>КАНОНИЧЕСКОЕ УРАВНЕНИЕ</span>
            <code>{meta.equation}</code>
          </div>

          <div className="affine-readout">
            <div><span>класс</span><strong>{meta.label}</strong></div>
            <div><span>rank малой формы r</span><strong>{meta.r}</strong></div>
            <div><span>rank большой формы R</span><strong>{meta.R}</strong></div>
            <div><span>|signature малой| σ</span><strong>{meta.sigma}</strong></div>
            <div><span>|signature большой| Σ</span><strong>{meta.Sigma}</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function AffineGeometryVisualInsert({topicId,index}:{topicId:string;index:number}) {
  if(topicId==="affine-spaces" && index===10) return <AffineSubspaceLab/>;
  if(topicId==="quadric-invariants" && index===8) return <ConicInvariantLab/>;
  return null;
}
