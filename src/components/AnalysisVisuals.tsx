import { useMemo, useState } from "react";

type Point = [number, number];

const W = 520;
const H = 330;
const PAD = 36;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function mapX(x: number, min = -5, max = 5) {
  return PAD + ((x - min) / (max - min)) * (W - PAD * 2);
}

function mapY(y: number, min = -4, max = 4) {
  return H - PAD - ((y - min) / (max - min)) * (H - PAD * 2);
}

function polyline(points: Point[], xMin = -5, xMax = 5, yMin = -4, yMax = 4) {
  return points
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
    .map(([x, y]) => mapX(x, xMin, xMax).toFixed(2) + "," + mapY(y, yMin, yMax).toFixed(2))
    .join(" ");
}

function PlotAxes({
  xMin = -5,
  xMax = 5,
  yMin = -4,
  yMax = 4,
}: {
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
}) {
  const zeroX = mapX(0, xMin, xMax);
  const zeroY = mapY(0, yMin, yMax);
  return (
    <g className="analysis-axes">
      {zeroY >= PAD && zeroY <= H - PAD && <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} />}
      {zeroX >= PAD && zeroX <= W - PAD && <line x1={zeroX} y1={PAD} x2={zeroX} y2={H - PAD} />}
    </g>
  );
}

function NumberLineLab() {
  const [a1, setA1] = useState(-3.2);
  const [b1, setB1] = useState(1.1);
  const [a2, setA2] = useState(-.5);
  const [b2, setB2] = useState(3.4);
  const [closedA, setClosedA] = useState(true);
  const [closedB, setClosedB] = useState(false);
  const [epsilon, setEpsilon] = useState(.8);
  const [center, setCenter] = useState(.4);

  const left = Math.max(a1, a2);
  const right = Math.min(b1, b2);
  const hasIntersection = left < right || Math.abs(left - right) < 1e-8;

  const intervalText = (a: number, b: number, leftClosed: boolean, rightClosed: boolean) =>
    (leftClosed ? "[" : "(") + a.toFixed(1) + ", " + b.toFixed(1) + (rightClosed ? "]" : ")");

  return (
    <section className="analysis-lab number-line-lab">
      <header>
        <div className="eyebrow">SETS / NUMBER LINE</div>
        <h2>Множества на прямой можно буквально видеть.</h2>
        <p>Двигай два промежутка, смотри их пересечение и отдельно меняй ε-окрестность точки x₀.</p>
      </header>

      <div className="analysis-layout">
        <div className="analysis-stage number-line-stage">
          <svg viewBox={"0 0 " + W + " " + H}>
            <line className="number-axis" x1={PAD} y1="95" x2={W-PAD} y2="95" />
            {Array.from({length:11},(_,i)=>i-5).map((x)=>(
              <g key={x}>
                <line className="number-tick" x1={mapX(x)} y1="89" x2={mapX(x)} y2="101" />
                <text className="number-label" x={mapX(x)} y="118">{x}</text>
              </g>
            ))}

            <line className="interval-a" x1={mapX(a1)} y1="70" x2={mapX(b1)} y2="70" />
            <circle className={closedA?"interval-end closed":"interval-end"} cx={mapX(a1)} cy="70" r="6" />
            <circle className={closedB?"interval-end closed":"interval-end"} cx={mapX(b1)} cy="70" r="6" />

            <line className="interval-b" x1={mapX(a2)} y1="140" x2={mapX(b2)} y2="140" />
            <circle className="interval-end-b closed" cx={mapX(a2)} cy="140" r="6" />
            <circle className="interval-end-b closed" cx={mapX(b2)} cy="140" r="6" />

            {hasIntersection && (
              <line className="interval-intersection" x1={mapX(left)} y1="176" x2={mapX(right)} y2="176" />
            )}

            <line className="number-axis faint" x1={PAD} y1="245" x2={W-PAD} y2="245" />
            <rect
              className="epsilon-neighborhood"
              x={mapX(center-epsilon)}
              y="224"
              width={Math.max(1,mapX(center+epsilon)-mapX(center-epsilon))}
              height="42"
              rx="10"
            />
            <circle className="epsilon-center" cx={mapX(center)} cy="245" r="6" />
            <text className="epsilon-text" x={mapX(center)} y="215">x₀</text>
            <text className="epsilon-bound" x={mapX(center-epsilon)} y="284">x₀−ε</text>
            <text className="epsilon-bound" x={mapX(center+epsilon)} y="284">x₀+ε</text>
          </svg>

          <div className="analysis-stage-badges">
            <span>A {intervalText(a1,b1,closedA,closedB)}</span>
            <span>B [{a2.toFixed(1)}, {b2.toFixed(1)}]</span>
            <span>A∩B = {hasIntersection ? "["+left.toFixed(1)+", "+right.toFixed(1)+"]" : "∅"}</span>
          </div>
        </div>

        <aside className="analysis-controls">
          <label><span>A left</span><input type="range" min="-4.5" max=".5" step=".1" value={a1} onChange={(e)=>setA1(Math.min(Number(e.target.value),b1-.1))}/><b>{a1.toFixed(1)}</b></label>
          <label><span>A right</span><input type="range" min="-.3" max="4.5" step=".1" value={b1} onChange={(e)=>setB1(Math.max(Number(e.target.value),a1+.1))}/><b>{b1.toFixed(1)}</b></label>
          <div className="analysis-toggle-row">
            <button className={closedA?"active":""} onClick={()=>setClosedA(v=>!v)}>левый {closedA?"закрыт":"открыт"}</button>
            <button className={closedB?"active":""} onClick={()=>setClosedB(v=>!v)}>правый {closedB?"закрыт":"открыт"}</button>
          </div>
          <label><span>B left</span><input type="range" min="-4.5" max=".5" step=".1" value={a2} onChange={(e)=>setA2(Math.min(Number(e.target.value),b2-.1))}/><b>{a2.toFixed(1)}</b></label>
          <label><span>B right</span><input type="range" min="-.3" max="4.5" step=".1" value={b2} onChange={(e)=>setB2(Math.max(Number(e.target.value),a2+.1))}/><b>{b2.toFixed(1)}</b></label>
          <label><span>x₀</span><input type="range" min="-3" max="3" step=".1" value={center} onChange={(e)=>setCenter(Number(e.target.value))}/><b>{center.toFixed(1)}</b></label>
          <label><span>ε</span><input type="range" min=".1" max="2" step=".05" value={epsilon} onChange={(e)=>setEpsilon(Number(e.target.value))}/><b>{epsilon.toFixed(2)}</b></label>
          <div className="analysis-formula-box">
            <span>ε-ОКРЕСТНОСТЬ</span>
            <code>|x−x₀| &lt; ε</code>
          </div>
        </aside>
      </div>
    </section>
  );
}

