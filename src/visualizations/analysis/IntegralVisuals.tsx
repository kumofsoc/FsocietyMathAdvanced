import { useMemo, useState } from "react";

type P2=[number,number];

const W=480,H=340,CX=240,CY=170,SX=54,SY=34;
const sx=(x:number)=>CX+x*SX;
const sy=(y:number)=>CY-y*SY;

function Axes(){
  return <g className="integral-axes">
    <line x1="18" y1={CY} x2="462" y2={CY}/>
    <line x1={CX} y1="18" x2={CX} y2="322"/>
  </g>;
}

function pathFor(fn:(x:number)=>number,x0=-3.8,x1=3.8,steps=140){
  let d="";
  for(let i=0;i<=steps;i++){
    const x=x0+(x1-x0)*i/steps;
    const y=fn(x);
    const X=sx(x),Y=sy(y);
    d+=(i===0?"M":"L")+X.toFixed(2)+" "+Y.toFixed(2)+" ";
  }
  return d;
}

function PrimitiveFamilyLab(){
  const [c,setC]=useState(0);
  const shifts=[-2,-1,0,1,2].map(v=>v+c);
  return <section className="integral-lab">
    <header>
      <div className="eyebrow">ANTIDERIVATIVE FAMILY</div>
      <h2>Одна производная — бесконечное семейство первообразных.</h2>
      <p>Все графики F(x)+C имеют одинаковую производную и отличаются только вертикальным сдвигом.</p>
    </header>
    <div className="integral-layout">
      <div className="integral-stage">
        <svg viewBox={"0 0 "+W+" "+H}>
          <Axes/>
          {shifts.map((k,i)=><path key={i} className={i===2?"primitive-main":"primitive-ghost"} d={pathFor(x=>x*x*x/3+k)}/>)}
        </svg>
        <div className="integral-badges">
          <span>f(x)=x²</span><span>F(x)=x³/3+C</span><span>F′(x)=x²</span>
        </div>
      </div>
      <aside className="integral-controls">
        <label><span>центр семейства C</span><input type="range" min="-2" max="2" step=".1" value={c} onChange={e=>setC(Number(e.target.value))}/><b>{c.toFixed(1)}</b></label>
        <div className="integral-readout">
          <div><span>изменение C</span><strong>не меняет F′</strong></div>
          <div><span>геометрически</span><strong>вертикальный сдвиг</strong></div>
        </div>
      </aside>
    </div>
  </section>;
}

function SubstitutionPartsLab(){
  const [mode,setMode]=useState<"substitution"|"parts">("substitution");
  return <section className="integral-lab">
    <header>
      <div className="eyebrow">METHOD ROUTER</div>
      <h2>Замена переменной и по частям решают разные структурные проблемы.</h2>
    </header>
    <div className="integral-method-tabs">
      <button className={mode==="substitution"?"active":""} onClick={()=>setMode("substitution")}>Подстановка</button>
      <button className={mode==="parts"?"active":""} onClick={()=>setMode("parts")}>По частям</button>
    </div>
    {mode==="substitution"?(
      <div className="integral-flow">
        <div><span>ИСХОДНО</span><strong>∫ 2x·(x²+1)⁵ dx</strong></div><i>→</i>
        <div><span>ЗАМЕНА</span><strong>u=x²+1</strong><small>du=2x dx</small></div><i>→</i>
        <div><span>ТАБЛИЦА</span><strong>∫u⁵du=u⁶/6</strong></div><i>→</i>
        <div><span>ВОЗВРАТ</span><strong>(x²+1)⁶/6+C</strong></div>
      </div>
    ):(
      <div className="integral-flow">
        <div><span>ИСХОДНО</span><strong>∫x eˣ dx</strong></div><i>→</i>
        <div><span>ВЫБОР</span><strong>u=x, dv=eˣdx</strong><small>du=dx, v=eˣ</small></div><i>→</i>
        <div><span>ФОРМУЛА</span><strong>uv−∫vdu</strong></div><i>→</i>
        <div><span>РЕЗУЛЬТАТ</span><strong>xeˣ−eˣ+C</strong></div>
      </div>
    )}
  </section>;
}

