import { useMemo, useState } from "react";

type V2=[number,number];

const W=520,H=360,CX=260,CY=185,SX=78,SY=72;
const px=(x:number)=>CX+x*SX;
const py=(y:number)=>CY-y*SY;

function Arrow({x,y,u,v,label,className}:{x:number;y:number;u:number;v:number;label?:string;className:string}){
  const x1=px(x),y1=py(y),x2=px(x+u),y2=py(y+v);
  const angle=Math.atan2(y2-y1,x2-x1)*180/Math.PI;
  return <g className={className}>
    <line x1={x1} y1={y1} x2={x2} y2={y2}/>
    <polygon points="-8,-4 0,0 -8,4" transform={"translate("+x2+" "+y2+") rotate("+angle+")"}/>
    {label&&<text x={x2+7} y={y2-7}>{label}</text>}
  </g>;
}

function PathWorkLab(){
  const [direction,setDirection]=useState<1|-1>(1);
  const [field,setField]=useState<"rot"|"grad">("rot");
  const points=useMemo(()=>Array.from({length:120},(_,i)=>{
    const t=i/(119)*Math.PI*1.55-.25*Math.PI;
    return [1.8*Math.cos(t),1.05*Math.sin(t)] as V2;
  }),[]);
  const d=points.map((p,i)=>(i===0?"M":"L")+px(p[0]).toFixed(1)+" "+py(p[1]).toFixed(1)).join(" ");

  const arrows=[];
  for(let x=-2.2;x<=2.2;x+=.8){
    for(let y=-1.5;y<=1.5;y+=.75){
      let u=0,v=0;
      if(field==="rot"){u=-y*.18;v=x*.18;}else{u=x*.14;v=y*.14;}
      arrows.push(<Arrow key={x+"-"+y} x={x} y={y} u={u} v={v} className="field-arrow"/>);
    }
  }

  return <section className="fieldint-lab">
    <header>
      <div className="eyebrow">LINE INTEGRAL / WORK</div>
      <h2>Интеграл II рода чувствует направление движения по кривой.</h2>
      <p>Поменяй ориентацию пути: геометрическая кривая та же, но работа поля меняет знак.</p>
    </header>
    <div className="fieldint-layout">
      <div className="fieldint-stage">
        <svg viewBox={"0 0 "+W+" "+H}>
          <line className="field-axis" x1="20" y1={CY} x2="500" y2={CY}/>
          <line className="field-axis" x1={CX} y1="20" x2={CX} y2="340"/>
          {arrows}
          <path className="work-path" d={d}/>
          {direction===1
            ? <Arrow x={points[67][0]} y={points[67][1]} u={-.35} v={-.13} label="direction" className="path-direction"/>
            : <Arrow x={points[67][0]} y={points[67][1]} u={.35} v={.13} label="direction" className="path-direction"/>}
        </svg>
        <div className="fieldint-badges">
          <span>∫<sub>L</sub> Pdx+Qdy</span>
          <span>{field==="rot"?"rotational field":"gradient field"}</span>
          <span>{direction===1?"A → B":"B → A"}</span>
        </div>
      </div>
      <aside className="fieldint-controls">
        <div className="fieldint-tabs">
          <button className={direction===1?"active":""} onClick={()=>setDirection(1)}>A → B</button>
          <button className={direction===-1?"active":""} onClick={()=>setDirection(-1)}>B → A</button>
        </div>
        <div className="fieldint-tabs">
          <button className={field==="rot"?"active":""} onClick={()=>setField("rot")}>вращательное поле</button>
          <button className={field==="grad"?"active":""} onClick={()=>setField("grad")}>градиентное поле</button>
        </div>
        <div className="fieldint-readout">
          <div><span>ориентация</span><strong>{direction===1?"положительная":"обратная"}</strong></div>
          <div><span>смена направления</span><strong>интеграл × (−1)</strong></div>
          <div><span>I род</span><strong>от направления не зависит</strong></div>
        </div>
      </aside>
    </div>
  </section>;
}

function FluxLab(){
  const [side,setSide]=useState<1|-1>(1);
  const [tilt,setTilt]=useState(18);
  const arrows=Array.from({length:15},(_,i)=>{
    const x=-1.9+(i%5)*.95;
    const y=-1.15+Math.floor(i/5)*1.15;
    return <Arrow key={i} x={x} y={y} u={.18} v={-.36} className="flux-field-arrow"/>;
  });
  return <section className="fieldint-lab">
    <header>
      <div className="eyebrow">SURFACE FLUX</div>
      <h2>Поток считает, сколько поля проходит сквозь выбранную сторону поверхности.</h2>
      <p>Разверни нормаль — поверхностный интеграл II рода меняет знак.</p>
    </header>
    <div className="fieldint-layout">
      <div className="fieldint-stage flux-stage">
        <svg viewBox={"0 0 "+W+" "+H}>
          {arrows}
          <g transform={"translate(260 185) rotate("+tilt+")"}>
            <ellipse className="flux-surface" cx="0" cy="0" rx="135" ry="58"/>
            <line className="flux-grid" x1="-120" y1="-22" x2="120" y2="-22"/>
            <line className="flux-grid" x1="-128" y1="0" x2="128" y2="0"/>
            <line className="flux-grid" x1="-120" y1="22" x2="120" y2="22"/>
          </g>
          <Arrow x={0} y={0} u={0} v={side*.95} label="n" className={side===1?"surface-normal":"surface-normal reverse"}/>
        </svg>
        <div className="fieldint-badges">
          <span>Φ = ∬ F·n dS</span>
          <span>{side===1?"upper side":"lower side"}</span>
        </div>
      </div>
      <aside className="fieldint-controls">
        <div className="fieldint-tabs">
          <button className={side===1?"active":""} onClick={()=>setSide(1)}>верхняя сторона</button>
          <button className={side===-1?"active":""} onClick={()=>setSide(-1)}>нижняя сторона</button>
        </div>
        <label><span>наклон поверхности</span><input type="range" min="-35" max="35" step="1" value={tilt} onChange={e=>setTilt(Number(e.target.value))}/><b>{tilt}°</b></label>
        <div className="fieldint-readout">
          <div><span>смена стороны</span><strong>Φ × (−1)</strong></div>
          <div><span>замкнутая поверхность</span><strong>Гаусс</strong></div>
          <div><span>граница поверхности</span><strong>Стокс</strong></div>
        </div>
      </aside>
    </div>
  </section>;
}

export function LineSurfaceIntegralVisualInsert({topicId,index}:{topicId:string;index:number}){
  if(topicId==="line-integrals" && index===4)return <PathWorkLab/>;
  if(topicId==="surface-integrals" && index===4)return <FluxLab/>;
  return null;
}