type FunctionMode = "square" | "cube" | "sin" | "exp" | "inverse";

const FUNCTION_META: Record<FunctionMode,{label:string;formula:string;fn:(x:number)=>number;xMin:number;xMax:number;yMin:number;yMax:number;note:string}> = {
  square:{label:"x²",formula:"f(x)=x²",fn:(x)=>x*x,xMin:-3,xMax:3,yMin:-1,yMax:9,note:"чётная; не монотонна на всей ℝ"},
  cube:{label:"x³",formula:"f(x)=x³",fn:(x)=>x*x*x,xMin:-2.1,xMax:2.1,yMin:-8,yMax:8,note:"нечётная; строго возрастает"},
  sin:{label:"sin x",formula:"f(x)=sin x",fn:Math.sin,xMin:-Math.PI*2,xMax:Math.PI*2,yMin:-1.5,yMax:1.5,note:"нечётная; период 2π"},
  exp:{label:"eˣ",formula:"f(x)=eˣ",fn:Math.exp,xMin:-3,xMax:2.2,yMin:-.5,yMax:8,note:"строго возрастает; E(f)=(0,+∞)"},
  inverse:{label:"x² ↔ √x",formula:"f(x)=x², x≥0",fn:(x)=>x*x,xMin:0,xMax:3,yMin:0,yMax:9,note:"на [0,+∞) обратима; f⁻¹(x)=√x"},
};

