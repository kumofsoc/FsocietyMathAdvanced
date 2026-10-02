import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useState } from "react";

type V3 = [number, number, number];

function EquationSetLab() {
  const [radius, setRadius] = useState(2.8);
  const [px, setPx] = useState(1.4);
  const [py, setPy] = useState(1.2);
  const inside = px * px + py * py <= radius * radius;
  const scale = 52;
  const cx = 220;
  const cy = 170;

  return (
    <section className="geometry-visual">
      <header>
        <div className="eyebrow">УРАВНЕНИЕ КАК ГЕОМЕТРИЧЕСКИЙ ФИЛЬТР</div>
        <h2>Формула выбирает точки, которые принадлежат фигуре.</h2>
        <p>Точка принадлежит окружности только при равенстве x²+y²=r²; неравенство x²+y²≤r² задаёт уже весь круг.</p>
      </header>
      <div className="geometry-visual-grid">
        <div className="geometry-stage geometry-stage-svg">
          <svg viewBox="0 0 440 340">
            <line className="geo-axis" x1="24" y1={cy} x2="416" y2={cy} />
            <line className="geo-axis" x1={cx} y1="24" x2={cx} y2="316" />
            <circle className="geo-set-fill" cx={cx} cy={cy} r={radius*scale} />
            <circle className="geo-set-boundary" cx={cx} cy={cy} r={radius*scale} />
            <circle className={inside ? "geo-probe inside" : "geo-probe outside"} cx={cx+px*scale} cy={cy-py*scale} r="7" />
            <text x={cx+px*scale+10} y={cy-py*scale-8}>M</text>
          </svg>
          <div className={"geo-membership " + (inside ? "inside" : "outside")}>
            <strong>{inside ? "M ∈ кругу" : "M ∉ кругу"}</strong>
            <small>{(px*px+py*py).toFixed(2)} {inside ? "≤" : ">"} {Math.pow(radius,2).toFixed(2)}</small>
          </div>
        </div>
        <div className="geometry-controls">
          {[
            ["r",radius,0.8,3.2,(v:number)=>setRadius(v)],
            ["x",px,-3,3,(v:number)=>setPx(v)],
            ["y",py,-3,3,(v:number)=>setPy(v)],
          ].map(([label,value,min,max,change])=>(
            <label key={String(label)}>
              <span>{String(label)}</span>
              <input type="range" min={Number(min)} max={Number(max)} step=".05" value={Number(value)} onChange={(e)=>(change as (v:number)=>void)(Number(e.target.value))}/>
              <b>{Number(value).toFixed(2)}</b>
            </label>
          ))}
          <div className="geometry-formula-stack">
            <code>x²+y²=r²</code>
            <span>граница: окружность</span>
            <code>x²+y²≤r²</code>
            <span>область: круг</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Line2DLab() {
  const [angle, setAngle] = useState(28);
  const [offset, setOffset] = useState(0.8);
  const [px, setPx] = useState(2.1);
  const [py, setPy] = useState(-1.2);

  const rad = angle*Math.PI/180;
  const dir = [Math.cos(rad),Math.sin(rad)];
  const normal = [-dir[1],dir[0]];
  const p0 = [normal[0]*offset,normal[1]*offset];
  const distance = Math.abs(normal[0]*px+normal[1]*py-offset);
  const cx=220,cy=170,scale=48;
  const pA=[p0[0]-dir[0]*6,p0[1]-dir[1]*6];
  const pB=[p0[0]+dir[0]*6,p0[1]+dir[1]*6];
  const footFactor=(px-p0[0])*dir[0]+(py-p0[1])*dir[1];
  const foot=[p0[0]+footFactor*dir[0],p0[1]+footFactor*dir[1]];

  const sx=(p:number)=>cx+p*scale;
  const sy=(p:number)=>cy-p*scale;

  return (
    <section className="geometry-visual line-lab">
      <header>
        <div className="eyebrow">ПРЯМАЯ / НАПРАВЛЯЮЩИЙ И НОРМАЛЬНЫЙ ВЕКТОР</div>
        <h2>Одна прямая — несколько эквивалентных способов записи.</h2>
      </header>
      <div className="geometry-visual-grid">
        <div className="geometry-stage geometry-stage-svg">
          <svg viewBox="0 0 440 340">
            <line className="geo-axis" x1="24" y1={cy} x2="416" y2={cy}/>
            <line className="geo-axis" x1={cx} y1="24" x2={cx} y2="316"/>
            <line className="geo-main-line" x1={sx(pA[0])} y1={sy(pA[1])} x2={sx(pB[0])} y2={sy(pB[1])}/>
            <line className="geo-normal" x1={sx(p0[0])} y1={sy(p0[1])} x2={sx(p0[0]+normal[0]*1.7)} y2={sy(p0[1]+normal[1]*1.7)}/>
            <line className="geo-distance" x1={sx(px)} y1={sy(py)} x2={sx(foot[0])} y2={sy(foot[1])}/>
            <circle className="geo-probe inside" cx={sx(px)} cy={sy(py)} r="6"/>
            <circle className="geo-foot" cx={sx(foot[0])} cy={sy(foot[1])} r="4"/>
            <text x={sx(px)+9} y={sy(py)-8}>M</text>
            <text x={sx(p0[0]+normal[0]*1.7)+8} y={sy(p0[1]+normal[1]*1.7)-6}>n</text>
          </svg>
          <div className="geo-distance-badge"><span>distance</span><strong>{distance.toFixed(3)}</strong></div>
        </div>
        <div className="geometry-controls">
          <label><span>угол</span><input type="range" min="-80" max="80" step="1" value={angle} onChange={(e)=>setAngle(Number(e.target.value))}/><b>{angle}°</b></label>
          <label><span>сдвиг</span><input type="range" min="-2.5" max="2.5" step=".05" value={offset} onChange={(e)=>setOffset(Number(e.target.value))}/><b>{offset.toFixed(2)}</b></label>
          <label><span>M.x</span><input type="range" min="-3" max="3" step=".05" value={px} onChange={(e)=>setPx(Number(e.target.value))}/><b>{px.toFixed(2)}</b></label>
          <label><span>M.y</span><input type="range" min="-3" max="3" step=".05" value={py} onChange={(e)=>setPy(Number(e.target.value))}/><b>{py.toFixed(2)}</b></label>
          <div className="geometry-formula-stack">
            <code>r=r₀+ta</code><span>параметрическая форма</span>
            <code>Ax+By+C=0</code><span>нормальная структура</span>
            <code>a=(-B,A)</code><span>направляющий вектор</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConicLab() {
  const [mode,setMode]=useState<"ellipse"|"hyperbola"|"parabola">("ellipse");
  const [a,setA]=useState(2.7);
  const [b,setB]=useState(1.65);
  const [p,setP]=useState(1.4);
  const cx=220,cy=170,scale=52;

  const ellipseC=Math.sqrt(Math.max(0,a*a-b*b));
  const hyperbolaC=Math.sqrt(a*a+b*b);

  const ellipsePath=Array.from({length:181},(_,i)=>{
    const t=i/180*Math.PI*2;
    return [cx+a*Math.cos(t)*scale,cy-b*Math.sin(t)*scale];
  }).map((pt,i)=>(i?"L":"M")+pt[0].toFixed(1)+" "+pt[1].toFixed(1)).join(" ");

  const hyperPath=(sign:number)=>Array.from({length:101},(_,i)=>{
    const t=-1.6+i/100*3.2;
    const x=sign*a*Math.cosh(t);
    const y=b*Math.sinh(t);
    return [cx+x*scale,cy-y*scale];
  }).map((pt,i)=>(i?"L":"M")+pt[0].toFixed(1)+" "+pt[1].toFixed(1)).join(" ");

  const parabolaPath=Array.from({length:121},(_,i)=>{
    const y=-3+i/120*6;
    const x=y*y/(2*p);
    return [cx+x*scale,cy-y*scale];
  }).map((pt,i)=>(i?"L":"M")+pt[0].toFixed(1)+" "+pt[1].toFixed(1)).join(" ");

  return (
    <section className="geometry-visual conic-lab">
      <header>
        <div className="eyebrow">КРИВЫЕ ВТОРОГО ПОРЯДКА</div>
        <h2>Фокусное определение видно прямо на чертеже.</h2>
      </header>
      <div className="coordinate-tabs">
        {(["ellipse","hyperbola","parabola"] as const).map(item=><button key={item} className={mode===item?"active":""} onClick={()=>setMode(item)}>{item==="ellipse"?"Эллипс":item==="hyperbola"?"Гипербола":"Парабола"}</button>)}
      </div>
      <div className="geometry-visual-grid">
        <div className="geometry-stage geometry-stage-svg conic-stage">
          <svg viewBox="0 0 440 340">
            <line className="geo-axis" x1="24" y1={cy} x2="416" y2={cy}/>
            <line className="geo-axis" x1={cx} y1="24" x2={cx} y2="316"/>
            {mode==="ellipse" && <>
              <path className="conic-main" d={ellipsePath}/>
              <circle className="conic-focus" cx={cx+ellipseC*scale} cy={cy} r="5"/>
              <circle className="conic-focus" cx={cx-ellipseC*scale} cy={cy} r="5"/>
              <text x={cx+ellipseC*scale+8} y={cy-8}>F₁</text><text x={cx-ellipseC*scale-24} y={cy-8}>F₂</text>
            </>}
            {mode==="hyperbola" && <>
              <path className="conic-main" d={hyperPath(1)}/><path className="conic-main" d={hyperPath(-1)}/>
              <line className="conic-asymptote" x1="40" y1={cy+(b/a)*(cx-40)} x2="400" y2={cy-(b/a)*(400-cx)}/>
              <line className="conic-asymptote" x1="40" y1={cy-(b/a)*(cx-40)} x2="400" y2={cy+(b/a)*(400-cx)}/>
              <circle className="conic-focus" cx={cx+hyperbolaC*scale} cy={cy} r="5"/>
              <circle className="conic-focus" cx={cx-hyperbolaC*scale} cy={cy} r="5"/>
            </>}
            {mode==="parabola" && <>
              <path className="conic-main" d={parabolaPath}/>
              <circle className="conic-focus" cx={cx+p/2*scale} cy={cy} r="5"/>
              <line className="conic-directrix" x1={cx-p/2*scale} y1="28" x2={cx-p/2*scale} y2="312"/>
              <text x={cx+p/2*scale+8} y={cy-8}>F</text>
            </>}
          </svg>
          <div className="conic-badge">
            {mode==="ellipse" && <><strong>r₁+r₂=2a</strong><small>ε=c/a&lt;1</small></>}
            {mode==="hyperbola" && <><strong>|r₁−r₂|=2a</strong><small>ε=c/a&gt;1</small></>}
            {mode==="parabola" && <><strong>d(M,F)=d(M,l)</strong><small>ε=1</small></>}
          </div>
        </div>
        <div className="geometry-controls">
          {mode!=="parabola" ? <>
            <label><span>a</span><input type="range" min="1.2" max="3.1" step=".05" value={a} onChange={(e)=>setA(Number(e.target.value))}/><b>{a.toFixed(2)}</b></label>
            <label><span>b</span><input type="range" min=".7" max="2.5" step=".05" value={Math.min(b,a-.05)} onChange={(e)=>setB(Number(e.target.value))}/><b>{Math.min(b,a-.05).toFixed(2)}</b></label>
          </>:
          <label><span>p</span><input type="range" min=".5" max="2.5" step=".05" value={p} onChange={(e)=>setP(Number(e.target.value))}/><b>{p.toFixed(2)}</b></label>}
          <div className="geometry-formula-stack">
            {mode==="ellipse" && <><code>x²/a²+y²/b²=1</code><span>каноническое уравнение</span><code>c²=a²−b²</code><span>фокусы (±c,0)</span></>}
            {mode==="hyperbola" && <><code>x²/a²−y²/b²=1</code><span>каноническое уравнение</span><code>c²=a²+b²</code><span>асимптоты y=±bx/a</span></>}
            {mode==="parabola" && <><code>y²=2px</code><span>каноническое уравнение</span><code>F=(p/2,0)</code><span>директриса x=−p/2</span></>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Arrow3D({ vector, color, origin=[0,0,0] }: { vector:V3;color:string;origin?:V3 }) {
  const helper=useMemo(()=>{
    const v=new THREE.Vector3(...vector);
    const len=Math.max(.001,v.length());
    return new THREE.ArrowHelper(v.clone().normalize(),new THREE.Vector3(...origin),len,color,Math.min(.3,len*.14),Math.min(.17,len*.09));
  },[vector[0],vector[1],vector[2],origin[0],origin[1],origin[2],color]);
  return <primitive object={helper}/>;
}

function PlaneMesh({ normal, d }: { normal:V3;d:number }) {
  const data=useMemo(()=>{
    const n=new THREE.Vector3(...normal);
    const len2=Math.max(.001,n.lengthSq());
    const pos=n.clone().multiplyScalar(-d/len2);
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),n.clone().normalize());
    return {pos,q};
  },[normal[0],normal[1],normal[2],d]);
  return <mesh position={data.pos} quaternion={data.q}>
    <planeGeometry args={[5.5,5.5,1,1]}/>
    <meshBasicMaterial color="#7f8cff" transparent opacity={.12} side={THREE.DoubleSide}/>
  </mesh>;
}

function SpaceScene({ normal, d, lineDir }: { normal:V3;d:number;lineDir:V3 }) {
  const point:V3=[-1.2,.4,1.1];
  const end:V3=[point[0]+lineDir[0]*3,point[1]+lineDir[1]*3,point[2]+lineDir[2]*3];
  return <>
    <gridHelper args={[10,10,"#30303b","#1a1a22"]}/>
    <axesHelper args={[2.2]}/>
    <PlaneMesh normal={normal} d={d}/>
    <Arrow3D vector={normal} color="#ffcb6b"/>
    <Line points={[point,end]} color="#58dca2" lineWidth={3}/>
    <OrbitControls makeDefault enableDamping dampingFactor={.08}/>
  </>;
}

function SpacePlaneLab() {
  const [normal,setNormal]=useState<V3>([1,1,1.4]);
  const [dir,setDir]=useState<V3>([1.5,.6,-.3]);
  const dot=normal[0]*dir[0]+normal[1]*dir[1]+normal[2]*dir[2];
  const cos=Math.abs(dot)/(Math.hypot(...normal)*Math.hypot(...dir));
  const linePlaneAngle=90-Math.acos(Math.min(1,cos))*180/Math.PI;

  return <section className="geometry-visual geometry-3d-lab">
    <header><div className="eyebrow">ПРЯМАЯ И ПЛОСКОСТЬ / 3D</div><h2>Направляющий вектор прямой и нормаль плоскости сразу дают угол.</h2></header>
    <div className="geometry-visual-grid">
      <div className="geometry-stage geometry-stage-3d">
        <Canvas camera={{position:[5,4,5],fov:48}} dpr={[1,1.5]}><SpaceScene normal={normal} d={0} lineDir={dir}/></Canvas>
        <div className="geo-distance-badge"><span>угол линия–плоскость</span><strong>{linePlaneAngle.toFixed(1)}°</strong></div>
      </div>
      <div className="geometry-controls">
        {(["n","a"] as const).flatMap(which=>[0,1,2].map(i=><label key={which+i}><span>{which}{["ₓ","ᵧ","𝓏"][i]}</span><input type="range" min="-2.5" max="2.5" step=".05" value={(which==="n"?normal:dir)[i]} onChange={(e)=>{const next=[...(which==="n"?normal:dir)] as V3;next[i]=Number(e.target.value);which==="n"?setNormal(next):setDir(next)}}/><b>{(which==="n"?normal:dir)[i].toFixed(2)}</b></label>))}
        <div className="geometry-formula-stack"><code>(r−r₀,n)=0</code><span>плоскость через точку с нормалью n</span><code>r=r₀+ta</code><span>прямая с направлением a</span></div>
      </div>
    </div>
  </section>;
}

export function GeometryVisualInsert({ topicId, index }: { topicId:string;index:number }) {
  if(topicId==="plane-coordinates" && index===1) return <EquationSetLab/>;
  if(topicId==="plane-lines" && index===2) return <Line2DLab/>;
  if(topicId==="conics" && index===2) return <ConicLab/>;
  if(topicId==="space-lines-planes" && index===3) return <SpacePlaneLab/>;
  return null;
}
