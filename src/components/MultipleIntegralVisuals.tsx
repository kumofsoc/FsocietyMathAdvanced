import { useMemo, useState } from "react";

type P2=[number,number];
const W=520,H=360,CX=260,CY=205,SX=70,SY=70;
const px=(x:number)=>CX+x*SX;
const py=(y:number)=>CY-y*SY;

function Axes(){
  return <g className="multi-axes">
    <line x1="18" y1={CY} x2="502" y2={CY}/>
    <line x1={CX} y1="18" x2={CX} y2="342"/>
  </g>;
}

function DoubleRiemannLab(){
  const [n,setN]=useState(7);
  const [mode,setMode]=useState<"cartesian"|"polar">("cartesian");
  const cells=useMemo(()=>{
    const out:{x:number;y:number;w:number;h:number;z:number}[]=[];
    if(mode==="cartesian"){
      const min=-1.6,max=1.6,d=(max-min)/n;
      for(let i=0;i<n;i++)for(let j=0;j<n;j++){
        const x=min+(i+.5)*d,y=min+(j+.5)*d;
        if(x*x+y*y<=2.4){
          out.push({x,y,w:d,h:d,z:Math.max(.18,2.6-.55*(x*x+y*y))});
        }
      }
    } else {
      const nr=n,na=Math.max(12,n*3);
      const dr=1.55/nr,da=Math.PI*2/na;
      for(let i=0;i<nr;i++)for(let j=0;j<na;j++){
        const r=(i+.5)*dr,a=(j+.5)*da;
        const x=r*Math.cos(a),y=r*Math.sin(a);
        out.push({x,y,w:dr,h:r*da,z:Math.max(.18,2.6-.55*r*r)});
      }
    }
    return out;
  },[n,mode]);

  return <section className="multi-lab">
    <header>
      <div className="eyebrow">DOUBLE INTEGRAL / RIEMANN SUM</div>
      <h2>Двойной интеграл собирает объём из маленьких площадок.</h2>
      <p>Уменьшай размер элементарных областей: ступенчатое приближение становится всё ближе к поверхности.</p>
    </header>
    <div className="multi-layout">
      <div className="multi-stage pseudo3d">
        <div className="multi-surface-cap">z = 2.6 − 0.55(x²+y²)</div>
        <div className="multi-columns" style={{"--n":n} as React.CSSProperties}>
          {cells.slice(0,220).map((c,i)=>(
            <i key={i} style={{
              left:(50+c.x*17)+"%",
              top:(52-c.y*13)+"%",
              width:Math.max(3,c.w*22)+"px",
              height:Math.max(7,c.z*26)+"px",
              opacity:.3+.65*c.z/2.6,
            }}/>
          ))}
        </div>
        <div className="multi-caption">Σ f(xᵢ,yᵢ) ΔSᵢ → ∬<sub>D</sub> f dS</div>
      </div>
      <aside className="multi-controls">
        <label><span>разбиение n</span><input type="range" min="3" max="16" value={n} onChange={e=>setN(Number(e.target.value))}/><b>{n}</b></label>
        <div className="multi-tabs">
          <button className={mode==="cartesian"?"active":""} onClick={()=>setMode("cartesian")}>dx dy</button>
          <button className={mode==="polar"?"active":""} onClick={()=>setMode("polar")}>r dr dφ</button>
        </div>
        <div className="multi-readout">
          <div><span>элементов</span><strong>{cells.length}</strong></div>
          <div><span>координаты</span><strong>{mode==="cartesian"?"декартовы":"полярные"}</strong></div>
          <div><span>якобиан</span><strong>{mode==="cartesian"?"1":"r"}</strong></div>
        </div>
      </aside>
    </div>
  </section>;
}

