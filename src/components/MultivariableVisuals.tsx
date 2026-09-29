import { useMemo, useState } from "react";

type V2=[number,number];
type V3=[number,number,number];

const W=520,H=360,CX=260,CY=185;
const S=58;

function xy([x,y]:V2):V2{return [CX+x*S,CY-y*S];}

function Arrow2({v,className,label}:{v:V2;className:string;label:string}){
  const a=xy([0,0]),b=xy(v);
  const angle=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
  return <g className={className}>
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}/>
    <polygon points="-8,-4 0,0 -8,4" transform={"translate("+b[0]+" "+b[1]+") rotate("+angle+")"}/>
    <text x={b[0]+7} y={b[1]-7}>{label}</text>
  </g>;
}

function Axes2(){
  return <g className="multi-axes"><line x1="28" y1={CY} x2="492" y2={CY}/><line x1={CX} y1="24" x2={CX} y2="336"/></g>;
}

function LimitPathLab(){
  const [k,setK]=useState(.5);
  const limit=(1-k*k)/(1+k*k);
  const points=Array.from({length:90},(_,i)=>{
    const x=-2.8+5.6*i/89;
    const y=k*x;
    return xy([x,y]).join(",");
  }).join(" ");

  return <section className="multi-lab">
    <header>
      <div className="eyebrow">LIMIT PATHS / §43.2</div>
      <h2>В двух переменных к одной точке можно прийти бесконечно многими путями.</h2>
      <p>Для функции (x²−y²)/(x²+y²) двигаемся к (0,0) по прямой y=kx. Меняй k — предельное значение меняется.</p>
    </header>
    <div className="multi-layout">
      <div className="multi-stage">
        <svg viewBox={"0 0 "+W+" "+H}>
          <Axes2/>
          <line className="limit-path-guide" x1={xy([-3,-3*k])[0]} y1={xy([-3,-3*k])[1]} x2={xy([3,3*k])[0]} y2={xy([3,3*k])[1]}/>
          <polyline className="limit-path-active" points={points}/>
          <circle className="multi-origin" cx={CX} cy={CY} r="5"/>
        </svg>
        <div className="multi-badges"><span>y={k.toFixed(2)}x</span><span>limit={limit.toFixed(5)}</span></div>
      </div>
      <aside className="multi-controls">
        <label><span>наклон k</span><input type="range" min="-3" max="3" step=".05" value={k} onChange={e=>setK(Number(e.target.value))}/><b>{k.toFixed(2)}</b></label>
        <div className="multi-equation">
          <span>ПО ПУТИ y=kx</span>
          <strong>(1−k²)/(1+k²)</strong>
          <i>= {limit.toFixed(5)}</i>
        </div>
        <div className="multi-readout">
          <div><span>k=0</span><strong>limit=1</strong></div>
          <div><span>k=1</span><strong>limit=0</strong></div>
          <div><span>вывод</span><strong>общего предела нет</strong></div>
        </div>
      </aside>
    </div>
  </section>;
}

