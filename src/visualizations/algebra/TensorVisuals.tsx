import { useMemo, useState } from "react";

type V2 = [number, number];
type M2 = [[number, number], [number, number]];

const CX = 240;
const CY = 180;
const SCALE = 46;

function screen([x,y]:V2):V2 {
  return [CX + x*SCALE, CY - y*SCALE];
}

function mul(A:M2,B:M2):M2 {
  return [
    [A[0][0]*B[0][0]+A[0][1]*B[1][0], A[0][0]*B[0][1]+A[0][1]*B[1][1]],
    [A[1][0]*B[0][0]+A[1][1]*B[1][0], A[1][0]*B[0][1]+A[1][1]*B[1][1]],
  ];
}

function apply(A:M2,v:V2):V2 {
  return [A[0][0]*v[0]+A[0][1]*v[1], A[1][0]*v[0]+A[1][1]*v[1]];
}

function det(A:M2) {
  return A[0][0]*A[1][1]-A[0][1]*A[1][0];
}

function inverse(A:M2):M2 {
  const d=det(A);
  if(Math.abs(d)<1e-8) return [[1,0],[0,1]];
  return [[A[1][1]/d,-A[0][1]/d],[-A[1][0]/d,A[0][0]/d]];
}

function transpose(A:M2):M2 {
  return [[A[0][0],A[1][0]],[A[0][1],A[1][1]]];
}

function rotation(angle:number):M2 {
  const a=angle*Math.PI/180;
  return [[Math.cos(a),-Math.sin(a)],[Math.sin(a),Math.cos(a)]];
}

function dot(a:V2,b:V2) {
  return a[0]*b[0]+a[1]*b[1];
}

function Arrow({origin=[0,0],vector,className,label}:{origin?:V2;vector:V2;className:string;label:string}) {
  const a=screen(origin);
  const b=screen([origin[0]+vector[0],origin[1]+vector[1]]);
  const angle=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
  return (
    <g className={className}>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}/>
      <polygon points="-9,-4 0,0 -9,4" transform={"translate("+b[0]+" "+b[1]+") rotate("+angle+")"}/>
      <text x={b[0]+8} y={b[1]-8}>{label}</text>
    </g>
  );
}

function Axes() {
  return (
    <g className="tensor-axes">
      <line x1="18" y1={CY} x2="462" y2={CY}/>
      <line x1={CX} y1="18" x2={CX} y2="342"/>
    </g>
  );
}

function MatrixBox({title,A}:{title:string;A:M2}) {
  return (
    <div className="tensor-matrix-box">
      <span>{title}</span>
      <div>
        <b>{A[0][0].toFixed(2)}</b><b>{A[0][1].toFixed(2)}</b>
        <b>{A[1][0].toFixed(2)}</b><b>{A[1][1].toFixed(2)}</b>
      </div>
    </div>
  );
}

