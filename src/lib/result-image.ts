import type {Metric} from './types';
import {formatMetric} from './sharing';
import {resultCardAddress} from './result-card-copy';

// Local canvas report. No external images, fonts, APIs or DOM screenshot dependencies.
export async function resultImage(title:string,mode:string,metrics:Metric[],notes:string[],toolURL:string,copy:{interpretation:string|null;tagline:string}={interpretation:null,tagline:'A clearer plan starts with clearer numbers.'}){
 const canvas=document.createElement('canvas');canvas.width=1200;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Image export is unavailable in this browser. Copy the summary instead.');
 type Text={text:string;x:number;y:number;font:string;color:string};
 type Box={x:number;y:number;w:number;h:number;fill:string;stroke:string};
 const texts:Text[]=[],boxes:Box[]=[];
 const ink='#18374d',muted='#536878',teal='#145b53';
 const address=resultCardAddress(toolURL);
 function write(text:string,x:number,y:number,width:number,size:number,color=ink,bold=false){
  const font=`${bold?'600 ':''}${size}px Arial, sans-serif`;
  ctx!.font=font;const lineHeight=Math.ceil(size*1.4);let line='';
  const flush=()=>{if(line){texts.push({text:line,x,y,font,color});y+=lineHeight;line='';}};
  for(const word of text.split(/\s+/)){
   if(ctx!.measureText(line?line+' '+word:word).width<=width){line=line?line+' '+word:word;continue;}
   flush();for(const char of word){if(ctx!.measureText(line+char).width>width)flush();line+=char;}
  }flush();return y;
 }
 let y=58;
 y=write('FINANCIAL CALCULATORS  /  RESULT SUMMARY',64,y,1072,18,'#b8d7e2',true)+20;
 y=write(title,64,y,1072,42,'#ffffff',true)+8;
 if(mode.trim().toLowerCase()!==title.trim().toLowerCase())y=write(mode,64,y,1072,23,'#d5e6ed')+12;
 const headerBottom=y+16;y=headerBottom+24;
 if(metrics[0]){
  const top=y;y=write(metrics[0].label,90,y+24,1020,23,teal,true)+10;
  y=write(formatMetric(metrics[0]),90,y,1020,52,teal,true)+26;
  boxes.push({x:64,y:top,w:1072,h:y-top,fill:'#edf6f5',stroke:'#cfe3df'});
 }
 y+=18;
 for(let i=1;i<metrics.length;i+=2){
  const top=y;let bottom=y;
  for(let j=i;j<Math.min(i+2,metrics.length);j++){
   const x=64+(j-i)*548;
   let end=write(metrics[j].label,x+22,top+22,480,21,muted)+10;
   end=write(formatMetric(metrics[j]),x+22,end,480,32,ink,true)+22;
   bottom=Math.max(bottom,end);
  }
  for(let j=i;j<Math.min(i+2,metrics.length);j++)boxes.push({x:64+(j-i)*548,y:top,w:524,h:bottom-top,fill:'#fff',stroke:'#dce5eb'});
  y=bottom+18;
 }
 y+=8;
 if(copy.interpretation){
  const top=y;y=write('READING YOUR RESULT',86,y+20,1028,17,muted,true)+8;
  y=write(copy.interpretation,86,y,1028,23,ink)+20;
  boxes.push({x:64,y:top,w:1072,h:y-top,fill:'#f1f5f8',stroke:'#e0e8ef'});y+=24;
 }
 if(notes.length){
  y=write('SELECTED MODEL NOTES',64,y,1072,18,muted,true)+10;
  for(const note of notes.slice(0,2))y=write(note.length>700?note.slice(0,697)+'…':note,64,y,1072,21,muted)+12;
 }
 y+=16;const divider=y;y+=24;
 y=write(copy.tagline,64,y,1072,27,teal,true)+18;
 y=write(address.label,64,y,1072,18,ink,true)+8;
 y=write('Selected results • Review the full inputs and assumptions in the calculator.',64,y,1072,20,muted)+10;
 y=write('Generated '+new Date().toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}),64,y,1072,19,muted)+10;
 y=write(address.url,64,y,1072,20,'#285d80');
 canvas.height=Math.ceil(y+48);ctx.fillStyle='#f6f8fb';ctx.fillRect(0,0,1200,canvas.height);
 ctx.beginPath();ctx.roundRect(32,24,1136,canvas.height-48,18);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#dce5eb';ctx.stroke();
 ctx.save();ctx.beginPath();ctx.roundRect(32,24,1136,canvas.height-48,18);ctx.clip();ctx.fillStyle='#18374d';ctx.fillRect(32,24,1136,headerBottom-24);ctx.fillStyle='#3a9d91';ctx.fillRect(32,24,1136,6);ctx.restore();
 for(const box of boxes){ctx.beginPath();ctx.roundRect(box.x,box.y,box.w,box.h,12);ctx.fillStyle=box.fill;ctx.fill();ctx.strokeStyle=box.stroke;ctx.lineWidth=1;ctx.stroke();}
 ctx.strokeStyle='#d6e0e8';ctx.beginPath();ctx.moveTo(64,divider);ctx.lineTo(1136,divider);ctx.stroke();
 ctx.textBaseline='top';for(const t of texts){ctx.font=t.font;ctx.fillStyle=t.color;ctx.fillText(t.text,t.x,t.y);}
 return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Unable to create an image. Copy the summary instead.')),'image/png'));
}
