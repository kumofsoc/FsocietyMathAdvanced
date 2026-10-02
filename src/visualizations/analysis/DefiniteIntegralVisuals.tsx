import { useMemo, useState } from "react";

type SampleMode = "left" | "mid" | "right";
type NumericMode = "midpoint" | "trapezoid" | "simpson";

const W = 520;
const H = 350;
const PAD = 38;

function clamp(value:number,min:number,max:number){ return Math.max(min,Math.min(max,value)); }

function graphPath(
  fn:(x:number)=>number,
  x0:number,
  x1:number,
  yMin:number,
  yMax:number,
  steps=180,
){
  const X=(x:number)=>PAD+(x-x0)/(x1-x0)*(W-PAD*2);
  const Y=(y:number)=>H-PAD-(y-yMin)/(yMax-yMin)*(H-PAD*2);
  let d="";
  for(let i=0;i<=steps;i++){
    const x=x0+(x1-x0)*i/steps;
    const y=clamp(fn(x),yMin-1,yMax+1);
    d+=(i===0?"M":"L")+X(x).toFixed(2)+" "+Y(y).toFixed(2)+" ";
  }
  return {d,X,Y};
}

function RiemannSumLab(){
  const [n,setN]=useState(8);
  const [sample,setSample]=useState<SampleMode>("mid");
  const a=0,b=3;
  const f=(x:number)=>.45*x*x+.4;
  const exact=.15*Math.pow(b,3)+.4*b;
  const dx=(b-a)/n;
  const approx=Array.from({length:n},(_,i)=>{
    const left=a+i*dx;
    const c=sample==="left"?left:sample==="right"?left+dx:left+dx/2;
    return f(c)*dx;
  }).reduce((s,v)=>s+v,0);
  const {d,X,Y}=graphPath(f,a,b,0,5,220);
  const axisY=Y(0);

  return <section className="defint-lab">
    <header>
      <div className="eyebrow">RIEMANN SUM / §35</div>
      <h2>Интеграл рождается из конечной суммы прямоугольников.</h2>
      <p>Увеличивай n: максимальная ширина Δx уменьшается, а интегральная сумма приближается к пределу.</p>
    </header>

    <div className="defint-layout">
      <div className="defint-stage">
        <svg viewBox={"0 0 "+W+" "+H}>
          <line className="defint-axis" x1={PAD} y1={axisY} x2={W-PAD} y2={axisY}/>
          <line className="defint-axis" x1={X(0)} y1={PAD} x2={X(0)} y2={H-PAD}/>
          {Array.from({length:n},(_,i)=>{
            const left=a+i*dx;
            const c=sample==="left"?left:sample==="right"?left+dx:left+dx/2;
            const h=f(c);
            const x=X(left);
            const width=X(left+dx)-X(left);
            const y=Y(h);
            return <g key={i}>
              <rect className="riemann-rect" x={x} y={y} width={Math.max(1,width)} height={axisY-y}/>
              <circle className="riemann-sample" cx={X(c)} cy={Y(h)} r="2.8"/>
            </g>;
          })}
          <path className="defint-curve" d={d}/>
        </svg>
        <div className="defint-badges">
          <span>Δx={dx.toFixed(4)}</span>
          <span>Sₙ={approx.toFixed(6)}</span>
          <span>∫={exact.toFixed(6)}</span>
          <span>ошибка={Math.abs(exact-approx).toExponential(2)}</span>
        </div>
      </div>

      <aside className="defint-controls">
        <label><span>число частей n</span><input type="range" min="2" max="36" step="1" value={n} onChange={e=>setN(Number(e.target.value))}/><b>{n}</b></label>
        <div className="defint-tabs">
          <button className={sample==="left"?"active":""} onClick={()=>setSample("left")}>левые</button>
          <button className={sample==="mid"?"active":""} onClick={()=>setSample("mid")}>середины</button>
          <button className={sample==="right"?"active":""} onClick={()=>setSample("right")}>правые</button>
        </div>
        <div className="defint-readout">
          <div><span>функция</span><strong>0.45x²+0.4</strong></div>
          <div><span>отрезок</span><strong>[0,3]</strong></div>
          <div><span>λ</span><strong>{dx.toFixed(4)}</strong></div>
          <div><span>предел</span><strong>{exact.toFixed(4)}</strong></div>
        </div>
      </aside>
    </div>
  </section>;
}