function FunctionExplorerLab() {
  const [mode,setMode]=useState<FunctionMode>("square");
  const meta=FUNCTION_META[mode];
  const steps=220;
  const curve=Array.from({length:steps},(_,i):Point=>{
    const x=meta.xMin+i/(steps-1)*(meta.xMax-meta.xMin);
    return [x,meta.fn(x)];
  });
  const inverseCurve=mode==="inverse"
    ? Array.from({length:160},(_,i):Point=>{
        const x=i/159*9;
        return [x,Math.sqrt(x)];
      })
    : [];

  return (
    <section className="analysis-lab function-explorer-lab">
      <header>
        <div className="eyebrow">FUNCTION EXPLORER</div>
        <h2>Формула — только один слой функции. Смотри область, симметрию и обратимость.</h2>
      </header>
      <div className="analysis-preset-row">
        {(Object.keys(FUNCTION_META) as FunctionMode[]).map((id)=>(
          <button key={id} className={mode===id?"active":""} onClick={()=>setMode(id)}>{FUNCTION_META[id].label}</button>
        ))}
      </div>
      <div className="analysis-layout">
        <div className="analysis-stage">
          <svg viewBox={"0 0 "+W+" "+H}>
            <PlotAxes xMin={meta.xMin} xMax={meta.xMax} yMin={meta.yMin} yMax={meta.yMax}/>
            {mode==="inverse" && (
              <line className="inverse-bisector" x1={mapX(0,0,9)} y1={mapY(0,0,9)} x2={mapX(9,0,9)} y2={mapY(9,0,9)}/>
            )}
            <polyline className="analysis-curve" points={polyline(curve,meta.xMin,meta.xMax,meta.yMin,meta.yMax)}/>
            {mode==="inverse" && (
              <polyline className="analysis-curve secondary" points={polyline(inverseCurve,0,9,0,9)}/>
            )}
          </svg>
          <div className="analysis-stage-badges">
            <span>{meta.formula}</span>
            <span>{meta.note}</span>
          </div>
        </div>
        <aside className="analysis-controls">
          <div className="analysis-formula-box"><span>ТЕКУЩАЯ ФУНКЦИЯ</span><code>{meta.formula}</code></div>
          <div className="analysis-readout">
            {mode==="square" && <>
              <div><span>чётность</span><strong>чётная</strong></div>
              <div><span>симметрия</span><strong>относительно Oy</strong></div>
              <div><span>минимум</span><strong>f(0)=0</strong></div>
            </>}
            {mode==="cube" && <>
              <div><span>чётность</span><strong>нечётная</strong></div>
              <div><span>симметрия</span><strong>центр O</strong></div>
              <div><span>монотонность</span><strong>возрастает</strong></div>
            </>}
            {mode==="sin" && <>
              <div><span>период</span><strong>2π</strong></div>
              <div><span>ограниченность</span><strong>|f|≤1</strong></div>
              <div><span>чётность</span><strong>нечётная</strong></div>
            </>}
            {mode==="exp" && <>
              <div><span>D(f)</span><strong>ℝ</strong></div>
              <div><span>E(f)</span><strong>(0,+∞)</strong></div>
              <div><span>обратная</span><strong>ln x</strong></div>
            </>}
            {mode==="inverse" && <>
              <div><span>ограничение</span><strong>x≥0</strong></div>
              <div><span>f⁻¹(x)</span><strong>√x</strong></div>
              <div><span>симметрия графиков</span><strong>относительно y=x</strong></div>
            </>}
          </div>
        </aside>
      </div>
    </section>
  );
}