function PartialFractionsLab(){
  const [a,setA]=useState(1);
  const [b,setB]=useState(-2);
  const denom=(x:number)=>(x-a)*(x-b);
  const A=1/(a-b);
  const B=1/(b-a);
  return <section className="integral-lab">
    <header>
      <div className="eyebrow">PARTIAL FRACTIONS</div>
      <h2>Факторизация знаменателя превращает одну дробь в сумму простейших.</h2>
    </header>
    <div className="integral-layout">
      <div className="partial-fraction-board">
        <div className="pf-main">1 / ((x−{a.toFixed(1)})(x−{b.toFixed(1)}))</div>
        <i>=</i>
        <div className="pf-split"><b>{A.toFixed(3)}</b>/(x−{a.toFixed(1)}) <span>+</span> <b>{B.toFixed(3)}</b>/(x−{b.toFixed(1)})</div>
        <small>A=1/(a−b), B=1/(b−a)</small>
      </div>
      <aside className="integral-controls">
        <label><span>корень a</span><input type="range" min="-3" max="3" step=".25" value={a} onChange={e=>setA(Number(e.target.value))}/><b>{a.toFixed(2)}</b></label>
        <label><span>корень b</span><input type="range" min="-3" max="3" step=".25" value={b} onChange={e=>{const v=Number(e.target.value); if(Math.abs(v-a)>.2)setB(v)}}/><b>{b.toFixed(2)}</b></label>
        <div className="integral-readout"><div><span>интеграл</span><strong>{A.toFixed(2)}ln|x−a| + {B.toFixed(2)}ln|x−b| + C</strong></div></div>
      </aside>
    </div>
  </section>;
}

function TrigDecisionLab(){
  const [m,setM]=useState(4);
  const [n,setN]=useState(5);
  const decision=useMemo(()=>{
    if(n>0&&Math.abs(n%2)===1)return "n нечётно → отделить cos x dx, t=sin x";
    if(m>0&&Math.abs(m%2)===1)return "m нечётно → отделить sin x dx, t=cos x";
    if(m>=0&&n>=0&&m%2===0&&n%2===0)return "обе степени чётны → понижение степени";
    if((m+n)<0&&(m+n)%2===0)return "m+n — чётное отрицательное → t=tg x";
    return "проверить симметрию; при необходимости t=tg(x/2)";
  },[m,n]);
  return <section className="integral-lab">
    <header><div className="eyebrow">TRIG STRATEGY</div><h2>Степени sin и cos сами подсказывают замену.</h2></header>
    <div className="integral-layout">
      <div className="trig-decision">
        <span>∫ sin<sup>{m}</sup>x · cos<sup>{n}</sup>x dx</span>
        <strong>{decision}</strong>
      </div>
      <aside className="integral-controls">
        <label><span>m</span><input type="range" min="-4" max="8" step="1" value={m} onChange={e=>setM(Number(e.target.value))}/><b>{m}</b></label>
        <label><span>n</span><input type="range" min="-4" max="8" step="1" value={n} onChange={e=>setN(Number(e.target.value))}/><b>{n}</b></label>
      </aside>
    </div>
  </section>;
}

function IrrationalSubstitutionLab(){
  const [mode,setMode]=useState<"minus"|"plus"|"outside">("minus");
  const info={
    minus:{rad:"√(a²−u²)",sub:"u=a sin t",out:"radical → a cos t"},
    plus:{rad:"√(u²+a²)",sub:"u=a tg t",out:"radical → a/cos t"},
    outside:{rad:"√(u²−a²)",sub:"u=a/cos t",out:"radical → a tg t"},
  }[mode];
  return <section className="integral-lab">
    <header><div className="eyebrow">IRRATIONAL → TRIGONOMETRIC</div><h2>Подстановка выбирается по знаку внутри квадратного корня.</h2></header>
    <div className="irrational-tabs">
      <button className={mode==="minus"?"active":""} onClick={()=>setMode("minus")}>a²−u²</button>
      <button className={mode==="plus"?"active":""} onClick={()=>setMode("plus")}>u²+a²</button>
      <button className={mode==="outside"?"active":""} onClick={()=>setMode("outside")}>u²−a²</button>
    </div>
    <div className="irrational-flow"><div><span>РАДИКАЛ</span><strong>{info.rad}</strong></div><i>→</i><div><span>ПОДСТАНОВКА</span><strong>{info.sub}</strong></div><i>→</i><div><span>УПРОЩЕНИЕ</span><strong>{info.out}</strong></div></div>
  </section>;
}

export function IntegralVisualInsert({topicId,index}:{topicId:string;index:number}){
  if(topicId==="antiderivative"&&index===2)return <PrimitiveFamilyLab/>;
  if(topicId==="integration-methods"&&index===2)return <SubstitutionPartsLab/>;
  if(topicId==="rational-integration"&&index===4)return <PartialFractionsLab/>;
  if(topicId==="trig-integration"&&index===5)return <TrigDecisionLab/>;
  if(topicId==="irrational-integration"&&index===2)return <IrrationalSubstitutionLab/>;
  return null;
}
