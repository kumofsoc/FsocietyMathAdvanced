import { useMemo, useState } from "react";
import "../styles/fourier.css";

const W = 620;
const H = 300;
const PAD = 28;

function scalePath(xs: number[], ys: number[], yMin: number, yMax: number) {
  const span = Math.max(1e-9, yMax-yMin);
  return ys.map((y,index)=>{
    const px=PAD+(index/Math.max(1,xs.length-1))*(W-PAD*2);
    const py=H-PAD-((y-yMin)/span)*(H-PAD*2);
    return (index===0?"M":"L")+px.toFixed(2)+" "+py.toFixed(2);
  }).join(" ");
}

function squareSeries(x: number, harmonics: number) {
  let sum=0;
  for(let k=0;k<harmonics;k+=1){
    const n=2*k+1;
    sum += Math.sin(n*x)/n;
  }
  return 4/Math.PI*sum;
}

function FourierSynthesisLab({ gibbs=false }: { gibbs?: boolean }) {
  const [harmonics,setHarmonics]=useState(gibbs?15:7);
  const xs=useMemo(()=>Array.from({length:180},(_,i)=>-Math.PI+(2*Math.PI*i)/179),[]);
  const target=xs.map(x=>Math.sin(x)>=0?1:-1);
  const approx=xs.map(x=>squareSeries(x,harmonics));
  const max=Math.max(...approx);
  const overshoot=(max-1)*100;

  return (
    <section className="fourier-lab">
      <header>
        <div className="eyebrow">{gibbs?"GIBBS PHENOMENON":"FOURIER SYNTHESIS"}</div>
        <h2>{gibbs?"Скачок не исчезает — зона ошибки лишь сжимается.":"Собери прямоугольную волну из чистых синусов."}</h2>
        <p>
          {gibbs
            ?"Увеличивай число нечётных гармоник: аппроксимация становится резче, но локальный overshoot около разрыва остаётся."
            :"Каждая новая гармоника добавляет более мелкую структуру. Это геометрически похоже на добавление координат в ортогональном базисе."}
        </p>
      </header>

      <div className="fourier-layout">
        <div className="fourier-stage">
          <svg viewBox={"0 0 "+W+" "+H}>
            <line className="fourier-axis" x1={PAD} y1={H/2} x2={W-PAD} y2={H/2}/>
            <path className="fourier-target" d={scalePath(xs,target,-1.5,1.5)}/>
            <path className="fourier-curve" d={scalePath(xs,approx,-1.5,1.5)}/>
          </svg>
          <div className="fourier-badges">
            <span>{harmonics} harmonics</span>
            <span>max={max.toFixed(4)}</span>
            <span>overshoot≈{overshoot.toFixed(2)}%</span>
          </div>
        </div>

        <aside className="fourier-controls">
          <label>
            <span>harmonics</span>
            <input type="range" min="1" max="35" step="1" value={harmonics} onChange={(e)=>setHarmonics(Number(e.target.value))}/>
            <b>{harmonics}</b>
          </label>
          <div className="fourier-spectrum">
            {Array.from({length:Math.min(harmonics,18)},(_,k)=>{
              const n=2*k+1;
              const amp=1/n;
              return <i key={n} style={{height:(amp*100)+"%"}} title={"n="+n}/>;
            })}
          </div>
          <div className="fourier-state">
            <span>ODD HARMONICS</span>
            <strong>1, 3, 5, 7, …</strong>
            <small>амплитуды убывают как 1/n</small>
          </div>
        </aside>
      </div>
    </section>
  );
}

function FourierTransformLab(){
  const [sigma,setSigma]=useState(0.9);
  const xs=useMemo(()=>Array.from({length:160},(_,i)=>-4+(8*i)/159),[]);
  const spatial=xs.map(x=>Math.exp(-(x*x)/(2*sigma*sigma)));
  const spectral=xs.map(w=>sigma*Math.exp(-(sigma*sigma*w*w)/2));
  const spatialPath=scalePath(xs,spatial,0,1.15);
  const spectralMax=Math.max(...spectral,1);
  const spectralPath=scalePath(xs,spectral,0,spectralMax*1.08);

  return (
    <section className="fourier-lab transform-lab">
      <header>
        <div className="eyebrow">FOURIER TRANSFORM / DUAL WIDTH</div>
        <h2>Сужаешь импульс — расширяешь спектр.</h2>
        <p>Гауссиан особенно нагляден: его преобразование тоже гауссово, а характерные ширины обратно связаны.</p>
      </header>

      <div className="transform-grid">
        <div className="fourier-stage">
          <span className="plot-label">x-space</span>
          <svg viewBox={"0 0 "+W+" "+H}>
            <line className="fourier-axis" x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD}/>
            <path className="fourier-curve" d={spatialPath}/>
          </svg>
        </div>
        <div className="fourier-stage">
          <span className="plot-label">ω-space</span>
          <svg viewBox={"0 0 "+W+" "+H}>
            <line className="fourier-axis" x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD}/>
            <path className="fourier-curve spectrum" d={spectralPath}/>
          </svg>
        </div>
      </div>

      <div className="transform-control">
        <label>
          <span>σₓ</span>
          <input type="range" min=".25" max="2.2" step=".01" value={sigma} onChange={(e)=>setSigma(Number(e.target.value))}/>
          <b>{sigma.toFixed(2)}</b>
        </label>
        <div><span>примерная спектральная ширина</span><strong>∝ {(1/sigma).toFixed(2)}</strong></div>
      </div>
    </section>
  );
}

export function FourierVisualInsert({topicId,index}:{topicId:string;index:number}){
  if(topicId==="fourier-series" && index===1) return <FourierSynthesisLab/>;
  if(topicId==="fourier-expansion" && index===2) return <FourierSynthesisLab gibbs/>;
  if(topicId==="fourier-integral" && index===1) return <FourierTransformLab/>;
  return null;
}
