import { useState } from "react";

type Point = [number, number];

const W = 520;
const H = 340;
const PAD = 38;

function mapX(x:number,min:number,max:number) {
  return PAD + (x-min)/(max-min)*(W-2*PAD);
}
function mapY(y:number,min:number,max:number) {
  return H-PAD - (y-min)/(max-min)*(H-2*PAD);
}
function pointsAttr(points:Point[],xMin:number,xMax:number,yMin:number,yMax:number) {
  return points
    .filter(([,y])=>Number.isFinite(y))
    .map(([x,y])=>mapX(x,xMin,xMax).toFixed(2)+","+mapY(y,yMin,yMax).toFixed(2))
    .join(" ");
}
function Axes({xMin,xMax,yMin,yMax}:{xMin:number;xMax:number;yMin:number;yMax:number}) {
  const zx=mapX(0,xMin,xMax);
  const zy=mapY(0,yMin,yMax);
  return (
    <g className="analysis2-axes">
      {zy>=PAD&&zy<=H-PAD&&<line x1={PAD} y1={zy} x2={W-PAD} y2={zy}/>}
      {zx>=PAD&&zx<=W-PAD&&<line x1={zx} y1={PAD} x2={zx} y2={H-PAD}/>}
    </g>
  );
}
function lineThrough(
  x0:number,
  y0:number,
  slope:number,
  xMin:number,
  xMax:number,
):Point[] {
  return [[xMin,y0+slope*(xMin-x0)],[xMax,y0+slope*(xMax-x0)]];
}

type DerivativeMode="square"|"cube"|"sin";
const DERIVATIVE_META:Record<DerivativeMode,{
  label:string;
  fn:(x:number)=>number;
  der:(x:number)=>number;
  xMin:number;xMax:number;yMin:number;yMax:number;
}> = {
  square:{label:"x²",fn:(x)=>x*x,der:(x)=>2*x,xMin:-3,xMax:3,yMin:-2,yMax:9},
  cube:{label:"x³",fn:(x)=>x*x*x,der:(x)=>3*x*x,xMin:-2.1,xMax:2.1,yMin:-8,yMax:8},
  sin:{label:"sin x",fn:Math.sin,der:Math.cos,xMin:-Math.PI*2,xMax:Math.PI*2,yMin:-2,yMax:2},
};