function TensorBasisLab() {
  const [angle,setAngle]=useState(28);
  const [sx,setSx]=useState(1.4);
  const [sy,setSy]=useState(.8);
  const [shear,setShear]=useState(.35);
  const [x,setX]=useState<V2>([2.1,1.35]);
  const [phi,setPhi]=useState<V2>([1.2,-.7]);

  const R=rotation(angle);
  const D:M2=[[sx,shear],[0,sy]];
  const S=mul(R,D);
  const Sinv=inverse(S);
  const xPrime=apply(Sinv,x);
  const phiPrime:V2=[
    phi[0]*S[0][0]+phi[1]*S[1][0],
    phi[0]*S[0][1]+phi[1]*S[1][1],
  ];
  const pairing=dot(phi,x);
  const pairingPrime=dot(phiPrime,xPrime);

  const e1:V2=[S[0][0],S[1][0]];
  const e2:V2=[S[0][1],S[1][1]];

  const levelLines=useMemo(()=>{
    const n=phi;
    const norm2=dot(n,n)||1;
    const dir:V2=[-n[1],n[0]];
    const dn=Math.hypot(dir[0],dir[1])||1;
    const u:V2=[dir[0]/dn,dir[1]/dn];
    return [-2,-1,0,1,2].map((c)=>{
      const base:V2=[n[0]*c/norm2,n[1]*c/norm2];
      return [
        screen([base[0]-u[0]*7,base[1]-u[1]*7]),
        screen([base[0]+u[0]*7,base[1]+u[1]*7]),
      ] as [V2,V2];
    });
  },[phi]);

  return (
    <section className="tensor-lab">
      <header>
        <div className="eyebrow">TENSOR TRANSFORM / БАЗИС МЕНЯЕТСЯ — ОБЪЕКТ НЕТ</div>
        <h2>Вектор и ковектор реагируют на смену базиса противоположным образом.</h2>
        <p>
          Физический вектор x и линейная функция φ фиксированы. Меняются только их компоненты:
          ξ′=S⁻¹ξ, а φ′=φS. Значение φ(x) остаётся инвариантным.
        </p>
      </header>

      <div className="tensor-layout">
        <div className="tensor-stage">
          <svg viewBox="0 0 480 360">
            <Axes/>
            {levelLines.map((line,i)=><line key={i} className={i===2?"tensor-covector-zero":"tensor-covector-level"} x1={line[0][0]} y1={line[0][1]} x2={line[1][0]} y2={line[1][1]}/>)}
            <Arrow vector={[1,0]} className="tensor-old-axis" label="e₁"/>
            <Arrow vector={[0,1]} className="tensor-old-axis second" label="e₂"/>
            <Arrow vector={e1} className="tensor-new-axis-a" label="e′₁"/>
            <Arrow vector={e2} className="tensor-new-axis-b" label="e′₂"/>
            <Arrow vector={x} className="tensor-object-vector" label="x"/>
          </svg>
          <div className="tensor-stage-badges">
            <span>φ(x)={pairing.toFixed(3)}</span>
            <span>φ′(x′)={pairingPrime.toFixed(3)}</span>
            <span>difference={(pairing-pairingPrime).toExponential(1)}</span>
          </div>
        </div>

        <aside className="tensor-controls">
          <label><span>поворот S</span><input type="range" min="-120" max="120" step="1" value={angle} onChange={(e)=>setAngle(Number(e.target.value))}/><b>{angle}°</b></label>
          <label><span>scale x</span><input type="range" min=".45" max="2.2" step=".05" value={sx} onChange={(e)=>setSx(Number(e.target.value))}/><b>{sx.toFixed(2)}</b></label>
          <label><span>scale y</span><input type="range" min=".45" max="2.2" step=".05" value={sy} onChange={(e)=>setSy(Number(e.target.value))}/><b>{sy.toFixed(2)}</b></label>
          <label><span>shear</span><input type="range" min="-1.2" max="1.2" step=".05" value={shear} onChange={(e)=>setShear(Number(e.target.value))}/><b>{shear.toFixed(2)}</b></label>

          <div className="tensor-pair-grid">
            <div>
              <span>VECTOR (1,0)</span>
              <strong>ξ = ({x[0].toFixed(2)}, {x[1].toFixed(2)})</strong>
              <code>ξ′ = ({xPrime[0].toFixed(2)}, {xPrime[1].toFixed(2)})</code>
            </div>
            <div>
              <span>COVECTOR (0,1)</span>
              <strong>φ = ({phi[0].toFixed(2)}, {phi[1].toFixed(2)})</strong>
              <code>φ′ = ({phiPrime[0].toFixed(2)}, {phiPrime[1].toFixed(2)})</code>
            </div>
          </div>

          <details className="tensor-details">
            <summary>Изменить x и φ</summary>
            <div className="tensor-inline-controls">
              <label><span>x₁</span><input type="number" step=".1" value={x[0]} onChange={(e)=>setX([Number(e.target.value),x[1]])}/></label>
              <label><span>x₂</span><input type="number" step=".1" value={x[1]} onChange={(e)=>setX([x[0],Number(e.target.value)])}/></label>
              <label><span>φ₁</span><input type="number" step=".1" value={phi[0]} onChange={(e)=>setPhi([Number(e.target.value),phi[1]])}/></label>
              <label><span>φ₂</span><input type="number" step=".1" value={phi[1]} onChange={(e)=>setPhi([phi[0],Number(e.target.value)])}/></label>
            </div>
          </details>
        </aside>
      </div>
    </section>
  );
}