type SequenceMode = "one-over-n" | "one-minus" | "alternating";

function sequenceValue(mode:SequenceMode,n:number) {
  if(mode==="one-over-n") return 1/n;
  if(mode==="one-minus") return (n-1)/n;
  return (n%2===0?1:-1)/n;
}

function sequenceLimit(mode:SequenceMode) {
  return mode==="one-minus"?1:0;
}

function SequenceLimitLab() {
  const [mode,setMode]=useState<SequenceMode>("one-minus");
  const [epsilon,setEpsilon]=useState(.15);
  const limit=sequenceLimit(mode);
  const N=useMemo(()=>{
    for(let n=1;n<10000;n++){
      let ok=true;
      for(let k=n+1;k<n+250;k++){
        if(Math.abs(sequenceValue(mode,k)-limit)>=epsilon){ok=false;break;}
      }
      if(ok) return n;
    }
    return 9999;
  },[mode,epsilon]);

  const shown=32;
  const yMin=mode==="alternating"?-.6:mode==="one-minus"?0:0;
  const yMax=mode==="one-minus"?1.2:1.1;
  const sx=(n:number)=>PAD+(n-1)/(shown-1)*(W-PAD*2);
  const sy=(y:number)=>mapY(y,yMin,yMax);

  return (
    <section className="analysis-lab sequence-lab">
      <header>
        <div className="eyebrow">ε–N LAB</div>
        <h2>Предел последовательности начинается не с «почти», а с номера N.</h2>
        <p>Меняй ε: система ищет номер, после которого весь показанный хвост гарантированно лежит в ε-полосе.</p>
      </header>
      <div className="analysis-preset-row">
        <button className={mode==="one-minus"?"active":""} onClick={()=>setMode("one-minus")}>(n−1)/n → 1</button>
        <button className={mode==="one-over-n"?"active":""} onClick={()=>setMode("one-over-n")}>1/n → 0</button>
        <button className={mode==="alternating"?"active":""} onClick={()=>setMode("alternating")}>(−1)ⁿ/n → 0</button>
      </div>
      <div className="analysis-layout">
        <div className="analysis-stage">
          <svg viewBox={"0 0 "+W+" "+H}>
            <rect className="epsilon-band" x={PAD} y={sy(limit+epsilon)} width={W-PAD*2} height={Math.max(1,sy(limit-epsilon)-sy(limit+epsilon))} />
            <line className="limit-line" x1={PAD} y1={sy(limit)} x2={W-PAD} y2={sy(limit)} />
            {Array.from({length:shown},(_,i)=>i+1).map(n=>{
              const val=sequenceValue(mode,n);
              return <circle key={n} className={n>N?"sequence-point tail":"sequence-point"} cx={sx(n)} cy={sy(val)} r={n>N?4:3}/>;
            })}
            {N<shown && <line className="sequence-N-line" x1={sx(N)} y1={PAD} x2={sx(N)} y2={H-PAD}/>}
          </svg>
          <div className="analysis-stage-badges">
            <span>a={limit}</span><span>ε={epsilon.toFixed(3)}</span><span>N={N}</span>
          </div>
        </div>
        <aside className="analysis-controls">
          <label><span>ε</span><input type="range" min=".02" max=".5" step=".01" value={epsilon} onChange={(e)=>setEpsilon(Number(e.target.value))}/><b>{epsilon.toFixed(2)}</b></label>
          <div className="analysis-formula-box">
            <span>ОПРЕДЕЛЕНИЕ</span>
            <code>n &gt; N ⇒ |xₙ−a| &lt; ε</code>
          </div>
          <div className="analysis-readout">
            <div><span>предел a</span><strong>{limit}</strong></div>
            <div><span>найденный N</span><strong>{N}</strong></div>
            <div><span>вне ε-полосы</span><strong>только конечный префикс</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

type LimitMode = "linear" | "square";

function EpsilonDeltaLab() {
  const [mode,setMode]=useState<LimitMode>("linear");
  const [epsilon,setEpsilon]=useState(.7);
  const x0=mode==="linear"?3:1;
  const A=mode==="linear"?5:1;
  const fn=(x:number)=>mode==="linear"?2*x-1:x*x;
  const delta=mode==="linear"?epsilon/2:Math.min(1,epsilon/3);
  const xMin=x0-2.4,xMax=x0+2.4,yMin=A-4.5,yMax=A+4.5;
  const curve=Array.from({length:220},(_,i):Point=>{
    const x=xMin+i/219*(xMax-xMin);
    return [x,fn(x)];
  });

  return (
    <section className="analysis-lab epsilon-delta-lab">
      <header>
        <div className="eyebrow">ε–δ LAB</div>
        <h2>Ты выбираешь точность по y. δ отвечает, насколько близко надо подойти по x.</h2>
      </header>
      <div className="analysis-preset-row">
        <button className={mode==="linear"?"active":""} onClick={()=>setMode("linear")}>2x−1, x→3</button>
        <button className={mode==="square"?"active":""} onClick={()=>setMode("square")}>x², x→1</button>
      </div>
      <div className="analysis-layout">
        <div className="analysis-stage">
          <svg viewBox={"0 0 "+W+" "+H}>
            <rect className="limit-horizontal-band" x={PAD} y={mapY(A+epsilon,yMin,yMax)} width={W-PAD*2} height={mapY(A-epsilon,yMin,yMax)-mapY(A+epsilon,yMin,yMax)} />
            <rect className="limit-vertical-band" x={mapX(x0-delta,xMin,xMax)} y={PAD} width={mapX(x0+delta,xMin,xMax)-mapX(x0-delta,xMin,xMax)} height={H-PAD*2} />
            <PlotAxes xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax}/>
            <polyline className="analysis-curve" points={polyline(curve,xMin,xMax,yMin,yMax)}/>
            <circle className="limit-center-point" cx={mapX(x0,xMin,xMax)} cy={mapY(A,yMin,yMax)} r="6"/>
          </svg>
          <div className="analysis-stage-badges">
            <span>ε={epsilon.toFixed(2)}</span><span>δ={delta.toFixed(3)}</span><span>(x₀,A)=({x0},{A})</span>
          </div>
        </div>
        <aside className="analysis-controls">
          <label><span>ε</span><input type="range" min=".1" max="2" step=".05" value={epsilon} onChange={(e)=>setEpsilon(Number(e.target.value))}/><b>{epsilon.toFixed(2)}</b></label>
          <div className="analysis-formula-box">
            <span>КОШИ</span>
            <code>0&lt;|x−x₀|&lt;δ ⇒ |f(x)−A|&lt;ε</code>
          </div>
          <div className="analysis-readout">
            <div><span>выбранное ε</span><strong>{epsilon.toFixed(3)}</strong></div>
            <div><span>достаточное δ</span><strong>{delta.toFixed(3)}</strong></div>
            <div><span>f(x₀)</span><strong>для предела не требуется</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

type SmallMode = "sin" | "square" | "tan" | "cos";

const SMALL_META:Record<SmallMode,{label:string;alpha:(x:number)=>number;beta:(x:number)=>number;ratioLabel:string;relation:string}> = {
  sin:{label:"sin x vs x",alpha:Math.sin,beta:(x)=>x,ratioLabel:"sin x / x",relation:"эквивалентны"},
  square:{label:"x² vs x",alpha:(x)=>x*x,beta:(x)=>x,ratioLabel:"x² / x",relation:"x² более высокого порядка"},
  tan:{label:"tan x vs x",alpha:Math.tan,beta:(x)=>x,ratioLabel:"tan x / x",relation:"эквивалентны"},
  cos:{label:"1−cos x vs x²/2",alpha:(x)=>1-Math.cos(x),beta:(x)=>x*x/2,ratioLabel:"(1−cos x)/(x²/2)",relation:"эквивалентны"},
};

function InfinitesimalLab() {
  const [mode,setMode]=useState<SmallMode>("sin");
  const [x,setX]=useState(.65);
  const meta=SMALL_META[mode];
  const ratio=Math.abs(meta.beta(x))<1e-10?NaN:meta.alpha(x)/meta.beta(x);
  const xs=Array.from({length:151},(_,i)=>-1.2+i/150*2.4).filter(v=>Math.abs(v)>.015);
  const alphaPts=xs.map(v=>[v,meta.alpha(v)] as Point);
  const betaPts=xs.map(v=>[v,meta.beta(v)] as Point);

  return (
    <section className="analysis-lab infinitesimal-lab">
      <header>
        <div className="eyebrow">INFINITESIMAL COMPARATOR</div>
        <h2>Сравнивать малые надо не по виду графика, а по пределу отношения.</h2>
      </header>
      <div className="analysis-preset-row">
        {(Object.keys(SMALL_META) as SmallMode[]).map(id=><button key={id} className={mode===id?"active":""} onClick={()=>setMode(id)}>{SMALL_META[id].label}</button>)}
      </div>
      <div className="analysis-layout">
        <div className="analysis-stage">
          <svg viewBox={"0 0 "+W+" "+H}>
            <PlotAxes xMin={-1.2} xMax={1.2} yMin={-1.6} yMax={1.6}/>
            <polyline className="analysis-curve" points={polyline(alphaPts,-1.2,1.2,-1.6,1.6)}/>
            <polyline className="analysis-curve secondary" points={polyline(betaPts,-1.2,1.2,-1.6,1.6)}/>
            <line className="small-x-marker" x1={mapX(x,-1.2,1.2)} y1={PAD} x2={mapX(x,-1.2,1.2)} y2={H-PAD}/>
          </svg>
          <div className="analysis-stage-badges"><span>α={meta.alpha(x).toFixed(4)}</span><span>β={meta.beta(x).toFixed(4)}</span><span>α/β={Number.isFinite(ratio)?ratio.toFixed(5):"—"}</span></div>
        </div>
        <aside className="analysis-controls">
          <label><span>x → 0</span><input type="range" min=".02" max="1.1" step=".01" value={x} onChange={(e)=>setX(Number(e.target.value))}/><b>{x.toFixed(2)}</b></label>
          <div className="analysis-formula-box"><span>СРАВНЕНИЕ</span><code>{meta.ratioLabel}</code></div>
          <div className="analysis-readout">
            <div><span>текущее отношение</span><strong>{Number.isFinite(ratio)?ratio.toFixed(6):"—"}</strong></div>
            <div><span>x→0</span><strong>{meta.relation}</strong></div>
            <div><span>эквивалентность</span><strong>{mode==="square"?"нет":"α∼β"}</strong></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

type ContinuityMode = "continuous" | "removable" | "jump" | "infinite";

function ContinuityLab() {
  const [mode,setMode]=useState<ContinuityMode>("removable");
  const x0=0;
  const segments=useMemo(()=>{
    if(mode==="continuous") return [{points:Array.from({length:201},(_,i):Point=>{const x=-4+i/200*8;return [x,.18*x*x+.4*x-.3]})}];
    if(mode==="removable") return [{points:Array.from({length:201},(_,i):Point=>{const x=-4+i/200*8;return [x,Math.abs(x)<.03?NaN:Math.sin(x)/x]})}];
    if(mode==="jump") return [
      {points:Array.from({length:101},(_,i):Point=>[-4+i/100*4,-1])},
      {points:Array.from({length:101},(_,i):Point=>[.001+i/100*3.999,1])},
    ];
    return [
      {points:Array.from({length:100},(_,i):Point=>[-4+i/100*3.9,1/(-4+i/100*3.9)])},
      {points:Array.from({length:100},(_,i):Point=>[.1+i/100*3.9,1/(.1+i/100*3.9)])},
    ];
  },[mode]);

  const data={
    continuous:{left:"f(0)",right:"f(0)",value:"совпадает",type:"непрерывна"},
    removable:{left:"1",right:"1",value:"2",type:"устранимый разрыв"},
    jump:{left:"−1",right:"1",value:"1",type:"скачок, I род"},
    infinite:{left:"−∞",right:"+∞",value:"не определено",type:"II род"},
  }[mode];

  return (
    <section className="analysis-lab continuity-lab">
      <header>
        <div className="eyebrow">CONTINUITY / DISCONTINUITY</div>
        <h2>Смотри отдельно: левый предел, правый предел и значение в точке.</h2>
      </header>
      <div className="analysis-preset-row">
        <button className={mode==="continuous"?"active":""} onClick={()=>setMode("continuous")}>непрерывная</button>
        <button className={mode==="removable"?"active":""} onClick={()=>setMode("removable")}>устранимый</button>
        <button className={mode==="jump"?"active":""} onClick={()=>setMode("jump")}>скачок</button>
        <button className={mode==="infinite"?"active":""} onClick={()=>setMode("infinite")}>II род</button>
      </div>
      <div className="analysis-layout">
        <div className="analysis-stage">
          <svg viewBox={"0 0 "+W+" "+H}>
            <PlotAxes xMin={-4} xMax={4} yMin={-3} yMax={3}/>
            {segments.map((segment,index)=><polyline key={index} className="analysis-curve" points={polyline(segment.points,-4,4,-3,3)}/>)}
            {mode==="removable" && <>
              <circle className="continuity-hole" cx={mapX(0,-4,4)} cy={mapY(1,-3,3)} r="7"/>
              <circle className="continuity-value" cx={mapX(0,-4,4)} cy={mapY(2,-3,3)} r="6"/>
            </>}
            {mode==="jump" && <>
              <circle className="continuity-hole" cx={mapX(0,-4,4)} cy={mapY(-1,-3,3)} r="7"/>
              <circle className="continuity-value" cx={mapX(0,-4,4)} cy={mapY(1,-3,3)} r="6"/>
            </>}
            {mode==="infinite" && <line className="continuity-asymptote" x1={mapX(0,-4,4)} y1={PAD} x2={mapX(0,-4,4)} y2={H-PAD}/>}
          </svg>
          <div className="analysis-stage-badges"><span>x₀=0</span><span>{data.type}</span></div>
        </div>
        <aside className="analysis-controls">
          <div className="analysis-readout">
            <div><span>lim x→0−</span><strong>{data.left}</strong></div>
            <div><span>lim x→0+</span><strong>{data.right}</strong></div>
            <div><span>f(0)</span><strong>{data.value}</strong></div>
            <div><span>класс</span><strong>{data.type}</strong></div>
          </div>
          <div className="analysis-formula-box"><span>НЕПРЕРЫВНОСТЬ</span><code>lim f(x) = f(x₀)</code></div>
        </aside>
      </div>
    </section>
  );
}

export function AnalysisVisualInsert({topicId,index}:{topicId:string;index:number}) {
  if(topicId==="sets-reals" && index===10) return <NumberLineLab/>;
  if(topicId==="functions" && index===9) return <FunctionExplorerLab/>;
  if(topicId==="sequences" && index===5) return <SequenceLimitLab/>;
  if(topicId==="limits" && index===2) return <EpsilonDeltaLab/>;
  if(topicId==="infinitesimals" && index===14) return <InfinitesimalLab/>;
  if(topicId==="continuity" && index===6) return <ContinuityLab/>;
  return null;
}
