import { useMemo, useState, type ReactElement } from "react";

type V2=[number,number];

const W=520,H=360,CX=W/2,CY=H/2,S=42;
const sx=(x:number)=>CX+x*S;
const sy=(y:number)=>CY-y*S;

function Axes(){
  return <g className="ode-axes">
    <line x1="20" y1={CY} x2={W-20} y2={CY}/>
    <line x1={CX} y1="20" x2={CX} y2={H-20}/>
  </g>;
}

function SlopeFieldLab(){
  const [mode,setMode]=useState<"xy"|"linear"|"logistic">("xy");
  const [k,setK]=useState(1);
  const [y0,setY0]=useState(1);
  const [x0,setX0]=useState(0);

  const f=(x:number,y:number)=>{
    if(mode==="xy") return k*x*y;
    if(mode==="linear") return k*x-y;
    return k*y*(1-y/2);
  };

  const segs=useMemo(()=>{
    const out:{x:number,y:number,dx:number,dy:number}[]=[];
    for(let x=-5;x<=5;x+=.65){
      for(let y=-3.5;y<=3.5;y+=.55){
        const m=f(x,y);
        const norm=Math.hypot(1,m)||1;
        const len=.34;
        out.push({x,y,dx:len/norm,dy:m*len/norm});
      }
    }
    return out;
  },[mode,k]);

  const curve=useMemo(()=>{
    const pts:V2[]=[[x0,y0]];
    const h=.045;
    let x=x0,y=y0;
    for(let i=0;i<120;i++){
      const m1=f(x,y);
      const m2=f(x+h/2,y+h*m1/2);
      const m3=f(x+h/2,y+h*m2/2);
      const m4=f(x+h,y+h*m3);
      y+=h*(m1+2*m2+2*m3+m4)/6;x+=h;
      if(!Number.isFinite(y)||Math.abs(y)>4.2) break;
      pts.push([x,y]);
    }
    x=x0;y=y0;
    const back:V2[]=[];
    for(let i=0;i<120;i++){
      const hh=-h;
      const m1=f(x,y);
      const m2=f(x+hh/2,y+hh*m1/2);
      const m3=f(x+hh/2,y+hh*m2/2);
      const m4=f(x+hh,y+hh*m3);
      y+=hh*(m1+2*m2+2*m3+m4)/6;x+=hh;
      if(!Number.isFinite(y)||Math.abs(y)>4.2) break;
      back.push([x,y]);
    }
    return [...back.reverse(),...pts];
  },[mode,k,x0,y0]);

  const d=curve.map((p,i)=>(i?"L":"M")+sx(p[0]).toFixed(1)+" "+sy(p[1]).toFixed(1)).join(" ");

  return <section className="ode-lab">
    <header>
      <div className="eyebrow">SLOPE FIELD / ПОЛЕ НАПРАВЛЕНИЙ</div>
      <h2>Уравнение задаёт локальный наклон ещё до того, как мы нашли формулу решения.</h2>
      <p>Каждый маленький штрих имеет наклон y'=f(x,y). Цветная кривая — одна численно построенная интегральная кривая через выбранную начальную точку.</p>
    </header>
    <div className="ode-layout">
      <div className="ode-stage">
        <svg viewBox={"0 0 "+W+" "+H}>
          <Axes/>
          {segs.map((g,i)=><line key={i} className="ode-slope" x1={sx(g.x-g.dx)} y1={sy(g.y-g.dy)} x2={sx(g.x+g.dx)} y2={sy(g.y+g.dy)}/>)}
          <path className="ode-solution-curve" d={d}/>
          <circle className="ode-initial-point" cx={sx(x0)} cy={sy(y0)} r="5"/>
        </svg>
      </div>
      <aside className="ode-controls">
        <div className="ode-tabs">
          <button className={mode==="xy"?"active":""} onClick={()=>setMode("xy")}>y'=kxy</button>
          <button className={mode==="linear"?"active":""} onClick={()=>setMode("linear")}>y'=kx−y</button>
          <button className={mode==="logistic"?"active":""} onClick={()=>setMode("logistic")}>логистика</button>
        </div>
        <label><span>k</span><input type="range" min="-2" max="2" step=".1" value={k} onChange={e=>setK(Number(e.target.value))}/><b>{k.toFixed(1)}</b></label>
        <label><span>x₀</span><input type="range" min="-3" max="3" step=".1" value={x0} onChange={e=>setX0(Number(e.target.value))}/><b>{x0.toFixed(1)}</b></label>
        <label><span>y₀</span><input type="range" min="-2.5" max="2.5" step=".1" value={y0} onChange={e=>setY0(Number(e.target.value))}/><b>{y0.toFixed(1)}</b></label>
      </aside>
    </div>
  </section>;
}