function ContractionLab() {
  const [A,setA]=useState<M2>([[2,-1],[.5,3]]);
  const trace=A[0][0]+A[1][1];

  const setEntry=(r:number,c:number,value:number)=>{
    const next:M2=[[...A[0]],[...A[1]]] as M2;
    next[r][c]=value;
    setA(next);
  };

  return (
    <section className="tensor-lab contraction-lab">
      <header>
        <div className="eyebrow">CONTRACTION / СВЁРТКА</div>
        <h2>Свёртка «склеивает» один верхний и один нижний индекс.</h2>
        <p>Для тензора типа (1,1) это превращает матрицу в скаляр — её след.</p>
      </header>

      <div className="contraction-demo">
        <div className="contraction-matrix">
          <span>Aⁱⱼ</span>
          <div>
            {[0,1].flatMap((r)=>[0,1].map((c)=>(
              <label key={r+"-"+c} className={r===c?"diagonal":""}>
                <small>{r===c?"суммируем":""}</small>
                <input type="number" step=".1" value={A[r][c]} onChange={(e)=>setEntry(r,c,Number(e.target.value))}/>
              </label>
            )))}
          </div>
        </div>

        <div className="contraction-arrow">
          <span>Σᵢ</span>
          <i>→</i>
        </div>

        <div className="contraction-result">
          <span>aⁱᵢ</span>
          <strong>{A[0][0].toFixed(2)} + {A[1][1].toFixed(2)}</strong>
          <b>= {trace.toFixed(2)}</b>
          <small>тип (1,1) → тип (0,0)</small>
        </div>
      </div>
    </section>
  );
}

function MetricIndexLab() {
  const [angle,setAngle]=useState(58);
  const [length,setLength]=useState(1.35);
  const [contrav,setContrav]=useState<V2>([1.4,-.65]);
  const a=angle*Math.PI/180;
  const e1:V2=[1,0];
  const e2:V2=[length*Math.cos(a),length*Math.sin(a)];
  const S:M2=[[e1[0],e2[0]],[e1[1],e2[1]]];
  const G=mul(transpose(S),S);
  const Ginv=inverse(G);
  const cov=apply(G,contrav);
  const raised=apply(Ginv,cov);
  const physical=apply(S,contrav);

  return (
    <section className="tensor-lab metric-lab">
      <header>
        <div className="eyebrow">METRIC TENSOR / RAISE & LOWER</div>
        <h2>Метрика превращает верхний индекс в нижний — и обратно.</h2>
        <p>В неортонормированном базисе компоненты aⁱ и aᵢ уже не совпадают: между ними стоит матрица Грама gᵢⱼ.</p>
      </header>

      <div className="tensor-layout">
        <div className="tensor-stage">
          <svg viewBox="0 0 480 360">
            <Axes/>
            <Arrow vector={e1} className="tensor-new-axis-a" label="e₁"/>
            <Arrow vector={e2} className="tensor-new-axis-b" label="e₂"/>
            <Arrow vector={physical} className="tensor-object-vector" label="a"/>
          </svg>
          <div className="tensor-stage-badges">
            <span>g₁₁={G[0][0].toFixed(2)}</span>
            <span>g₁₂={G[0][1].toFixed(2)}</span>
            <span>g₂₂={G[1][1].toFixed(2)}</span>
          </div>
        </div>

        <aside className="tensor-controls">
          <label><span>угол e₂</span><input type="range" min="18" max="162" step="1" value={angle} onChange={(e)=>setAngle(Number(e.target.value))}/><b>{angle}°</b></label>
          <label><span>|e₂|</span><input type="range" min=".55" max="2.1" step=".05" value={length} onChange={(e)=>setLength(Number(e.target.value))}/><b>{length.toFixed(2)}</b></label>

          <div className="tensor-matrices-row">
            <MatrixBox title="gᵢⱼ" A={G}/>
            <MatrixBox title="gⁱʲ" A={Ginv}/>
          </div>

          <div className="tensor-index-flow">
            <div><span>верхние</span><strong>aⁱ = ({contrav[0].toFixed(2)}, {contrav[1].toFixed(2)})</strong></div>
            <i>gᵢⱼ ↓</i>
            <div><span>нижние</span><strong>aᵢ = ({cov[0].toFixed(2)}, {cov[1].toFixed(2)})</strong></div>
            <i>gⁱʲ ↑</i>
            <div><span>подняли обратно</span><strong>({raised[0].toFixed(2)}, {raised[1].toFixed(2)})</strong></div>
          </div>

          <div className="tensor-inline-controls two">
            <label><span>a¹</span><input type="number" step=".1" value={contrav[0]} onChange={(e)=>setContrav([Number(e.target.value),contrav[1]])}/></label>
            <label><span>a²</span><input type="number" step=".1" value={contrav[1]} onChange={(e)=>setContrav([contrav[0],Number(e.target.value)])}/></label>
          </div>
        </aside>
      </div>
    </section>
  );
}