function FundamentalTheoremLab(){
  const [x,setX]=useState(2.2);
  const a=0,b=Math.PI*2;
  const f=(t:number)=>1.15+Math.sin(t);
  const F=(t:number)=>1.15*t+1-Math.cos(t);
  const {d,X,Y}=graphPath(f,a,b,0,2.4,220);
  const axisY=Y(0);
  const xNow=X(x);
  const areaPath=useMemo(()=>{
    const steps=100;
    let d2="M "+X(a)+" "+axisY+" ";
    for(let i=0;i<=steps;i++){
      const t=a+(x-a)*i/steps;
      d2+="L "+X(t)+" "+Y(f(t))+" ";
    }
    d2+="L "+xNow+" "+axisY+" Z";
    return d2;
  },[x,xNow,axisY]);

  return <section className="defint-lab">
    <header>
      <div className="eyebrow">FUNDAMENTAL THEOREM / §37</div>
      <h2>Двигаем правую границу — накопленная площадь становится функцией F(x).</h2>
      <p>Для F(x)=∫₀ˣf(t)dt скорость накопления равна текущей высоте графика: F′(x)=f(x).</p>
    </header>
    <div className="defint-layout">
      <div className="defint-stage">
        <svg viewBox={"0 0 "+W+" "+H}>
          <line className="defint-axis" x1={PAD} y1={axisY} x2={W-PAD} y2={axisY}/>
          <path className="accumulated-area" d={areaPath}/>
          <path className="defint-curve" d={d}/>
          <line className="moving-boundary" x1={xNow} y1={PAD} x2={xNow} y2={axisY}/>
          <circle className="riemann-sample" cx={xNow} cy={Y(f(x))} r="4"/>
        </svg>
        <div className="defint-badges">
          <span>x={x.toFixed(3)}</span><span>F(x)={F(x).toFixed(4)}</span><span>f(x)={f(x).toFixed(4)}</span>
        </div>
      </div>
      <aside className="defint-controls">
        <label><span>верхний предел x</span><input type="range" min="0" max={b} step=".02" value={x} onChange={e=>setX(Number(e.target.value))}/><b>{x.toFixed(2)}</b></label>
        <div className="fundamental-equation">
          <span>НАКОПЛЕНИЕ</span>
          <strong>F(x)=∫₀ˣ f(t)dt</strong>
          <i>↓ производная</i>
          <strong>F′(x)=f(x)</strong>
        </div>
      </aside>
    </div>
  </section>;
}

function ImproperIntegralLab(){
  const [kind,setKind]=useState<"infinity"|"zero">("infinity");
  const [p,setP]=useState(1.4);
  const [cut,setCut]=useState(8);

  const value=useMemo(()=>{
    if(kind==="infinity"){
      if(Math.abs(p-1)<1e-8) return Math.log(cut);
      return (Math.pow(cut,1-p)-1)/(1-p);
    }
    const eps=1/cut;
    if(Math.abs(p-1)<1e-8) return -Math.log(eps);
    return (1-Math.pow(eps,1-p))/(1-p);
  },[kind,p,cut]);

  const converges=kind==="infinity"?p>1:p<1;
  const limitValue=kind==="infinity"
    ? (p>1 ? 1/(p-1) : Infinity)
    : (p<1 ? 1/(1-p) : Infinity);

  const x0=kind==="infinity"?1:.08;
  const x1=kind==="infinity"?Math.max(4,cut):1;
  const fn=(x:number)=>1/Math.pow(x,p);
  const ymax=kind==="infinity"?1.15:Math.min(8,fn(x0));
  const {d,X,Y}=graphPath(fn,x0,x1,0,ymax,240);

  return <section className="defint-lab">
    <header>
      <div className="eyebrow">IMPROPER INTEGRALS / §40</div>
      <h2>Символ ∞ — это предел, а не число для подстановки.</h2>
    </header>
    <div className="defint-layout">
      <div className="defint-stage">
        <svg viewBox={"0 0 "+W+" "+H}>
          <line className="defint-axis" x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD}/>
          <path className="improper-fill" d={d+" L "+X(x1)+" "+Y(0)+" L "+X(x0)+" "+Y(0)+" Z"}/>
          <path className="defint-curve" d={d}/>
        </svg>
        <div className="defint-badges">
          <span>p={p.toFixed(2)}</span>
          <span>{kind==="infinity"?"[1,R]":"[ε,1]"}</span>
          <span className={converges?"ok":"danger"}>{converges?"сходится":"расходится"}</span>
        </div>
      </div>
      <aside className="defint-controls">
        <div className="defint-tabs">
          <button className={kind==="infinity"?"active":""} onClick={()=>setKind("infinity")}>1 → ∞</button>
          <button className={kind==="zero"?"active":""} onClick={()=>setKind("zero")}>0 → 1</button>
        </div>
        <label><span>степень p</span><input type="range" min=".2" max="2.6" step=".05" value={p} onChange={e=>setP(Number(e.target.value))}/><b>{p.toFixed(2)}</b></label>
        <label><span>{kind==="infinity"?"R":"1/ε"}</span><input type="range" min="2" max="60" step="1" value={cut} onChange={e=>setCut(Number(e.target.value))}/><b>{cut}</b></label>
        <div className="defint-readout">
          <div><span>частичный интеграл</span><strong>{value.toFixed(5)}</strong></div>
          <div><span>критерий</span><strong>{kind==="infinity"?"p>1":"p<1"}</strong></div>
          <div><span>предел</span><strong>{Number.isFinite(limitValue)?limitValue.toFixed(5):"∞ / не существует"}</strong></div>
        </div>
      </aside>
    </div>
  </section>;
}