function DifferentialLab(){
  const [x,setX]=useState(.7);
  const [y,setY]=useState(.45);
  const [dx,setDx]=useState(.35);
  const [dy,setDy]=useState(-.2);
  const f=(a:number,b:number)=>a*a+.5*b*b+.35*a*b;
  const fx=2*x+.35*y;
  const fy=y+.35*x;
  const dz=fx*dx+fy*dy;
  const exact=f(x+dx,y+dy)-f(x,y);
  const error=exact-dz;

  const base=xy([x,y]);
  const moved=xy([x+dx,y+dy]);
  const vx:[number,number]=[dx,0];
  const vy:[number,number]=[0,dy];

  return <section className="multi-lab">
    <header>
      <div className="eyebrow">PARTIALS + DIFFERENTIAL / §44</div>
      <h2>Полный дифференциал складывает два независимых локальных вклада.</h2>
      <p>Сравни реальное Δz с линейной моделью dz=fₓdx+fᵧdy.</p>
    </header>
    <div className="multi-layout">
      <div className="multi-stage">
        <svg viewBox={"0 0 "+W+" "+H}>
          <Axes2/>
          <circle className="multi-base-point" cx={base[0]} cy={base[1]} r="5"/>
          <line className="multi-dx-line" x1={base[0]} y1={base[1]} x2={xy([x+dx,y])[0]} y2={xy([x+dx,y])[1]}/>
          <line className="multi-dy-line" x1={xy([x+dx,y])[0]} y1={xy([x+dx,y])[1]} x2={moved[0]} y2={moved[1]}/>
          <circle className="multi-moved-point" cx={moved[0]} cy={moved[1]} r="5"/>
          <text className="multi-label" x={base[0]+8} y={base[1]-8}>M</text>
          <text className="multi-label accent" x={moved[0]+8} y={moved[1]-8}>M+ΔM</text>
        </svg>
        <div className="multi-badges"><span>Δz={exact.toFixed(5)}</span><span>dz={dz.toFixed(5)}</span><span>ошибка={error.toExponential(2)}</span></div>
      </div>
      <aside className="multi-controls">
        <label><span>x</span><input type="range" min="-1.5" max="1.5" step=".05" value={x} onChange={e=>setX(Number(e.target.value))}/><b>{x.toFixed(2)}</b></label>
        <label><span>y</span><input type="range" min="-1.5" max="1.5" step=".05" value={y} onChange={e=>setY(Number(e.target.value))}/><b>{y.toFixed(2)}</b></label>
        <label><span>dx</span><input type="range" min="-.8" max=".8" step=".02" value={dx} onChange={e=>setDx(Number(e.target.value))}/><b>{dx.toFixed(2)}</b></label>
        <label><span>dy</span><input type="range" min="-.8" max=".8" step=".02" value={dy} onChange={e=>setDy(Number(e.target.value))}/><b>{dy.toFixed(2)}</b></label>
        <div className="multi-readout">
          <div><span>fₓ</span><strong>{fx.toFixed(4)}</strong></div>
          <div><span>fᵧ</span><strong>{fy.toFixed(4)}</strong></div>
          <div><span>dz</span><strong>{dz.toFixed(5)}</strong></div>
          <div><span>Δz−dz</span><strong>{error.toExponential(2)}</strong></div>
        </div>
      </aside>
    </div>
  </section>;
}

function project([x,y,z]:V3):V2{
  const px=CX+(x-y)*54;
  const py=250-(x+y)*21-z*36;
  return [px,py];
}

function linePath(points:V3[]){
  return points.map((p,i)=>{const q=project(p);return (i?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1)}).join(" ");
}

function TangentPlaneLab(){
  const [x0,setX0]=useState(.7);
  const [y0,setY0]=useState(-.45);
  const f=(x:number,y:number)=>.5*(x*x+y*y);
  const z0=f(x0,y0);
  const fx=x0,fy=y0;
  const tangent=(x:number,y:number)=>z0+fx*(x-x0)+fy*(y-y0);

  const surfaceLines=useMemo(()=>{
    const arr:string[]=[];
    for(let j=-4;j<=4;j++){
      const y=j/2;
      arr.push(linePath(Array.from({length:45},(_,i)=>{const x=-2+4*i/44;return [x,y,f(x,y)] as V3;})));
    }
    for(let j=-4;j<=4;j++){
      const x=j/2;
      arr.push(linePath(Array.from({length:45},(_,i)=>{const y=-2+4*i/44;return [x,y,f(x,y)] as V3;})));
    }
    return arr;
  },[]);

  const planeCorners:[V3,V3,V3,V3]=[
    [x0-.7,y0-.7,tangent(x0-.7,y0-.7)],
    [x0+.7,y0-.7,tangent(x0+.7,y0-.7)],
    [x0+.7,y0+.7,tangent(x0+.7,y0+.7)],
    [x0-.7,y0+.7,tangent(x0-.7,y0+.7)],
  ];
  const planePts=planeCorners.map(project).map(p=>p.join(",")).join(" ");
  const p0=project([x0,y0,z0]);
  const normal:V3=[fx,fy,-1];
  const nEnd=project([x0+normal[0]*.65,y0+normal[1]*.65,z0+normal[2]*.65]);

  return <section className="multi-lab">
    <header>
      <div className="eyebrow">TANGENT PLANE / §45</div>
      <h2>Касательная плоскость — локальная линейная версия поверхности.</h2>
    </header>
    <div className="multi-layout">
      <div className="multi-stage tangent-stage">
        <svg viewBox={"0 0 "+W+" "+H}>
          {surfaceLines.map((d,i)=><path key={i} className="surface-wire" d={d}/>)}
          <polygon className="tangent-plane-patch" points={planePts}/>
          <line className="normal-line" x1={p0[0]} y1={p0[1]} x2={nEnd[0]} y2={nEnd[1]}/>
          <circle className="multi-moved-point" cx={p0[0]} cy={p0[1]} r="5"/>
        </svg>
      </div>
      <aside className="multi-controls">
        <label><span>x₀</span><input type="range" min="-1.3" max="1.3" step=".05" value={x0} onChange={e=>setX0(Number(e.target.value))}/><b>{x0.toFixed(2)}</b></label>
        <label><span>y₀</span><input type="range" min="-1.3" max="1.3" step=".05" value={y0} onChange={e=>setY0(Number(e.target.value))}/><b>{y0.toFixed(2)}</b></label>
        <div className="multi-equation">
          <span>z=½(x²+y²)</span>
          <strong>z−z₀={fx.toFixed(2)}(x−x₀)+{fy.toFixed(2)}(y−y₀)</strong>
        </div>
        <div className="multi-readout">
          <div><span>точка</span><strong>({x0.toFixed(2)}, {y0.toFixed(2)}, {z0.toFixed(2)})</strong></div>
          <div><span>нормаль</span><strong>({fx.toFixed(2)}, {fy.toFixed(2)}, −1)</strong></div>
        </div>
      </aside>
    </div>
  </section>;
}