function RegionOrderLab(){
  const [order,setOrder]=useState<"yx"|"xy">("yx");
  const xs=Array.from({length:90},(_,i)=>-1.8+i*3.6/89);
  const upper=(x:number)=>1.8-.42*x*x;
  const lower=(x:number)=>-.8+.18*x*x;
  const poly=[...xs.map(x=>[px(x),py(upper(x))] as P2),...xs.slice().reverse().map(x=>[px(x),py(lower(x))] as P2)]
    .map(p=>p.join(",")).join(" ");
  return <section className="multi-lab">
    <header><div className="eyebrow">CHANGE ORDER</div><h2>Сначала опиши область — потом меняй порядок интегрирования.</h2></header>
    <div className="multi-layout">
      <div className="multi-stage">
        <svg viewBox={"0 0 "+W+" "+H}>
          <Axes/>
          <polygon className="region-fill" points={poly}/>
          {order==="yx"
            ? [-1.4,-.7,0,.7,1.4].map((x,i)=><line key={i} className="slice-line" x1={px(x)} x2={px(x)} y1={py(lower(x))} y2={py(upper(x))}/>)
            : [-.3,.15,.6,1.05,1.5].map((y,i)=><line key={i} className="slice-line alt" x1="145" x2="375" y1={py(y)} y2={py(y)}/>)}
        </svg>
      </div>
      <aside className="multi-controls">
        <div className="multi-tabs">
          <button className={order==="yx"?"active":""} onClick={()=>setOrder("yx")}>dy → dx</button>
          <button className={order==="xy"?"active":""} onClick={()=>setOrder("xy")}>dx → dy</button>
        </div>
        <div className="order-card">
          {order==="yx"
            ? <><span>VERTICAL SLICES</span><strong>∫ₐᵇ [∫φ₁(x)^φ₂(x) f(x,y)dy] dx</strong><small>границы y зависят от x</small></>
            : <><span>HORIZONTAL SLICES</span><strong>∫cᵈ [∫ψ₁(y)^ψ₂(y) f(x,y)dx] dy</strong><small>границы x зависят от y</small></>}
        </div>
      </aside>
    </div>
  </section>;
}

function CoordinateVolumeLab(){
  const [mode,setMode]=useState<"cart"|"cyl"|"sph">("cyl");
  const data={
    cart:{title:"Декартовы",coords:"x, y, z",jac:"dV = dx dy dz",use:"коробки, плоские границы"},
    cyl:{title:"Цилиндрические",coords:"r, φ, z",jac:"dV = r dr dφ dz",use:"оси, цилиндры, тела вращения"},
    sph:{title:"Сферические",coords:"ρ, θ, φ",jac:"dV = ρ² sinθ dρ dθ dφ",use:"шары, сферы, центральная симметрия"},
  }[mode];
  return <section className="multi-lab">
    <header><div className="eyebrow">TRIPLE INTEGRAL / COORDINATES</div><h2>Правильная система координат превращает сложное тело в простые пределы.</h2></header>
    <div className="volume-coordinate-grid">
      <div className={"volume-object "+mode}>
        <div className="orbital one"/><div className="orbital two"/><div className="orbital three"/>
        <div className="volume-core"/>
        <span>{data.title}</span>
      </div>
      <aside className="multi-controls">
        <div className="multi-tabs">
          <button className={mode==="cart"?"active":""} onClick={()=>setMode("cart")}>xyz</button>
          <button className={mode==="cyl"?"active":""} onClick={()=>setMode("cyl")}>rφz</button>
          <button className={mode==="sph"?"active":""} onClick={()=>setMode("sph")}>ρθφ</button>
        </div>
        <div className="multi-readout">
          <div><span>координаты</span><strong>{data.coords}</strong></div>
          <div><span>элемент объёма</span><strong>{data.jac}</strong></div>
          <div><span>лучше всего</span><strong>{data.use}</strong></div>
        </div>
      </aside>
    </div>
  </section>;
}

export function MultipleIntegralVisualInsert({topicId,index}:{topicId:string;index:number}){
  if(topicId==="double-integral" && index===1)return <DoubleRiemannLab/>;
  if(topicId==="double-integral" && index===9)return <RegionOrderLab/>;
  if(topicId==="triple-integral" && index===4)return <CoordinateVolumeLab/>;
  return null;
}