function ApplicationAccumulationLab(){
  const [mode,setMode]=useState<"area"|"volume">("area");
  const [right,setRight]=useState(1.5);
  const a=-2,b=2;
  const f=(x:number)=>Math.max(0,2-.45*x*x);
  const {d,X,Y}=graphPath(f,a,b,0,2.3,220);
  const axisY=Y(0);
  const r=clamp(right,a,b);
  const area=useMemo(()=>{
    const anti=(x:number)=>2*x-.15*x*x*x;
    return anti(r)-anti(a);
  },[r]);
  const volume=useMemo(()=>{
    const anti=(x:number)=>4*x-.6*x*x*x+.0405*Math.pow(x,5);
    return Math.PI*(anti(r)-anti(a));
  },[r]);

  const fillPath=useMemo(()=>{
    const steps=100;
    let q="M "+X(a)+" "+axisY+" ";
    for(let i=0;i<=steps;i++){
      const x=a+(r-a)*i/steps;
      q+="L "+X(x)+" "+Y(f(x))+" ";
    }
    q+="L "+X(r)+" "+axisY+" Z";
    return q;
  },[r,axisY]);

  return <section className="defint-lab">
    <header>
      <div className="eyebrow">APPLICATIONS / §41</div>
      <h2>Один локальный слой — разные геометрические величины.</h2>
      <p>Для площади слой равен y·dx, для объёма вращения — πy²·dx.</p>
    </header>
    <div className="defint-layout">
      <div className="defint-stage">
        <svg viewBox={"0 0 "+W+" "+H}>
          <line className="defint-axis" x1={PAD} y1={axisY} x2={W-PAD} y2={axisY}/>
          <path className={mode==="area"?"application-fill area":"application-fill volume"} d={fillPath}/>
          <path className="defint-curve" d={d}/>
          <line className="moving-boundary" x1={X(r)} y1={PAD} x2={X(r)} y2={axisY}/>
          {mode==="volume" && Array.from({length:9},(_,i)=>{
            const x=a+(r-a)*(i+1)/10;
            const yy=f(x);
            return <ellipse key={i} className="volume-disc" cx={X(x)} cy={Y(yy/2)} rx="10" ry={Math.max(2,yy*5)}/>;
          })}
        </svg>
      </div>
      <aside className="defint-controls">
        <div className="defint-tabs">
          <button className={mode==="area"?"active":""} onClick={()=>setMode("area")}>площадь</button>
          <button className={mode==="volume"?"active":""} onClick={()=>setMode("volume")}>объём вращения</button>
        </div>
        <label><span>правая граница</span><input type="range" min={a} max={b} step=".02" value={right} onChange={e=>setRight(Number(e.target.value))}/><b>{r.toFixed(2)}</b></label>
        <div className="fundamental-equation">
          <span>ЛОКАЛЬНЫЙ ВКЛАД</span>
          <strong>{mode==="area"?"dS=y dx":"dV=πy² dx"}</strong>
          <i>↓ суммирование</i>
          <strong>{mode==="area"?"S="+area.toFixed(4):"V="+volume.toFixed(4)}</strong>
        </div>
      </aside>
    </div>
  </section>;
}