function OrderReductionLab(){
  const [mode,setMode]=useState<"xonly"|"noy"|"nox">("xonly");
  const data={
    xonly:{src:"y'' = f(x)",sub:"p=y'",reduced:"p' = f(x)",note:"сначала интегрируем p, потом y"},
    noy:{src:"F(x,y',y'')=0",sub:"p=y'",reduced:"F(x,p,p')=0",note:"порядок уменьшается на единицу"},
    nox:{src:"F(y,y',y'')=0",sub:"p=p(y)",reduced:"y''=p·dp/dy",note:"x исчезает, независимой становится y"},
  }[mode];
  return <section className="ode-lab">
    <header><div className="eyebrow">ORDER REDUCTION</div><h2>Высший порядок иногда можно снять одной правильной заменой.</h2></header>
    <div className="ode-tabs">
      <button className={mode==="xonly"?"active":""} onClick={()=>setMode("xonly")}>y''=f(x)</button>
      <button className={mode==="noy"?"active":""} onClick={()=>setMode("noy")}>нет y</button>
      <button className={mode==="nox"?"active":""} onClick={()=>setMode("nox")}>нет x</button>
    </div>
    <div className="ode-flow">
      <div><span>ИСХОДНО</span><strong>{data.src}</strong></div><i>→</i>
      <div><span>ПОДСТАНОВКА</span><strong>{data.sub}</strong></div><i>→</i>
      <div><span>НИЖЕ ПОРЯДОК</span><strong>{data.reduced}</strong><small>{data.note}</small></div>
    </div>
  </section>;
}

function CharacteristicLab(){
  const [p,setP]=useState(-1);
  const [q,setQ]=useState(-2);
  const D=p*p-4*q;
  let rootText="",solution="";
  if(D>1e-8){
    const r1=(-p+Math.sqrt(D))/2,r2=(-p-Math.sqrt(D))/2;
    rootText="k₁="+r1.toFixed(2)+", k₂="+r2.toFixed(2);
    solution="C₁e^("+r1.toFixed(2)+"x)+C₂e^("+r2.toFixed(2)+"x)";
  }else if(Math.abs(D)<=1e-8){
    const r=-p/2;
    rootText="k="+r.toFixed(2)+" (кратный)";
    solution="(C₁+C₂x)e^("+r.toFixed(2)+"x)";
  }else{
    const a=-p/2,b=Math.sqrt(-D)/2;
    rootText="k="+a.toFixed(2)+" ± "+b.toFixed(2)+"i";
    solution="e^("+a.toFixed(2)+"x)[C₁cos("+b.toFixed(2)+"x)+C₂sin("+b.toFixed(2)+"x)]";
  }
  return <section className="ode-lab">
    <header><div className="eyebrow">CHARACTERISTIC ROOTS</div><h2>Дискриминант характеристического уравнения меняет геометрию решения.</h2></header>
    <div className="ode-layout">
      <div className="characteristic-board">
        <span>y'' + p y' + q y = 0</span>
        <strong>k² + {p.toFixed(1)}k + {q.toFixed(1)} = 0</strong>
        <b className={D>0?"real":D<0?"complex":"repeated"}>D = {D.toFixed(2)}</b>
        <code>{rootText}</code>
        <em>{solution}</em>
      </div>
      <aside className="ode-controls">
        <label><span>p</span><input type="range" min="-5" max="5" step=".1" value={p} onChange={e=>setP(Number(e.target.value))}/><b>{p.toFixed(1)}</b></label>
        <label><span>q</span><input type="range" min="-5" max="5" step=".1" value={q} onChange={e=>setQ(Number(e.target.value))}/><b>{q.toFixed(1)}</b></label>
        <div className="ode-readout"><div><span>тип корней</span><strong>{D>0?"2 вещественных":D<0?"комплексная пара":"кратный корень"}</strong></div></div>
      </aside>
    </div>
  </section>;
}

function PhasePlaneLab(){
  const [kind,setKind]=useState<"node"|"saddle"|"center"|"spiral">("saddle");
  const A=kind==="node"?[[ -1,0],[0,-2]]:kind==="saddle"?[[1,0],[0,-1]]:kind==="center"?[[0,-1],[1,0]]:[[-.25,-1],[1,-.25]];
  const field:ReactElement[]=[];
  for(let x=-4.5;x<=4.5;x+=.65){
    for(let y=-3.3;y<=3.3;y+=.55){
      const vx=A[0][0]*x+A[0][1]*y,vy=A[1][0]*x+A[1][1]*y;
      const n=Math.hypot(vx,vy)||1,l=.3;
      field.push(<line key={x+"-"+y} className="ode-phase-arrow" x1={sx(x-vx/n*l)} y1={sy(y-vy/n*l)} x2={sx(x+vx/n*l)} y2={sy(y+vy/n*l)}/>);
    }
  }
  return <section className="ode-lab">
    <header><div className="eyebrow">PHASE PLANE / y'=Ay</div><h2>Собственные значения матрицы становятся формой фазового портрета.</h2></header>
    <div className="ode-tabs">
      <button className={kind==="node"?"active":""} onClick={()=>setKind("node")}>узел</button>
      <button className={kind==="saddle"?"active":""} onClick={()=>setKind("saddle")}>седло</button>
      <button className={kind==="center"?"active":""} onClick={()=>setKind("center")}>центр</button>
      <button className={kind==="spiral"?"active":""} onClick={()=>setKind("spiral")}>спираль</button>
    </div>
    <div className="ode-stage">
      <svg viewBox={"0 0 "+W+" "+H}><Axes/>{field}<circle className="ode-equilibrium" cx={CX} cy={CY} r="5"/></svg>
    </div>
  </section>;
}

export function ODEVisualInsert({topicId,index}:{topicId:string;index:number}){
  if(topicId==="first-order-ode"&&index===1)return <SlopeFieldLab/>;
  if(topicId==="higher-order-ode"&&index===4)return <OrderReductionLab/>;
  if(topicId==="linear-ode"&&index===1)return <CharacteristicLab/>;
  if(topicId==="ode-systems"&&index===5)return <PhasePlaneLab/>;
  return null;
}