function HessianLab(){
  const [A,setA]=useState(2);
  const [B,setB]=useState(0);
  const [C,setC]=useState(2);
  const delta=A*C-B*B;
  const classification=delta>1e-7?(A>0?"локальный минимум":A<0?"локальный максимум":"вырожденный случай"):delta< -1e-7?"седло / экстремума нет":"Δ=0: критерий не решает";
  const f=(x:number,y:number)=>.5*(A*x*x+2*B*x*y+C*y*y);

  const cells=useMemo(()=>{
    const out:{x:number;y:number;value:number}[]=[];
    const n=23;
    for(let iy=0;iy<n;iy++)for(let ix=0;ix<n;ix++){
      const x=-2+4*ix/(n-1),y=-2+4*iy/(n-1);
      out.push({x,y,value:f(x,y)});
    }
    const max=Math.max(1,...out.map(v=>Math.abs(v.value)));
    return out.map(v=>({...v,value:v.value/max}));
  },[A,B,C]);

  return <section className="multi-lab">
    <header>
      <div className="eyebrow">HESSIAN CLASSIFIER / §46.2</div>
      <h2>Знак Δ=AC−B² отделяет чашу, купол и седло.</h2>
    </header>
    <div className="multi-layout">
      <div className="multi-stage hessian-stage">
        <svg viewBox={"0 0 "+W+" "+H}>
          {cells.map((cell,i)=>{
            const p=xy([cell.x,cell.y]);
            const opacity=.08+.5*Math.min(1,Math.abs(cell.value));
            return <rect key={i} className={cell.value>=0?"hessian-pos":"hessian-neg"} x={p[0]-S*2/22} y={p[1]-S*2/22} width={S*4/22} height={S*4/22} opacity={opacity}/>;
          })}
          <Axes2/>
          <circle className="multi-origin" cx={CX} cy={CY} r="5"/>
        </svg>
        <div className="multi-badges"><span>A={A.toFixed(2)}</span><span>B={B.toFixed(2)}</span><span>C={C.toFixed(2)}</span><span>Δ={delta.toFixed(3)}</span></div>
      </div>
      <aside className="multi-controls">
        <label><span>A=fₓₓ</span><input type="range" min="-3" max="3" step=".1" value={A} onChange={e=>setA(Number(e.target.value))}/><b>{A.toFixed(1)}</b></label>
        <label><span>B=fₓᵧ</span><input type="range" min="-3" max="3" step=".1" value={B} onChange={e=>setB(Number(e.target.value))}/><b>{B.toFixed(1)}</b></label>
        <label><span>C=fᵧᵧ</span><input type="range" min="-3" max="3" step=".1" value={C} onChange={e=>setC(Number(e.target.value))}/><b>{C.toFixed(1)}</b></label>
        <div className={"hessian-result "+(delta>0?"definite":delta<0?"saddle":"degenerate")}>
          <span>КЛАССИФИКАЦИЯ</span>
          <strong>{classification}</strong>
        </div>
        <div className="multi-readout">
          <div><span>Δ</span><strong>{delta.toFixed(4)}</strong></div>
          <div><span>правило</span><strong>{delta>0?"смотреть знак A":delta<0?"седло":"доп. исследование"}</strong></div>
        </div>
      </aside>
    </div>
  </section>;
}

export function MultivariableVisualInsert({topicId,index}:{topicId:string;index:number}){
  if(topicId==="multivariable-functions"&&index===5)return <LimitPathLab/>;
  if(topicId==="partial-derivatives"&&index===7)return <DifferentialLab/>;
  if(topicId==="tangent-plane"&&index===1)return <TangentPlaneLab/>;
  if(topicId==="multivariable-extrema"&&index===5)return <HessianLab/>;
  return null;
}