function NumericalQuadratureLab(){
  const [nRaw,setNRaw]=useState(8);
  const [mode,setMode]=useState<NumericMode>("midpoint");
  const n=mode==="simpson" ? (nRaw%2===0?nRaw:nRaw+1) : nRaw;
  const a=0,b=2;
  const f=(x:number)=>1/(1+x*x);
  const exact=Math.atan(2);
  const h=(b-a)/n;

  const midpoint=()=>Array.from({length:n},(_,i)=>f(a+(i+.5)*h)).reduce((s,v)=>s+v,0)*h;
  const trapezoid=()=>{
    let s=(f(a)+f(b))/2;
    for(let i=1;i<n;i++) s+=f(a+i*h);
    return h*s;
  };
  const simpson=()=>{
    let s=f(a)+f(b);
    for(let i=1;i<n;i++) s+=(i%2?4:2)*f(a+i*h);
    return h*s/3;
  };
  const approx=mode==="midpoint"?midpoint():mode==="trapezoid"?trapezoid():simpson();
  const {d,X,Y}=graphPath(f,a,b,0,1.12,220);
  const axisY=Y(0);

  return <section className="defint-lab">
    <header>
      <div className="eyebrow">NUMERICAL QUADRATURE / §42</div>
      <h2>Одна и та же площадь — три разных конечных приближения.</h2>
    </header>
    <div className="defint-layout">
      <div className="defint-stage">
        <svg viewBox={"0 0 "+W+" "+H}>
          <line className="defint-axis" x1={PAD} y1={axisY} x2={W-PAD} y2={axisY}/>
          {mode==="midpoint" && Array.from({length:n},(_,i)=>{
            const l=a+i*h,m=l+h/2,y=f(m);
            return <rect key={i} className="numeric-shape" x={X(l)} y={Y(y)} width={X(l+h)-X(l)} height={axisY-Y(y)}/>;
          })}
          {mode==="trapezoid" && Array.from({length:n},(_,i)=>{
            const l=a+i*h,r=l+h;
            const pts=[[X(l),axisY],[X(l),Y(f(l))],[X(r),Y(f(r))],[X(r),axisY]].map(p=>p.join(",")).join(" ");
            return <polygon key={i} className="numeric-shape" points={pts}/>;
          })}
          {mode==="simpson" && Array.from({length:n/2},(_,j)=>{
            const l=a+2*j*h,r=l+2*h;
            return <rect key={j} className="numeric-simpson-band" x={X(l)} y={PAD} width={X(r)-X(l)} height={axisY-PAD}/>;
          })}
          <path className="defint-curve" d={d}/>
        </svg>
        <div className="defint-badges">
          <span>n={n}</span><span>approx={approx.toFixed(8)}</span><span>exact={exact.toFixed(8)}</span><span>error={Math.abs(exact-approx).toExponential(2)}</span>
        </div>
      </div>
      <aside className="defint-controls">
        <div className="defint-tabs">
          <button className={mode==="midpoint"?"active":""} onClick={()=>setMode("midpoint")}>прямоугольники</button>
          <button className={mode==="trapezoid"?"active":""} onClick={()=>setMode("trapezoid")}>трапеции</button>
          <button className={mode==="simpson"?"active":""} onClick={()=>setMode("simpson")}>Симпсон</button>
        </div>
        <label><span>n</span><input type="range" min="2" max="40" step="1" value={nRaw} onChange={e=>setNRaw(Number(e.target.value))}/><b>{n}</b></label>
        <div className="defint-readout">
          <div><span>f(x)</span><strong>1/(1+x²)</strong></div>
          <div><span>точно</span><strong>arctg 2</strong></div>
          <div><span>ошибка</span><strong>{Math.abs(exact-approx).toExponential(3)}</strong></div>
        </div>
      </aside>
    </div>
  </section>;
}

export function DefiniteIntegralVisualInsert({topicId,index}:{topicId:string;index:number}){
  if(topicId==="riemann-integral" && index===2) return <RiemannSumLab/>;
  if(topicId==="newton-leibniz" && index===0) return <FundamentalTheoremLab/>;
  if(topicId==="improper-integrals" && index===2) return <ImproperIntegralLab/>;
  if(topicId==="integral-applications" && index===1) return <ApplicationAccumulationLab/>;
  if(topicId==="integral-applications" && index===11) return <NumericalQuadratureLab/>;
  return null;
}
