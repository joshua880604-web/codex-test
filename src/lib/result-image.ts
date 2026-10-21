import type {Metric} from './types';
import {formatMetric} from './sharing';
// Canvas only: no DOM capture, external fonts, images or API requests.
export async function resultImage(title:string,mode:string,metrics:Metric[],notes:string[],toolURL:string){
 const canvas=document.createElement('canvas');canvas.width=1200;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Image export is unavailable in this browser. Copy the summary instead.');
 const blocks:{text:string;font:string;color:string;gap:number}[]=[];
 const add=(text:string,font:string,color='#18374d',gap=12)=>blocks.push({text,font,color,gap});
 add(title,'bold 42px sans-serif');add(mode,'28px sans-serif','#555',24);
 for(const metric of metrics){add(metric.label,'25px sans-serif','#555',6);add(formatMetric(metric),'bold 38px sans-serif','#426e25',24);}
 if(notes.length)for(const note of notes.slice(0,2))add(note.length>700?note.slice(0,697)+'…':note,'23px sans-serif','#444',14);
 add('Selected results. Read the full inputs and assumptions in the calculator.','23px sans-serif','#555');
 add('Generated '+new Date().toLocaleDateString('en-US')+' · Financial Calculators','22px sans-serif','#555');
 add(toolURL,'24px sans-serif','#075587',0);
 const lines:{text:string;font:string;color:string;y:number}[]=[];let y=64;
 for(const block of blocks){
  ctx.font=block.font;const size=Number(block.font.match(/\d+/)?.[0]??24),lineHeight=Math.ceil(size*1.45);let line='';
  const flush=()=>{if(line){lines.push({text:line,font:block.font,color:block.color,y});y+=lineHeight;line='';}};
  for(const word of block.text.split(/\s+/)){
    const candidate=line?line+' '+word:word;
    if(ctx.measureText(candidate).width<=1072){line=candidate;continue;}
    flush();
    for(const char of word){if(ctx.measureText(line+char).width>1072)flush();line+=char;}
  }
  if(line){lines.push({text:line,font:block.font,color:block.color,y});y+=lineHeight;}y+=block.gap;
 }
 canvas.height=Math.ceil(y+48);ctx.fillStyle='#fff';ctx.fillRect(0,0,1200,canvas.height);ctx.fillStyle='#4f8128';ctx.fillRect(0,0,1200,12);ctx.textBaseline='top';
 for(const line of lines){ctx.font=line.font;ctx.fillStyle=line.color;ctx.fillText(line.text,64,line.y);}
 return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Unable to create an image. Copy the summary instead.')),'image/png'));
}
