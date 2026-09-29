import { useMemo, useState } from "react";
import "../styles/laplace.css";

const W=600,H=280,P=28;

function path(values:number[],min:number,max:number){
  const span=Math.max(1e-9,max-min);
  return values.map((v,i)=>{
    const x=P+(i/Math.max(1,values.length-1))*(W-P*2);
    const y=H-P-((v-min)/span)*(H-P*2);
    return (i===0?"M":"L")+x.toFixed(2)+" "+y.toFixed(2);
  }).join(" ");
}

function KernelLab(){
  const [s,setS]=useState(1.1);
  const [b,setB]=useState(2);
  const ts=useMemo(()=>Array.from({length:160},(_,i)=>6*i/159),[]);
  const signal=ts.map(t=>Math.sin(b*t));
  const weighted=ts.map(t=>Math.exp(-s*t)*Math.sin(b*t));
  const exact=b/(s*s+b*b);
  return (
    <section className="laplace-lab">
      <header><div className="eyebrow">LAPLACE KERNEL / DAMPING</div><h2>e^{-st} превращает бесконечный хвост в управляемый вклад.</h2><p>Сравни исходный синус и функцию под интегралом. Увеличение s сильнее подавляет далёкое будущее.</p></header>
      <div className="laplace-layout">
        <div className="laplace-stage"><svg viewBox={"0 0 "+W+" "+H}><line className="laplace-axis" x1={P} y1={H/2} x2={W-P} y2={H/2}/><path className="laplace-signal" d={path(signal,-1.1,1.1)}/><path className="laplace-weighted" d={path(weighted,-1.1,1.1)}/></svg><div className="laplace-badges"><span>sin({b.toFixed(1)}t)</span><span>F(s)={exact.toFixed(5)}</span></div></div>
        <aside className="laplace-controls"><label><span>s</span><input type="range" min=".15" max="3" step=".01" value={s} onChange={e=>setS(Number(e.target.value))}/><b>{s.toFixed(2)}</b></label><label><span>b</span><input type="range" min=".4" max="4" step=".05" value={b} onChange={e=>setB(Number(e.target.value))}/><b>{b.toFixed(2)}</b></label><div className="laplace-state"><span>L{"{sin bt}"}</span><strong>b/(s²+b²)</strong><small>{exact.toFixed(6)}</small></div></aside>
      </div>
    </section>
  );
}

function ShiftLab(){
  const [delay,setDelay]=useState(1.8);
  const [rate,setRate]=useState(1);
  const ts=useMemo(()=>Array.from({length:160},(_,i)=>6*i/159),[]);
  const base=ts.map(t=>Math.exp(-rate*t));
  const shifted=ts.map(t=>t<delay?0:Math.exp(-rate*(t-delay)));
  return (
    <section className="laplace-lab">
      <header><div className="eyebrow">SECOND SHIFT / HEAVISIDE</div><h2>Задержка во времени становится простым множителем в s-пространстве.</h2><p>H(t−a)f(t−a) буквально переносит сигнал вправо; в образе это всего лишь e^{-as}F(s).</p></header>
      <div className="laplace-layout"><div className="laplace-stage"><svg viewBox={"0 0 "+W+" "+H}><line className="laplace-axis" x1={P} y1={H-P} x2={W-P} y2={H-P}/><path className="laplace-signal" d={path(base,0,1.1)}/><path className="laplace-weighted" d={path(shifted,0,1.1)}/></svg><div className="laplace-badges"><span>delay a={delay.toFixed(2)}</span><span>e^(-as)F(s)</span></div></div><aside className="laplace-controls"><label><span>a</span><input type="range" min="0" max="4" step=".05" value={delay} onChange={e=>setDelay(Number(e.target.value))}/><b>{delay.toFixed(2)}</b></label><label><span>rate</span><input type="range" min=".3" max="2.5" step=".05" value={rate} onChange={e=>setRate(Number(e.target.value))}/><b>{rate.toFixed(2)}</b></label></aside></div>
    </section>
  );
}

function ODEResponseLab(){
  const [a,setA]=useState(1.2);
  const ts=useMemo(()=>Array.from({length:160},(_,i)=>6*i/159),[]);
  const ys=ts.map(t=>(1-Math.exp(-a*t))/a);
  const steady=1/a;
  return (
    <section className="laplace-lab">
      <header><div className="eyebrow">ODE / STEP RESPONSE</div><h2>Алгебра в s-пространстве превращается обратно в динамику во времени.</h2><p>Для y′+ay=1, y(0)=0 образ Y(s)=1/[s(s+a)], а обратное преобразование показывает экспоненциальный выход на установившееся значение 1/a.</p></header>
      <div className="laplace-layout"><div className="laplace-stage"><svg viewBox={"0 0 "+W+" "+H}><line className="laplace-axis" x1={P} y1={H-P} x2={W-P} y2={H-P}/><path className="laplace-weighted" d={path(ys,0,Math.max(steady*1.15,.2))}/></svg><div className="laplace-badges"><span>steady={steady.toFixed(3)}</span><span>τ≈{(1/a).toFixed(3)}</span></div></div><aside className="laplace-controls"><label><span>a</span><input type="range" min=".25" max="3" step=".05" value={a} onChange={e=>setA(Number(e.target.value))}/><b>{a.toFixed(2)}</b></label><div className="laplace-state"><span>Y(s)</span><strong>1/[s(s+a)]</strong><small>y=(1−e^(-at))/a</small></div></aside></div>
    </section>
  );
}

export function LaplaceVisualInsert({topicId,index}:{topicId:string;index:number}){
  if(topicId==="laplace"&&index===0) return <KernelLab/>;
  if(topicId==="inverse-laplace"&&index===6) return <ShiftLab/>;
  if(topicId==="laplace-ode"&&index===2) return <ODEResponseLab/>;
  return null;
}