function WedgeLab() {
  const [a1,setA1]=useState(18);
  const [a2,setA2]=useState(82);
  const [l1,setL1]=useState(2.2);
  const [l2,setL2]=useState(1.8);

  const u:V2=[l1*Math.cos(a1*Math.PI/180),l1*Math.sin(a1*Math.PI/180)];
  const v:V2=[l2*Math.cos(a2*Math.PI/180),l2*Math.sin(a2*Math.PI/180)];
  const wedge=u[0]*v[1]-u[1]*v[0];
  const parallelogram=[screen([0,0]),screen(u),screen([u[0]+v[0],u[1]+v[1]]),screen(v)]
    .map((p)=>p.join(",")).join(" ");

  return (
    <section className="tensor-lab wedge-lab">
      <header>
        <div className="eyebrow">EXTERIOR ALGEBRA / u ∧ v</div>
        <h2>Внешнее произведение двух векторов измеряет ориентированную площадь.</h2>
        <p>Когда u и v становятся зависимыми, параллелограмм схлопывается и u∧v=0.</p>
      </header>

      <div className="tensor-layout">
        <div className="tensor-stage">
          <svg viewBox="0 0 480 360">
            <Axes/>
            <polygon className={wedge>=0?"wedge-area positive":"wedge-area negative"} points={parallelogram}/>
            <Arrow vector={u} className="tensor-new-axis-a" label="u"/>
            <Arrow vector={v} className="tensor-new-axis-b" label="v"/>
          </svg>
          <div className="tensor-stage-badges">
            <span>u∧v = {wedge.toFixed(3)}</span>
            <span>v∧u = {(-wedge).toFixed(3)}</span>
            <span>|area| = {Math.abs(wedge).toFixed(3)}</span>
          </div>
        </div>

        <aside className="tensor-controls">
          <label><span>arg u</span><input type="range" min="-180" max="180" step="1" value={a1} onChange={(e)=>setA1(Number(e.target.value))}/><b>{a1}°</b></label>
          <label><span>|u|</span><input type="range" min=".4" max="3" step=".05" value={l1} onChange={(e)=>setL1(Number(e.target.value))}/><b>{l1.toFixed(2)}</b></label>
          <label><span>arg v</span><input type="range" min="-180" max="180" step="1" value={a2} onChange={(e)=>setA2(Number(e.target.value))}/><b>{a2}°</b></label>
          <label><span>|v|</span><input type="range" min=".4" max="3" step=".05" value={l2} onChange={(e)=>setL2(Number(e.target.value))}/><b>{l2.toFixed(2)}</b></label>

          <div className="wedge-law">
            <span>АНТИКОММУТАТИВНОСТЬ 1-ФОРМ</span>
            <strong>u ∧ v = − v ∧ u</strong>
          </div>

          <div className="tensor-readout">
            <div><span>ориентация</span><strong>{wedge>0?"положительная":wedge<0?"отрицательная":"вырождена"}</strong></div>
            <div><span>линейно зависимы</span><strong>{Math.abs(wedge)<.03?"да":"нет"}</strong></div>
            <div><span>det[u v]</span><strong>{wedge.toFixed(3)}</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function TensorVisualInsert({topicId,index}:{topicId:string;index:number}) {
  if(topicId==="tensor-linear" && index===7) return <TensorBasisLab/>;
  if(topicId==="tensor-linear" && index===13) return <ContractionLab/>;
  if(topicId==="tensor-euclidean" && index===4) return <MetricIndexLab/>;
  if(topicId==="exterior-algebra" && index===10) return <WedgeLab/>;
  return null;
}
