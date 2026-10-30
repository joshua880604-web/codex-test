import type {StudyFigure} from '@/lib/model-study-articles';
function scaleStep(span:number){const rough=(span||1)/4,power=10**Math.floor(Math.log10(rough)),ratio=rough/power;return (ratio<=1?1:ratio<=2?2:ratio<=5?5:10)*power;}
export default function StudyChart({figure}:{figure:StudyFigure}){
 const {id,x,series}=figure,W=780,H=390,left=96,right=28,top=36,bottom=82,plotW=W-left-right,plotH=H-top-bottom;
 const values=series.flatMap(s=>s.values),step=scaleStep(Math.max(0,...values)-Math.min(0,...values)),low=Math.floor(Math.min(0,...values)/step)*step,high=Math.ceil(Math.max(0,...values)/step)*step||step;
 const y=(n:number)=>top+(high-n)/(high-low)*plotH,px=(i:number)=>left+plotW*(i+.5)/x.length;
 const ticks=Array.from({length:Math.round((high-low)/step)+1},(_,i)=>low+i*step);
 const label=(n:number)=>figure.unit==='percent'?n+'%':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:1}).format(n);
 const marks=['circle','square','diamond','triangle'];
 return <figure className="study-figure" id={id}><h3>{figure.title}</h3><p className="study-chart-hint">Scroll horizontally to view every scenario →</p><div className="study-chart-scroll" role="region" aria-label={figure.title+' chart'} tabIndex={0}><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={id+'-title '+id+'-desc'}><title id={id+'-title'}>{figure.title}</title><desc id={id+'-desc'}>{figure.description}</desc>
 <text x={left} y={18} className="study-chart-axis-title">{figure.yLabel}</text>
 {ticks.map(n=><g key={n}><line x1={left} x2={W-right} y1={y(n)} y2={y(n)} className={n===0?'study-zero-line':'study-grid-line'}/><text x={left-12} y={y(n)+5} textAnchor="end">{label(n)}</text></g>)}
 {x.map((label,i)=><text x={px(i)} y={H-bottom+28} textAnchor="middle" key={label}>{label}</text>)}<text x={left+plotW/2} y={H-16} textAnchor="middle" className="study-chart-axis-title">{figure.xLabel}</text>
 {series.map((s,i)=><g key={s.label} className={'study-series study-series-'+i}>
  {figure.kind==='bar'?s.values.map((v,j)=><rect key={j} x={px(j)-plotW/x.length*.22} y={Math.min(y(0),y(v))} width={plotW/x.length*.44} height={Math.max(1,Math.abs(y(v)-y(0)))} className="study-bar"><title>{`${x[j]}: ${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v)}`}</title></rect>):<><polyline fill="none" strokeWidth={3} strokeDasharray={i===1?'8 4':i===2?'3 4':i===3?'12 4 3 4':undefined} points={s.values.map((v,j)=>px(j)+','+y(v)).join(' ')}/>{s.values.map((v,j)=><g key={j}><title>{`${s.label}, ${x[j]}: ${figure.unit==='money'?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v):v.toFixed(2)+'%'}`}</title>{i===0?<circle cx={px(j)} cy={y(v)} r={5}/>:i===1?<rect x={px(j)-5} y={y(v)-5} width={10} height={10}/>:i===2?<path d={`M ${px(j)} ${y(v)-6} l 6 6 l -6 6 l -6 -6 Z`}/>:<path d={`M ${px(j)} ${y(v)-6} l 6 11 h -12 Z`}/>}</g>)}</>}
 </g>)}
 </svg></div><ul className="study-chart-legend" aria-label="Chart series">{series.map((s,i)=><li key={s.label}><span aria-hidden="true" className={'study-legend-symbol study-series-'+i}>{figure.kind==='bar'?'▰':marks[i]==='circle'?'●':marks[i]==='square'?'■':marks[i]==='diamond'?'◆':'▲'}</span>{s.label}</li>)}</ul><figcaption>{figure.caption} Full numerical values and calculator inputs follow below. <a href={"/research-charts/"+id+".svg"} download>Download SVG</a> · <a href={"/research-charts/"+id+".png"} download>Download PNG</a>.</figcaption></figure>;
}