function DerivativeTangentLab() {
  const [mode,setMode]=useState<DerivativeMode>("square");
  const [x0,setX0]=useState(1);
  const [h,setH]=useState(1.25);
  const meta=DERIVATIVE_META[mode];
  const safeX0=Math.max(meta.xMin+.2,Math.min(meta.xMax-.2,x0));
  const y0=meta.fn(safeX0);
  const x1=Math.max(meta.xMin+.02,Math.min(meta.xMax-.02,safeX0+h));
  const actualH=x1-safeX0;
  const secant=(meta.fn(x1)-y0)/actualH;
  const tangent=meta.der(safeX0);
  const curve=Array.from({length:240},(_,i):Point=>{
    const x=meta.xMin+i/239*(meta.xMax-meta.xMin);
    return [x,meta.fn(x)];
  });

  return (
    <section className="analysis2-lab derivative-lab">
      <header>
        <div className="eyebrow">DERIVATIVE LAB / SECANT → TANGENT</div>
        <h2>Уменьшай Δx и смотри, как секущая превращается в касательную.</h2>
        <p>Её угловой коэффициент стремится к производной в выбранной точке.</p>
      </header>

      <div className="analysis2-preset-row">
        {(Object.keys(DERIVATIVE_META) as DerivativeMode[]).map(id=>(
          <button key={id} className={mode===id?"active":""} onClick={()=>{
            setMode(id);
            setX0(id==="sin"?0.7:1);
          }}>{DERIVATIVE_META[id].label}</button>
        ))}
      </div>

      <div className="analysis2-layout">
        <div className="analysis2-stage">
          <svg viewBox={"0 0 "+W+" "+H}>
            <Axes xMin={meta.xMin} xMax={meta.xMax} yMin={meta.yMin} yMax={meta.yMax}/>
            <polyline className="analysis2-curve" points={pointsAttr(curve,meta.xMin,meta.xMax,meta.yMin,meta.yMax)}/>
            <polyline className="secant-line" points={pointsAttr(lineThrough(safeX0,y0,secant,meta.xMin,meta.xMax),meta.xMin,meta.xMax,meta.yMin,meta.yMax)}/>
            <polyline className="tangent-line" points={pointsAttr(lineThrough(safeX0,y0,tangent,meta.xMin,meta.xMax),meta.xMin,meta.xMax,meta.yMin,meta.yMax)}/>
            <circle className="derivative-point base" cx={mapX(safeX0,meta.xMin,meta.xMax)} cy={mapY(y0,meta.yMin,meta.yMax)} r="6"/>
            <circle className="derivative-point moving" cx={mapX(x1,meta.xMin,meta.xMax)} cy={mapY(meta.fn(x1),meta.yMin,meta.yMax)} r="6"/>
          </svg>
          <div className="analysis2-stage-badges">
            <span>Δx={actualH.toFixed(3)}</span>
            <span>secant={secant.toFixed(4)}</span>
            <span>f′(x₀)={tangent.toFixed(4)}</span>
          </div>
        </div>

        <aside className="analysis2-controls">
          <label><span>x₀</span><input type="range" min={meta.xMin+.25} max={meta.xMax-.25} step=".05" value={safeX0} onChange={(e)=>setX0(Number(e.target.value))}/><b>{safeX0.toFixed(2)}</b></label>
          <label><span>Δx</span><input type="range" min=".03" max="2" step=".01" value={h} onChange={(e)=>setH(Number(e.target.value))}/><b>{h.toFixed(2)}</b></label>
          <div className="analysis2-formula">
            <span>РАЗНОСТНОЕ ОТНОШЕНИЕ</span>
            <code>Δy/Δx → f′(x₀)</code>
          </div>
          <div className="analysis2-readout">
            <div><span>секущая</span><strong>{secant.toFixed(5)}</strong></div>
            <div><span>касательная</span><strong>{tangent.toFixed(5)}</strong></div>
            <div><span>ошибка наклона</span><strong>{Math.abs(secant-tangent).toExponential(2)}</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

type DifferentialMode="square"|"sin"|"sqrt";
const DIFFERENTIAL_META:Record<DifferentialMode,{
  label:string; fn:(x:number)=>number; der:(x:number)=>number; xMin:number;xMax:number;yMin:number;yMax:number;defaultX:number;
}> = {
  square:{label:"x²",fn:(x)=>x*x,der:(x)=>2*x,xMin:-2.5,xMax:3,yMin:-1,yMax:9,defaultX:1},
  sin:{label:"sin x",fn:Math.sin,der:Math.cos,xMin:-Math.PI,xMax:Math.PI,yMin:-1.7,yMax:1.7,defaultX:.8},
  sqrt:{label:"√x",fn:(x)=>Math.sqrt(Math.max(0,x)),der:(x)=>1/(2*Math.sqrt(x)),xMin:.1,xMax:5,yMin:0,yMax:2.5,defaultX:1},
};

function DifferentialLab() {
  const [mode,setMode]=useState<DifferentialMode>("sqrt");
  const [x0,setX0]=useState(1);
  const [dx,setDx]=useState(.45);
  const meta=DIFFERENTIAL_META[mode];
  const sx=Math.max(meta.xMin+.05,Math.min(meta.xMax-.6,x0));
  const end=Math.max(meta.xMin,Math.min(meta.xMax,sx+dx));
  const actualDx=end-sx;
  const y0=meta.fn(sx);
  const deltaY=meta.fn(end)-y0;
  const dy=meta.der(sx)*actualDx;
  const curve=Array.from({length:220},(_,i):Point=>{
    const x=meta.xMin+i/219*(meta.xMax-meta.xMin);
    return [x,meta.fn(x)];
  });
  const tangentEnd=y0+meta.der(sx)*actualDx;

  return (
    <section className="analysis2-lab differential-lab">
      <header>
        <div className="eyebrow">DIFFERENTIAL / Δy VS dy</div>
        <h2>Δy идёт по кривой. dy идёт по касательной.</h2>
        <p>При уменьшении dx разность между ними становится величиной более высокого порядка.</p>
      </header>

      <div className="analysis2-preset-row">
        {(Object.keys(DIFFERENTIAL_META) as DifferentialMode[]).map(id=>(
          <button key={id} className={mode===id?"active":""} onClick={()=>{
            setMode(id);setX0(DIFFERENTIAL_META[id].defaultX);
          }}>{DIFFERENTIAL_META[id].label}</button>
        ))}
      </div>

      <div className="analysis2-layout">
        <div className="analysis2-stage">
          <svg viewBox={"0 0 "+W+" "+H}>
            <Axes xMin={meta.xMin} xMax={meta.xMax} yMin={meta.yMin} yMax={meta.yMax}/>
            <polyline className="analysis2-curve" points={pointsAttr(curve,meta.xMin,meta.xMax,meta.yMin,meta.yMax)}/>
            <polyline className="tangent-line" points={pointsAttr(lineThrough(sx,y0,meta.der(sx),meta.xMin,meta.xMax),meta.xMin,meta.xMax,meta.yMin,meta.yMax)}/>
            <line className="dx-line" x1={mapX(sx,meta.xMin,meta.xMax)} y1={mapY(y0,meta.yMin,meta.yMax)} x2={mapX(end,meta.xMin,meta.xMax)} y2={mapY(y0,meta.yMin,meta.yMax)}/>
            <line className="delta-y-line" x1={mapX(end,meta.xMin,meta.xMax)} y1={mapY(y0,meta.yMin,meta.yMax)} x2={mapX(end,meta.xMin,meta.xMax)} y2={mapY(meta.fn(end),meta.yMin,meta.yMax)}/>
            <line className="dy-line" x1={mapX(end,meta.xMin,meta.xMax)} y1={mapY(y0,meta.yMin,meta.yMax)} x2={mapX(end,meta.xMin,meta.xMax)} y2={mapY(tangentEnd,meta.yMin,meta.yMax)}/>
          </svg>
          <div className="analysis2-stage-badges">
            <span>dx={actualDx.toFixed(3)}</span><span>Δy={deltaY.toFixed(5)}</span><span>dy={dy.toFixed(5)}</span>
          </div>
        </div>

        <aside className="analysis2-controls">
          <label><span>x</span><input type="range" min={meta.xMin+.1} max={meta.xMax-.65} step=".05" value={sx} onChange={(e)=>setX0(Number(e.target.value))}/><b>{sx.toFixed(2)}</b></label>
          <label><span>dx</span><input type="range" min=".02" max="1.2" step=".01" value={dx} onChange={(e)=>setDx(Number(e.target.value))}/><b>{dx.toFixed(2)}</b></label>
          <div className="analysis2-formula"><span>ЛИНЕЙНАЯ ЧАСТЬ</span><code>dy = f′(x) dx</code></div>
          <div className="analysis2-readout">
            <div><span>Δy</span><strong>{deltaY.toFixed(6)}</strong></div>
            <div><span>dy</span><strong>{dy.toFixed(6)}</strong></div>
            <div><span>|Δy−dy|</span><strong>{Math.abs(deltaY-dy).toExponential(3)}</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function FunctionStudyLab() {
  const [a,setA]=useState(3);
  const fn=(x:number)=>x*x*x-a*x;
  const der=(x:number)=>3*x*x-a;
  const second=(x:number)=>6*x;
  const c=a>0?Math.sqrt(a/3):0;
  const xMin=-3,xMax=3,yMin=-8,yMax=8;
  const curve=Array.from({length:260},(_,i):Point=>{
    const x=xMin+i/259*(xMax-xMin);
    return [x,fn(x)];
  });
  const derivative=Array.from({length:260},(_,i):Point=>{
    const x=xMin+i/259*(xMax-xMin);
    return [x,der(x)];
  });

  return (
    <section className="analysis2-lab study-lab">
      <header>
        <div className="eyebrow">FUNCTION STUDY / f · f′ · f″</div>
        <h2>Не угадывай форму графика — считай его поведение по производным.</h2>
        <p>Семейство f(x)=x³−ax показывает критические точки, экстремумы и перегиб на одной сцене.</p>
      </header>

      <div className="analysis2-layout">
        <div className="analysis2-stage">
          <svg viewBox={"0 0 "+W+" "+H}>
            <Axes xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax}/>
            <polyline className="analysis2-curve" points={pointsAttr(curve,xMin,xMax,yMin,yMax)}/>
            <polyline className="study-derivative-curve" points={pointsAttr(derivative,xMin,xMax,yMin,yMax)}/>
            {a>0&&<>
              <line className="critical-line" x1={mapX(-c,xMin,xMax)} y1={PAD} x2={mapX(-c,xMin,xMax)} y2={H-PAD}/>
              <line className="critical-line" x1={mapX(c,xMin,xMax)} y1={PAD} x2={mapX(c,xMin,xMax)} y2={H-PAD}/>
              <circle className="study-extremum max" cx={mapX(-c,xMin,xMax)} cy={mapY(fn(-c),yMin,yMax)} r="6"/>
              <circle className="study-extremum min" cx={mapX(c,xMin,xMax)} cy={mapY(fn(c),yMin,yMax)} r="6"/>
            </>}
            <circle className="study-inflection" cx={mapX(0,xMin,xMax)} cy={mapY(0,yMin,yMax)} r="6"/>
          </svg>
          <div className="analysis2-stage-badges">
            <span>f(x)=x³−{a.toFixed(1)}x</span>
            <span>f′=3x²−{a.toFixed(1)}</span>
            <span>f″=6x</span>
          </div>
        </div>

        <aside className="analysis2-controls">
          <label><span>a</span><input type="range" min=".2" max="6" step=".1" value={a} onChange={(e)=>setA(Number(e.target.value))}/><b>{a.toFixed(1)}</b></label>
          <div className="analysis2-readout">
            <div><span>критические x</span><strong>±{c.toFixed(3)}</strong></div>
            <div><span>максимум</span><strong>x={(-c).toFixed(3)}</strong></div>
            <div><span>минимум</span><strong>x={c.toFixed(3)}</strong></div>
            <div><span>перегиб</span><strong>x=0</strong></div>
          </div>
          <div className="study-sign-table">
            <span>ЗНАК f′</span>
            <div><b>+</b><i>x&lt;−c</i></div>
            <div><b className="negative">−</b><i>−c&lt;x&lt;c</i></div>
            <div><b>+</b><i>x&gt;c</i></div>
          </div>
          <div className="analysis2-formula"><span>ЛОГИКА</span><code>f′: рост/убывание · f″: выпуклость</code></div>
        </aside>
      </div>
    </section>
  );
}

type TaylorMode="exp"|"sin"|"cos";
const TAYLOR_META:Record<TaylorMode,{label:string;fn:(x:number)=>number}> = {
  exp:{label:"eˣ",fn:Math.exp},
  sin:{label:"sin x",fn:Math.sin},
  cos:{label:"cos x",fn:Math.cos},
};

function factorial(n:number) {
  let result=1;
  for(let i=2;i<=n;i++) result*=i;
  return result;
}

function derivativeAtZero(mode:TaylorMode,k:number) {
  if(mode==="exp") return 1;
  if(mode==="sin") {
    const cycle=[0,1,0,-1];
    return cycle[k%4];
  }
  const cycle=[1,0,-1,0];
  return cycle[k%4];
}

function taylorValue(mode:TaylorMode,x:number,n:number) {
  let sum=0;
  for(let k=0;k<=n;k++) sum+=derivativeAtZero(mode,k)*Math.pow(x,k)/factorial(k);
  return sum;
}

function TaylorLab() {
  const [mode,setMode]=useState<TaylorMode>("exp");
  const [degree,setDegree]=useState(4);
  const [probe,setProbe]=useState(1);
  const meta=TAYLOR_META[mode];
  const xMin=-4,xMax=4;
  const yMin=mode==="exp"?-3:-2;
  const yMax=mode==="exp"?10:2;
  const exact=Array.from({length:260},(_,i):Point=>{
    const x=xMin+i/259*(xMax-xMin);
    return [x,meta.fn(x)];
  });
  const approx=Array.from({length:260},(_,i):Point=>{
    const x=xMin+i/259*(xMax-xMin);
    return [x,taylorValue(mode,x,degree)];
  });
  const exactProbe=meta.fn(probe);
  const approxProbe=taylorValue(mode,probe,degree);

  return (
    <section className="analysis2-lab taylor-lab">
      <header>
        <div className="eyebrow">TAYLOR LAB / FUNCTION → POLYNOMIAL</div>
        <h2>Увеличивай степень и наблюдай, как многочлен «захватывает» функцию вокруг x₀=0.</h2>
      </header>

      <div className="analysis2-preset-row">
        {(Object.keys(TAYLOR_META) as TaylorMode[]).map(id=><button key={id} className={mode===id?"active":""} onClick={()=>setMode(id)}>{TAYLOR_META[id].label}</button>)}
      </div>

      <div className="analysis2-layout">
        <div className="analysis2-stage">
          <svg viewBox={"0 0 "+W+" "+H}>
            <Axes xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax}/>
            <polyline className="taylor-exact" points={pointsAttr(exact,xMin,xMax,yMin,yMax)}/>
            <polyline className="taylor-approx" points={pointsAttr(approx,xMin,xMax,yMin,yMax)}/>
            <line className="taylor-probe-line" x1={mapX(probe,xMin,xMax)} y1={PAD} x2={mapX(probe,xMin,xMax)} y2={H-PAD}/>
          </svg>
          <div className="analysis2-stage-badges">
            <span>n={degree}</span><span>x={probe.toFixed(2)}</span><span>error={Math.abs(exactProbe-approxProbe).toExponential(2)}</span>
          </div>
        </div>

        <aside className="analysis2-controls">
          <label><span>степень n</span><input type="range" min="0" max="12" step="1" value={degree} onChange={(e)=>setDegree(Number(e.target.value))}/><b>{degree}</b></label>
          <label><span>x probe</span><input type="range" min="-3" max="3" step=".05" value={probe} onChange={(e)=>setProbe(Number(e.target.value))}/><b>{probe.toFixed(2)}</b></label>
          <div className="analysis2-formula"><span>МАКЛОРЕН</span><code>Pₙ(x)=Σ f⁽ᵏ⁾(0)xᵏ/k!</code></div>
          <div className="analysis2-readout">
            <div><span>f(x)</span><strong>{exactProbe.toFixed(7)}</strong></div>
            <div><span>Pₙ(x)</span><strong>{approxProbe.toFixed(7)}</strong></div>
            <div><span>|Rₙ|</span><strong>{Math.abs(exactProbe-approxProbe).toExponential(3)}</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function AnalysisAdvancedVisualInsert({topicId,index}:{topicId:string;index:number}) {
  if(topicId==="derivative" && index===2) return <DerivativeTangentLab/>;
  if(topicId==="differential" && index===3) return <DifferentialLab/>;
  if(topicId==="function-study" && index===9) return <FunctionStudyLab/>;
  if(topicId==="taylor" && index===6) return <TaylorLab/>;
  return null;
}
