import { useMemo, useState } from "react";
import "@/styles/complex.css";

const W=580;
const H=300;

function ComplexDerivativeLab(){
  const [x,setX]=useState(0.8);
  const [y,setY]=useState(0.45);
  const a=2*x;
  const b=2*y;
  const scale=Math.hypot(a,b);
  const angle=Math.atan2(b,a);

  return (
    <section className="complex-lab">
      <header>
        <div className="eyebrow">COMPLEX DERIVATIVE / LOCAL GEOMETRY</div>
        <h2>Для f(z)=z² производная локально означает масштаб + поворот.</h2>
        <p>Если производная существует как комплексное число, малые направления преобразуются одинаково: локальная геометрия не зависит от того, с какой стороны мы подошли.</p>
      </header>
      <div className="complex-layout">
        <div className="complex-stage">
          <svg viewBox={"0 0 "+W+" "+H}>
            <line className="complex-axis" x1={W/2} y1="18" x2={W/2} y2={H-18}/>
            <line className="complex-axis" x1="18" y1={H/2} x2={W-18} y2={H/2}/>
            <circle className="complex-origin-ring" cx={W/2} cy={H/2} r="74"/>
            {[0,Math.PI/2,Math.PI,3*Math.PI/2].map((theta,index)=>{
              const x1=W/2+62*Math.cos(theta);
              const y1=H/2-62*Math.sin(theta);
              const mapped=theta+angle;
              const len=Math.min(90,32+scale*22);
              const x2=W/2+len*Math.cos(mapped);
              const y2=H/2-len*Math.sin(mapped);
              return <g key={index}>
                <line className="complex-input-ray" x1={W/2} y1={H/2} x2={x1} y2={y1}/>
                <line className="complex-output-ray" x1={W/2} y1={H/2} x2={x2} y2={y2}/>
              </g>;
            })}
            <circle className="complex-point" cx={W/2+x*42} cy={H/2-y*42} r="5"/>
          </svg>
          <div className="complex-badges">
            <span>z={x.toFixed(2)} {y>=0?"+":"−"} {Math.abs(y).toFixed(2)}i</span>
            <span>|f′|={scale.toFixed(3)}</span>
            <span>arg f′={(angle*180/Math.PI).toFixed(1)}°</span>
          </div>
        </div>
        <aside className="complex-controls">
          <label><span>Re z</span><input type="range" min="-1.8" max="1.8" step=".02" value={x} onChange={e=>setX(Number(e.target.value))}/><b>{x.toFixed(2)}</b></label>
          <label><span>Im z</span><input type="range" min="-1.8" max="1.8" step=".02" value={y} onChange={e=>setY(Number(e.target.value))}/><b>{y.toFixed(2)}</b></label>
          <div className="complex-state"><span>f′(z)=2z</span><strong>{a.toFixed(2)} {b>=0?"+":"−"} {Math.abs(b).toFixed(2)}i</strong><small>масштаб и поворот одинаковы для всех малых направлений</small></div>
        </aside>
      </div>
    </section>
  );
}

function LaurentAnnulusLab(){
  const [inner,setInner]=useState(0.7);
  const [outer,setOuter]=useState(2.1);
  const r1=Math.min(inner,outer-.15);
  const r2=Math.max(outer,inner+.15);
  const scale=76;
  return (
    <section className="complex-lab">
      <header><div className="eyebrow">LAURENT / ANNULUS OF CONVERGENCE</div><h2>Разложение живёт не обязательно в круге — оно живёт в кольце.</h2><p>Отрицательные степени кодируют поведение около внутренней особенности, положительные — обычную аналитическую часть.</p></header>
      <div className="complex-layout">
        <div className="complex-stage annulus-stage">
          <svg viewBox={"0 0 "+W+" "+H}>
            <circle className="annulus-outer" cx={W/2} cy={H/2} r={r2*scale}/>
            <circle className="annulus-fill" cx={W/2} cy={H/2} r={r2*scale}/>
            <circle className="annulus-hole" cx={W/2} cy={H/2} r={r1*scale}/>
            <circle className="complex-singularity" cx={W/2} cy={H/2} r="5"/>
          </svg>
          <div className="complex-badges"><span>{r1.toFixed(2)} &lt; |z−z₀| &lt; {r2.toFixed(2)}</span><span>principal part ↔ inner singularity</span></div>
        </div>
        <aside className="complex-controls">
          <label><span>r</span><input type="range" min=".15" max="1.6" step=".05" value={inner} onChange={e=>setInner(Number(e.target.value))}/><b>{r1.toFixed(2)}</b></label>
          <label><span>R</span><input type="range" min=".5" max="2.8" step=".05" value={outer} onChange={e=>setOuter(Number(e.target.value))}/><b>{r2.toFixed(2)}</b></label>
          <div className="complex-state"><span>LAURENT DOMAIN</span><strong>annulus</strong><small>каждое кольцо может иметь своё разложение одной функции</small></div>
        </aside>
      </div>
    </section>
  );
}

function ResidueLab(){
  const [radius,setRadius]=useState(1.35);
  const poles=useMemo(()=>[
    {x:-.65,y:.2,residue:-1,label:"z₁"},
    {x:.65,y:.15,residue:1,label:"z₂"},
    {x:1.65,y:-.15,residue:.5,label:"z₃"},
  ],[]);
  const enclosed=poles.filter(p=>Math.hypot(p.x,p.y)<radius);
  const sum=enclosed.reduce((acc,p)=>acc+p.residue,0);
  const s=78;
  return (
    <section className="complex-lab">
      <header><div className="eyebrow">RESIDUE THEOREM / CONTOUR</div><h2>Контур считывает только особенности, которые он охватывает.</h2><p>Меняй радиус. Сумма вычетов внутри контура мгновенно определяет интеграл 2πi·ΣRes.</p></header>
      <div className="complex-layout">
        <div className="complex-stage residue-stage">
          <svg viewBox={"0 0 "+W+" "+H}>
            <line className="complex-axis" x1={W/2} y1="18" x2={W/2} y2={H-18}/>
            <line className="complex-axis" x1="18" y1={H/2} x2={W-18} y2={H/2}/>
            <circle className="residue-contour" cx={W/2} cy={H/2} r={radius*s}/>
            {poles.map(p=><g key={p.label} transform={"translate("+(W/2+p.x*s)+" "+(H/2-p.y*s)+")"}><circle className={Math.hypot(p.x,p.y)<radius?"pole inside":"pole"} r="6"/><text x="10" y="-8">{p.label}</text></g>)}
          </svg>
          <div className="complex-badges"><span>{enclosed.length} poles inside</span><span>ΣRes={sum.toFixed(2)}</span><span>∮=2πi·{sum.toFixed(2)}</span></div>
        </div>
        <aside className="complex-controls"><label><span>radius</span><input type="range" min=".3" max="2.4" step=".02" value={radius} onChange={e=>setRadius(Number(e.target.value))}/><b>{radius.toFixed(2)}</b></label><div className="complex-state"><span>ENCLOSED</span><strong>{enclosed.map(p=>p.label).join(", ")||"none"}</strong><small>внешние полюса не участвуют в сумме</small></div></aside>
      </div>
    </section>
  );
}

export function ComplexVisualInsert({topicId,index}:{topicId:string;index:number}){
  if(topicId==="complex-functions"&&index===2) return <ComplexDerivativeLab/>;
  if(topicId==="laurent-series"&&index===3) return <LaurentAnnulusLab/>;
  if(topicId==="residues"&&index===3) return <ResidueLab/>;
  return null;
}
